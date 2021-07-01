<template>
 <div>
  <button @click="changeView">Change view</button>
  {{ mode }}
  <chart
    :visible="mode === 'chart'"
    :data-sources="dataSource"
    :init-chart="options"
    ref="chart"
    @update="$emit('update')"
  />

  <pivot v-if="mode === 'pivot'" :sql-result="dataSource"/>
  <side-tool-bar @switch="$emit('switch')"/>
</div>
</template>

<script>
import Chart from './Chart'
import Pivot from './Pivot'
import SideToolBar from '../SideToolBar'

export default {
  name: 'DataView',
  props: ['dataSource', 'options', 'switchTo'],
  components: {
    Chart,
    Pivot,
    SideToolBar
  },
  data () {
    return {
      mode: 'chart'
    }
  },
  methods: {
    changeView () {
      this.mode = this.mode === 'chart' ? 'pivot' : 'chart'
    }
  }
}
</script>

<style scoped>

</style>
