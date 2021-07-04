import chai from 'chai'
import lodash from 'lodash'
import database from '@/lib/database'
import csv from '@/components/CsvImport/csv'

const expect = chai.expect
const benchmark = require('benchmark')

class PromiseWrapper {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.reject = reject
      this.resolve = resolve
    })
  }
}

function createBenchmarkSuite () {
  // Combined workaround from:
  // - https://github.com/bestiejs/benchmark.js/issues/106
  // - https://github.com/bestiejs/benchmark.js/issues/237

  // Benchmark could not pick up lodash otherwise
  const bm = benchmark.runInContext({ _: lodash })
  // Avoid `ReferenceError: Benchmark is not defined` error because Benchmark is assumed
  // to be in window
  window.Benchmark = bm

  return new bm.Suite()
}

async function importToTable (columns, values) {
  const db = database.getNewDatabase()
  try {
    console.info(new Date().toISOString() + ' importing')
    const throttledProgressLog = lodash.throttle(
      (details) => { console.log(details.toFixed(2) + '%') }, 1000
    )
    await db.pw.postMessage({
      action: 'import',
      tabName: 'benchmark_table',
      columns: columns,
      values: values,
      progressCounterId: db.createProgressCounter(throttledProgressLog)
    })
    throttledProgressLog.cancel()
    console.info(new Date().toISOString() + ' imported')
    await db.pw.postMessage({ action: 'close' })
  }
  finally {
    console.info(new Date().toISOString() + ' shutting down')
    db.shutDown()
  }
}

describe('SQLite extension benchmark', function () {
  it('performs CSV import benchmark', async function () {
    const resp = await fetch('http://localhost:9876/base/benchmark_sample.csv')
    const file = new Blob([await resp.text()])
    file.name = 'example.csv'
    const parsed = await csv.parse(file)

    const suite = createBenchmarkSuite()
    suite.add('CSV import', {
      minSamples: 7,
      defer: true,
      fn: async function (deferred) {
        // There is some sort special behaviour of an async function with
        // first/single await here, so keep the test in importToTable
        await importToTable(parsed.data.columns, parsed.data.values)
        deferred.resolve()
      }
    })

    const suiteResult = new PromiseWrapper()
    suite
      .on('cycle', function (event) {
        console.log(String(event.target))
      })
      .on('complete', function () {
        console.log(JSON.stringify(this.filter('successful')))
        suiteResult.resolve()
      })
      .on('error', function () {
        console.log('Benchmark failed')
        suiteResult.reject()
      })
      .run()

    await suiteResult.promise
  })
})
