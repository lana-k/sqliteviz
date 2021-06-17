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
      result.columns = source.meta.fields.map(col => col.trim())
      result.values = source.data.map(row => {
        const resultRow = []
        source.meta.fields.forEach(col => { resultRow.push(row[col]) })
        return resultRow
      })
    } else {
      result.values = source.data
      result.columns = []
      for (let i = 1; i <= source.data[0].length; i++) {
        result.columns.push(`col${i}`)
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
            hasErrors: false
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
