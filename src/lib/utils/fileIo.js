export default {
  isDatabase (file) {
    const dbTypes = ['application/vnd.sqlite3', 'application/x-sqlite3']
    return file.type
      ? dbTypes.includes(file.type)
      : /\.(db|sqlite(3)?)+$/.test(file.name)
  },

  getFileName (file) {
    return file.name.replace(/\.[^.]+$/, '')
  },

  downloadFromUrl (url, fileName) {
    // Create downloader
    const downloader = document.createElement('a')
    downloader.href = url
    downloader.download = fileName

    // Trigger click
    downloader.click()

    // Clean up
    URL.revokeObjectURL(url)
  },

  async exportToFile (str, fileName, type = 'octet/stream') {
    const blob = new Blob([str], { type })
    const url = URL.createObjectURL(blob)
    this.downloadFromUrl(url, fileName)
  },

  /**
   * Note: if user press Cancel in file choosing dialog
   * it will be an unsettled promise. But it's grabbed by
   * the garbage collector (tested with FinalizationRegistry).
   */
  getFileFromUser (type) {
    return new Promise(resolve => {
      const uploader = document.createElement('input')

      uploader.type = 'file'
      uploader.accept = type

      uploader.addEventListener('change', () => {
        const file = uploader.files[0]
        resolve(file)
      })

      uploader.click()
    })
  },

  importFile () {
    const reader = new FileReader()

    return this.getFileFromUser('.json')
      .then(file => {
        return new Promise((resolve, reject) => {
          reader.onload = e => {
            resolve(e.target.result)
          }
          reader.readAsText(file)
        })
      })
  },

  readFile (path) {
    return fetch(path)
  },

  readAsArrayBuffer (file) {
    const fileReader = new FileReader()

    return new Promise((resolve, reject) => {
      fileReader.onerror = () => {
        fileReader.abort()
        reject(new Error('Problem parsing input file.'))
      }

      fileReader.onload = () => {
        resolve(fileReader.result)
      }
      fileReader.readAsArrayBuffer(file)
    })
  }
}
