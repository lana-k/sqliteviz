import registerPromiseWorker from 'promise-worker/register'
import initSqlJs from 'sql.js/dist/sql-wasm.js'
import dbUtils from '@/dbUtils'

const sqlModuleReady = initSqlJs()
let db = null

function onModuleReady (SQL) {
  function createDb (data) {
    if (db != null) db.close()
    db = new SQL.Database(data)
    return db
  }

  const data = this

  switch (data && data.action) {
    case 'open':
      const buff = data.buffer
      createDb(buff && new Uint8Array(buff))
      return {
        ready: true
      }
    case 'exec':
      if (db === null) {
        createDb()
      }
      if (!data.sql) {
        throw new Error('exec: Missing query string')
      }
      return db.exec(data.sql, data.params)
    case 'each':
      if (db === null) {
        createDb()
      }
      const callback = function callback (row) {
        return {
          row: row,
          finished: false
        }
      }
      const done = function done () {
        return {
          finished: true
        }
      }
      return db.each(data.sql, data.params, callback, done)
    case 'import':
      createDb()
      const values = data.values
      const columns = data.columns
      const chunkSize = 1500
      db.exec(dbUtils.getCreateStatement(columns, values))
      const chunks = dbUtils.generateChunks(values, chunkSize)
      const chunksAmount = Math.ceil(values.length / chunkSize)
      let count = 0
      const insertStr = dbUtils.getInsertStmt(columns)
      const insertStmt = db.prepare(insertStr)

      postMessage({ progress: 0, id: data.progressCounterId })
      for (const chunk of chunks) {
        db.exec('BEGIN')
        for (const row of chunk) {
          insertStmt.run(row)
        }
        db.exec('COMMIT')
        count++
        postMessage({ progress: 100 * (count / chunksAmount), id: data.progressCounterId })
      }

      return {
        finish: true
      }
    case 'export':
      return db.export()
    case 'close':
      if (db) {
        db.close()
      }
      return {
        finished: true
      }
    default:
      throw new Error('Invalid action : ' + (data && data.action))
  }
}

function onError (err) {
  return {
    error: new Error(err.message)
  }
}

registerPromiseWorker(data => {
  return sqlModuleReady
    .then(onModuleReady.bind(data))
    .catch(onError)
})
