#!/bin/bash -e

cleanup () {
  rm -rf lib/dist $flag_file
}
trap cleanup EXIT

if [ ! -f sample.csv ]; then
  wget --header="accept-encoding: gzip" -q -O- \
    https://github.com/plotly/datasets/raw/547090bd/wellspublic.csv \
    | gunzip -c > sample.csv
fi

# for renice to work run like "sudo -E env PATH=$PATH ./make.sh"
test_ni=$(nice -n -1 nice)
if [ $test_ni == -1 ]; then
  flag_file=$(mktemp)
fi
(
  while [ -f $flag_file ]; do
    root_pid=$(
      docker ps -f status=running -f name='^sqljs-benchmark-' -q \
        | xargs -r -I{} -- docker inspect -f '{{.State.Pid}}' {}
    )
    if [ ! -z $root_pid ]; then
      procpath query -d $'\n' "$..children[?(@.stat.pid == $root_pid)]..pid" \
        | xargs -I{} -- renice -n -1 -p {} > /dev/null
    fi
    sleep 1
  done &
)

shopt -s nullglob
for d in lib/build-* ; do
  rm -rf lib/dist
  cp -r $d lib/dist

  name=$(basename $d)
  docker build -t sqliteviz/sqljs-benchmark:$name .
  docker rm sqljs-benchmark-$name 2> /dev/null || true
  docker run -it --cpus 2 --name sqljs-benchmark-$name sqliteviz/sqljs-benchmark:$name
  docker cp sqljs-benchmark-$name:/tmp/build/suite-result.json ${name}-result.json
  docker rm sqljs-benchmark-$name
done
