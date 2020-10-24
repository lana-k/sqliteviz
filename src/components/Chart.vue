<template>
  <PlotlyEditor
    v-show="visible"
    :data="state.data"
    :layout="state.layout"
    :frames="state.frames"
    :config="{ editable: true }"
    :dataSources="dataSources"
    :dataSourceOptions="dataSourceOptions"
    :plotly="plotly"
    @onUpdate="update"
    :useResizeHandler="true"
    :debug="true"
    :advancedTraceTypeSelector="true"
  />
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
