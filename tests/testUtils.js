export function waitCondition(condition, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    if (condition()) {
      resolve()
      return
    }
    const start = new Date().getTime()
    const interval = setInterval(() => {
      if (condition()) {
        clearInterval(interval)
        resolve()
      } else {
        if (new Date().getTime() - start > timeoutMs) {
          clearInterval(interval)
          reject()
        }
      }
    }, 500)
  })
}
