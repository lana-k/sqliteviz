<template>
  <div
    ref="container"
    :class="[
      'splitpanes',
      `splitpanes--${horizontal ? 'horizontal' : 'vertical'}`,
      { 'splitpanes--dragging': touch.dragging }
    ]"
  >
    <div class="movable-splitter" ref="movableSplitter" :style="movableSplitterStyle" />
    <div
      class="splitpanes__pane"
      ref="left"
      :size="paneBefore.size"
      max-size="30"
      :style="styles[0]"
    >
      <slot name="left-pane" />
    </div>
    <!-- Splitter start-->
    <div
      class="splitpanes__splitter"
      @mousedown="onMouseDown"
      @touchstart="onMouseDown"
    >
      <div class="toggle-btn" @click="toggleFirstPane">
        <img
          class="direction-icon"
          :src="require('@/assets/images/chevron.svg')"
          :style="directionIconStyle"
        >
      </div>
    </div>
    <!-- splitter end -->
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

export default {
  name: 'Splitpanes',
  props: {
    horizontal: { type: Boolean, default: false },
    before: { type: Object },
    after: { type: Object }
  },
  data () {
    return {
      container: null,
      paneBefore: this.before,
      paneAfter: this.after,
      beforeMinimising: this.before.size,
      touch: {
        mouseDown: false,
        dragging: false
      },
      movableSplitter: {
        top: 0,
        left: 0,
        visibility: 'hidden'
      }
    }
  },
  computed: {
    styles () {
      return [
        { [this.horizontal ? 'height' : 'width']: `${this.paneBefore.size}%` },
        { [this.horizontal ? 'height' : 'width']: `${this.paneAfter.size}%` }
      ]
    },
    movableSplitterStyle () {
      const style = { ...this.movableSplitter }
      style.top += '%'
      style.left += '%'
      return style
    },
    expanded () {
      return this.paneBefore.size !== 0
    },
    directionIconStyle () {
      const translation = 'translate(-50%, -50%)'
      if (this.horizontal) {
        return {
          transform: `${translation} ${this.expanded ? 'rotate(-90deg)' : 'rotate(90deg)'}`
        }
      } else {
        return {
          transform: `${translation} ${this.expanded ? 'rotate(180deg)' : ''}`
        }
      }
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
        this.$set(this.movableSplitter, 'visibility', 'visible')
        this.moveSplitter(event)
      }
    },

    onMouseUp () {
      this.touch.mouseDown = false
      if (this.touch.dragging) {
        const dragPercentage = this.horizontal
          ? this.movableSplitter.top
          : this.movableSplitter.left

        this.paneBefore.size = dragPercentage
        this.paneAfter.size = 100 - dragPercentage

        this.movableSplitter = {
          top: 0,
          left: 0,
          visibility: 'hidden'
        }
      }

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
      const { clientX, clientY } = ('ontouchstart' in window && event.touches)
        ? event.touches[0]
        : event
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

    moveSplitter (event) {
      const dragPercentage = this.getCurrentDragPercentage(this.getCurrentMouseDrag(event))
      const paneBefore = this.paneBefore
      const paneAfter = this.paneAfter

      const paneBeforeMaxReached = paneBefore.max < 100 && (dragPercentage >= paneBefore.max)
      const paneAfterMaxReached = paneAfter.max < 100 && (dragPercentage <= 100 - paneAfter.max)

      const dir = this.horizontal ? 'top' : 'left'

      // Prevent dragging beyond pane max.
      if (paneBeforeMaxReached || paneAfterMaxReached) {
        if (paneBeforeMaxReached) {
          this.$set(this.movableSplitter, dir, paneBefore.max)
        } else {
          this.$set(this.movableSplitter, dir, Math.max(100 - paneAfter.max, 0))
        }
      } else {
        this.$set(this.movableSplitter, dir, Math.min(Math.max(dragPercentage, 0), paneBefore.max))
      }
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
  }
}
</script>

<style>
.splitpanes {
  display: flex;
  height: 100%;
  position: relative;
}

.splitpanes--vertical {flex-direction: row;}
.splitpanes--horizontal {flex-direction: column;}
.splitpanes--dragging * {user-select: none;}

.splitpanes__pane {
  width: 100%;
  height: 100%;
  overflow: auto;
}

/* Splitter */

.splitpanes--vertical > .splitpanes__splitter,
.splitpanes--vertical.splitpanes--dragging {
  cursor: col-resize;
}
.splitpanes--horizontal > .splitpanes__splitter,
.splitpanes--horizontal.splitpanes--dragging {
  cursor: row-resize;
}

.splitpanes__splitter {
  touch-action: none;
  background-color: var(--color-bg-light-2);
  box-sizing: border-box;
  position: relative;
  flex-shrink: 0;
  z-index: 1;
}

.movable-splitter {
  position: absolute;
  background-color:rgba(162, 177, 198, 0.5);
}

.splitpanes--vertical > .splitpanes__splitter,
.splitpanes--vertical .movable-splitter {
  width: 3px;
  z-index: 5;
  height: 100%
}

.splitpanes--horizontal > .splitpanes__splitter,
.splitpanes--horizontal .movable-splitter {
  height: 3px;
  width: 100%;
}
.splitpanes__splitter .toggle-btn {
  background-color: var(--color-bg-light-2);
  border-radius: var(--border-radius-small);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.splitpanes__splitter .toggle-btn:hover {
  cursor: pointer;
}

.splitpanes--vertical .toggle-btn {
  height: 68px;
  width: 15px;
}
.splitpanes--horizontal .toggle-btn {
  width: 68px;
  height: 15px;
}
.splitpanes__splitter .toggle-btn .direction-icon {
  position: absolute;
  top: 50%;
  left: 50%;
}
</style>
