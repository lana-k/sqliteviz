import dereference from 'react-chart-editor/lib/lib/dereference'

export function getOptionsFromDataSources (dataSources) {
  if (!dataSources) {
    return []
  }

  return Object.keys(dataSources).map(name => ({
    value: name,
    label: name
  }))
}

export function getChartStateForSave (state, dataSources) {
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

export default {
  getOptionsFromDataSources,
  getChartStateForSave
}
