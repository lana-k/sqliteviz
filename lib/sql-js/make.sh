#!/bin/bash -e

docker build -t sqliteviz/sqljs .

rm -r dist || true

CONTAINER=$(docker create sqliteviz/sqljs)
docker cp $CONTAINER:/tmp/build/dist .
docker rm $CONTAINER
