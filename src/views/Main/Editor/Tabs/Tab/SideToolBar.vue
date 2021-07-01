<template>
  <div>
    <slot/>
    <button @click="$emit('switch')">Switch to {{ switchTo }}</button>
  </div>
</template>

<script>
export default {
  name: 'SideToolBar',
  props: ['switchTo']
}
</script>

<style scoped>
</style>
