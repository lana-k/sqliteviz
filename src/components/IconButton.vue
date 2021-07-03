<template>
  <div :class="['icon-btn', { active }]" @click="$emit('click')">
    <slot/>
  </div>
</template>

<script>
export default {
  name: 'SideBarButton',
  props: ['active', 'disabled']
}
</script>

<style scoped>
.icon-btn {
  box-sizing: border-box;
  width: 26px;
  height: 26px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-btn:hover {
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-medium-2);
}
</style>
