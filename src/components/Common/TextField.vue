<template>
  <div>
    <div
      v-if="label"
      :class="['text-field-label', { error: errorMsg }, { disabled: disabled }]"
    >
      {{ label }}
      <IconButton
        v-if="hint"
        icon="myicon myicon-hint"
        variant="secondary"
        class="hint"
        :tooltip="hint"
        :maxTooltipWidth="maxHintWidth"
        :iconSize="20"
      />
    </div>
    <div :class="['text-field-container', { disabled }]">
      <input
        type="text"
        :placeholder="placeholder"
        :class="{ error: errorMsg }"
        :style="{ width: width }"
        :value="modelValue"
        :disabled="disabled"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <button
        v-if="showClearButton"
        type="button"
        :disabled="disabled"
        class="clear-btn"
        @click="$emit('update:modelValue', '')"
      >
        <i class="myicon myicon-clear" />
      </button>
    </div>

    <div v-show="errorMsg" class="text-field-error">{{ errorMsg }}</div>
  </div>
</template>

<script>
import IconButton from '@/components/Common/IconButton.vue'

export default {
  name: 'TextField',
  components: { IconButton },
  props: {
    placeholder: String,
    label: String,
    errorMsg: String,
    modelValue: String,
    width: String,
    hint: String,
    maxHintWidth: { type: String, default: '149px' },
    disabled: Boolean,
    showClearButton: Boolean
  },
  emits: ['update:modelValue']
}
</script>

<style scoped>
.text-field-container {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-medium-2);
  height: 36px;
  padding: 0 8px;
  font-size: 13px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.text-field-container.disabled {
  background: var(--color-bg-light);
}

.text-field-container.error {
  border-color: var(--color-text-error);
}

input {
  background: inherit;
  border: none;
  color: var(--color-text-base);
  height: 100%;
  padding: 0;
  display: block;
}

input::placeholder {
  color: var(--color-text-light-2);
}

input:focus {
  outline: none;
}

input:disabled {
  color: var(--color-text-light-2);
  cursor: default;
}

.text-field-label {
  font-size: 12px;
  color: var(--color-text-base);
  padding-left: 8px;
  margin-bottom: 2px;
  display: inline-block;
  position: relative;
}

.text-field-label .hint {
  position: absolute;
  top: -6px;
  right: -26px;
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

:deep(.icon-tooltip) {
  display: block;
  white-space: normal;
  height: auto;
  line-height: normal;
  padding: 6px;
  box-sizing: border-box;
}

.clear-btn {
  background: transparent;
  border: none;
  padding: 0;
  height: 20px;
  width: 20px;
  color: var(--color-border);
  font-size: 20px;
}

.clear-btn i {
  display: block;
}

.clear-btn:not(:disabled):hover {
  color: var(--color-danger);
}
</style>
