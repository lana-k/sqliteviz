import Lib from 'plotly.js/src/lib'
import dataUrlToBlob from 'dataurl-to-blob'

export default {
  async copyCsv (str) {
    await navigator.clipboard.writeText(str)
    Lib.notifier('CSV copied to clipboard successfully', 'long')
  },

  async copyImage (source) {
    if (source instanceof HTMLCanvasElement) {
      return this._copyCanvas(source)
    } else {
      return this._copyFromDataUrl(source)
    }
  },

  async _copyBlob (blob) {
    await navigator.clipboard.write([
      new ClipboardItem({ // eslint-disable-line no-undef
        [blob.type]: blob
      })
    ])
  },

  async _copyFromDataUrl (url) {
    const blob = dataUrlToBlob(url)
    await this._copyBlob(blob)
    Lib.notifier('Image copied to clipboard successfully', 'long')
  },

  async _copyCanvas (canvas) {
    canvas.toBlob(async (blob) => {
      await this._copyBlob(blob)
      Lib.notifier('Image copied to clipboard successfully', 'long')
    }, 'image/png', 1)
  }
}
