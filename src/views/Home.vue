<template>
  <div id="dbloader-container">
    <h1>Sqliteviz</h1>
    <db-upload />
    <button id ="skip" class="secondary" @click="$router.push('/editor')">
      Skip database connection for now
    </button>
  </div>
</template>

<script>
import dbUpload from '@/components/DbUpload'

export default {
  name: 'Home',
  components: { dbUpload },
  methods: {
    loadDb () {
      this.$db.loadDb(this.$refs.file.files[0])
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

#skip {
  position: absolute;
  bottom: 50px;
}

>>>.drop-area {
  width: 628px;
  height: 490px;
  padding: 0 150px;
}
</style>
