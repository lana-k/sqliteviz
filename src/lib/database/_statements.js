import sqliteParser from 'sqlite-parser'

export default {
  * generateChunks (arr, size) {
    const count = Math.ceil(arr.length / size)

    for (let i = 0; i <= count - 1; i++) {
      const start = size * i
      const end = start + size
      yield arr.slice(start, end)
    }
  },

  getInsertStmt (tabName, columns) {
    const colList = `"${columns.join('", "')}"`
    const params = columns.map(() => '?').join(', ')
    return `INSERT INTO "${tabName}" (${colList}) VALUES (${params});`
  },

  getCreateStatement (tabName, columns, values) {
    let result = `CREATE table "${tabName}"(`
    columns.forEach((col, index) => {
    // Get the first row of values to determine types
      const value = values[0][index]
      let type = ''
      switch (typeof value) {
        case 'number': {
          type = 'REAL'
          break
        }
        case 'boolean': {
          type = 'INTEGER'
          break
        }
        case 'string': {
          type = 'TEXT'
          break
        }
        default: type = 'TEXT'
      }
      result += `"${col}" ${type}, `
    })
    result = result.replace(/,\s$/, ');')
    return result
  },

  getAst (sql) {
    // There is a bug is sqlite-parser
    // It throws an error if tokenizer has an arguments:
    // https://github.com/codeschool/sqlite-parser/issues/59
    const fixedSql = sql
      .replace(/(tokenize=[^,]+)"tokenchars=.+?"/, '$1')
      .replace(/(tokenize=[^,]+)"remove_diacritics=.+?"/, '$1')
      .replace(/(tokenize=[^,]+)"separators=.+?"/, '$1')
      .replace(/tokenize=.+?(,|\))/, 'tokenize=unicode61$1')

    return sqliteParser(fixedSql)
  },

  /*
   * Return an array of columns with name and type. E.g.:
   * [
   *   { name: 'id',    type: 'INTEGER' },
   *   { name: 'title', type: 'NVARCHAR(30)' },
   * ]
  */
  getColumns (sql) {
    const columns = []
    const ast = this.getAst(sql)

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
}
