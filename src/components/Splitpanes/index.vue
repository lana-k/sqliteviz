<template>
  <div
    ref="container"
    :class="[
      'splitpanes',
      `splitpanes-${horizontal ? 'horizontal' : 'vertical'}`,
      { 'splitpanes-dragging': dragging }
    ]"
  >
    <div class="movable-splitter" ref="movableSplitter" :style="movableSplitterStyle" />
    <div
      class="splitpanes-pane"
      ref="left"
      :size="paneBefore.size"
      max-size="30"
      :style="styles.before"
    >
      <slot name="left-pane" />
    </div>
    <!-- Splitter start-->
    <div
      class="splitpanes-splitter"
      @mousedown="bindEvents"
      @touchstart="bindEvents"
    >
      <div
        :class="[
          'toggle-btns',
          {
            'both': after.max === 100 && before.max === 100 &&
              paneAfter.size > 0 && paneBefore.size > 0
          }
        ]"
      >
        <div
          v-if="after.max === 100 && paneAfter.size > 0"
          class="toggle-btn"
          @click="togglePane(paneBefore)"
        >
          <img
            class="direction-icon"
            :src="require('@/assets/images/chevron.svg')"
            :style="directionBeforeIconStyle"
          >
        </div>
        <div
          v-if="before.max === 100 && paneBefore.size > 0"
          class="toggle-btn"
          @click="togglePane(paneAfter)"
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
      class="splitpanes-pane"
      ref="right"
      :style="styles.after"
    >
      <slot name="right-pane" />
    </div>
  </div>
</template>

<script>
import splitter from './splitter'

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
      dragging: false,
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
      const translation = 'translate(-50%, -50%) '
      let rotation = ''

      if (this.horizontal) {
        rotation = expanded ? 'rotate(90deg)' : 'rotate(-90deg)'
      } else {
        rotation = expanded ? 'rotate(0deg)' : 'rotate(180deg)'
      }

      return {
        transform: translation + rotation
      }
    },
    directionAfterIconStyle () {
      const expanded = this.paneAfter.size !== 0
      const translation = 'translate(-50%, -50%)'
      let rotation = ''

      if (this.horizontal) {
        rotation = expanded ? 'rotate(-90deg)' : 'rotate(90deg)'
      } else {
        rotation = expanded ? 'rotate(180deg)' : 'rotate(0deg)'
      }

      return {
        transform: translation + rotation
      }
    }
  },

  methods: {
    bindEvents () {
      // Passive: false to prevent scrolling while touch dragging.
      document.addEventListener('mousemove', this.onMouseMove, { passive: false })
      document.addEventListener('mouseup', this.onMouseUp)

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

    onMouseMove (event) {
      event.preventDefault()
      this.dragging = true
      this.movableSplitter.visibility = 'visible'
      this.moveSplitter(event)
    },

    onMouseUp () {
      if (this.dragging) {
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

        this.dragging = false
      }

      this.unbindEvents()
    },

    moveSplitter (event) {
      const splitterInfo = {
        container: this.container,
        paneBeforeMax: this.paneBefore.max,
        paneAfterMax: this.paneAfter.max,
        isHorisontal: this.horizontal
      }
      const offset = splitter.calculateOffset(event, splitterInfo)
      const dir = this.horizontal ? 'top' : 'left'
      this.movableSplitter[dir] = offset
    },

    togglePane (pane) {
      if (pane.size > 0) {
        this.beforeMinimising.before = this.paneBefore.size
        this.beforeMinimising.after = this.paneAfter.size
        pane.size = 0
        const otherPane = pane === this.paneBefore ? this.paneAfter : this.paneBefore
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

.splitpanes-vertical {flex-direction: row;}
.splitpanes-horizontal {flex-direction: column;}
.splitpanes-dragging * {user-select: none;}

.splitpanes-pane {
  width: 100%;
  height: 100%;
  overflow: auto;
}

/* Splitter */

.splitpanes-vertical > .splitpanes-splitter,
.splitpanes-vertical.splitpanes-dragging {
  cursor: col-resize;
}
.splitpanes-horizontal > .splitpanes-splitter,
.splitpanes-horizontal.splitpanes-dragging {
  cursor: row-resize;
}

.splitpanes-splitter {
  touch-action: none;
  background-color: var(--color-bg-light);
  box-sizing: border-box;
  position: relative;
  flex-shrink: 0;
  z-index: 1;
}

.splitpanes-horizontal > .splitpanes-splitter {
  border-top: 1px solid var(--color-border-light);
  border-bottom: 1px solid var(--color-border-light);
}

.splitpanes-vertical > .splitpanes-splitter {
  border-left: 1px solid var(--color-border-light);
  border-right: 1px solid var(--color-border-light);
}

.movable-splitter {
  position: absolute;
  background-color:rgba(162, 177, 198, 0.5);
}

.splitpanes-vertical > .splitpanes-splitter,
.splitpanes-vertical > .movable-splitter {
  width: 8px;
  z-index: 5;
  height: 100%
}

.splitpanes-horizontal > .splitpanes-splitter,
.splitpanes-horizontal > .movable-splitter {
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

.splitpanes-vertical > .splitpanes-splitter .toggle-btns {
  flex-direction: column;
}

.splitpanes-horizontal > .splitpanes-splitter .toggle-btns {
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

.splitpanes-vertical > .splitpanes-splitter .toggle-btn {
  height: 49px;
  width: 8px;
}

.splitpanes-horizontal > .splitpanes-splitter .toggle-btn {
  width: 49px;
  height: 8px;
}

.toggle-btn .direction-icon {
  position: absolute;
  top: 50%;
  left: 50%;
}

.splitpanes-horizontal > .splitpanes-splitter .toggle-btns.both .toggle-btn:first-child {
  border-radius: var(--border-radius-small) 0 0 var(--border-radius-small);
}

.splitpanes-horizontal > .splitpanes-splitter .toggle-btns.both .toggle-btn:last-child {
  border-radius: 0 var(--border-radius-small) var(--border-radius-small) 0;
  margin-left: -1px;
}

.splitpanes-vertical > .splitpanes-splitter .toggle-btns.both .toggle-btn:first-child {
  border-radius: var(--border-radius-small) var(--border-radius-small) 0 0;
}

.splitpanes-vertical > .splitpanes-splitter .toggle-btns.both .toggle-btn:last-child {
  border-radius: 0 0 var(--border-radius-small) var(--border-radius-small);
  margin-top: -1px;
}
</style>
