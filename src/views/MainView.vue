<template>
  <div>
    <main-menu />
    <keep-alive include="Editor">
      <router-view id="main-view" />
    </keep-alive>
  </div>
</template>

<script>
import MainMenu from '@/components/MainMenu'
import '@/assets/styles/scrollbars.css'

export default {
  name: 'MainView',
  components: { MainMenu },
  created () {
    this.readPredefinedQueries()
      .then(queries => {
        this.$store.commit('updatePredefinedQueries', queries)
      })
      .catch(console.error)
  },
  methods: {
    readPredefinedQueries () {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('GET', './queries.json')
        xhr.onload = () => {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              resolve(JSON.parse(xhr.responseText || '[]'))
            } else {
              reject(xhr.statusText)
            }
          }
        }
        xhr.onerror = () => {
          reject(xhr.statusText)
        }
        xhr.send()
      })
    }
  }
}
</script>
<style scoped>
#main-view {
  margin-top: 68px;
  height: calc(100vh - 68px);
  overflow-y: auto;
}
</style>
