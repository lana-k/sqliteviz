export default {
  getPeriod (start, end) {
    const diff = end.getTime() - start.getTime()
    const seconds = diff / 1000
    return seconds.toFixed(3) + 's'
  },

  debounce (func, ms) {
    let timeout
    return function () {
      clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(this, arguments), ms)
    }
  },

  sleep (ms) {
    return new Promise(resolve => {
      setTimeout(() => { resolve() }, ms)
    })
  }
}
