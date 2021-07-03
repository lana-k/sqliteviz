<template>
  <div :class="['icon-btn', { active }, { disabled }]" @click="$emit('click')">
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

.icon-btn:hover >>> path,
.icon-btn.active >>> path,
.icon-btn:hover >>> circle,
.icon-btn.active >>> circle {
  fill: var(--color-accent);
}

.disabled.icon-btn {
  cursor: default;
}

.disabled.icon-btn:hover >>> path {
  fill: #C8D4E3;
}
</style>
