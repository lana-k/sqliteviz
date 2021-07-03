<template>
  <div class="data-view-panel">
    <div class="data-view-panel-content">
      <chart
        v-if="mode === 'chart'"
        :visible="mode === 'chart'"
        :data-sources="dataSource"
        :init-chart="options"
        ref="chart"
        @update="$emit('update')"
      />

      <pivot v-if="mode === 'pivot'" :data-sources="dataSource" />
    </div>
    <side-tool-bar panel="dataView" @switchTo="$emit('switchTo', $event)">
      <icon-button
       :active="mode === 'chart'"
       @click="mode = 'chart'"
      >
        <chart-icon />
      </icon-button>
      <icon-button
        :active="mode === 'pivot'"
        @click="mode = 'pivot'"
      >
        <pivot-icon />
      </icon-button>
    </side-tool-bar>
  </div>
</template>

<script>
import Chart from './Chart'
import Pivot from './Pivot'
import SideToolBar from '../SideToolBar'
import IconButton from '@/components/IconButton'
import ChartIcon from '@/components/svg/chart'
import PivotIcon from '@/components/svg/pivot'

export default {
  name: 'DataView',
  props: ['dataSource', 'options', 'initMode'],
  components: {
    Chart,
    Pivot,
    SideToolBar,
    IconButton,
    ChartIcon,
    PivotIcon
  },
  data () {
    return {
      mode: this.initMode
    }
  },
  methods: {
  }
}
</script>

<style scoped>
.data-view-panel {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.data-view-panel-content {
  position: relative;
  flex-grow: 1;
  width: calc(100% - 39px);
  height: 100%;
  overflow: auto;
}
</style>
