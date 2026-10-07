<template>
  <div :class="['pivot-sort-btn', direction]" @click="changeSorting">
    {{ modelValue.includes('key') ? 'key' : 'value' }}
    <i
      :class="[
        'myicon myicon-sort sort-icon',
        { vertical: direction === 'row' },
        { asc: modelValue.includes('a_to_z') }
      ]"
    />
  </div>
</template>

<script>
export default {
  name: 'PivotSortBtn',
  props: {
    direction: String,
    modelValue: String
  },
  emits: ['update:modelValue'],
  methods: {
    changeSorting() {
      if (this.modelValue === 'key_a_to_z') {
        this.$emit('update:modelValue', 'value_a_to_z')
      } else if (this.modelValue === 'value_a_to_z') {
        this.$emit('update:modelValue', 'value_z_to_a')
      } else {
        this.$emit('update:modelValue', 'key_a_to_z')
      }
    }
  }
}
</script>

<style scoped>
.pivot-sort-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 43px;
  height: 27px;
  background-color: var(--color-bg-light-4);
  border-radius: var(--border-radius-medium-2);
  border: 1px solid var(--color-border);
  cursor: pointer;
  font-size: 11px;
  color: var(--color-text-base);
  line-height: 8px;
  box-sizing: border-box;
}
.pivot-sort-btn:hover {
  color: var(--color-text-active);
  border-color: var(--color-border-dark);
}

.pivot-sort-btn.col {
  flex-direction: column;
  padding-top: 5px;
}

.pivot-sort-btn.row {
  flex-direction: row;
}

.sort-icon {
  font-size: 12px;
}
.sort-icon.asc {
  transform: rotate(180deg);
}
.sort-icon.vertical {
  transform: rotate(90deg);
  margin-right: -3px;
  margin-left: -1px;
}

.sort-icon.vertical.asc {
  transform: rotate(-90deg);
}
</style>
