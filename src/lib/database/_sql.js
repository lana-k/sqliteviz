import initSqlJs from 'sql.js'
import dbUtils from './_statements'
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url'

let SQL = null
const sqlModuleReady = initSqlJs({
  locateFile: () => wasmUrl
}).then(sqlModule => {
  SQL = sqlModule
})

function _getDataSourcesFromSqlResult(sqlResult) {
  if (!sqlResult) {
    return {}
  }
  const dataSources = {}
  sqlResult.columns.forEach((column, index) => {
    dataSources[column] = sqlResult.values.map(row => row[index])
  })
  return dataSources
}

export default class Sql {
  constructor() {
    this.db = null
  }

  static build() {
    return sqlModuleReady.then(() => {
      return new Sql()
    })
  }

  createDb(buffer) {
    if (this.db != null) this.db.close()
    this.db = new SQL.Database(buffer)
    return this.db
  }

  open(buffer) {
    this.createDb(buffer && new Uint8Array(buffer))
    return {
      ready: true
    }
  }

  exec(sql, params) {
    if (this.db === null) {
      this.createDb()
    }
    if (!sql) {
      throw new Error('exec: Missing query string')
    }
    const sqlResults = this.db.exec(sql, params)
    return sqlResults.map(result => {
      return {
        columns: result.columns,
        values: _getDataSourcesFromSqlResult(result)
      }
    })
  }

  import(tabName, data, progressCounterId, progressCallback, chunkSize = 1500) {
    if (this.db === null) {
      this.createDb()
    }
    const columns = data.columns
    const rowCount = data.values[columns[0]].length
    this.db.exec(dbUtils.getCreateStatement(tabName, data.values))
    const chunks = dbUtils.generateChunks(data.values, chunkSize)
    const chunksAmount = Math.ceil(rowCount / chunkSize)
    let count = 0
    const insertStr = dbUtils.getInsertStmt(tabName, columns)
    const insertStmt = this.db.prepare(insertStr)

    progressCallback({ progress: 0, id: progressCounterId })
    for (const chunk of chunks) {
      this.db.exec('BEGIN')
      for (const row of chunk) {
        insertStmt.run(row)
      }
      this.db.exec('COMMIT')
      count++
      progressCallback({
        progress: 100 * (count / chunksAmount),
        id: progressCounterId
      })
    }

    return {
      finish: true
    }
  }

  export() {
    return this.db.export()
  }

  close() {
    if (this.db) {
      this.db.close()
    }
    return {
      finished: true
    }
  }
}
