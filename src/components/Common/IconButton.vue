<template>
  <button
    :class="['icon-btn', { active }, 'icon-btn-' + variant]"
    :disabled="disabled"
    :style="{
      color: iconColor,
      fontSize: iconSize + 'px',
      width: width + 'px',
      height: width + 'px'
    }"
    @click.stop="onClick"
    @mouseenter="showTooltip($event, tooltipPosition)"
    @mouseleave="hideTooltip"
  >
    <div class="icon">
      <slot>
        <i :class="icon" />
      </slot>
    </div>
    <div v-show="loading" class="icon-in-progress">
      <loading-indicator />
    </div>
    <span
      v-if="tooltip"
      ref="tooltip"
      class="icon-tooltip"
      :style="{ ...tooltipStyle, maxWidth: maxTooltipWidth }"
    >
      {{ tooltip }}
    </span>
  </button>
</template>

<script>
import tooltipMixin from '@/tooltipMixin'
import LoadingIndicator from '@/components/Common/LoadingIndicator'

export default {
  name: 'SideBarButton',
  components: { LoadingIndicator },
  mixins: [tooltipMixin],
  props: {
    active: Boolean,
    disabled: Boolean,
    tooltip: String,
    tooltipPosition: String,
    maxTooltipWidth: String,
    loading: Boolean,
    icon: String,
    iconColor: { type: String, default: 'var(--color-text-light-2)' },
    variant: {
      type: String,
      default: 'accent',
      validator: value => ['accent', 'secondary'].includes(value)
    },
    iconSize: {
      type: Number,
      default: 18
    }
  },
  emits: ['click'],
  computed: {
    width() {
      return this.iconSize + 8
    }
  },
  methods: {
    onClick() {
      this.hideTooltip()
      this.$emit('click')
    }
  }
}
</script>

<style scoped>
.icon-btn {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background-color: transparent;
  border: none;
}

.icon-btn .icon i {
  font-size: inherit;
}
.icon-btn.icon-btn-accent:hover {
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-medium-2);
}

.icon-btn.icon-btn-accent:hover,
.icon-btn.icon-btn-accent.active {
  color: var(--color-accent) !important;
}

.icon-btn.icon-btn-secondary:hover,
.icon-btn.icon-btn-secondary.active {
  color: var(--color-text-base) !important;
}

.icon-btn:disabled {
  color: var(--color-border) !important;
}

.icon-btn:disabled {
  cursor: default;
  pointer-events: none;
}

.icon-in-progress {
  position: absolute;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-light);
  will-change: opacity;
  /*
    We need to show loader in 1 sec after starting query execution. We can't do that with
    setTimeout because the main thread can be busy by getting a result set from the web worker.
    But we can use CSS animation for opacity. Opacity triggers changes only in the Composite Layer
    stage in rendering waterfall. Hence it can be processed only with Compositor Thread while
    the Main Thread processes a result set.
    https://www.viget.com/articles/animation-performance-101-browser-under-the-hood/
  */
  animation: show-loader 1s linear 0s 1;
}

@keyframes show-loader {
  0% {
    opacity: 0;
  }
  99% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
