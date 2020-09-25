<template>
  <div
    class="splitpanes__splitter"
    @mousedown="$emit('mousedown')"
    @touchstart="$emit('mousedown')"
  >
    <div class="toggle-btn" @click="$emit('toggle')">
      <img
        class="direction-icon"
        :src="require('@/assets/images/chevron.svg')"
        :style="directionIconStyle"
      >
    </div>
  </div>
</template>

<script>
export default {
  name: 'splitter',
  props: ['expanded'],
  computed: {
    directionIconStyle () {
      const translation = 'translate(-50%, -50%)'
      if (this.$parent.horizontal) {
        return {
          transform: `${translation} ${this.expanded ? 'rotate(-90deg)' : 'rotate(90deg)'}`
        }
      } else {
        return {
          transform: `${translation} ${this.expanded ? 'rotate(180deg)' : ''}`
        }
      }
    }
  }
}
</script>

<style>
.splitpanes--vertical > .splitpanes__splitter {min-width: 1px;cursor: col-resize;}
.splitpanes--horizontal > .splitpanes__splitter {min-height: 1px; cursor: row-resize;}
.splitpanes__splitter {
  touch-action: none;
  background-color: var(--color-bg-light-2);
  box-sizing: border-box;
  position: relative;
  flex-shrink: 0;
  z-index: 1;
}

.splitpanes--vertical > .splitpanes__splitter {
  width: 3px;
  z-index: 3;
}

.splitpanes--horizontal > .splitpanes__splitter {
  height: 3px;
  width: 100%;
}
.splitpanes__splitter .toggle-btn {
  background-color: var(--color-bg-light-2);
  border-radius: 2px;
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
