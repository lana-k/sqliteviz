<template>
  <div>
    <svg
      class="db-edit-icon"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      @click.stop="onClick"
      @mouseenter="showTooltip"
      @mouseleave="hideTooltip"
    >
      <path
        d="M3 10.5V12.75C3 14.25 5.2875 15.54 8.25 15.75V13.5825L8.3475 13.5C5.34 13.32 3 12.045 3
      10.5ZM9 9.75C5.685 9.75 3 8.4075 3 6.75V9C3 10.6575 5.685 12 9 12C9.2925 12 9.5775 12
      9.87 12L12.75 9.09C11.55 9.54 10.2825 9.75 9 9.75ZM9 2.25C5.685 2.25 3 3.5925 3 5.25C3
      6.9075 5.685 8.25 9 8.25C12.315 8.25 15 6.9075 15 5.25C15 3.5925 12.315 2.25 9 2.25ZM15.75
      8.3475C15.6375 8.3475 15.5325 8.3925 15.4575 8.475L14.7075 9.225L16.245 10.725L16.995
      9.975C17.1525 9.825 17.16 9.57 16.995 9.3975L16.065 8.475C15.99 8.3925 15.885 8.3475 15.78
      8.3475H15.75ZM14.28 9.66L9.75 14.205V15.75H11.295L15.84 11.1975L14.28 9.66Z"
        fill="#A2B1C6"
      />
    </svg>
    <span ref="tooltip" class="icon-tooltip" :style="tooltipStyle">
      Load another database, CSV, JSON or NDJSON
    </span>
  </div>
</template>

<script>
import tooltipMixin from '@/tooltipMixin'

export default {
  name: 'ChangeDbIcon',
  mixins: [tooltipMixin],
  emits: ['click'],
  methods: {
    onClick() {
      this.hideTooltip()
      this.$emit('click')
    }
  }
}
</script>

<style scoped>
.db-edit-icon {
  display: block;
  cursor: pointer;
}
.db-edit-icon:hover path {
  fill: var(--color-accent);
}
</style>
