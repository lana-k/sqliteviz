<template>
  <svg
    :class="['table-icon', {'disabled': disabled}]"
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
  >
    <path fill-rule="evenodd" clip-rule="evenodd" d="M14.5 2.16512L3.5 2.17C2.675 2.17 2 2.845 2 3.67V14.3349C2 15.1599 2.675 15.8349 3.5 15.8349L14.5 15.83C15.3327 15.83 16 15.1551 16 14.33V3.66512C16 2.83512 15.33 2.16512 14.5 2.16512ZM14.5014 3.66512L3.49878 3.67V14.33L14.5014 14.3251V3.66512Z" fill="#A2B1C6"/>
    <line x1="7.02319" y1="3.32135" x2="7.02319" y2="14.7069" stroke="#A2B1C6" stroke-width="1.5"/>
    <line x1="11.0139" y1="3.30772" x2="11.0139" y2="14.6932" stroke="#A2B1C6" stroke-width="1.5"/>
    <line x1="2.4895" y1="6.73325" x2="15.5108" y2="6.73325" stroke="#A2B1C6" stroke-width="1.5"/>
    <line x1="2.4895" y1="10.8556" x2="15.5108" y2="10.8556" stroke="#A2B1C6" stroke-width="1.5"/>
  </svg>
</template>

<script>

export default {
  name: 'TableIcon',
  props: ['disabled']
}
</script>

<style scoped>
.table-icon {
  cursor: pointer;
}

.table-icon:hover path {
  fill: var(--color-danger);
}

.disabled.table-icon {
  cursor: default;
}

.disabled.table-icon:hover path {
  fill: #C8D4E3;
}
</style>
