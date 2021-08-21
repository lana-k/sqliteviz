import Lib from 'plotly.js/src/lib'
import dataUrlToBlob from 'dataurl-to-blob'

async function _copyBlob (blob) {
  await navigator.clipboard.write([
    new ClipboardItem({ // eslint-disable-line no-undef
      [blob.type]: blob
    })
  ])
}

async function _copyFromDataUrl (url) {
  const blob = dataUrlToBlob(url)
  await _copyBlob(blob)
  Lib.notifier('Image copied to clipboard successfully', 'long')
}

async function _copyCanvas (canvas) {
  canvas.toBlob(async (blob) => {
    await _copyBlob(blob)
    Lib.notifier('Image copied to clipboard successfully', 'long')
  }, 'image/png', 1)
}

export default {
  async copyCsv (str) {
    await navigator.clipboard.writeText(str)
    Lib.notifier('CSV copied to clipboard successfully', 'long')
  },

  async copyImage (source) {
    if (source instanceof HTMLCanvasElement) {
      console.log('canvas')
      return _copyCanvas(source)
    } else {
      return _copyFromDataUrl(source)
    }
  }
}
