<template>
  <div :class="['pivot-sort-btn', direction] " @click="changeSorting">
  {{ value.includes('key') ? 'key' : 'value' }}
  <sort-icon
    class="sort-icon"
    :horizontal="direction === 'col'"
    :asc="value.includes('a_to_z')"
  />
  </div>
</template>

<script>
import SortIcon from '@/components/svg/sort'

export default {
  name: 'PivotSortBtn',
  props: ['direction', 'value'],
  components: {
    SortIcon
  },
  methods: {
    changeSorting () {
      if (this.value === 'key_a_to_z') {
        this.$emit('input', 'value_a_to_z')
      } else if (this.value === 'value_a_to_z') {
        this.$emit('input', 'value_z_to_a')
      } else {
        this.$emit('input', 'key_a_to_z')
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
.pivot-sort-btn:hover >>> .sort-icon path {
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
