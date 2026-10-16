export default {
  data() {
    return {
      tooltipStyle: {
        visibility: 'hidden'
      },
      showTooltipTimeout: null
    }
  },
  computed: {
    tooltipElement() {
      return this.$refs.tooltip
    }
  },
  methods: {
    showTooltip(e, tooltipPosition) {
      this.showTooltipTimeout = setTimeout(() => {
        const position = tooltipPosition
          ? tooltipPosition.split('-')
          : ['top', 'right']
        const offset = 12

        if (position[0] === 'top') {
          this.tooltipStyle.top = e.clientY - offset + 'px'
        } else {
          this.tooltipStyle.top = e.clientY + offset + 'px'
        }

        if (position[1] === 'right') {
          this.tooltipStyle.left = e.clientX + offset + 'px'
        } else {
          this.tooltipStyle.left =
            e.clientX - offset - this.tooltipElement.offsetWidth + 'px'
        }

        this.tooltipStyle.visibility = 'visible'
      }, 500)
    },
    hideTooltip() {
      this.showTooltipTimeout && clearTimeout(this.showTooltipTimeout)
      this.tooltipStyle.visibility = 'hidden'
    }
  }
}
