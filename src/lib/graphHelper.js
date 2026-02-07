import { COLOR_PICKER_CONSTANTS } from 'react-colorscales'
import tinycolor from 'tinycolor2'

const TYPE_NODE = 0
const TYPE_EDGE = 1
const DEFAULT_SCALE = COLOR_PICKER_CONSTANTS.DEFAULT_SCALE

export function dataSourceIsValid(dataSources) {
  const docColumn = Object.keys(dataSources)[0]
  if (!docColumn) {
    return false
  }
  try {
    const records = dataSources[docColumn].slice(0, 10)
    records.forEach(record => {
      const parsedRec = JSON.parse(record)
      if (Object.keys(parsedRec).length < 2) {
        throw new Error('The records must have at least 2 keys')
      }
    })
    const firstRecord = JSON.parse(records[0])
    if (
      !Object.keys(firstRecord).some(key => {
        return records
          .map(record => JSON.parse(record)[key])
          .every(value => value === 0 || value === 1)
      })
    ) {
      throw new Error(
        'There must be a common key used as object type: 0 - node, 1 - edge'
      )
    }
    return true
  } catch (err) {
    return false
  }
}

export function buildNodes(graph, dataSources, options) {
  const docColumn = Object.keys(dataSources)[0]
  const { objectType, nodeId } = options.structure

  if (objectType && nodeId) {
    const nodes = dataSources[docColumn]
      .map(json => JSON.parse(json))
      .filter(item => item[objectType] === TYPE_NODE)
    nodes.forEach(node => {
      if (node[nodeId]) {
        graph.addNode(node[nodeId], {
          data: node
        })
      }
    })
  }
}

export function buildEdges(graph, dataSources, options) {
  const docColumn = Object.keys(dataSources)[0]
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
          data: edge
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

export function reduceNodes(node, data, interactionState, settings) {
  const {
    selectedNodeId,
    hoveredNodeId,
    selectedEdgeId,
    hoveredEdgeId,
    neighborsOfSelectedNode,
    neighborsOfHoveredNode,
    selectedEdgeExtremities,
    hoveredEdgeExtremities
  } = interactionState

  const res = { ...data }

  if (selectedNodeId || hoveredNodeId || hoveredEdgeId || selectedEdgeId) {
    res.zIndex = 2
    res.highlighted = node === selectedNodeId || node === hoveredNodeId

    const isInHoveredFamily =
      node === hoveredNodeId ||
      neighborsOfHoveredNode?.has(node) ||
      hoveredEdgeExtremities.includes(node)
    const isInSelectedFamily =
      node === selectedNodeId ||
      neighborsOfSelectedNode?.has(node) ||
      selectedEdgeExtremities.includes(node)
    if (isInSelectedFamily || isInHoveredFamily) {
      res.forceLabel = true
    } else {
      res.color = getDiminishedColor(data.color, settings.style.backgroundColor)
      res.label = ''
      res.zIndex = 1
    }
  }

  return res
}

export function reduceEdges(edge, data, interactionState, settings, graph) {
  const {
    selectedNodeId,
    hoveredNodeId,
    selectedEdgeId,
    hoveredEdgeId,
    neighborsOfSelectedNode,
    neighborsOfHoveredNode
  } = interactionState

  const res = { ...data }
  if (hoveredEdgeId || selectedEdgeId || selectedNodeId || hoveredNodeId) {
    const extremities = graph.extremities(edge)
    res.zIndex = 2
    const isHighlighted = hoveredEdgeId === edge || selectedEdgeId === edge

    let isVisible
    if (settings.style.highlightMode === 'node_alone') {
      isVisible = isHighlighted
    } else if (settings.style.highlightMode === 'node_and_neighbors') {
      isVisible =
        isHighlighted ||
        (selectedNodeId && extremities.includes(selectedNodeId)) ||
        (hoveredNodeId && extremities.includes(hoveredNodeId))
    } else {
      isVisible =
        isHighlighted ||
        (selectedNodeId &&
          extremities.every(
            n => n === selectedNodeId || neighborsOfSelectedNode.has(n)
          )) ||
        (hoveredNodeId &&
          extremities.every(
            n => n === hoveredNodeId || neighborsOfHoveredNode.has(n)
          ))
    }
    if (isHighlighted) {
      res.size = res.size * 2
      res.forceLabel = true
    } else if (!isVisible) {
      res.color = getDiminishedColor(data.color, settings.style.backgroundColor)
      res.zIndex = 1
      res.label = ''
    }
  }
  return res
}

export function getDiminishedColor(color, bgColor) {
  const colorObj = tinycolor(color)
  const colorOpacity = colorObj.getAlpha()
  colorObj.setAlpha(0.25 * colorOpacity)

  const fg = colorObj.toRgb()
  const bg = tinycolor(bgColor).toRgb()

  const r = Math.round(fg.r * fg.a + bg.r * (1 - fg.a))
  const g = Math.round(fg.g * fg.a + bg.g * (1 - fg.a))
  const b = Math.round(fg.b * fg.a + bg.b * (1 - fg.a))

  return tinycolor({ r, g, b, a: 1 }).toHexString()
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
    return attributes => {
      attributes.size = getVariabledSize(
        mode,
        attributes.data[source],
        scale,
        min
      )
    }
  } else {
    return (attributes, nodeId) => {
      attributes.size = getVariabledSize(
        mode,
        graph[method](nodeId),
        scale,
        min
      )
    }
  }
}

function getDirectVariableColorUpdateMethod(source, opacity = 100) {
  return attributes => {
    const color = tinycolor(attributes.data[source])
    const colorOpacity = color.getAlpha()
    attributes.color = color
      .setAlpha((opacity / 100) * colorOpacity)
      .toHex8String()
  }
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
    method,
    opacity
  } = colorSettings
  if (type === 'constant') {
    const color = tinycolor(value)
    const colorOpacity = color.getAlpha()
    return attributes =>
      (attributes.color = color
        .setAlpha((opacity / 100) * colorOpacity)
        .toHex8String())
  } else if (type === 'variable') {
    return sourceUsage === 'map_to'
      ? getColorMethod(
          graph,
          mode,
          (nodeId, attributes) => attributes.data[source],
          colorscale,
          colorscaleDirection,
          getNodeValueScale,
          opacity
        )
      : getDirectVariableColorUpdateMethod(source, opacity)
  } else {
    return getColorMethod(
      graph,
      mode,
      nodeId => graph[method](nodeId),
      colorscale,
      colorscaleDirection,
      getNodeValueScale,
      opacity
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

function getVariabledSize(mode, value, scale, min) {
  if (mode === 'diameter') {
    return Math.max((value / 2) * scale, min / 2)
  } else if (mode === 'area') {
    return Math.max(Math.sqrt((value / 2) * scale), min / 2)
  } else {
    return Math.max(value * scale, min)
  }
}

function getColorMethod(
  graph,
  mode,
  sourceGetter,
  selectedColorscale,
  colorscaleDirection,
  valueScaleGetter,
  opacity = 100
) {
  const opacityFactor = opacity / 100
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
      attributes.color = tinycolor(colorMap[category])
        .setAlpha(opacityFactor)
        .toHex8String()
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
        attributes.color = tinycolor('#000000')
          .setAlpha(opacityFactor)
          .toHex8String()
        return
      }
      const exactMatch = normalizedColorscale.find(
        ([value]) => value === normalizedValue
      )
      if (exactMatch) {
        attributes.color = tinycolor(exactMatch[1])
          .setAlpha(opacityFactor)
          .toHex8String()
        return
      }

      const rightColorIndex = normalizedColorscale.findIndex(
        ([value]) => value > normalizedValue
      )
      const leftColorIndex = rightColorIndex - 1
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
      })
        .setAlpha(opacityFactor)
        .toHex8String()
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
