<template>
  <svg
    :style="{ transform: expanded ? 'rotate(90deg)' : 'rotate(0)' }"
    class="chevron-icon"
    width="9"
    height="9"
    viewBox="0 0 8 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0.721924 9.93097L4.85292 5.79997L0.721924 1.66897L1.99992 0.399973L7.39992
      5.79997L1.99992 11.2L0.721924 9.93097Z"
      :fill="expanded ? '#506784' : 'rgba(80, 103, 132, 0.5)'"
    />
  </svg>
</template>

<script>

export default {
  name: 'treeChevron',
  props: {
    expanded: {
      type: Boolean,
      required: true
    }
  }
}
</script>

<style scoped>
.chevron-icon {
  -webkit-transition: transform .15s ease-in-out;
  transition: transform .15s ease-in-out;
}
</style>
