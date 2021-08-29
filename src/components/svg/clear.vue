<template>
  <svg
    :class="['clear-icon', {'disabled': disabled}]"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14.3481 14.849C13.8791 15.318 13.1191 15.318 12.6511 14.849L10.0001 11.819L7.34907
        14.848C6.88007 15.317 6.12007 15.317 5.65207 14.848C5.18307 14.379 5.18307 13.619
        5.65207 13.151L8.41007 10.001L5.65107 6.84898C5.18207 6.37998 5.18207 5.62098 5.65107
        5.15198C6.12007 4.68298 6.87907 4.68298 7.34807 5.15198L10.0001 8.18298L12.6511
        5.15198C13.1201 4.68298 13.8791 4.68298 14.3481 5.15198C14.8171 5.62098 14.8171 6.38098
        14.3481 6.84898L11.5901 10.001L14.3481 13.151C14.8171 13.62 14.8171 14.38 14.3481
        14.849V14.849Z"
      fill="#C8D4E3"
    />
  </svg>
</template>

<script>

export default {
  name: 'ClearIcon',
  props: ['disabled']
}
</script>

<style scoped>
.clear-icon {
  cursor: pointer;
}

.clear-icon:hover path {
  fill: var(--color-danger);
}

.disabled.clear-icon {
  cursor: default;
}

.disabled.clear-icon:hover path {
  fill: #C8D4E3;
}
</style>
