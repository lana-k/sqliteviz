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
  importFile () {
    return new Promise((resolve, reject) => {
      const uploader = document.createElement('input')

      uploader.id = 'file-uploader'
      uploader.type = 'file'
      uploader.accept = '.json'

      uploader.addEventListener('change', () => {
        const file = uploader.files[0]
        const reader = new FileReader()
        reader.onload = (e) => {
          resolve(e.target.result)
        }
        reader.readAsText(file)
      })

      uploader.click()
    })
  }
}
