import benchmark from 'benchmark'
import initSqlJs from 'sql.js'
import lodash from 'lodash'
import Papa from 'papaparse'
import useragent from 'ua-parser-js'


describe('SQLite build benchmark', function () {
  let parsedCsv
  let sqlModule
  let selectDb

  before(async function () {
    parsedCsv = await parseCsv('http://localhost:9876/base/sample.csv')
    sqlModule = await initSqlJs()

    selectDb = new sqlModule.Database()
    importToTable(selectDb, parsedCsv)
  })

  function benchmarkImport () {
    const db = new sqlModule.Database()
    try {
      importToTable(db, parsedCsv)
    } finally {
      db.close()
    }
  }

  function benchmarkSelect () {
    const result = selectDb.exec(`
      SELECT county, AVG(avg_depth) avg_depth_c
      FROM (
        SELECT s.county, s.town, COUNT(*) cnt, AVG(s.DrilledDepth) avg_depth
        FROM csv_import s
        JOIN csv_import USING(hole)
        WHERE s.town IS NOT NULL
        GROUP BY 1, 2
        ORDER BY 4 DESC
      )
      GROUP BY 1
      ORDER BY 2 DESC
    `)
    console.assert(result.values.length == 56, 'Unexpected size of result set')
  }

  it('run', async function () {
    const suite = createSuite()
    suite.add('import', { initCount: 3, minSamples: 50, fn: benchmarkImport })
    suite.add('select', { initCount: 3, minSamples: 50, fn: benchmarkSelect })
    await run(suite)
  })

})


function importToTable (db, parsedCsv, chunkSize = 1024) {
  const columnListString = parsedCsv.meta.fields.join(', ')
  db.exec(`CREATE TABLE csv_import(${columnListString})`)

  const params = parsedCsv.meta.fields.map(name => '?').join(', ')
  const insertStmt = db.prepare(`INSERT INTO csv_import VALUES(${params})`)
  chunkArray(parsedCsv.data, chunkSize).map(function (chunk) {
    db.exec('BEGIN')
    chunk.map(row => insertStmt.run(Object.values(row)))
    db.exec('COMMIT')
  })
}


class PromiseWrapper {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.reject = reject
      this.resolve = resolve
    })
  }
}

function parseCsv(url) {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      header: true,
      download: true,
      skipEmptyLines: 'greedy',
      complete: results => resolve(results),
      error: (error, file) => reject(error)
    })
  })
}

function chunkArray (arr, size) {
  return arr.reduce(function (result, value, index) {
    const chunkIndex = Math.floor(index / size)

    if(!(chunkIndex in result)) {
      result[chunkIndex] = []
    }
    result[chunkIndex].push(value)

    return result
  }, [])
}


function createSuite () {
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

function run (suite) {
  const suiteResult = new PromiseWrapper()
  suite
    .on('cycle', function (event) {
      console.info(String(event.target))
    })
    .on('complete', function () {
      console.log(JSON.stringify({
        browser: useragent(navigator.userAgent).browser,
        result: this.filter('successful')
      }))
      suiteResult.resolve()
    })
    .on('error', function (event) {
      console.error('Benchmark failed', String(event.target))
      suiteResult.reject()
    })
    .run({async: true})

  return suiteResult.promise
}
