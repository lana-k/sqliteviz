# SQLite WebAssembly build micro-benchmark

This directory contains a micro-benchmark for evaluating SQLite WebAssembly
builds performance on read and write SQL queries, run from `make.sh` script. If
the script has permission to `nice` processes and [Procpath][1] is installed,
e.g. it is run with `sudo -E env PATH=$PATH ./make.sh`, it'll `renice` all
processes running inside the benchmark containers. It can also serve as a smoke
test (e.g. for memory leaks).

The benchmark operates on a set of SQLite WebAssembly builds expected in
`lib/build-$NAME` directories each containing `sql-wasm.js` and
`sql-wasm.wasm`. Then it creates a Docker image for each, and runs the
benchmark in Firefox and Chromium using Karma in the container.

After successful run, the benchmark produces the following per each build:

- `build-$NAME-result.json`
- `build-$NAME.sqlite` (if Procpath is installed)
- `build-$NAME.svg` (if Procpath is installed)

These files can be analysed using `result-analysis.ipynb` Jupyter notebook.
The SVG is a chart with CPU and RSS usage of each test container (i.e. Chromium
run, then Firefox run per container).

[1]: https://pypi.org/project/Procpath/
