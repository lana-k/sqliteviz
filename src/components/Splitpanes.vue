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
      :style="styles.before"
    >
      <slot name="left-pane" />
    </div>
    <!-- Splitter start-->
    <div
      class="splitpanes__splitter"
      @mousedown="onMouseDown"
      @touchstart="onMouseDown"
    >
      <div
        :class="[
          'toggle-btns',
          {'both': after.max === 100 && before.max === 100 && after.size > 0 && before.size > 0}
        ]"
      >
        <div
          v-if="after.max === 100  && after.size > 0"
          class="toggle-btn"
          @click="togglePane('before')"
        >
          <img
            class="direction-icon"
            :src="require('@/assets/images/chevron.svg')"
            :style="directionBeforeIconStyle"
          >
        </div>
        <div
          v-if="before.max === 100 && before.size > 0"
          class="toggle-btn"
          @click="togglePane('after')"
        >
          <img
            class="direction-icon"
            :src="require('@/assets/images/chevron.svg')"
            :style="directionAfterIconStyle"
          >
        </div>
      </div>
    </div>
    <!-- splitter end -->
    <div
      class="splitpanes__pane"
      ref="right"
      :style="styles.after"
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
      beforeMinimising: {
        before: this.before.size,
        after: this.after.size
      },
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
      return {
        before: { [this.horizontal ? 'height' : 'width']: `${this.paneBefore.size}%` },
        after: { [this.horizontal ? 'height' : 'width']: `${this.paneAfter.size}%` }
      }
    },
    movableSplitterStyle () {
      const style = { ...this.movableSplitter }
      style.top += '%'
      style.left += '%'
      return style
    },
    directionBeforeIconStyle () {
      const expanded = this.paneBefore.size !== 0
      const translation = 'translate(-50%, -50%)'
      if (this.horizontal) {
        return {
          transform: `${translation} ${expanded ? 'rotate(90deg)' : 'rotate(-90deg)'}`
        }
      } else {
        return {
          transform: `${translation} ${expanded ? 'rotate(0deg)' : 'rotate(180deg)'}`
        }
      }
    },
    directionAfterIconStyle () {
      const expanded = this.paneAfter.size !== 0
      const translation = 'translate(-50%, -50%)'
      if (this.horizontal) {
        return {
          transform: `${translation} ${expanded ? 'rotate(-90deg)' : 'rotate(90deg)'}`
        }
      } else {
        return {
          transform: `${translation} ${expanded ? 'rotate(180deg)' : 'rotate(0deg)'}`
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
    togglePane (toggledPane) {
      const pane = toggledPane === 'before' ? this.paneBefore : this.paneAfter
      if (pane.size > 0) {
        this.beforeMinimising.before = this.paneBefore.size
        this.beforeMinimising.after = this.paneAfter.size
        pane.size = 0
        const otherPane = toggledPane === 'before' ? this.paneAfter : this.paneBefore
        otherPane.size = 100 - pane.size
      } else {
        this.paneBefore.size = this.beforeMinimising.before
        this.paneAfter.size = this.beforeMinimising.after
      }
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
  background-color: var(--color-bg-light);
  box-sizing: border-box;
  position: relative;
  flex-shrink: 0;
  z-index: 1;
}

.splitpanes--horizontal > .splitpanes__splitter {
  border-top: 1px solid var(--color-border-light);
  border-bottom: 1px solid var(--color-border-light);
}

.splitpanes--vertical > .splitpanes__splitter {
  border-left: 1px solid var(--color-border-light);
  border-right: 1px solid var(--color-border-light);
}

.movable-splitter {
  position: absolute;
  background-color:rgba(162, 177, 198, 0.5);
}

.splitpanes--vertical > .splitpanes__splitter,
.splitpanes--vertical > .movable-splitter {
  width: 8px;
  z-index: 5;
  height: 100%
}

.splitpanes--horizontal > .splitpanes__splitter,
.splitpanes--horizontal > .movable-splitter {
  height: 8px;
  width: 100%;
  z-index: 5;
}
/* Toggle buttons */
.toggle-btns {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
}

.splitpanes--vertical > .splitpanes__splitter .toggle-btns {
  flex-direction: column;
}

.splitpanes--horizontal > .splitpanes__splitter .toggle-btns {
  flex-direction: row;
}

.toggle-btn {
  background-color: var(--color-border-light);
  border-radius: var(--border-radius-small);
  border: 1px solid var(--color-border);
  box-sizing: border-box;
  position: relative;
  cursor: pointer;
}

.splitpanes--vertical > .splitpanes__splitter .toggle-btn {
  height: 49px;
  width: 8px;
}

.splitpanes--horizontal > .splitpanes__splitter .toggle-btn {
  width: 49px;
  height: 8px;
}

.toggle-btn .direction-icon {
  position: absolute;
  top: 50%;
  left: 50%;
}

.splitpanes--horizontal > .splitpanes__splitter .toggle-btns.both .toggle-btn:first-child {
  border-radius: var(--border-radius-small) 0 0 var(--border-radius-small);
}

.splitpanes--horizontal > .splitpanes__splitter .toggle-btns.both .toggle-btn:last-child {
  border-radius: 0 var(--border-radius-small) var(--border-radius-small) 0;
  margin-left: -1px;
}

.splitpanes--vertical > .splitpanes__splitter .toggle-btns.both .toggle-btn:first-child {
  border-radius: var(--border-radius-small) var(--border-radius-small) 0 0;
}

.splitpanes--vertical > .splitpanes__splitter .toggle-btns.both .toggle-btn:last-child {
  border-radius: 0 0 var(--border-radius-small) var(--border-radius-small);
  margin-top: -1px;
}
</style>
