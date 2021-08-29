<template>
  <span>
    <svg
      class="icon"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      @click.stop="onClick"
      @mouseenter="showTooltip"
      @mouseleave="hideTooltip"
    >
      <path
        d="M10.545 6.75L11.25 7.455L4.44 14.25H3.75V13.56L10.545 6.75ZM13.245 2.25C13.0575 2.25
        12.8625 2.325 12.72 2.4675L11.3475 3.84L14.16 6.6525L15.5325 5.28C15.825 4.9875 15.825
        4.5 15.5325 4.2225L13.7775 2.4675C13.6275 2.3175 13.44 2.25 13.245 2.25ZM10.545
        4.6425L2.25 12.9375V15.75H5.0625L13.3575 7.455L10.545 4.6425Z"
        fill="#A2B1C6"
      />
    </svg>
    <span class="icon-tooltip" :style="tooltipStyle" ref="tooltip">
      Rename inquiry
    </span>
  </span>
</template>

<script>
import tooltipMixin from '@/tooltipMixin'

export default {
  name: 'RenameIcon',
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
