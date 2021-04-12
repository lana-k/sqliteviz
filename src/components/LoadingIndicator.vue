<template>
  <svg :class="['svg-container', animationClass ]" height="20" width="20" viewBox="0 0 20 20">
    <circle
      class="loader-svg bg"
      cx="10"
      cy="10"
      r="8"
    />
    <circle
      class="loader-svg front"
      :style="{ strokeDasharray: circleProgress }"
      cx="10"
      cy="10"
      r="8"
    />
  </svg>
</template>

<script>
export default {
  name: 'loadingIndicator',
  props: ['progress'],
  computed: {
    circleProgress () {
      const dash = (50.24 * this.progress) / 100
      const space = 50.24 - dash
      return `${dash}, ${space}`
    },
    animationClass () {
      return this.progress === undefined ? 'loading' : 'progress'
    }
  }
}
</script>

<style scoped>
.loader-svg {
  position: absolute;
  left: 0; right: 0; top: 0; bottom: 0;
  fill: none;
  stroke-width: 2px;
  stroke-linecap: round;
  stroke: var(--color-accent);
}

.loader-svg.bg {
  stroke: var(--color-gray-light-3);
}

.loading .loader-svg.front {
  stroke-dasharray: 40.24;
  animation: fill-animation-loading 1s cubic-bezier(1,1,1,1) 0s infinite;
}

@keyframes fill-animation-loading {
  0% {
    stroke-dasharray: 10 40.24;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 25.12;
    stroke-dashoffset: 25.12;
  }
  100% {
    stroke-dasharray: 10 40.24 ;
    stroke-dashoffset: 50.24;
  }
}

.progress .loader-svg.front {
  stroke-dashoffset: 12.56;
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
