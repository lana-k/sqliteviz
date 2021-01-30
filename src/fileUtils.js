export default {
  exportToFile (str, fileName, type = 'octet/stream') {
    // Create downloader
    const downloader = document.createElement('a')
    const blob = new Blob([str], { type })
    const url = URL.createObjectURL(blob)
    downloader.href = url
    downloader.download = fileName

    // Trigger click
    downloader.click()

    // Clean up
    URL.revokeObjectURL(url)
    downloader.remove()
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
        uploader.remove()
        resolve(file)
      })

      uploader.click()
    })
  },

  importFile () {
    return this.getFileFromUser('.json')
      .then(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = e => {
            resolve(e.target.result)
          }
          reader.readAsText(file)
        })
      })
  },

  readFile (path) {
    return fetch(path)
  }
}
