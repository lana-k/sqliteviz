<template>
  <div>
    <main-menu />
    <keep-alive include="Workspace">
      <router-view id="main-view" />
    </keep-alive>
  </div>
</template>

<script>
import MainMenu from './MainMenu'
import '@/assets/styles/scrollbars.css'

export default {
  name: 'Main',
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
