import { COLOR_PICKER_CONSTANTS } from 'react-colorscales'
import tinycolor from 'tinycolor2'

const TYPE_NODE = 0
const TYPE_EDGE = 1
const DEFAULT_SCALE = COLOR_PICKER_CONSTANTS.DEFAULT_SCALE

export function buildNodes(graph, dataSources, options) {
  const docColumn = Object.keys(dataSources)[0] || 'doc'
  const { objectType, nodeId } = options.structure

  if (objectType && nodeId) {
    const nodes = dataSources[docColumn]
      .map(json => JSON.parse(json))
      .filter(item => item[objectType] === TYPE_NODE)
    nodes.forEach(node => {
      graph.addNode(node[nodeId], {
        data: node,
        labelColor: options.style.nodes.label.color
      })
    })
  }
}

export function buildEdges(graph, dataSources, options) {
  const docColumn = Object.keys(dataSources)[0] || 'doc'
  const { objectType, edgeSource, edgeTarget } = options.structure

  if (objectType && edgeSource && edgeTarget) {
    const edges = dataSources[docColumn]
      .map(json => JSON.parse(json))
      .filter(item => item[objectType] === TYPE_EDGE)

    edges.forEach(edge => {
      const source = edge[edgeSource]
      const target = edge[edgeTarget]
      if (graph.hasNode(source) && graph.hasNode(target)) {
        graph.addEdge(source, target, {
          data: edge,
          labelColor: options.style.edges.label.color
        })
      }
    })
  }
}

export function updateNodes(graph, attributeUpdates) {
  const changeMethods = []
  if (attributeUpdates.label) {
    changeMethods.push(getUpdateLabelMethod(attributeUpdates.label))
  }

  if (attributeUpdates.size) {
    changeMethods.push(getUpdateSizeMethod(graph, attributeUpdates.size))
  }

  if (attributeUpdates.color) {
    changeMethods.push(getUpdateNodeColorMethod(graph, attributeUpdates.color))
  }
  graph.forEachNode(nodeId => {
    graph.updateNode(nodeId, attributes => {
      const newAttributes = { ...attributes }
      changeMethods.forEach(method => method(newAttributes, nodeId))
      return newAttributes
    })
  })
}

export function updateEdges(graph, attributeUpdates) {
  const changeMethods = []
  if (attributeUpdates.label) {
    changeMethods.push(getUpdateLabelMethod(attributeUpdates.label))
  }

  if (attributeUpdates.size) {
    changeMethods.push(getUpdateSizeMethod(graph, attributeUpdates.size))
  }

  if (attributeUpdates.color) {
    changeMethods.push(getUpdateEdgeColorMethod(graph, attributeUpdates.color))
  }

  if ('showDirection' in attributeUpdates) {
    changeMethods.push(
      attributes =>
        (attributes.type = attributeUpdates.showDirection ? 'arrow' : 'line')
    )
  }

  graph.forEachEdge((edgeId, attributes, source, target) => {
    graph.updateEdgeWithKey(edgeId, source, target, attr => {
      const newAttributes = { ...attr }
      changeMethods.forEach(method => method(newAttributes, edgeId))
      return newAttributes
    })
  })
}

function getUpdateLabelMethod(labelSettings) {
  const { source, color } = labelSettings
  return attributes => {
    const label = attributes.data[source] ?? ''
    attributes.label = label.toString()
    attributes.labelColor = color
  }
}

function getUpdateSizeMethod(graph, sizeSettings) {
  const { type, value, source, scale, mode, min, method } = sizeSettings
  if (type === 'constant') {
    return attributes => (attributes.size = value)
  } else if (type === 'variable') {
    return getVariabledSizeMethod(mode, source, scale, min)
  } else {
    return (attributes, nodeId) =>
      (attributes.size = Math.max(graph[method](nodeId) * scale, min))
  }
}

function getDirectVariableColorUpdateMethod(source) {
  return attributes =>
    (attributes.color = tinycolor(attributes.data[source]).toHexString())
}

function getUpdateNodeColorMethod(graph, colorSettings) {
  const {
    type,
    value,
    source,
    sourceUsage,
    colorscale,
    colorscaleDirection,
    mode,
    method
  } = colorSettings
  if (type === 'constant') {
    return attributes => (attributes.color = value)
  } else if (type === 'variable') {
    return sourceUsage === 'map_to'
      ? getColorMethod(
          graph,
          mode,
          (nodeId, attributes) => attributes.data[source],
          colorscale,
          colorscaleDirection,
          getNodeValueScale
        )
      : getDirectVariableColorUpdateMethod(source)
  } else {
    return getColorMethod(
      graph,
      mode,
      nodeId => graph[method](nodeId),
      colorscale,
      colorscaleDirection,
      getNodeValueScale
    )
  }
}

function getUpdateEdgeColorMethod(graph, colorSettings) {
  const {
    type,
    value,
    source,
    sourceUsage,
    colorscale,
    colorscaleDirection,
    mode
  } = colorSettings
  if (type === 'constant') {
    return attributes => (attributes.color = value)
  } else {
    return sourceUsage === 'map_to'
      ? getColorMethod(
          graph,
          mode,
          (edgeId, attributes) => attributes.data[source],
          colorscale,
          colorscaleDirection,
          getEdgeValueScale
        )
      : getDirectVariableColorUpdateMethod(source)
  }
}

function getVariabledSizeMethod(mode, source, scale, min) {
  if (mode === 'diameter') {
    return attributes =>
      (attributes.size = Math.max(
        (attributes.data[source] / 2) * scale,
        min / 2
      ))
  } else if (mode === 'area') {
    return attributes =>
      (attributes.size = Math.max(
        Math.sqrt((attributes.data[source] / 2) * scale),
        min / 2
      ))
  } else {
    return attributes =>
      (attributes.size = Math.max(attributes.data[source] * scale, min))
  }
}

function getColorMethod(
  graph,
  mode,
  sourceGetter,
  selectedColorscale,
  colorscaleDirection,
  valueScaleGetter
) {
  const valueScale = valueScaleGetter(graph, sourceGetter)
  let colorscale = selectedColorscale || DEFAULT_SCALE
  if (colorscaleDirection === 'reversed') {
    colorscale = [...colorscale].reverse()
  }

  if (mode === 'categorical') {
    const colorMap = Object.fromEntries(
      valueScale.map((value, index) => [
        value,
        colorscale[index % colorscale.length]
      ])
    )

    return (attributes, nodeId) => {
      const category = sourceGetter(nodeId, attributes)
      attributes.color = colorMap[category]
    }
  } else {
    const min = valueScale[0]
    const max = valueScale[valueScale.length - 1]
    const normalizedColorscale = colorscale.map((color, index) => [
      index / (colorscale.length - 1),
      tinycolor(color).toRgb()
    ])
    return (attributes, nodeId) => {
      const value = sourceGetter(nodeId, attributes)
      const normalizedValue = (value - min) / (max - min)
      if (isNaN(normalizedValue)) {
        return
      }
      const exactMatch = normalizedColorscale.find(
        ([value]) => value === normalizedValue
      )
      if (exactMatch) {
        attributes.color = tinycolor(exactMatch[1]).toHexString()
        return
      }

      const rightColorIndex = normalizedColorscale.findIndex(
        ([value]) => value >= normalizedValue
      )
      const leftColorIndex = (rightColorIndex || 1) - 1
      const right = normalizedColorscale[rightColorIndex]
      const left = normalizedColorscale[leftColorIndex]
      const interpolationFactor =
        (normalizedValue - left[0]) / (right[0] - left[0])

      const r0 = left[1].r
      const g0 = left[1].g
      const b0 = left[1].b
      const r1 = right[1].r
      const g1 = right[1].g
      const b1 = right[1].b

      attributes.color = tinycolor({
        r: r0 + interpolationFactor * (r1 - r0),
        g: g0 + interpolationFactor * (g1 - g0),
        b: b0 + interpolationFactor * (b1 - b0)
      }).toHexString()
    }
  }
}

function getNodeValueScale(graph, sourceGetter) {
  const scaleSet = graph.reduceNodes((res, nodeId, attributes) => {
    res.add(sourceGetter(nodeId, attributes))
    return res
  }, new Set())
  return Array.from(scaleSet).sort((a, b) => a - b)
}

function getEdgeValueScale(graph, sourceGetter) {
  const scaleSet = graph.reduceEdges((res, edgeId, attributes) => {
    res.add(sourceGetter(edgeId, attributes))
    return res
  }, new Set())
  return Array.from(scaleSet).sort((a, b) => a - b)
}

export function getOptionsFromDataSources(dataSources) {
  if (!dataSources) {
    return []
  }

  return Object.keys(dataSources).map(name => ({
    value: name,
    label: name
  }))
}

export default {
  getOptionsFromDataSources
}
