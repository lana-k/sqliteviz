import Lib from 'plotly.js/src/lib'

export default {
  async copyCsv (str) {
    await navigator.clipboard.writeText(str)
    Lib.notifier('CSV copied to clipboard successfully', 'long')
  }
}
