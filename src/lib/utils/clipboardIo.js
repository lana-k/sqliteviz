import Lib from 'plotly.js/src/lib'
import dataUrlToBlob from 'dataurl-to-blob'

async function _copyBlob(blob) {
  await navigator.clipboard.write([
    new ClipboardItem({
      [blob.type]: blob
    })
  ])
}

export default {
  async copyCsv (str) {
    await navigator.clipboard.writeText(str)
    Lib.notifier('CSV copied to clipboard successfully', 'long')
  },

  async copyCanvas (canvas, type) {
    canvas.toBlob(async (blob) => {
      await _copyBlob(blob)
      Lib.notifier('Image copied to clipboard successfully', 'long')
    }, 'image/png', 1)
  },

  async copyFromDataUrl (url) {
    const blob = dataUrlToBlob(url)
    await _copyBlob(blob)
    Lib.notifier('Image copied to clipboard successfully', 'long')
  }
}
