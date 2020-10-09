<template>
  <div id="dbloader-container">
    <h1>Sqliteviz</h1>
    <label for="assetsFieldHandle">
      <div id="drop-area" @dragover="dragover" @dragleave="dragleave" @drop="drop">
        <input
          type="file"
          id="assetsFieldHandle"
          @change="loadDb"
          ref="file"
          accept=".db"
        />
        <div>
          Drop the database file to upload here or click to choose a file from your computer.
        </div>
      </div>
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
  methods: {
    loadDb () {
      const dbName = this.$refs.file.value.substr(this.$refs.file.value.lastIndexOf('\\') + 1)
      this.$store.commit('saveDbName', dbName)
      const f = this.$refs.file.files[0]
      const r = new FileReader()
      r.onload = () => {
        this.worker.onmessage = () => {
          const getSchemaSql = `
            SELECT name, sql
            FROM sqlite_master
            WHERE type='table' AND name NOT LIKE 'sqlite_%';`
          this.worker.onmessage = event => {
            this.$store.commit('saveSchema', event.data.results[0].values)
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
    },
    dragover (event) {
      event.preventDefault()
      // TODO: Add some visual fluff to show the user can drop its files
      if (!event.currentTarget.classList.contains('bg-green-300')) {
        event.currentTarget.classList.remove('bg-gray-100')
        event.currentTarget.classList.add('bg-green-300')
      }
    },
    dragleave (event) {
      // Clean up
      event.currentTarget.classList.add('bg-gray-100')
      event.currentTarget.classList.remove('bg-green-300')
    },
    drop (event) {
      event.preventDefault()
      this.$refs.file.files = event.dataTransfer.files
      this.loadDb()
      // Clean up
      event.currentTarget.classList.add('bg-gray-100')
      event.currentTarget.classList.remove('bg-green-300')
    }
  }
}
</script>

<style scoped>
#dbloader-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
h1 {
  color: var(--color-accent);
}
label {
  display: inline-block;
  border: 1px dashed var(--color-border);
  padding: 8px;
  border-radius: var(--border-radius-big);
}
#drop-area {
  width: 231px;
  height: 153px;
  background-color: var(--color-bg-light-3);
  border-radius: var(--border-radius-big);
  color: var(--color-text-base);
  font-size: 13px;
  padding: 44px 15px;
  text-align: center;
  box-sizing: border-box;
}
input {
  display: none;
}
</style>
