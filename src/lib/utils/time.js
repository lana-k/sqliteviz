export default {
  getPeriod (start, end) {
    const diff = end.getTime() - start.getTime()
    const seconds = diff / 1000
    return seconds.toFixed(3) + 's'
  }
}
