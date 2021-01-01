import sqliteParser from 'sqlite-parser'
const worker = new Worker('js/worker.sql-wasm.js')

export default {
  loadDb (file) {
    return new Promise((resolve, reject) => {
      const f = file
      const r = new FileReader()
      r.onload = () => {
        // on 'action: open' completed
        worker.onmessage = () => {
          const getSchemaSql = `
            SELECT name, sql
            FROM sqlite_master
            WHERE type='table' AND name NOT LIKE 'sqlite_%';`

          this.execute(getSchemaSql)
            .then(result => {
              // Parse DDL statements to get column names and types
              const parsedSchema = []
              result.values.forEach(item => {
                parsedSchema.push({
                  name: item[0],
                  columns: getColumns(item[1])
                })
              })

              // Return db name and schema
              resolve({
                dbName: file.name,
                schema: parsedSchema
              })
            })
        }

        try {
          worker.postMessage({ action: 'open', buffer: r.result }, [r.result])
        } catch (exception) {
          worker.postMessage({ action: 'open', buffer: r.result })
        }
      }
      r.readAsArrayBuffer(f)
    })
  },
  execute (commands) {
    return new Promise((resolve, reject) => {
      worker.onmessage = (event) => {
        if (event.data.error) {
          reject(event.data.error)
        } else {
          // if it was more than one select - take only the first one
          resolve(event.data.results[0])
        }
      }
      worker.postMessage({ action: 'exec', sql: commands })
    })
  }
}

function getAst (sql) {
  // There is a bug is sqlite-parser
  // It throws an error if tokenizer has an arguments:
  // https://github.com/codeschool/sqlite-parser/issues/59
  const fixedSql = sql
    .replace(/(?<=tokenize=.+)"tokenchars=.+"/, '')
    .replace(/(?<=tokenize=.+)"remove_diacritics=.+"/, '')
    .replace(/(?<=tokenize=.+)"separators=.+"/, '')
    .replace(/tokenize=.+(?=(,|\)))/, 'tokenize=unicode61')

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
