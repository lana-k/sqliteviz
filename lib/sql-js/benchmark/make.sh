#!/bin/bash -e

cleanup () {
  rm -rf lib/dist "$renice_flag_file"
  docker rm -f sqljs-benchmark-run 2> /dev/null || true
}
trap cleanup EXIT

if [ ! -f sample.csv ]; then
  wget --header="accept-encoding: gzip" -q -O- \
    https://github.com/plotly/datasets/raw/547090bd/wellspublic.csv \
    | gunzip -c > sample.csv
fi

getrootpid () {
  docker inspect -f "{{.State.Pid}}" $1 2> /dev/null || true
}

# for renice to work run like "sudo -E env PATH=$PATH ./make.sh"
test_ni=$(nice -n -5 nice)
if [ $test_ni == -5 ]; then
  renice_flag_file=$(mktemp)
fi
(
  while [ -f $renice_flag_file ]; do
    root_pid=$(getrootpid sqljs-benchmark-run)
    if [ ! -z $root_pid ]; then
      procpath query -d $'\n' "$..children[?(@.stat.pid == $root_pid)]..pid" \
        | xargs -I{} -- renice -n -5 -p {} &> /dev/null
    fi
    sleep 1
  done &
)

shopt -s nullglob
for d in lib/build-* ; do
  rm -rf lib/dist
  cp -r $d lib/dist

  sample_name=$(basename $d)
  (
    root_pid=""
    while [ -z $root_pid ]; do
      root_pid=$(getrootpid sqljs-benchmark-run)
      if [ ! -z $root_pid ]; then
        rm -f ${sample_name}.sqlite
        procpath record -d ${sample_name}.sqlite -i 1 \
          --stop-without-result -p $root_pid \
          "$..children[?(@.stat.pid == $root_pid)]"
        procpath plot -q rss -q cpu -d ${sample_name}.sqlite -f ${sample_name}.svg -w 5
        break
      fi
      sleep 1
    done &
  )

  docker build -t sqliteviz/sqljs-benchmark .
  docker rm sqljs-benchmark-run 2> /dev/null || true
  docker run -it --cpus 2 --name sqljs-benchmark-run sqliteviz/sqljs-benchmark
  docker cp sqljs-benchmark-run:/tmp/build/suite-result.json ${sample_name}-result.json
  docker rm sqljs-benchmark-run
done
