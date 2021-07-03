<template>
  <svg
    :class="['pivot-icon', {'disabled': disabled}]"
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
  >
    <path d="M15.7661 6.59674V12.8467C15.7661 14.5134 14.9328 15.3467 13.2661 15.3467H7.01611M15.7661 6.59674L17.0161 8.68007H14.5161L15.7661 6.59674ZM7.01611 15.3467L9.09945 14.0967V16.5967L7.01611 15.3467Z" stroke="#A2B1C6" stroke-width="1.5" stroke-linecap="round"/>
    <rect x="6.41943" width="12" height="4" fill="#A2B1C6"/>
    <rect x="0.419434" y="6" width="4" height="12" fill="#A2B1C6"/>
    <rect x="0.419434" width="4" height="4" fill="#A2B1C6"/>
  </svg>
</template>

<script>

export default {
  name: 'PivotIcon',
  props: ['disabled']
}
</script>

<style scoped>
.pivot-icon {
  cursor: pointer;
}

.pivot-icon:hover path {
  fill: var(-1-color-danger);
}

.disabled.pivot-icon {
  cursor: default;
}

.disabled.pivot-icon:hover path {
  fill: #C8D4E3;
}
</style>
