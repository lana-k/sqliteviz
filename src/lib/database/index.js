import sqliteParser from 'sqlite-parser'
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

  async importDb (name, data, progressCounterId) {
    const result = await this.pw.postMessage({
      action: 'import',
      columns: data.columns,
      values: data.values,
      progressCounterId
    })

    if (result.error) {
      throw new Error(result.error)
    }

    return await this.getSchema(name)
  }

  async loadDb (file) {
    const fileContent = file ? await fu.readAsArrayBuffer(file) : null
    const res = await this.pw.postMessage({ action: 'open', buffer: fileContent })

    if (res.error) {
      throw new Error(res.error)
    }

    const dbName = file ? file.name.replace(/\.[^.]+$/, '') : 'database'
    return this.getSchema(dbName)
  }

  async getSchema (name) {
    const getSchemaSql = `
      SELECT name, sql
      FROM sqlite_master
      WHERE type='table' AND name NOT LIKE 'sqlite_%';
    `
    const result = await this.execute(getSchemaSql)
    // Parse DDL statements to get column names and types
    const parsedSchema = []
    if (result && result.values) {
      result.values.forEach(item => {
        parsedSchema.push({
          name: item[0],
          columns: getColumns(item[1])
        })
      })
    }

    // Return db name and schema
    return {
      dbName: name,
      schema: parsedSchema
    }
  }

  async execute (commands) {
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
}

function getAst (sql) {
  // There is a bug is sqlite-parser
  // It throws an error if tokenizer has an arguments:
  // https://github.com/codeschool/sqlite-parser/issues/59
  const fixedSql = sql
    .replace(/(tokenize=[^,]+)"tokenchars=.+?"/, '$1')
    .replace(/(tokenize=[^,]+)"remove_diacritics=.+?"/, '$1')
    .replace(/(tokenize=[^,]+)"separators=.+?"/, '$1')
    .replace(/tokenize=.+?(,|\))/, 'tokenize=unicode61$1')

  return sqliteParser(fixedSql)
}

/*
 * Return an array of columns with name and type. E.g.:
 * [
 *   { name: 'id',    type: 'INTEGER' },
 *   { name: 'title', type: 'NVARCHAR(30)' },
 * ]
*/
function getColumns (sql) {
  const columns = []
  const ast = getAst(sql)

  const columnDefinition = ast.statement[0].format === 'table'
    ? ast.statement[0].definition
    : ast.statement[0].result.args.expression // virtual table

  columnDefinition.forEach(item => {
    if (item.variant === 'column' && ['identifier', 'definition'].includes(item.type)) {
      let type = item.datatype ? item.datatype.variant : 'N/A'
      if (item.datatype && item.datatype.args) {
        type = type + '(' + item.datatype.args.expression[0].value
        if (item.datatype.args.expression.length === 2) {
          type = type + ', ' + item.datatype.args.expression[1].value
        }
        type = type + ')'
      }
      columns.push({ name: item.name, type: type })
    }
  })
  return columns
}
