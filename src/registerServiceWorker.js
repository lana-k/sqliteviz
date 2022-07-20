import events from '@/lib/utils/events'
let refresh = false

function invokeServiceWorkerUpdateFlow (registration) {
  const agree = confirm('New version of the app is available. Refresh now?')
  if (agree) {
    if (registration.waiting) {
      // let waiting Service Worker know it should became active
      refresh = true
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
  }
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    const registration = await navigator.serviceWorker.register('service-worker.js')
    // ensure the case when the updatefound event was missed is also handled
    // by re-invoking the prompt when there's a waiting Service Worker
    if (registration.waiting) {
      invokeServiceWorkerUpdateFlow(registration)
    }

    // detect Service Worker update available and wait for it to become installed
    registration.addEventListener('updatefound', () => {
      const newRegestration = registration.installing
      if (newRegestration) {
        // wait until the new Service worker is actually installed (ready to take over)
        newRegestration.addEventListener('statechange', () => {
          if (registration.waiting && navigator.serviceWorker.controller) {
            invokeServiceWorkerUpdateFlow(registration)
          }
        })
      }
    })

    // detect controller change and refresh the page
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refresh) {
        window.location.reload()
        refresh = false
      }
    })
  })

  window.addEventListener('appinstalled', () => {
    events.send('pwa.install')
  })
}
