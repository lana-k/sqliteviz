<template>
<div>
  <div class="warning pivot-warning" v-show="!dataSources">
    There is no data to build a pivot. Run your sql query and make sure the result is not empty.
  </div>
  <pivot-ui :key-names="columns" v-model="pivotOptions"/>
  <div ref="output"/>
  <div id="id"/>

  <!--<chart
    :visible="false"
    :sql-result="result"
    :init-chart="initChart"
    ref="chart"
    @update="$store.commit('updateTab', { index: tabIndex, isUnsaved: true })"
  />-->
</div>
</template>

<script>
import $ from 'jquery'
import 'jquery-ui/ui/widgets/sortable'
import 'pivottable'
import 'pivottable/dist/export_renderers.js'
import 'pivottable/dist/plotly_renderers.js'
import 'pivottable/dist/pivot.css'
import PivotUi from './PivotUi'
/* import Chart from '@/views/Main/Editor/Tabs/Tab/Chart'
import Vue from 'vue'
const ChartClass = Vue.extend(Chart) */
/*
function myRenderer (data, options) {
  console.log(data)
  console.log(options)
  const rowKeys = data.getRowKeys()
  const colKeys = data.getColKeys()
  console.log(rowKeys)
  console.log(colKeys)
  const plotData = {}
  colKeys.forEach(colKey => {
    console.log('colKey', colKey)
    plotData[colKey.join('-')] = []
    rowKeys.forEach(rowKey => {
      plotData[colKey.join('-')].push(data.getAggregator(rowKey, colKey).value())
    })
  })
  console.log(plotData)

  const chartInstance = new ChartClass({
    propsData: { visible: true }
  })
  chartInstance.$mount()
  console.log(chartInstance.$el)

  return $(chartInstance.$el)
}
const renderers = $.extend(
  $.pivotUtilities.renderers,
  $.pivotUtilities.export_renderers,
  $.pivotUtilities.plotly_renderers,
  { myRenderer: myRenderer }
) */

export default {
  name: 'pivot',
  props: ['dataSources'],
  components: {
    PivotUi
  },
  data () {
    return {
      pivotOptions: {}
    }
  },
  computed: {
    columns () {
      return Object.keys(this.dataSources || {})
    }
  },
  watch: {
    dataSources () {
      this.show()
    },
    pivotOptions () {
      this.show()
    }
  },
  mounted () {
    this.show()
  },
  methods: {
    show () {
      if (!this.dataSources) {
        return
      }

      $(this.$refs.output).pivot(
        function (callback) {
          const rowCount = this.dataSources[this.columns[0]].length
          for (let i = 1; i <= rowCount; i++) {
            const row = {}
            this.columns.forEach(col => {
              row[col] = this.dataSources[col][i - 1]
            })
            callback(row)
          }
        }.bind(this),
        this.pivotOptions
      )
    }
  }
}
</script>

<style scoped>
.pivot-warning {
  height: 40px;
  line-height: 40px;
  box-sizing: border-box;
  margin-bottom: 20px;
}
</style>
