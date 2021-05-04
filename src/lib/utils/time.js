export default {
  getPeriod (start, end) {
    let diff = end.getTime() - start.getTime()
    let result = ''

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    diff -= days * (1000 * 60 * 60 * 24)
    if (days) {
      result += days + ' d '
    }

    const hours = Math.floor(diff / (1000 * 60 * 60))
    diff -= hours * (1000 * 60 * 60)
    if (hours) {
      result += hours + ' h '
    }

    const mins = Math.floor(diff / (1000 * 60))
    diff -= mins * (1000 * 60)
    if (mins) {
      result += mins + ' m '
    }

    const seconds = Math.floor(diff / (1000))
    diff -= seconds * (1000)
    if (seconds) {
      result += seconds + ' s '
    }

    if (diff) {
      result += diff + ' ms '
    }

    return result.replace(/\s$/, '')
  }
}
