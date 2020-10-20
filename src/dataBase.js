import store from '@/store'
import router from '@/router'
const worker = new Worker('js/worker.sql-wasm.js')

export default {
  loadDb (file) {
    const dbName = file.name
    store.commit('saveDbName', dbName)
    const f = file
    const r = new FileReader()
    r.onload = () => {
      worker.onmessage = () => {
        const getSchemaSql = `
          SELECT name, sql
          FROM sqlite_master
          WHERE type='table' AND name NOT LIKE 'sqlite_%';`
        worker.onmessage = event => {
          store.commit('saveSchema', event.data.results[0].values)
          if (router.currentRoute.path !== '/editor') {
            router.push('/editor')
          }
        }
        worker.postMessage({ action: 'exec', sql: getSchemaSql })
      }
      store.commit('saveDbFile', r.result)
      try {
        worker.postMessage({ action: 'open', buffer: r.result }, [r.result])
      } catch (exception) {
        worker.postMessage({ action: 'open', buffer: r.result })
      }
    }
    r.readAsArrayBuffer(f)
  },
  execute (commands) {
    return new Promise((resolve, reject) => {
      worker.onmessage = (event) => {
        if (event.data.error) {
          reject(event.data.error)
        }
        // if it was more than one select - take only the first one
        resolve(event.data.results[0])
      }
      worker.postMessage({ action: 'exec', sql: commands })
    })
  }
}
