<template>
  <svg
    @click.stop="$emit('click')"
    :class="['icon', {'disabled': disabled }]"
    :width="size"
    :height="size"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14
      12.59L8.41 7L14 1.41Z"
      fill="#A2B1C6"
    />
  </svg>
</template>

<script>
export default {
  name: 'CloseIcon',
  props: {
    size: {
      type: Number,
      required: false,
      default: 14
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    }
  }
}
</script>

<style scoped>
.icon {
  cursor: pointer;
}
.disabled {
  pointer-events: none;
}
.icon:hover path {
  fill: var(--color-text-base);
}
</style>
