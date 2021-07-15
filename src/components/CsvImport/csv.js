import Papa from 'papaparse'

const hintsByCode = {
  MissingQuotes: 'Edit your CSV so that the field has a closing quote char.',
  TooFewFields: 'Add fields or try another delimiter.',
  TooManyFields: 'Edit your CSV or try another delimiter.'
}

export default {
  getResult (source) {
    const result = {}
    if (source.meta.fields) {
      source.meta.fields.forEach(col => {
        result[col.trim()] = source.data.map(row => {
          let value = row[col]
          if (value instanceof Date) {
            value = value.toISOString()
          }
          return value
        })
      })
    } else {
      for (let i = 0; i <= source.data[0].length - 1; i++) {
        result[`col${i + 1}`] = source.data.map(row => {
          let value = row[i]
          if (value instanceof Date) {
            value = value.toISOString()
          }
          return value
        })
      }
    }
    return result
  },

  parse (file, config = {}) {
    return new Promise((resolve, reject) => {
      const defaultConfig = {
        delimiter: '', // auto-detect
        newline: '', // auto-detect
        quoteChar: '"',
        escapeChar: '"',
        header: false,
        transformHeader: undefined,
        dynamicTyping: true,
        preview: 0,
        encoding: 'UTF-8',
        worker: true,
        comments: false,
        step: undefined,
        complete: results => {
          const res = {
            data: this.getResult(results),
            delimiter: results.meta.delimiter,
            hasErrors: false,
            rowCount: results.data.length
          }
          res.messages = results.errors.map(msg => {
            msg.type = msg.code === 'UndetectableDelimiter' ? 'info' : 'error'
            if (msg.type === 'error') res.hasErrors = true
            msg.hint = hintsByCode[msg.code]
            return msg
          })
          resolve(res)
        },
        error: (error, file) => {
          reject(error)
        },
        download: false,
        downloadRequestHeaders: undefined,
        downloadRequestBody: undefined,
        skipEmptyLines: 'greedy',
        chunk: undefined,
        chunkSize: undefined,
        fastMode: undefined,
        beforeFirstChunk: undefined,
        withCredentials: undefined,
        transform: undefined,
        delimitersToGuess: [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP]
      }

      Papa.parse(file, { ...defaultConfig, ...config })
    })
  }
}
