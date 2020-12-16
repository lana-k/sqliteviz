<template>
  <div class="db-upload-container">
    <label for="assetsFieldHandle">
      <div class="drop-area" @dragover="dragover" @dragleave="dragleave" @drop="drop">
        <input
          type="file"
          id="assetsFieldHandle"
          @change="loadDb"
          ref="file"
          accept=".db,.sqlite,.sqlite3"
        />
        <div class="text">
          Drop the database file here or click to choose a file from your computer.
        </div>
      </div>
    </label>
    <div id="error" class="error"></div>
  </div>
</template>

<script>
export default {
  name: 'DbUpload',
  methods: {
    loadDb () {
      return this.$db.loadDb(this.$refs.file.files[0])
        .then((schema) => {
          this.$store.commit('saveSchema', schema)
          if (this.$route.path !== '/editor') {
            this.$router.push('/editor')
          }
        })
    },
    dragover (event) {
      event.preventDefault()
      // TODO: Add some visual stuff to show the user can drop its files
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
        .then(() => {
          // Clean up
          event.currentTarget.classList.add('bg-gray-100')
          event.currentTarget.classList.remove('bg-green-300')
        })
    }
  }
}
</script>

<style scoped>
label {
  display: inline-block;
  border: 1px dashed var(--color-border);
  padding: 8px;
  border-radius: var(--border-radius-big);
  height: 100%;
  width: 100%;
  box-sizing: border-box;
}

.drop-area {
  background-color: var(--color-bg-light-3);
  border-radius: var(--border-radius-big);
  color: var(--color-text-base);
  font-size: 13px;
  text-align: center;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

input {
  display: none;
}
</style>
