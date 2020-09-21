<template>
  <nav>
    <div>
      <router-link to="/editor">Editor</router-link>
      <router-link to="/my-queries">My queries</router-link>
    </div>
    <div>
      <button class="primary" disabled>Save</button>
      <button class="primary">Create</button>
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
  padding: 0 52px;
}
a {
  font-size: 18px;
  color: var(--color-text-base);
  text-transform: none;
  text-decoration: none;
  margin-right: 28px;
}
a.router-link-active {
  color: var(--color-accent);
}
button {
  margin-left: 16px;
}
</style>
