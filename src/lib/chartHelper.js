import dereference from 'react-chart-editor/lib/lib/dereference'
import plotly from 'plotly.js'

export function getOptionsFromDataSources (dataSources) {
  if (!dataSources) {
    return []
  }

  return Object.keys(dataSources).map(name => ({
    value: name,
    label: name
  }))
}

export function getOptionsForSave (state, dataSources) {
  // we don't need to save the data, only settings
  // so we modify state.data using dereference
  const stateCopy = JSON.parse(JSON.stringify(state))
  const emptySources = {}
  for (const key in dataSources) {
    emptySources[key] = []
  }
  dereference(stateCopy.data, emptySources)
  return stateCopy
}

export async function getImageDataUrl (element, type) {
  const chartElement = element.querySelector('.js-plotly-plot')
  return await plotly.toImage(chartElement, {
    format: type,
    width: null,
    height: null
  })
}

export default {
  getOptionsFromDataSources,
  getOptionsForSave,
  getImageDataUrl
}
