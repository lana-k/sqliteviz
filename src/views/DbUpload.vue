<template>
  <div>
    <label class="button">
      Load an SQLite database file: <input type='file' ref='dbfile' @change="loadDb">
    </label>
    <div id="error" class="error"></div>
  </div>
</template>

<script>
export default {
  name: 'DbUpload',
  data () {
    return {
      worker: this.$store.state.worker
    }
  },
  created () {
    // Open a database
    this.$store.state.worker.postMessage({ action: 'open' })
  },
  methods: {
    loadDb () {
      const f = this.$refs.dbfile.files[0]
      const r = new FileReader()
      r.onload = () => {
        this.worker.onmessage = () => {
          const getSchemaSql = `
            SELECT name, sql
            FROM sqlite_master
            WHERE type='table' AND name NOT LIKE 'sqlite_%';`
          this.worker.onmessage = event => {
            this.$store.commit('saveSchema', event.data.results[0].values)
            // this.schema = event.data.results[0].values
            this.$router.push('/editor')
          }
          this.worker.postMessage({ action: 'exec', sql: getSchemaSql })
        }
        this.$store.commit('saveDbFile', r.result)
        try {
          this.worker.postMessage({ action: 'open', buffer: r.result }, [r.result])
        } catch (exception) {
          this.worker.postMessage({ action: 'open', buffer: r.result })
        }
      }
      r.readAsArrayBuffer(f)
    }
  }
}
</script>
