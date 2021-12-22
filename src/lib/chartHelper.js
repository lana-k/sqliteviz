import dereference from 'react-chart-editor/lib/lib/dereference'
import plotly from 'plotly.js'
import { nanoid } from 'nanoid'

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

export function getChartData (element) {
  const chartElement = element.querySelector('.js-plotly-plot')
  return {
    data: chartElement.data,
    layout: chartElement.layout
  }
}

export function getHtml (options) {
  const chartId = nanoid()
  return `
      <script src="https://cdn.plot.ly/plotly-latest.js" charset="UTF-8"></script>
      <div id="${chartId}"></div>
      <script>
        const el = document.getElementById("${chartId}")
        
        let timeout
        function debounceResize() {
          clearTimeout(timeout)
          timeout = setTimeout(() => {
            var r = el.getBoundingClientRect()
            Plotly.relayout(el, {width: r.width, height: r.height})
          }, 200)
        }
        
        const resizeObserver = new ResizeObserver(debounceResize)
        resizeObserver.observe(el)
      
        Plotly.newPlot(el, ${JSON.stringify(options.data)}, ${JSON.stringify(options.layout)})
      </script>
  `
}

export default {
  getOptionsFromDataSources,
  getOptionsForSave,
  getImageDataUrl,
  getHtml,
  getChartData
}
