import store from '@/store'
const worker = new Worker('js/worker.sql-wasm.js')

export default {
  loadDb (file) {
    return new Promise((resolve, reject) => {
      const dbName = file.name
      store.commit('saveDbName', dbName)
      const f = file
      const r = new FileReader()
      r.onload = () => {
        // on 'action: open' completed
        worker.onmessage = () => {
          const getSchemaSql = `
            SELECT name, sql
            FROM sqlite_master
            WHERE type='table' AND name NOT LIKE 'sqlite_%';`

          // on 'action: exec' completed
          worker.onmessage = event => {
            resolve(event.data.results[0].values)
          }
          worker.postMessage({ action: 'exec', sql: getSchemaSql })
        }

        try {
          worker.postMessage({ action: 'open', buffer: r.result }, [r.result])
        } catch (exception) {
          worker.postMessage({ action: 'open', buffer: r.result })
        }
      }
      r.readAsArrayBuffer(f)
    })
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
