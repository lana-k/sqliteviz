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
  }
}
