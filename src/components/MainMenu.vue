<template>
  <nav>
    <div>
      <router-link to="/editor">Editor</router-link>
      <router-link to="/my-queries">My queries</router-link>
    </div>
    <div>
      <button>Save</button>
      <button>Create</button>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'MainMenu'
}
</script>
<style scoped>
nav {
  height: 68px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--color-bg-light);
  border-bottom: 1px solid var(--color-border-light);
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
}
</style>
