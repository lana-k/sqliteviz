export default {
  data () {
    return {
      tooltipStyle: {
        visibility: 'hidden'
      }
    }
  },
  methods: {
    showTooltip (e) {
      this.$set(this.tooltipStyle, 'top', e.clientY - 12 + 'px')
      this.$set(this.tooltipStyle, 'left', e.clientX + 12 + 'px')
      this.$set(this.tooltipStyle, 'visibility', 'visible')
    },
    hideTooltip () {
      this.$set(this.tooltipStyle, 'visibility', 'hidden')
    }
  }
}
