<template>
  <div
    ref="container"
    :class="['splitpanes', `splitpanes--${horizontal ? 'horizontal' : 'vertical'}`, { 'splitpanes--dragging': touch.dragging }]"
  >
    <div
      class="splitpanes__pane"
      ref="left"
      :size="paneBefore.size"
      max-size="30"
      :style="styles[0]"
    >
      <slot name="left-pane" />
    </div>

    <splitter
      @mousedown="onMouseDown"
      @toggle="toggleFirstPane"
      :expanded="paneBefore.size !== 0"
    />

    <div
      class="splitpanes__pane"
      ref="right"
      :style="styles[1]"
    >
      <slot name="right-pane" />
    </div>
  </div>
</template>

<script>
import Splitter from '@/components/splitter'

export default {
  name: 'splitpanes',
  components: { Splitter },
  props: {
    horizontal: { type: Boolean, default: false },
    before: { type: Object },
    after: { type: Object }
  },
  data: () => ({
    container: null,
    paneBefore: null,
    paneAfter: null,
    beforeMinimising: 20,
    touch: {
      mouseDown: false,
      dragging: false
    }
  }),

  computed: {
    styles () {
      return [
        { [this.horizontal ? 'height' : 'width']: `${this.paneBefore.size}%` },
        { [this.horizontal ? 'height' : 'width']: `${this.paneAfter.size}%` }
      ]
    }
  },

  methods: {
    bindEvents () {
      document.addEventListener('mousemove', this.onMouseMove, { passive: false })
      document.addEventListener('mouseup', this.onMouseUp)

      // Passive: false to prevent scrolling while touch dragging.
      if ('ontouchstart' in window) {
        document.addEventListener('touchmove', this.onMouseMove, { passive: false })
        document.addEventListener('touchend', this.onMouseUp)
      }
    },

    unbindEvents () {
      document.removeEventListener('mousemove', this.onMouseMove, { passive: false })
      document.removeEventListener('mouseup', this.onMouseUp)

      if ('ontouchstart' in window) {
        document.removeEventListener('touchmove', this.onMouseMove, { passive: false })
        document.removeEventListener('touchend', this.onMouseUp)
      }
    },

    onMouseDown () {
      this.bindEvents()
      this.touch.mouseDown = true
    },

    onMouseMove (event) {
      if (this.touch.mouseDown) {
        // Prevent scrolling while touch dragging (only works with an active event, eg. passive: false).
        event.preventDefault()
        this.touch.dragging = true
        this.calculatePanesSize(this.getCurrentMouseDrag(event))
      }
    },

    onMouseUp () {
      this.touch.mouseDown = false
      // Keep dragging flag until click event is finished (click happens immediately after mouseup)
      // in order to prevent emitting `splitter-click` event if splitter was dragged.
      setTimeout(() => {
        this.touch.dragging = false
        this.unbindEvents()
      }, 100)
    },

    // Get the cursor position relative to the splitpane container.
    getCurrentMouseDrag (event) {
      const rect = this.container.getBoundingClientRect()
      const { clientX, clientY } = ('ontouchstart' in window && event.touches) ? event.touches[0] : event

      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      }
    },

    // Returns the drag percentage of the splitter relative to the 2 panes it's inbetween.
    // if the sum of size of the 2 cells is 60%, the dragPercentage range will be 0 to 100% of this 60%.
    getCurrentDragPercentage (drag) {
      drag = drag[this.horizontal ? 'y' : 'x']
      // In the code bellow 'size' refers to 'width' for vertical and 'height' for horizontal layout.
      const containerSize = this.container[this.horizontal ? 'clientHeight' : 'clientWidth']
      return drag * 100 / containerSize
    },

    calculatePanesSize (drag) {
      const dragPercentage = this.getCurrentDragPercentage(drag)
      // If not pushing other panes, panes to resize are right before and right after splitter.
      const paneBefore = this.paneBefore
      const paneAfter = this.paneAfter

      const paneBeforeMaxReached = paneBefore.max < 100 && (dragPercentage >= paneBefore.max)
      const paneAfterMaxReached = paneAfter.max < 100 && (dragPercentage <= 100 - paneAfter.max)
      // Prevent dragging beyond pane max.
      if (paneBeforeMaxReached || paneAfterMaxReached) {
        if (paneBeforeMaxReached) {
          paneBefore.size = paneBefore.max
          paneAfter.size = Math.max(100 - paneBefore.max, 0)
        } else {
          paneBefore.size = Math.max(100 - paneAfter.max, 0)
          paneAfter.size = paneAfter.max
        }
        return
      }
      paneBefore.size = Math.min(Math.max(dragPercentage, 0), paneBefore.max)
      paneAfter.size = Math.min(Math.max(100 - dragPercentage, 0), paneAfter.max)
    },
    toggleFirstPane () {
      if (this.paneBefore.size > 0) {
        this.beforeMinimising = this.paneBefore.size
        this.paneBefore.size = 0
      } else {
        this.paneBefore.size = this.beforeMinimising
      }
      this.paneAfter.size = 100 - this.paneBefore.size
    }
  },
  mounted () {
    this.container = this.$refs.container
  },
  created () {
    this.paneBefore = this.before
    this.paneAfter = this.after
  }
}
</script>

<style>
.splitpanes {
  display: flex;
  height: 100%;
}

.splitpanes--vertical {flex-direction: row;}
.splitpanes--horizontal {flex-direction: column;}
.splitpanes--dragging * {user-select: none;}

.splitpanes__pane {
  width: 100%;
  height: 100%;
  overflow: auto;
}
</style>
