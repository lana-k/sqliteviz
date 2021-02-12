<template>
<div v-show="visible" class="chart-container">
  <div class="warning chart-warning" v-show="!sqlResult && visible">
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
    @onRender="go"
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
import {
  getOptionsFromDataSources,
  getDataSourcesFromSqlResult,
  getChartStateForSave
} from '@/chart'
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
      return getDataSourcesFromSqlResult(this.sqlResult)
    },
    dataSourceOptions () {
      return getOptionsFromDataSources(this.dataSources)
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
    go (data, layout, frames) {
      // TODO: check changes and enable Save button if needed
    },
    update (data, layout, frames) {
      this.state = { data, layout, frames }
      this.$emit('update')
    },
    getChartStateForSave () {
      return getChartStateForSave(this.state, this.dataSources)
    }
  }
}
</script>

<style scoped>
.chart-container {
  height: calc(100% - 89px);
}

.chart-warning {
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
</style>
