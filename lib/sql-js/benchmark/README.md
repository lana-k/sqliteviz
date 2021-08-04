# SQLite WebAssembly build micro-benchmark

This directory contains a micro-benchmark for evaluating SQLite
WebAssembly builds performance on typical SQL queries, run from
`make.sh` script. It can also serve as a smoke test.

The benchmark operates on a set of SQLite WebAssembly builds expected
in `lib/build-$NAME` directories each containing `sql-wasm.js` and
`sql-wasm.wasm`. Then it creates a Docker image for each, and runs
the benchmark in Firefox and Chromium using Karma in the container.

After successful run, the benchmark result of each build is contained
in `build-$NAME-result.json`. The JSON result files can be analysed
using `result-analysis.ipynb` Jupyter notebook.
