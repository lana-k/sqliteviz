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

PLAYBOOK=procpath/karma_docker.procpath

# for renice to work run like "sudo -E env PATH=$PATH ./make.sh"
test_ni=$(nice -n -5 nice)
if [ $test_ni == -5 ]; then
  renice_flag_file=$(mktemp)
fi
{
  while [ -f $renice_flag_file ]; do
    procpath --logging-level ERROR play -f $PLAYBOOK renice:watch
  done
} &

shopt -s nullglob
for d in lib/build-* ; do
  rm -rf lib/dist
  cp -r $d lib/dist
  sample_name=$(basename $d)

  docker build -t sqliteviz/sqljs-benchmark .
  docker rm sqljs-benchmark-run 2> /dev/null || true
  docker run -d -it --cpus 2 --name sqljs-benchmark-run sqliteviz/sqljs-benchmark
  {
    rm -f ${sample_name}.sqlite
    procpath play -f $PLAYBOOK -o database_file=${sample_name}.sqlite track:record
    procpath play -f $PLAYBOOK -o database_file=${sample_name}.sqlite \
      -o plot_file=${sample_name}.svg track:plot
  } &

  docker attach sqljs-benchmark-run
  docker cp sqljs-benchmark-run:/tmp/build/suite-result.json ${sample_name}-result.json
  docker rm sqljs-benchmark-run
done
