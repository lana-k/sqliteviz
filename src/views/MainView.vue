<template>
  <div>
    <main-menu />
    <router-view id="main-view" />
  </div>
</template>

<script>
import MainMenu from '@/components/MainMenu'
import '@/assets/styles/scrollbars.css'

export default {
  name: 'MainView',
  components: { MainMenu }
}
</script>
<style scoped>
#main-view {
  margin-top: 68px;
  height: calc(100vh - 68px);
  overflow-y: auto;
}
</style>
