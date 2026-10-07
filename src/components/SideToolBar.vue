<template>
  <div class="side-tool-bar">
    <icon-button
      ref="sqlEditorBtn"
      icon="myicon myicon-sql-editor"
      :active="panel === 'sqlEditor'"
      tooltip="Switch panel to SQL editor"
      tooltipPosition="top-left"
      @click="$emit('switchTo', 'sqlEditor')"
    />

    <icon-button
      ref="tableBtn"
      icon="myicon myicon-table"
      :active="panel === 'table'"
      tooltip="Switch panel to result set"
      tooltipPosition="top-left"
      @click="$emit('switchTo', 'table')"
    />

    <icon-button
      ref="dataViewBtn"
      icon="myicon myicon-data-view"
      :active="panel === 'dataView'"
      tooltip="Switch panel to data view"
      tooltipPosition="top-left"
      @click="$emit('switchTo', 'dataView')"
    />

    <div v-if="$slots.default" class="side-tool-bar-divider" />

    <slot />
  </div>
</template>

<script>
import IconButton from '@/components/Common/IconButton'

export default {
  name: 'SideToolBar',
  components: {
    IconButton
  },
  props: {
    panel: String
  },
  emits: ['switchTo']
}
</script>

<style scoped>
.side-tool-bar {
  background-color: var(--color-bg-light);
  border-left: 1px solid var(--color-border-light);
  padding: 6px;
}
</style>

<style>
.side-tool-bar-divider {
  width: 26px;
  height: 1px;
  background: var(--color-border-light);
  margin: 6px 0;
}
</style>
