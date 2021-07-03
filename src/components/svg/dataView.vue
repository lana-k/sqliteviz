<template>
  <svg
    :class="['data-view-icon', {'disabled': disabled}]"
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
  >
    <path d="M1.53345 13.1725L5.3465 9.76941L8.75264 12.7145L13.5613 7.66519L16.7235 10.88" stroke="#A2B1C6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="5.50049" cy="6.00339" r="1.5" fill="#A2B1C6"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M16.036 1.21788L1.96546 1.213C1.14046 1.213 0.465462 1.888 0.465462 2.713L0.464111 15.2821C0.464111 16.1071 1.13911 16.7821 1.96411 16.7821L16.0347 16.787C16.8674 16.787 17.5347 16.1121 17.5347 15.287L17.536 2.71788C17.536 1.88787 16.866 1.21788 16.036 1.21788ZM16.0374 2.71788L1.96424 2.713L1.96289 15.2773L16.036 15.2821L16.0374 2.71788Z" fill="#A2B1C6"/>
  </svg>
</template>

<script>

export default {
  name: 'DataViewIcon',
  props: ['disabled']
}
</script>

<style scoped>
.data-view-icon {
  cursor: pointer;
}

.data-view-icon:hover path {
  fill: var(--color-danger);
}

.disabled.data-view-icon {
  cursor: default;
}

.disabled.clear-icon:hover path {
  fill: #C8D4E3;
}
</style>
