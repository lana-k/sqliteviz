<template>
  <div>
    <div v-if="label" :class="['text-field-label', { error: errorMsg }, {'disabled': disabled}]">
      {{ label }}
      <hint-icon class="hint" v-if="hint" :hint="hint" :max-width="maxHintWidth || '149px'"/>
    </div>
    <input
      type="text"
      :placeholder="placeholder"
      :class="{ error: errorMsg }"
      :style="{ width: width }"
      :value="value"
      :disabled="disabled"
      @input="$emit('input', $event.target.value)"
    />
    <div v-show="errorMsg" class="text-field-error">{{ errorMsg }}</div>
  </div>
</template>

<script>
import HintIcon from '@/components/svg/hint'
export default {
  name: 'textField',
  props: ['placeholder', 'label', 'errorMsg', 'value', 'width', 'hint', 'maxHintWidth', 'disabled'],
  components: { HintIcon }
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
  display: block;
}

input::placeholder {
  color: var(--color-text-light-2);
}

input:focus {
  outline: none;
}

input:disabled {
  background: var(--color-bg-light);
  color: var(--color-text-light-2);
  cursor: default;
}

input.error {
  border-color: var(--color-text-error);
}

.text-field-label {
  font-size: 12px;
  color: var(--color-text-base);
  padding-left: 8px;
  margin-bottom: 2px;
  display: inline-block;
  position: relative;
}

.text-field-label .hint{
  position: absolute;
  top: -2px;
  right: -22px;
}

.text-field-label.error {
  color: var(--color-text-error);
}

.text-field-label.disabled {
  color: var(--color-text-light-2);
}

.text-field-error {
  color: var(--color-text-error);
  font-size: 12px;
  padding-left: 8px;
  margin-top: 2px;
  position: absolute;
}
.text-field-error:first-letter {
  text-transform: uppercase;
}
</style>
