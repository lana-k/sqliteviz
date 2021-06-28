<template>
<div>
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
  props: ['sqlResult'],
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
      return Object.keys(this.sqlResult || {})
    },
    source () {
      return !this.sqlResult ? [] : [
        this.sqlResult.columns,
        ...this.sqlResult.values
      ]
    }
  },
  watch: {
    sqlResult () {
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
      $(this.$refs.output).pivot(
        function (callback) {
          const rowCount = this.sqlResult[this.columns[0]].length
          for (let i = 1; i <= rowCount; i++) {
            const row = {}
            this.columns.forEach(col => {
              row[col] = this.sqlResult[col][i - 1]
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
