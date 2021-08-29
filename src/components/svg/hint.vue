<template>
  <div>
    <svg
      class="hint-icon"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      @click.stop="onClick"
      @mouseenter="showTooltip"
      @mouseleave="hideTooltip"
    >
      <path
        d="M8.75 14.1666H10.4167V12.5H8.75V14.1666ZM9.58333 16.25C5.90833 16.25 2.91667 13.2583
        2.91667 9.58333C2.91667 5.90833 5.90833 2.91667 9.58333 2.91667C13.2583 2.91667 16.25
        5.90833 16.25 9.58333C16.25 13.2583 13.2583 16.25 9.58333 16.25ZM9.58333 1.25C8.48898
        1.25 7.40535 1.46555 6.3943 1.88434C5.38326 2.30313 4.4646 2.91696 3.69078
        3.69078C2.12797 5.25358 1.25 7.3732 1.25 9.58333C1.25 11.7935 2.12797 13.9131 3.69078
        15.4759C4.4646 16.2497 5.38326 16.8635 6.3943 17.2823C7.40535 17.7011 8.48898 17.9167
        9.58333 17.9167C11.7935 17.9167 13.9131 17.0387 15.4759 15.4759C17.0387 13.9131 17.9167
        11.7935 17.9167 9.58333C17.9167 8.48898 17.7011 7.40535 17.2823 6.3943C16.8635 5.38326
        16.2497 4.4646 15.4759 3.69078C14.7021 2.91696 13.7834 2.30313 12.7724 1.88434C11.7613
        1.46555 10.6777 1.25 9.58333 1.25Z"
        fill="#A2B1C6"
      />
      <path
        d="M9.91601 4.51787C8.98167 4.42606 8.05144 4.69097 7.36309 5.24472C6.68735 5.78828
        6.2998 6.56661 6.2998 7.38012H7.92488C7.92488 6.97463 8.11059 6.60187 8.44779
        6.33061C8.79784 6.049 9.25647 5.92005 9.73896 5.96755C10.4832 6.04076 11.0828 6.57277
        11.1647 7.23265C11.2306 7.764 10.9661 8.28194 10.4744 8.58426C9.38676 9.25303 8.73742
        10.343 8.73742 11.5H10.3625C10.3625 10.8243 10.7477 10.184 11.3929 9.78733C12.3808
        9.17985 12.9122 8.13913 12.7798 7.07124C12.6144 5.73863 11.41 4.66476 9.91601 4.51787Z"
        fill="#A2B1C6"
      />
    </svg>
    <span class="icon-tooltip" :style="{...tooltipStyle, maxWidth: maxWidth }" ref="tooltip">
      {{ hint }}
    </span>
  </div>
</template>

<script>
import tooltipMixin from '@/tooltipMixin'

export default {
  name: 'HintIcon',
  props: ['hint', 'maxWidth'],
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
.hint-icon {
  display: block;
  cursor: pointer;
}
.hint-icon:hover path {
  fill: var(--color-text-base);
}
.icon-tooltip {
  display: block;
  white-space: normal;
  height: auto;
  line-height: normal;
  padding: 6px;
  box-sizing: border-box;
}
</style>
