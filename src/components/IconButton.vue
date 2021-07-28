<template>
  <div
    :class="['icon-btn', { active }, { disabled }]"
    @click="onClick"
    @mouseenter="showTooltip($event, tooltipPosition)"
    @mouseleave="hideTooltip"
  >
    <slot/>
    <span v-if="tooltip" class="icon-tooltip" :style="tooltipStyle" ref="tooltip">
      {{ tooltip }}
    </span>
  </div>
</template>

<script>
import tooltipMixin from '@/tooltipMixin'

export default {
  name: 'SideBarButton',
  props: ['active', 'disabled', 'tooltip', 'tooltipPosition'],
  mixins: [tooltipMixin],
  methods: {
    onClick () {
      this.hideTooltip()
      this.$emit('click')
    }
  }
}
</script>

<style scoped>
.icon-btn {
  box-sizing: border-box;
  width: 26px;
  height: 26px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-btn:hover {
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-medium-2);
}

.icon-btn:hover >>> path,
.icon-btn.active >>> path,
.icon-btn:hover >>> circle,
.icon-btn.active >>> circle {
  fill: var(--color-accent);
}

.disabled.icon-btn >>> path,
.disabled.icon-btn >>> circle {
  fill: var(--color-border);
}

.disabled.icon-btn {
  cursor: default;
  pointer-events: none;
}

.disabled.icon-btn:hover >>> path {
  fill: #C8D4E3;
}
</style>
