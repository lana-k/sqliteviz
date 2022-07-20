export default {
  send (name, value, labels) {
    const event = new CustomEvent('sqliteviz-app-event', {
      detail: {
        name,
        value,
        labels: labels || {}
      }
    })
    window.dispatchEvent(event)
  }
}
