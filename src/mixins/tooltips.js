export default {
  data () {
    return {
      tooltipStyle: {}
    }
  },
  methods: {
    showTooltip (e) {
      this.tooltipStyle = {
        visibility: 'visible',
        position: 'fixed',
        top: e.clientY - 12 + 'px',
        left: e.clientX + 12 + 'px'
      }
    },
    hideTooltip () {
      this.$set(this.tooltipStyle, 'visibility', 'hidden')
    }
  }
}
