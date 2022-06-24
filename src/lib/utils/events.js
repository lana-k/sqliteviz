export function send (payload) {
  console.log(payload)
  if (!window.sendEvent) {
    return
  }

  const event = new CustomEvent('sqliteviz-app-event', {
    detail: payload
  })
  window.dispatchEvent(event)
}
