import initSqlJs from 'sql.js/dist/sql-wasm.js'
import dbUtils from './_statements'

let SQL = null
const sqlModuleReady = initSqlJs().then(sqlModule => { SQL = sqlModule })

export default class Sql {
  constructor () {
    this.db = null
  }

  static build () {
    return sqlModuleReady
      .then(() => {
        return new Sql()
      })
  }

  createDb (buffer) {
    if (this.db != null) this.db.close()
    this.db = new SQL.Database(buffer)
    return this.db
  }

  open (buffer) {
    this.createDb(buffer && new Uint8Array(buffer))
    return {
      ready: true
    }
  }

  exec (sql, params) {
    if (this.db === null) {
      this.createDb()
    }
    if (!sql) {
      throw new Error('exec: Missing query string')
    }
    return this.db.exec(sql, params)
  }

  import (tabName, columns, values, progressCounterId, progressCallback, chunkSize = 1500) {
    if (this.db === null) {
      this.createDb()
    }
    this.db.exec(dbUtils.getCreateStatement(tabName, columns, values))
    const chunks = dbUtils.generateChunks(values, chunkSize)
    const chunksAmount = Math.ceil(values.length / chunkSize)
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
      progressCallback({ progress: 100 * (count / chunksAmount), id: progressCounterId })
    }

    return {
      finish: true
    }
  }

  export () {
    return this.db.export()
  }

  close () {
    if (this.db) {
      this.db.close()
    }
    return {
      finished: true
    }
  }
}
