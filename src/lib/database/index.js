import fu from '@/lib/utils/fileIo'
// We can import workers like so because of worker-loader:
// https://webpack.js.org/loaders/worker-loader/
import Worker from './_worker.js'

// Use promise-worker in order to turn worker into the promise based one:
// https://github.com/nolanlawson/promise-worker
import PromiseWorker from 'promise-worker'

import events from '@/lib/utils/events'

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

    events.send('database.import', file ? file.size : 0, {
      from: file ? 'sqlite' : 'none',
      new_db: true
    })
  }

  async refreshSchema () {
    const getSchemaSql = `
    WITH columns as (
      SELECT
        a.tbl_name,
        json_group_array(
          json_object('name', b.name,'type', IIF(b.type = '', 'N/A', b.type))
        ) as column_json
      FROM sqlite_master a, pragma_table_info(a.name) b
      WHERE a.type in ('table','view') AND a.name NOT LIKE 'sqlite_%' group by tbl_name
    )
    SELECT json_group_array(json_object('name',tbl_name, 'columns', json(column_json))) objects
    FROM columns;
    `
    const result = await this.execute(getSchemaSql)
    this.schema = JSON.parse(result.values.objects[0])
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
    events.send('database.export', data.byteLength, { to: 'sqlite' })
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
