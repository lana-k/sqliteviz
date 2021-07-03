<template>
  <div class="side-tool-bar">
    <slot/>

    <div class="divider" v-if="$slots.default"/>

    <icon-button @click.native="$emit('switchTo', 'sqlEditor')">
      <sql-editor-icon />
    </icon-button>

    <icon-button @click.native="$emit('switchTo', 'table')">
      <table-icon/>
    </icon-button>

    <icon-button @click.native="$emit('switchTo', 'dataView')">
      <data-view-icon />
    </icon-button>
  </div>
</template>

<script>
import IconButton from '@/components/IconButton'
import TableIcon from '@/components/svg/table'
import SqlEditorIcon from '@/components/svg/sqlEditor'
import DataViewIcon from '@/components/svg/dataView'

export default {
  name: 'SideToolBar',
  props: ['panel'],
  components: {
    IconButton,
    SqlEditorIcon,
    DataViewIcon,
    TableIcon
  }
}
</script>

<style scoped>
.side-tool-bar {
  background-color: var(--color-bg-light);
  border-left: 1px solid var(--color-border-light);
}

.divider {
  width: 26px;
  height: 1px;
  background: var(--color-border-light);
}
</style>
