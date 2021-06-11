<template>
<div>
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
import Chart from '@/views/Main/Editor/Tabs/Tab/Chart'
import Vue from 'vue'
const ChartClass = Vue.extend(Chart)

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
)

const options = {
  renderers
}

export default {
  name: 'pivot',
  props: ['sqlResult'],
  computed: {
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
    }
  },
  mounted () {
    this.show()
  },
  methods: {
    show () {
      $(this.$refs.output).pivotUI(
        this.source,
        options
      )
    }
  }
}
</script>
