<template>
  <div class="view-switcher">
    <div
      :class="['table-mode', {'active-mode': view === 'table'}]"
      @click="$emit('update:view','table')"
    >
      Table
    </div>
    <div
      :class="['chart-mode', {'active-mode': view === 'chart'}]"
      @click="$emit('update:view','chart')"
    >
      Chart
    </div>
  </div>
</template>

<script>
export default {
  name: 'ViewSwitcher',
  props: ['view']
}
</script>

<style scoped>
.view-switcher {
  height: 28px;
  display: flex;
  margin: 12px;
}
.view-switcher div {
  height: 100%;
  width: 136px;
  box-sizing: border-box;
  line-height: 28px;
  font-size: 12px;
  cursor: pointer;
  background: var(--color-white);
  border: 1px solid var(--color-border);
  color: var(--color-text-base);
  text-align: center;
  font-weight: 400;
}
.view-switcher div:hover {
  background-color: var(--color-bg-light);
  color: var(--color-text-active);
}
.view-switcher div.active-mode {
  background: var(--color-accent);
  border: 1px solid var(--color-accent-shade);
  color: var(--color-text-light);
  text-shadow: var(--shadow);
  z-index: 1;
  font-weight: 600;
}
.view-switcher div.active-mode:hover {
  background: var(--color-accent-shade);
}
.table-mode {
  border-radius: var(--border-radius-medium) 0 0 var(--border-radius-medium);
}
.chart-mode {
  margin-left: -1px;
  border-radius: 0 var(--border-radius-medium) var(--border-radius-medium) 0;
}
</style>
