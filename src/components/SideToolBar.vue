<template>
  <div class="side-tool-bar">
    <icon-button
      ref="sqlEditorBtn"
      :active="panel === 'sqlEditor'"
      tooltip="Switch panel to SQL editor"
      tooltipPosition="top-left"
      @click="$emit('switchTo', 'sqlEditor')"
    >
      <sql-editor-icon />
    </icon-button>

    <icon-button
      ref="tableBtn"
      :active="panel === 'table'"
      tooltip="Switch panel to result set"
      tooltipPosition="top-left"
      @click="$emit('switchTo', 'table')"
    >
      <table-icon />
    </icon-button>

    <icon-button
      ref="dataViewBtn"
      :active="panel === 'dataView'"
      tooltip="Switch panel to data view"
      tooltipPosition="top-left"
      @click="$emit('switchTo', 'dataView')"
    >
      <data-view-icon />
    </icon-button>

    <div v-if="$slots.default" class="side-tool-bar-divider" />

    <slot />
  </div>
</template>

<script>
import IconButton from '@/components/Common/IconButton'
import TableIcon from '@/components/svg/table'
import SqlEditorIcon from '@/components/svg/sqlEditor'
import DataViewIcon from '@/components/svg/dataView'

export default {
  name: 'SideToolBar',
  components: {
    IconButton,
    SqlEditorIcon,
    DataViewIcon,
    TableIcon
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
