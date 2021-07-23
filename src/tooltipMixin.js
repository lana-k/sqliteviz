export default {
  data () {
    return {
      tooltipStyle: {
        visibility: 'hidden'
      }
    }
  },
  computed: {
    tooltipElement () {
      return this.$refs.tooltip
    }
  },
  methods: {
    showTooltip (e, tooltipPosition) {
      const position = tooltipPosition ? tooltipPosition.split('-') : ['top', 'right']
      const offset = 12

      if (position[0] === 'top') {
        this.tooltipStyle.top = e.clientY - offset + 'px'
      } else {
        this.tooltipStyle.top = e.clientY + offset + 'px'
      }

      if (position[1] === 'right') {
        this.tooltipStyle.left = e.clientX + offset + 'px'
      } else {
        this.tooltipStyle.left = e.clientX - offset - this.tooltipElement.offsetWidth + 'px'
      }

      this.tooltipStyle.visibility = 'visible'
    },
    hideTooltip () {
      this.tooltipStyle.visibility = 'hidden'
    }
  }
}
