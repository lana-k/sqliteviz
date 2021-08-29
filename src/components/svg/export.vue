<template>
  <span>
    <svg
      class="icon"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      @click.stop="onClick"
      @mouseenter="showTooltip($event, tooltipPosition)"
      @mouseleave="hideTooltip"
    >
      <path
        d="M10.5 1.5H4.5C3.675 1.5 3 2.175 3 3V15C3 15.825 3.675 16.5 4.5 16.5H13.5C14.325 16.5
        15 15.825 15 15V6L10.5 1.5ZM13.5 15H4.5V3H9.75V6.75H13.5V15ZM12 8.25V13.575L10.425
        12L8.325 14.1L6.225 12L8.325 9.9L6.675 8.25H12Z"
        fill="#A2B1C6"
      />
    </svg>
    <span class="icon-tooltip" :style="tooltipStyle" ref="tooltip">
      {{ tooltip }}
    </span>
  </span>
</template>

<script>
import tooltipMixin from '@/tooltipMixin'

export default {
  name: 'ExportIcon',
  mixins: [tooltipMixin],
  props: ['tooltip', 'tooltipPosition'],
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
  cursor: pointer;
}

.icon:hover path {
  fill: var(--color-accent);
}
</style>
