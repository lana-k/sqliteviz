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
      this.tooltipStyle.top = e.clientY - 12 + 'px'
      this.tooltipStyle.left = e.clientX + 12 + 'px'
      this.tooltipStyle.visibility = 'visible'
    },
    hideTooltip () {
      this.tooltipStyle.visibility = 'hidden'
    }
  }
}
