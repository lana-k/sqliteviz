<template>
  <div>
    <div @click="colVisible = !colVisible" class="table-name">
      <tree-chevron :expanded="colVisible"/>
      {{ name }}
    </div>
    <div v-show="colVisible" class="columns">
      <div v-for="(col, index) in columns" :key="index" class="column">
        {{ col.name }}
        <span class="column-type">{{ col.type }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import TreeChevron from '@/components/svg/treeChevron'

export default {
  name: 'TableDescription',
  components: { TreeChevron },
  props: ['name', 'columns'],
  data () {
    return {
      colVisible: false
    }
  }
}
</script>

<style scoped>
.table-name, .column {
  margin-top: 11px;
}

.table-name:hover {
  cursor: pointer;
}
.columns {
  margin-left: 24px;
}
.column-type {
  display: inline-block;
  background-color: var(--color-gray-light-4);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-small);
  padding: 2px 6px;
  font-size: 11px;
  text-transform: uppercase;
}
</style>
