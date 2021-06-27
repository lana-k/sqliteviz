import stms from './_statements'
import fu from '@/lib/utils/fileIo'
// We can import workers like so because of worker-loader:
// https://webpack.js.org/loaders/worker-loader/
import Worker from './_worker.js'

// Use promise-worker in order to turn worker into the promise based one:
// https://github.com/nolanlawson/promise-worker
import PromiseWorker from 'promise-worker'

function getNewDatabase () {
  const worker = new Worker()
  return new Database(worker)
}

export default {
  getNewDatabase
}

let progressCounterIds = 0
class Database {
  constructor (worker) {
    this.dbName = null
    this.schema = null
    this.worker = worker
    this.pw = new PromiseWorker(worker)

    this.importProgresses = {}
    worker.addEventListener('message', e => {
      const progress = e.data.progress
      if (progress !== undefined) {
        const id = e.data.id
        this.importProgresses[id].dispatchEvent(new CustomEvent('progress', {
          detail: progress
        }))
      }
    })
  }

  shutDown () {
    this.worker.terminate()
  }

  createProgressCounter (callback) {
    const id = progressCounterIds++
    this.importProgresses[id] = new EventTarget()
    this.importProgresses[id].addEventListener('progress', e => { callback(e.detail) })
    return id
  }

  deleteProgressCounter (id) {
    delete this.importProgresses[id]
  }

  async addTableFromCsv (tabName, data, progressCounterId) {
    const result = await this.pw.postMessage({
      action: 'import',
      data,
      progressCounterId,
      tabName
    })

    if (result.error) {
      throw new Error(result.error)
    }
    this.dbName = this.dbName || 'database'
    this.refreshSchema()
  }

  async loadDb (file) {
    const fileContent = file ? await fu.readAsArrayBuffer(file) : null
    const res = await this.pw.postMessage({ action: 'open', buffer: fileContent })

    if (res.error) {
      throw new Error(res.error)
    }

    this.dbName = file ? fu.getFileName(file) : 'database'
    this.refreshSchema()
  }

  async refreshSchema () {
    const getSchemaSql = `
      SELECT name, sql
      FROM sqlite_master
      WHERE type='table' AND name NOT LIKE 'sqlite_%';
    `
    const result = await this.execute(getSchemaSql)
    // Parse DDL statements to get column names and types
    const parsedSchema = []
    if (result && result.name) {
      result.name.forEach((table, index) => {
        parsedSchema.push({
          name: table,
          columns: stms.getColumns(result.sql[index])
        })
      })
    }

    // Refresh schema
    this.schema = parsedSchema
  }

  async execute (commands) {
    await this.pw.postMessage({ action: 'reopen' })
    const results = await this.pw.postMessage({ action: 'exec', sql: commands })

    if (results.error) {
      throw new Error(results.error)
    }
    // if it was more than one select - take only the last one
    return results[results.length - 1]
  }

  async export (fileName) {
    const data = await this.pw.postMessage({ action: 'export' })

    if (data.error) {
      throw new Error(data.error)
    }
    fu.exportToFile(data, fileName)
  }

  async validateTableName (name) {
    if (name.startsWith('sqlite_')) {
      throw new Error("Table name can't start with sqlite_")
    }

    if (/[^\w]/.test(name)) {
      throw new Error('Table name can contain only letters, digits and underscores')
    }

    if (/^(\d)/.test(name)) {
      throw new Error("Table name can't start with a digit")
    }

    await this.execute(`BEGIN; CREATE TABLE "${name}"(id); ROLLBACK;`)
  }

  sanitizeTableName (tabName) {
    return tabName
      .replace(/[^\w]/g, '_') // replace everything that is not letter, digit or _  with _
      .replace(/^(\d)/, '_$1') // add _ at beginning if starts with digit
      .replace(/_{2,}/g, '_') // replace multiple _ with one _
  }
}
