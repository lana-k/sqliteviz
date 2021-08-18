export default {
  * generateChunks (data, size) {
    const matrix = Object.keys(data).map(col => data[col])
    const [row] = matrix
    const transposedMatrix = row.map((value, column) => matrix.map(row => row[column]))

    const count = Math.ceil(transposedMatrix.length / size)

    for (let i = 0; i <= count - 1; i++) {
      const start = size * i
      const end = start + size
      yield transposedMatrix.slice(start, end)
    }
  },

  getInsertStmt (tabName, columns) {
    const colList = `"${columns.join('", "')}"`
    const params = columns.map(() => '?').join(', ')
    return `INSERT INTO "${tabName}" (${colList}) VALUES (${params});`
  },

  getCreateStatement (tabName, data) {
    let result = `CREATE table "${tabName}"(`
    for (const col in data) {
      // Get the first row of values to determine types
      const value = data[col][0]
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
    }

    result = result.replace(/,\s$/, ');')
    return result
  }
}
