<template>
  <svg :class="animationClass" :height="size" :width="size" :viewBox="`0 0 ${size} ${size}`">
    <circle
      class="loader-svg bg"
      :style="{ strokeWidth }"
      :cx="size / 2"
      :cy="size / 2"
      :r="radius"
    />
    <circle
      class="loader-svg front"
      :style="{ strokeDasharray: circleProgress, strokeDashoffset: offset, strokeWidth }"
      :cx="size / 2"
      :cy="size / 2"
      :r="radius"
    />
  </svg>
</template>

<script>
export default {
  name: 'LoadingIndicator',
  props: {
    progress: {
      type: Number,
      required: false
    },
    size: {
      type: Number,
      required: false,
      default: 20
    }
  },
  computed: {
    circleProgress () {
      const circle = this.radius * 3.14 * 2
      const dash = this.progress ? (circle * this.progress) / 100 : circle * 1 / 3
      const space = circle - dash
      return `${dash}px, ${space}px`
    },
    animationClass () {
      return this.progress === undefined ? 'loading' : 'progress'
    },
    radius () {
      return this.size / 2 - this.strokeWidth
    },
    offset () {
      return this.radius * 3.14 / 2
    },
    strokeWidth () {
      return this.size / 10
    }
  }
}
</script>

<style scoped>
.loader-svg {
  position: absolute;
  left: 0; right: 0; top: 0; bottom: 0;
  fill: none;
  stroke-linecap: round;
  stroke: var(--color-accent);
}

.loader-svg.bg {
  stroke: var(--color-gray-light-3);
}

.loading .loader-svg.front {
  will-change: transform;
  animation: fill-animation-loading 1s cubic-bezier(1,1,1,1) 0s infinite;
  transform-origin: center;
}

/*
  We can't change anything in loading animation except transform, opacity and filter. Because in
  our case the Main Thread can be busy and animation will be frozen (e. g. getting a result set
  from the web-worker after query execution).
  But transform, opacity and filter trigger changes only in the Composite Layer stage in rendering
  waterfall. Hence they can be processed only with Compositor Thread while the Main Thread
  processes something else.
  https://www.viget.com/articles/animation-performance-101-browser-under-the-hood/
*/
@keyframes fill-animation-loading {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.progress .loader-svg.front {
  transition: stroke-dasharray 0.2s;
}

.progress .loader-svg.bg {
  animation: bg-animation 1.5s cubic-bezier(1,1,1,1) 0s infinite;
}

@keyframes bg-animation{
  0% {
    r: 8;
  }
  50% {
    stroke: var(--color-gray-light-2);
    r: 9;
  }
  100% {
   r: 8;
  }
}

</style>
