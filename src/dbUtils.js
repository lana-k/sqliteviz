export default {
  * generateChunks (arr, size) {
    const count = Math.ceil(arr.length / size)

    for (let i = 0; i <= count - 1; i++) {
      const start = size * i
      const end = start + size
      yield arr.slice(start, end)
    }
  },

  getInsertStmt (columns) {
    const colList = `"${columns.join('", "')}"`
    const params = columns.map(() => '?').join(', ')
    return `INSERT INTO csv_import (${colList}) VALUES (${params});`
  },

  getCreateStatement (columns, values) {
    let result = 'CREATE table csv_import('
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
  }
}
