import $ from 'jquery'
import 'pivottable'
import 'pivottable/dist/export_renderers.js'
import 'pivottable/dist/plotly_renderers.js'
import Chart from '@/views/Main/Editor/Tabs/Tab/DataView/Chart'
import Vue from 'vue'
const ChartClass = Vue.extend(Chart)

export const zeroValAggregators = [
  'Count',
  'Count as Fraction of Total',
  'Count as Fraction of Rows',
  'Count as Fraction of Columns'
]

export const twoValAggregators = [
  'Sum over Sum',
  '80% Upper Bound',
  '80% Lower Bound'
]

/*
  <!--<chart
    :sql-result="result"
    :init-options="initOptions"
    @update="$store.commit('updateTab', { index: tabIndex, isUnsaved: true })"
  />-->
*/
function customChartRenderer (data, options) {
  const rowKeys = data.getRowKeys()
  const colKeys = data.getColKeys()

  let dataSources = {
    'Column keys': colKeys.map(colKey => colKey.join('-')),
    'Row keys': rowKeys.map(rowKey => rowKey.join('-'))
  }

  const dataSourcesByRows = {}
  const dataSourcesByCols = {}

  colKeys.forEach(colKey => {
    const sourceColKey = data.colAttrs.join('-') + ':' + colKey.join('-')
    dataSourcesByCols[sourceColKey] = []
    rowKeys.forEach(rowKey => {
      const value = data.getAggregator(rowKey, colKey).value()
      dataSourcesByCols[sourceColKey].push(value)
      const sourceRowKey = data.rowAttrs.join('-') + ':' + rowKey.join('-')
      if (!dataSourcesByRows[sourceRowKey]) {
        dataSourcesByRows[sourceRowKey] = []
      }
      dataSourcesByRows[sourceRowKey].push(value)
    })
  })
  dataSources = Object.assign(dataSources, dataSourcesByCols, dataSourcesByRows)

  options.customChartComponent.dataSources = dataSources
  options.customChartComponent.$mount()
  
  return $(options.customChartComponent.$el)
}

$.extend(
  $.pivotUtilities.renderers,
  $.pivotUtilities.export_renderers,
  $.pivotUtilities.plotly_renderers,
  { 'Custom chart': customChartRenderer }
)

export const renderers = Object.keys($.pivotUtilities.renderers).map(key => {
  return {
    name: key,
    fun: $.pivotUtilities.renderers[key]
  }
})

export const aggregators = Object.keys($.pivotUtilities.aggregators).map(key => {
  return {
    name: key,
    fun: $.pivotUtilities.aggregators[key]
  }
})
