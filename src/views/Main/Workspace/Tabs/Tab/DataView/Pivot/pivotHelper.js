import $ from 'jquery'
import 'pivottable'
import 'pivottable/dist/export_renderers.js'
import 'pivottable/dist/plotly_renderers.js'
import html2canvas from 'html2canvas'

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

export function _getDataSources (pivotData) {
  const rowKeys = pivotData.getRowKeys()
  const colKeys = pivotData.getColKeys()

  const dataSources = {
    'Column keys': colKeys.map(colKey => colKey.join('-')),
    'Row keys': rowKeys.map(rowKey => rowKey.join('-'))
  }

  const dataSourcesByRows = {}
  const dataSourcesByCols = {}

  const rowAttrs = pivotData.rowAttrs.join('-')
  const colAttrs = pivotData.colAttrs.join('-')

  colKeys.forEach(colKey => {
    const sourceColKey = colAttrs + ':' + colKey.join('-')
    dataSourcesByCols[sourceColKey] = []
    rowKeys.forEach(rowKey => {
      const value = pivotData.getAggregator(rowKey, colKey).value()
      dataSourcesByCols[sourceColKey].push(value)
      const sourceRowKey = rowAttrs + ':' + rowKey.join('-')
      if (!dataSourcesByRows[sourceRowKey]) {
        dataSourcesByRows[sourceRowKey] = []
      }
      dataSourcesByRows[sourceRowKey].push(value)
    })
  })

  return Object.assign(dataSources, dataSourcesByCols, dataSourcesByRows)
}

function customChartRenderer (data, options) {
  options.customChartComponent.dataSources = _getDataSources(data)
  options.customChartComponent.forPivot = true

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

export async function getPivotCanvas (pivotOutput) {
  const tableElement = pivotOutput.querySelector('.pvtTable')
  return await html2canvas(tableElement, { logging: false })
}

export function getPivotHtml (pivotOutput) {
  return `
      <style>
        table.pvtTable {
          font-family: Arial, sans-serif;
          font-size: 12px;
          text-align: left;
          border-collapse: collapse;
          min-width: 100%;
        }
        table.pvtTable .pvtColLabel {
          text-align: center;
        }
        table.pvtTable .pvtTotalLabel {
          text-align: right;
        }
        table.pvtTable tbody tr td {
          color: #506784;
          border: 1px solid #DFE8F3;
          text-align: right;
        }
        table.pvtTable thead tr th,
        table.pvtTable tbody tr th {
          background-color: #506784;
          color: #fff;
          border: 1px solid #DFE8F3;
        }
      </style>
      ${pivotOutput.outerHTML}
  `
}

export default {
  getPivotCanvas,
  getPivotHtml
}
