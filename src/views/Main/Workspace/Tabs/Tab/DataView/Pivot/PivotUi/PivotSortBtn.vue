<template>
  <div :class="['pivot-sort-btn', direction] " @click="changeSorting">
  {{ modelValue.includes('key') ? 'key' : 'value' }}
  <sort-icon
    class="sort-icon"
    :horizontal="direction === 'col'"
    :asc="modelValue.includes('a_to_z')"
  />
  </div>
</template>

<script>
import SortIcon from '@/components/svg/sort'

export default {
  name: 'PivotSortBtn',
  props: ['direction', 'modelValue'],
  components: {
    SortIcon
  },
  methods: {
    changeSorting () {
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
.pivot-sort-btn:hover deep(.sort-icon path) {
  fill: var(--color-text-active);
}

.pivot-sort-btn.col {
  flex-direction: column;
  padding-top: 5px;
}

.pivot-sort-btn.row {
  flex-direction: row;
}

.pivot-sort-btn.row .sort-icon {
  margin-left: 2px;
}
</style>
