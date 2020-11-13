<template>
<div v-show="visible" class="chart-container">
  <div class="worning chart-worning" v-show="!sqlResult && visible">
    There is no data to build a chart. Run your sql query and make sure the result is not empty.
  </div>
  <PlotlyEditor
    :data="state.data"
    :layout="state.layout"
    :frames="state.frames"
    :config="{ editable: true, displaylogo: false }"
    :dataSources="dataSources"
    :dataSourceOptions="dataSourceOptions"
    :plotly="plotly"
    @onUpdate="update"
    :useResizeHandler="true"
    :debug="true"
    :advancedTraceTypeSelector="true"
    class="chart"
    :style="{ height: !sqlResult ? 'calc(100% - 40px)' : '100%' }"
  />
</div>
</template>

<script>
import plotly from 'plotly.js/dist/plotly'
import 'react-chart-editor/lib/react-chart-editor.min.css'

import PlotlyEditor from 'react-chart-editor'
import dereference from 'react-chart-editor/lib/lib/dereference'

export default {
  name: 'Chart',
  props: ['sqlResult', 'initChart', 'visible'],
  components: {
    PlotlyEditor
  },
  data () {
    return {
      plotly: plotly,
      state: this.initChart || {
        data: [],
        layout: {},
        frames: []
      }
    }
  },
  computed: {
    dataSources () {
      if (!this.sqlResult) {
        return {}
      }
      const dataSorces = {}
      const matrix = this.sqlResult.values
      const [row] = matrix
      const transposedMatrix = row.map((value, column) => matrix.map(row => row[column]))
      this.sqlResult.columns.forEach((column, index) => {
        dataSorces[column] = transposedMatrix[index]
      })
      return dataSorces
    },
    dataSourceOptions () {
      return Object.keys(this.dataSources).map(name => ({
        value: name,
        label: name
      }))
    }
  },
  watch: {
    dataSources () {
      // we need to update state.data in order to update the graph
      // https://github.com/plotly/react-chart-editor/issues/948
      dereference(this.state.data, this.dataSources)
    }
  },
  methods: {
    update (data, layout, frames) {
      this.state = { data, layout, frames }
      this.$emit('update')
    },
    getChartSatateForSave () {
      // we don't need to save the data, only settings
      // so we modify state.data using dereference
      const stateCopy = JSON.parse(JSON.stringify(this.state))
      const emptySources = {}
      for (const key in this.dataSources) {
        emptySources[key] = []
      }
      dereference(stateCopy.data, emptySources)
      return stateCopy
    }
  }
}
</script>
<style scoped>
.chart-container {
  height: calc(100% - 89px);
}
.chart-worning {
  height: 40px;
  line-height: 40px;
}
.chart {
  border-top: 1px solid var(--color-border);
  min-height: 242px;
}

>>> .editor_controls .sidebar__item:before {
  width: 0;
}

>>> .sidebar {
  width: 120px;
  min-width: 120px;
  max-width: 120px;
}

>>> .editor_controls__wrapper>.panel,
>>> .editor_controls .panel__empty {
  width: 315px;
}
>>> .editor_controls .sidebar__group__title {
  padding-left: 10px;
}
>>> .editor_controls .sidebar__item {
  padding-left: 32px;
}
</style>
