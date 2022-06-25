export function send (name, value, labels) {
  console.log(name, value, labels)

  const event = new CustomEvent('sqliteviz-app-event', {
    detail: {
      name,
      value,
      labels
    }
  })
  window.dispatchEvent(event)
}
