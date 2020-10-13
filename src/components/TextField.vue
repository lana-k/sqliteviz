<template>
  <div>
    <div :class="['text-field-label', { error: errorMsg }]">{{ label }}</div>
    <input
      type="text"
      :placeholder="placeholder"
      :class="{ error: errorMsg }"
      :style="{ width: width }"
      :value="value"
      @input="$emit('input',  $event.target.value)"
    />
    <div class="text-field-error">{{ errorMsg }}</div>
  </div>
</template>

<script>
export default {
  name: 'textField',
  props: ['placeholder', 'label', 'errorMsg', 'value', 'width']
}
</script>

<style scoped>
input {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  color: var(--color-text-base);
  border-radius: var(--border-radius-medium-2);
  height: 36px;
  padding: 0 8px;
  font-size: 13px;
  box-sizing: border-box;
}

input::placeholder {
  color: var(--color-text-light-2);
}

input:focus {
  outline: none;
}

input.error {
  border-color: var(--color-text-error);
}
.text-field-label {
  font-size: 12px;
  color: var(--color-text-base);
  padding-left: 8px;
  margin-bottom: 2px;
}

.text-field-label.error {
  color: var(--color-text-error);
}

.text-field-error {
  color: var(--color-text-error);
  font-size: 12px;
  padding-left: 8px;
  margin-top: 2px;
}
</style>
