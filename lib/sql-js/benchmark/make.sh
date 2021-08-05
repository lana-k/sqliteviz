#!/bin/bash -e

if [ ! -f sample.csv ]; then
  wget --header="accept-encoding: gzip" -q -O- \
    https://github.com/plotly/datasets/raw/547090bd/wellspublic.csv \
    | gunzip -c > sample.csv
fi

for d in lib/build-* ; do
  rm -r lib/dist || true
  cp -r $d lib/dist

  name=$(basename $d)
  docker build -t sqliteviz/sqljs-benchmark:$name .
  docker rm sqljs-benchmark-$name 2> /dev/null || true
  docker run -it --name sqljs-benchmark-$name sqliteviz/sqljs-benchmark:$name
  docker cp sqljs-benchmark-$name:/tmp/build/suite-result.json ${name}-result.json
  docker rm sqljs-benchmark-$name
done

rm -r lib/dist
