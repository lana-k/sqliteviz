<template>
  <svg
    :class="['run-icon', {'disabled': disabled}]"
    width="12"
    height="13"
    viewBox="0 0 12 13"
    fill="none"
  >
    <path d="M11.1624 6.94358L0.770043 12.9436L0.770043 0.943573L11.1624 6.94358Z" fill="#A2B1C6"/>
  </svg>
</template>

<script>

export default {
  name: 'RunIcon',
  props: ['disabled']
}
</script>

<style scoped>
.run-icon {
  cursor: pointer;
}

.run-icon:hover path {
  fill: var(--color-danger);
}

.disabled.run-icon {
  cursor: default;
}

.disabled.run-icon:hover path {
  fill: #C8D4E3;
}
</style>
