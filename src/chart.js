import dereference from 'react-chart-editor/lib/lib/dereference'

export function getDataSourcesFromSqlResult (sqlResult) {
  if (!sqlResult) {
    return {}
  }
  const dataSorces = {}
  const matrix = sqlResult.values
  const [row] = matrix
  const transposedMatrix = row.map((value, column) => matrix.map(row => row[column]))
  sqlResult.columns.forEach((column, index) => {
    dataSorces[column] = transposedMatrix[index]
  })
  return dataSorces
}

export function getOptionsFromDataSources (dataSources) {
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
  getDataSourcesFromSqlResult,
  getOptionsFromDataSources,
  getChartStateForSave
}
