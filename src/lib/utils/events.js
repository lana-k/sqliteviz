export function send (payload) {
  console.log(payload)

  const event = new CustomEvent('sqliteviz-app-event', {
    detail: payload
  })
  window.dispatchEvent(event)
}
