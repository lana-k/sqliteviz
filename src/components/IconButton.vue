<template>
  <div
    :class="['icon-btn', { active }, { disabled }]"
    @click="onClick"
    @mouseenter="showTooltip($event, tooltipPosition)"
    @mouseleave="hideTooltip"
  >
    <div class="icon"><slot /></div>
    <div v-show="loading" class="icon-in-progress">
      <loading-indicator />
    </div>
    <span v-if="tooltip" class="icon-tooltip" :style="tooltipStyle" ref="tooltip">
      {{ tooltip }}
    </span>
  </div>
</template>

<script>
import tooltipMixin from '@/tooltipMixin'
import LoadingIndicator from '@/components/LoadingIndicator'

export default {
  name: 'SideBarButton',
  props: ['active', 'disabled', 'tooltip', 'tooltipPosition', 'loading'],
  components: { LoadingIndicator },
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
  position: relative;
}
.icon-btn:hover {
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-medium-2);
}

.icon-btn:hover .icon >>> path,
.icon-btn.active .icon >>> path,
.icon-btn:hover .icon >>> circle,
.icon-btn.active .icon >>> circle {
  fill: var(--color-accent);
}

.disabled.icon-btn  .icon >>> path,
.disabled.icon-btn  .icon >>> circle {
  fill: var(--color-border);
}

.disabled.icon-btn {
  cursor: default;
  pointer-events: none;
}

.disabled.icon-btn:hover .icon >>> path {
  fill: var(--color-border);
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
