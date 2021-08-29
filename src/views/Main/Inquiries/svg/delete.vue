<template>
  <span>
    <svg
      class="icon"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      @click.stop="onClick"
      @mouseenter="showTooltip($event, 'top-left')"
      @mouseleave="hideTooltip"
    >
      <path
        d="M6.75 2.25V3H3V4.5H3.75V14.25C3.75 14.6478 3.90804 15.0294 4.18934 15.3107C4.47064
        15.592 4.85218 15.75 5.25 15.75H12.75C13.1478 15.75 13.5294 15.592 13.8107
        15.3107C14.092 15.0294 14.25 14.6478 14.25 14.25V4.5H15V3H11.25V2.25H6.75ZM5.25
        4.5H12.75V14.25H5.25V4.5ZM6.75 6V12.75H8.25V6H6.75ZM9.75 6V12.75H11.25V6H9.75Z"
        fill="#A2B1C6"
      />
    </svg>
    <span class="icon-tooltip" :style="tooltipStyle" ref="tooltip">
      Delete inquiry
    </span>
  </span>
</template>

<script>
import tooltipMixin from '@/tooltipMixin'

export default {
  name: 'DeleteIcon',
  mixins: [tooltipMixin],
  methods: {
    onClick () {
      this.hideTooltip()
      this.$emit('click')
    }
  }
}
</script>

<style scoped>
.icon {
  display: block;
  margin: 0 12px;
}

.icon:hover path {
  fill: var(--color-accent);
}
</style>
