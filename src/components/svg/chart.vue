<template>
  <svg
    :class="['chart-icon', {'disabled': disabled}]"
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
  >
    <line x1="9.41943" y1="10" x2="9.41943" y2="16" stroke="#A2B1C6" stroke-width="2"/>
    <line x1="3.41943" y1="10" x2="3.41943" y2="16" stroke="#A2B1C6" stroke-width="2"/>
    <line x1="12.4194" y1="7" x2="12.4194" y2="16" stroke="#A2B1C6" stroke-width="2"/>
    <path d="M15.4194 8V16" stroke="#A2B1C6" stroke-width="2"/>
    <line x1="6.41943" y1="16" x2="6.41943" y2="12" stroke="#A2B1C6" stroke-width="2"/>
    <path d="M2.41943 5.5L5.91943 8.5L12.4194 2.5L15.9194 6" stroke="#A2B1C6" stroke-linecap="square"/>
  </svg>
</template>

<script>

export default {
  name: 'ChartIcon',
  props: ['disabled']
}
</script>

<style scoped>
.chart-icon {
  cursor: pointer;
}

.chart-icon:hover path {
  fill: var(--color-danger);
}

.disabled.chart-icon {
  cursor: default;
}

.disabled.clear-icon:hover path {
  fill: #C8D4E3;
}
</style>
