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
      <g clip-path="url(#clip0)">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          :d="
            `M13.6573 1.5H2.59985C1.77485 1.5 1.09985 2.175 1.09985 3V13.6649C1.09985 14.4899
            1.77485 15.1649 2.59985
            15.1649H9.84V13.6649H8.87866V9.08244H13.6573V9.83777H15.1573V3C15.1573
            2.17 14.4873 1.5 13.6573 1.5ZM13.6573
            7.58244V3H8.87866V7.58244H13.6573ZM7.37866 3H2.59985V7.58244H7.37866V3ZM2.59985
            9.08244V13.6649H7.37866V9.08244H2.59985ZM13.1702
            10.8434H15.6702V13.1717H18.0001V15.6717H15.6702V18H13.1702V15.6717H10.8401V13.` +
            '1717H13.1702V10.8434Z'
          "
          fill="#A2B1C6"
        />
      </g>
      <defs>
        <clipPath id="clip0">
          <rect width="18" height="18" fill="white"/>
        </clipPath>
      </defs>
    </svg>
    <span class="icon-tooltip" :style="tooltipStyle" ref="tooltip">
      Add new table from CSV
    </span>
  </span>
</template>

<script>
import tooltipMixin from '@/tooltipMixin'

export default {
  name: 'AddTableIcon',
  mixins: [tooltipMixin],
  props: ['tooltip'],
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
  margin: 0;
  cursor: pointer;
}

.icon:hover path {
  fill: var(--color-accent);
}
</style>
