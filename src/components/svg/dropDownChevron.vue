<template>
  <svg
    class="chevron-icon"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M6.175 7.15002L10 10.975L13.825 7.15002L15 8.33336L10 13.3334L5 8.33336L6.175 7.15002Z" fill="#C8D4E3"/>
  </svg>
</template>

<script>

export default {
  name: 'DropDownChevron'
}
</script>

<style scoped>
.chevron-icon {
  cursor: pointer;
}

.chevron-icon:hover path {
  fill: var(--color-accent);
}
</style>
