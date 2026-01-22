import { expect } from 'chai'
import sinon from 'sinon'
import * as graphHelper from '@/lib/graphHelper'
import Graph from 'graphology'

describe('graphHelper.js', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('dataSourceIsValid returns false if data source is not valid for graph', () => {
    // no columns
    let dataSources = {}

    expect(graphHelper.dataSourceIsValid(dataSources)).to.eql(false)

    // the records are not JSONs
    dataSources = {
      id: [1, 2]
    }

    expect(graphHelper.dataSourceIsValid(dataSources)).to.eql(false)

    // too few keys in JSON
    dataSources = {
      doc: ['{"id": 1}', '{"id": 2}']
    }

    expect(graphHelper.dataSourceIsValid(dataSources)).to.eql(false)

    // no key that could be an object type
    dataSources = {
      doc: ['{"foo": "hello", "type": 1}', '{"object_type": 0, "bar": true}']
    }

    expect(graphHelper.dataSourceIsValid(dataSources)).to.eql(false)

    // valid
    dataSources = {
      doc: ['{"foo": "hello", "type": 1}', '{"type": 0, "bar": true}']
    }

    expect(graphHelper.dataSourceIsValid(dataSources)).to.eql(true)
  })

  it('buildNodes', () => {
    const dataSources = {
      doc: [
        '{"type": 0, "node_id": 1, "label": "cat"}',
        '{"type": 0, "node_id": 2, "label": "dog"}',
        '{"type": 0, "node_id": null, "label": "bird"}',
        '{"object_type": 0, "node_id": 4, "label": "insect"}',
        '{"type": 1, "source": 1, "target": ""}'
      ]
    }
    const graph = new Graph()
    const options = {
      structure: {
        nodeId: null,
        objectType: null,
        edgeSource: null,
        edgeTarget: null
      }
    }
    graphHelper.buildNodes(graph, dataSources, options)
    expect(graph.export().nodes).to.eql([])

    graph.clear()

    options.structure.nodeId = 'node_id'
    options.structure.objectType = 'type'
    graphHelper.buildNodes(graph, dataSources, options)
    expect(graph.export().nodes).to.eql([
      {
        key: '1',
        attributes: { data: { type: 0, node_id: 1, label: 'cat' } }
      },
      {
        key: '2',
        attributes: { data: { type: 0, node_id: 2, label: 'dog' } }
      }
    ])
  })

  it('buildEdges', () => {
    const dataSources = {
      doc: [
        '{"type": 0, "node_id": 1, "label": "cat"}',
        '{"type": 0, "node_id": 2, "label": "dog"}',
        '{"type": 0, "node_id": 3, "label": "bird"}',
        '{"type": 1, "source": 1, "target": 2}',
        '{"type": 1, "source": 1, "target": 8}',
        '{"type": 1, "from": 1, "to": 3}'
      ]
    }
    const graph = new Graph()
    const options = {
      structure: {
        nodeId: 'node_id',
        objectType: null,
        edgeSource: null,
        edgeTarget: null
      }
    }
    graphHelper.buildNodes(graph, dataSources, options)
    graphHelper.buildEdges(graph, dataSources, options)
    expect(graph.export().edges).to.eql([])

    graph.clear()

    options.structure.objectType = 'type'
    options.structure.edgeSource = 'source'
    options.structure.edgeTarget = 'target'

    graphHelper.buildNodes(graph, dataSources, options)
    graphHelper.buildEdges(graph, dataSources, options)

    const edges = graph.export().edges
    expect(edges.length).to.eql(1)
    expect(edges[0].source).to.equal('1')
    expect(edges[0].target).to.equal('2')
    expect(edges[0].attributes).to.eql({
      data: { type: 1, source: 1, target: 2 }
    })
  })

  it('udpateNodes - lables', () => {
    const dataSources = {
      doc: [
        '{"type": 0, "node_id": 1, "label": "cat"}',
        '{"type": 0, "node_id": 2, "label": "dog"}'
      ]
    }
    const graph = new Graph()
    const options = {
      structure: {
        nodeId: 'node_id',
        objectType: 'type',
        edgeSource: null,
        edgeTarget: null
      }
    }
    graphHelper.buildNodes(graph, dataSources, options)
    graphHelper.updateNodes(graph, {
      label: {
        source: 'label',
        color: 'green'
      }
    })
    expect(graph.export().nodes).to.eql([
      {
        key: '1',
        attributes: {
          data: { type: 0, node_id: 1, label: 'cat' },
          label: 'cat',
          labelColor: 'green'
        }
      },
      {
        key: '2',
        attributes: {
          data: { type: 0, node_id: 2, label: 'dog' },
          label: 'dog',
          labelColor: 'green'
        }
      }
    ])

    graphHelper.updateNodes(graph, {
      label: {
        source: null,
        color: 'green'
      }
    })
    expect(graph.export().nodes).to.eql([
      {
        key: '1',
        attributes: {
          data: { type: 0, node_id: 1, label: 'cat' },
          label: '',
          labelColor: 'green'
        }
      },
      {
        key: '2',
        attributes: {
          data: { type: 0, node_id: 2, label: 'dog' },
          label: '',
          labelColor: 'green'
        }
      }
    ])
  })

  it('udpateEdges - lables', () => {
    const dataSources = {
      doc: [
        '{"type": 0, "node_id": 1, "label": "cat"}',
        '{"type": 0, "node_id": 2, "label": "mouse"}',
        '{"type": 1, "source": 1, "target": 2, "label": "eats"}'
      ]
    }
    const graph = new Graph()
    const options = {
      structure: {
        nodeId: 'node_id',
        objectType: 'type',
        edgeSource: 'source',
        edgeTarget: 'target'
      }
    }
    graphHelper.buildNodes(graph, dataSources, options)
    graphHelper.buildEdges(graph, dataSources, options)
    graphHelper.updateEdges(graph, {
      label: {
        source: 'label',
        color: 'green'
      }
    })
    expect(graph.export().edges.map(edge => edge.attributes)).to.eql([
      {
        data: { type: 1, source: 1, target: 2, label: 'eats' },
        label: 'eats',
        labelColor: 'green'
      }
    ])

    graphHelper.updateEdges(graph, {
      label: {
        source: null,
        color: 'green'
      }
    })
    expect(graph.export().edges.map(edge => edge.attributes)).to.eql([
      {
        data: { type: 1, source: 1, target: 2, label: 'eats' },
        label: '',
        labelColor: 'green'
      }
    ])
  })

  it('udpateNodes - size - constant', () => {
    const dataSources = {
      doc: [
        '{"type": 0, "node_id": 1, "label": "cat"}',
        '{"type": 0, "node_id": 2, "label": "dog"}'
      ]
    }
    const graph = new Graph()
    const options = {
      structure: {
        nodeId: 'node_id',
        objectType: 'type',
        edgeSource: null,
        edgeTarget: null
      }
    }
    graphHelper.buildNodes(graph, dataSources, options)
    graphHelper.updateNodes(graph, {
      size: {
        type: 'constant',
        value: 25
      }
    })
    expect(graph.export().nodes).to.eql([
      {
        key: '1',
        attributes: {
          data: { type: 0, node_id: 1, label: 'cat' },
          size: 25
        }
      },
      {
        key: '2',
        attributes: {
          data: { type: 0, node_id: 2, label: 'dog' },
          size: 25
        }
      }
    ])
  })

  it('udpateEdges - size - constant', () => {
    const dataSources = {
      doc: [
        '{"type": 0, "node_id": 1, "label": "cat"}',
        '{"type": 0, "node_id": 2, "label": "mouse"}',
        '{"type": 1, "source": 1, "target": 2}'
      ]
    }
    const graph = new Graph()
    const options = {
      structure: {
        nodeId: 'node_id',
        objectType: 'type',
        edgeSource: 'source',
        edgeTarget: 'target'
      }
    }
    graphHelper.buildNodes(graph, dataSources, options)
    graphHelper.buildEdges(graph, dataSources, options)
    graphHelper.updateEdges(graph, {
      size: {
        type: 'constant',
        value: 20
      }
    })
    expect(graph.export().edges.map(edge => edge.attributes)).to.eql([
      {
        data: { type: 1, source: 1, target: 2 },
        size: 20
      }
    ])
  })

  it('udpateNodes - size - variable', () => {
    const dataSources = {
      doc: [
        '{"type": 0, "node_id": 1, "points": 0}',
        '{"type": 0, "node_id": 2, "points": 8}'
      ]
    }
    const graph = new Graph()
    const options = {
      structure: {
        nodeId: 'node_id',
        objectType: 'type',
        edgeSource: null,
        edgeTarget: null
      }
    }
    graphHelper.buildNodes(graph, dataSources, options)
    graphHelper.updateNodes(graph, {
      size: {
        type: 'variable',
        source: 'points',
        scale: 4,
        mode: 'diameter',
        min: 1
      }
    })
    expect(graph.export().nodes).to.eql([
      {
        key: '1',
        attributes: {
          data: { type: 0, node_id: 1, points: 0 },
          size: 0.5
        }
      },
      {
        key: '2',
        attributes: {
          data: { type: 0, node_id: 2, points: 8 },
          size: 16
        }
      }
    ])

    graphHelper.updateNodes(graph, {
      size: {
        type: 'variable',
        source: 'points',
        scale: 4,
        mode: 'area',
        min: 1
      }
    })

    expect(graph.export().nodes).to.eql([
      {
        key: '1',
        attributes: {
          data: { type: 0, node_id: 1, points: 0 },
          size: 0.5
        }
      },
      {
        key: '2',
        attributes: {
          data: { type: 0, node_id: 2, points: 8 },
          size: 4
        }
      }
    ])
  })

  it('udpateEdges - size - variable', () => {
    const dataSources = {
      doc: [
        '{"type": 0, "node_id": 1, "label": "cat"}',
        '{"type": 0, "node_id": 2, "label": "mouse"}',
        '{"type": 0, "node_id": 3, "label": "cheese"}',
        '{"type": 1, "source": 1, "target": 2, "weight": 5}',
        '{"type": 1, "source": 2, "target": 3, "weight": 2}'
      ]
    }
    const graph = new Graph()
    const options = {
      structure: {
        nodeId: 'node_id',
        objectType: 'type',
        edgeSource: 'source',
        edgeTarget: 'target'
      }
    }
    graphHelper.buildNodes(graph, dataSources, options)
    graphHelper.buildEdges(graph, dataSources, options)
    graphHelper.updateEdges(graph, {
      size: {
        type: 'variable',
        source: 'weight',
        scale: 2,
        min: 6
      }
    })

    expect(graph.export().edges.map(edge => edge.attributes)).to.eql([
      {
        data: { type: 1, source: 1, target: 2, weight: 5 },
        size: 10
      },
      {
        data: { type: 1, source: 2, target: 3, weight: 2 },
        size: 6
      }
    ])
  })

  it('udpateNodes - size - computed', () => {
    const dataSources = {
      doc: [
        '{"type": 0, "node_id": 1}', // 0
        '{"type": 0, "node_id": 2}', // 2
        '{"type": 0, "node_id": 3}', // 0
        '{"type": 1, "source": 2, "target": 1}',
        '{"type": 1, "source": 2, "target": 3}'
      ]
    }
    const graph = new Graph()
    const options = {
      structure: {
        nodeId: 'node_id',
        objectType: 'type',
        edgeSource: 'source',
        edgeTarget: 'target'
      }
    }
    graphHelper.buildNodes(graph, dataSources, options)
    graphHelper.buildEdges(graph, dataSources, options)
    graphHelper.updateNodes(graph, {
      size: {
        type: 'calculated',
        method: 'outDegree',
        scale: 4,
        mode: 'diameter',
        min: 1
      }
    })

    expect(graph.export().nodes).to.eql([
      {
        key: '1',
        attributes: {
          data: { type: 0, node_id: 1 },
          size: 0.5
        }
      },
      {
        key: '2',
        attributes: {
          data: { type: 0, node_id: 2 },
          size: 4
        }
      },
      {
        key: '3',
        attributes: {
          data: { type: 0, node_id: 3 },
          size: 0.5
        }
      }
    ])

    graphHelper.updateNodes(graph, {
      size: {
        type: 'calculated',
        method: 'outDegree',
        scale: 4,
        mode: 'area',
        min: 1
      }
    })
    expect(graph.export().nodes).to.eql([
      {
        key: '1',
        attributes: {
          data: { type: 0, node_id: 1 },
          size: 0.5
        }
      },
      {
        key: '2',
        attributes: {
          data: { type: 0, node_id: 2 },
          size: 2
        }
      },
      {
        key: '3',
        attributes: {
          data: { type: 0, node_id: 3 },
          size: 0.5
        }
      }
    ])
  })

  it('udpateNodes - color - constant', () => {
    const dataSources = {
      doc: ['{"type": 0, "node_id": 1}', '{"type": 0, "node_id": 2}']
    }
    const graph = new Graph()
    const options = {
      structure: {
        nodeId: 'node_id',
        objectType: 'type',
        edgeSource: null,
        edgeTarget: null
      }
    }
    graphHelper.buildNodes(graph, dataSources, options)
    graphHelper.updateNodes(graph, {
      color: {
        type: 'constant',
        value: '#a1b8c380',
        opacity: 50
      }
    })
    expect(graph.export().nodes).to.eql([
      {
        key: '1',
        attributes: {
          data: { type: 0, node_id: 1 },
          color: '#a1b8c340'
        }
      },
      {
        key: '2',
        attributes: {
          data: { type: 0, node_id: 2 },
          color: '#a1b8c340'
        }
      }
    ])
  })

  it('udpateEdges - color - constant', () => {
    const dataSources = {
      doc: [
        '{"type": 0, "node_id": 1, "label": "cat"}',
        '{"type": 0, "node_id": 2, "label": "mouse"}',
        '{"type": 1, "source": 1, "target": 2}'
      ]
    }
    const graph = new Graph()
    const options = {
      structure: {
        nodeId: 'node_id',
        objectType: 'type',
        edgeSource: 'source',
        edgeTarget: 'target'
      }
    }
    graphHelper.buildNodes(graph, dataSources, options)
    graphHelper.buildEdges(graph, dataSources, options)
    graphHelper.updateEdges(graph, {
      color: {
        type: 'constant',
        value: '#df78af'
      }
    })
    expect(graph.export().edges.map(edge => edge.attributes)).to.eql([
      {
        data: { type: 1, source: 1, target: 2 },
        color: '#df78af'
      }
    ])
  })

  it('udpateNodes - color - variable', () => {
    const dataSources = {
      doc: [
        '{"type": 0, "node_id": 1, "color": "red", "points": 5}',
        '{"type": 0, "node_id": 2, "color": "#abcdff", "points": 15}',
        '{"type": 0, "node_id": 3, "color": "#12345680", "points": 10}'
      ]
    }
    const graph = new Graph()
    const options = {
      structure: {
        nodeId: 'node_id',
        objectType: 'type',
        edgeSource: null,
        edgeTarget: null
      }
    }
    graphHelper.buildNodes(graph, dataSources, options)
    graphHelper.updateNodes(graph, {
      color: {
        type: 'variable',
        source: 'color',
        sourceUsage: 'direct',
        opacity: 50
      }
    })
    expect(graph.export().nodes).to.eql([
      {
        key: '1',
        attributes: {
          data: { type: 0, node_id: 1, color: 'red', points: 5 },
          color: '#ff000080'
        }
      },
      {
        key: '2',
        attributes: {
          data: { type: 0, node_id: 2, color: '#abcdff', points: 15 },
          color: '#abcdff80'
        }
      },
      {
        key: '3',
        attributes: {
          data: { type: 0, node_id: 3, color: '#12345680', points: 10 },
          color: '#12345640'
        }
      }
    ])

    const colorscale = ['#aaaaff', '#8888ff', '#6666ff', '#4444ff', '#0000ff']
    graphHelper.updateNodes(graph, {
      color: {
        type: 'variable',
        source: 'points',
        sourceUsage: 'map_to',
        colorscale,
        mode: 'categorical',
        colorscaleDirection: 'normal',
        opacity: 50
      }
    })
    expect(graph.export().nodes).to.eql([
      {
        key: '1',
        attributes: {
          data: { type: 0, node_id: 1, color: 'red', points: 5 },
          color: '#aaaaff80'
        }
      },
      {
        key: '2',
        attributes: {
          data: { type: 0, node_id: 2, color: '#abcdff', points: 15 },
          color: '#6666ff80'
        }
      },
      {
        key: '3',
        attributes: {
          data: { type: 0, node_id: 3, color: '#12345680', points: 10 },
          color: '#8888ff80'
        }
      }
    ])

    graphHelper.updateNodes(graph, {
      color: {
        type: 'variable',
        source: 'points',
        sourceUsage: 'map_to',
        colorscale,
        mode: 'categorical',
        colorscaleDirection: 'reversed',
        opacity: 50
      }
    })

    expect(graph.export().nodes).to.eql([
      {
        key: '1',
        attributes: {
          data: { type: 0, node_id: 1, color: 'red', points: 5 },
          color: '#0000ff80'
        }
      },
      {
        key: '2',
        attributes: {
          data: { type: 0, node_id: 2, color: '#abcdff', points: 15 },
          color: '#6666ff80'
        }
      },
      {
        key: '3',
        attributes: {
          data: { type: 0, node_id: 3, color: '#12345680', points: 10 },
          color: '#4444ff80'
        }
      }
    ])

    graphHelper.updateNodes(graph, {
      color: {
        type: 'variable',
        source: 'points',
        sourceUsage: 'map_to',
        colorscale,
        mode: 'continious',
        colorscaleDirection: 'normal',
        opacity: 50
      }
    })
    expect(graph.export().nodes).to.eql([
      {
        key: '1',
        attributes: {
          data: { type: 0, node_id: 1, color: 'red', points: 5 },
          color: '#aaaaff80'
        }
      },
      {
        key: '2',
        attributes: {
          data: { type: 0, node_id: 2, color: '#abcdff', points: 15 },
          color: '#0000ff80'
        }
      },
      {
        key: '3',
        attributes: {
          data: { type: 0, node_id: 3, color: '#12345680', points: 10 },
          color: '#6666ff80'
        }
      }
    ])

    graphHelper.updateNodes(graph, {
      color: {
        type: 'variable',
        source: 'points',
        sourceUsage: 'map_to',
        colorscale,
        mode: 'continious',
        colorscaleDirection: 'reversed',
        opacity: 50
      }
    })

    expect(graph.export().nodes).to.eql([
      {
        key: '1',
        attributes: {
          data: { type: 0, node_id: 1, color: 'red', points: 5 },
          color: '#0000ff80'
        }
      },
      {
        key: '2',
        attributes: {
          data: { type: 0, node_id: 2, color: '#abcdff', points: 15 },
          color: '#aaaaff80'
        }
      },
      {
        key: '3',
        attributes: {
          data: { type: 0, node_id: 3, color: '#12345680', points: 10 },
          color: '#6666ff80'
        }
      }
    ])

    graphHelper.updateNodes(graph, {
      color: {
        type: 'variable',
        source: 'points',
        sourceUsage: 'map_to',
        colorscale: ['#aaaaff', '#0000ff'],
        mode: 'continious',
        colorscaleDirection: 'normal',
        opacity: 50
      }
    })

    expect(graph.export().nodes).to.eql([
      {
        key: '1',
        attributes: {
          data: { type: 0, node_id: 1, color: 'red', points: 5 },
          color: '#aaaaff80'
        }
      },
      {
        key: '2',
        attributes: {
          data: { type: 0, node_id: 2, color: '#abcdff', points: 15 },
          color: '#0000ff80'
        }
      },
      {
        key: '3',
        attributes: {
          data: { type: 0, node_id: 3, color: '#12345680', points: 10 },
          color: '#5555ff80'
        }
      }
    ])
  })

  it('udpateNodes makes nodes black when apply continious color for categories', () => {
    const dataSources = {
      doc: [
        '{"type": 0, "node_id": 1, "country": "NL"}',
        '{"type": 0, "node_id": 2, "country": "GB"}'
      ]
    }
    const graph = new Graph()
    const options = {
      structure: {
        nodeId: 'node_id',
        objectType: 'type',
        edgeSource: null,
        edgeTarget: null
      }
    }
    graphHelper.buildNodes(graph, dataSources, options)
    graphHelper.updateNodes(graph, {
      color: {
        type: 'variable',
        source: 'country',
        sourceUsage: 'map_to',
        mode: 'continious',
        colorscaleDirection: 'normal',
        opacity: 100
      }
    })
    expect(graph.export().nodes).to.eql([
      {
        key: '1',
        attributes: {
          data: { type: 0, node_id: 1, country: 'NL' },
          color: '#000000ff'
        }
      },
      {
        key: '2',
        attributes: {
          data: { type: 0, node_id: 2, country: 'GB' },
          color: '#000000ff'
        }
      }
    ])
  })

  it('udpateEdges - color - variable', () => {
    const dataSources = {
      doc: [
        '{"type": 0, "node_id": 1, "label": "cat"}',
        '{"type": 0, "node_id": 2, "label": "mouse"}',
        '{"type": 0, "node_id": 3, "label": "cheese"}',
        '{"type": 1, "source": 1, "target": 2, "color": "red", "weight": 5}',
        '{"type": 1, "source": 1, "target": 3, "color": "red", "weight": 15}',
        '{"type": 1, "source": 2, "target": 3, "color": "red", "weight": 10}'
      ]
    }
    const graph = new Graph()
    const options = {
      structure: {
        nodeId: 'node_id',
        objectType: 'type',
        edgeSource: 'source',
        edgeTarget: 'target'
      }
    }
    graphHelper.buildNodes(graph, dataSources, options)
    graphHelper.buildEdges(graph, dataSources, options)
    graphHelper.updateEdges(graph, {
      color: {
        type: 'variable',
        source: 'color',
        sourceUsage: 'direct'
      }
    })
    expect(graph.export().edges.map(edge => edge.attributes)).to.eql([
      {
        data: { type: 1, source: 1, target: 2, color: 'red', weight: 5 },
        color: '#ff0000ff'
      },
      {
        data: { type: 1, source: 1, target: 3, color: 'red', weight: 15 },
        color: '#ff0000ff'
      },
      {
        data: { type: 1, source: 2, target: 3, color: 'red', weight: 10 },
        color: '#ff0000ff'
      }
    ])

    const colorscale = ['#aaaaff', '#8888ff', '#6666ff', '#4444ff', '#0000ff']
    graphHelper.updateEdges(graph, {
      color: {
        type: 'variable',
        source: 'weight',
        sourceUsage: 'map_to',
        colorscale,
        mode: 'categorical',
        colorscaleDirection: 'normal'
      }
    })

    expect(graph.export().edges.map(edge => edge.attributes)).to.eql([
      {
        data: { type: 1, source: 1, target: 2, color: 'red', weight: 5 },
        color: '#aaaaffff'
      },
      {
        data: { type: 1, source: 1, target: 3, color: 'red', weight: 15 },
        color: '#6666ffff'
      },
      {
        data: { type: 1, source: 2, target: 3, color: 'red', weight: 10 },
        color: '#8888ffff'
      }
    ])

    graphHelper.updateEdges(graph, {
      color: {
        type: 'variable',
        source: 'weight',
        sourceUsage: 'map_to',
        colorscale,
        mode: 'categorical',
        colorscaleDirection: 'reversed'
      }
    })

    expect(graph.export().edges.map(edge => edge.attributes)).to.eql([
      {
        data: { type: 1, source: 1, target: 2, color: 'red', weight: 5 },
        color: '#0000ffff'
      },
      {
        data: { type: 1, source: 1, target: 3, color: 'red', weight: 15 },
        color: '#6666ffff'
      },
      {
        data: { type: 1, source: 2, target: 3, color: 'red', weight: 10 },
        color: '#4444ffff'
      }
    ])

    graphHelper.updateEdges(graph, {
      color: {
        type: 'variable',
        source: 'weight',
        sourceUsage: 'map_to',
        colorscale,
        mode: 'continious',
        colorscaleDirection: 'normal'
      }
    })

    expect(graph.export().edges.map(edge => edge.attributes)).to.eql([
      {
        data: { type: 1, source: 1, target: 2, color: 'red', weight: 5 },
        color: '#aaaaffff'
      },
      {
        data: { type: 1, source: 1, target: 3, color: 'red', weight: 15 },
        color: '#0000ffff'
      },
      {
        data: { type: 1, source: 2, target: 3, color: 'red', weight: 10 },
        color: '#6666ffff'
      }
    ])

    graphHelper.updateEdges(graph, {
      color: {
        type: 'variable',
        source: 'weight',
        sourceUsage: 'map_to',
        colorscale,
        mode: 'continious',
        colorscaleDirection: 'reversed'
      }
    })

    expect(graph.export().edges.map(edge => edge.attributes)).to.eql([
      {
        data: { type: 1, source: 1, target: 2, color: 'red', weight: 5 },
        color: '#0000ffff'
      },
      {
        data: { type: 1, source: 1, target: 3, color: 'red', weight: 15 },
        color: '#aaaaffff'
      },
      {
        data: { type: 1, source: 2, target: 3, color: 'red', weight: 10 },
        color: '#6666ffff'
      }
    ])
  })

  it('udpateNodes - color - calculated', () => {
    const dataSources = {
      doc: [
        '{"type": 0, "node_id": 1}',
        '{"type": 0, "node_id": 2}',
        '{"type": 0, "node_id": 3}',
        '{"type": 1, "source": 2, "target": 3}'
      ]
    }
    const graph = new Graph()
    const options = {
      structure: {
        nodeId: 'node_id',
        objectType: 'type',
        edgeSource: 'source',
        edgeTarget: 'target'
      }
    }

    graphHelper.buildNodes(graph, dataSources, options)
    graphHelper.buildEdges(graph, dataSources, options)

    const colorscale = ['#aaaaff', '#8888ff', '#6666ff', '#4444ff', '#0000ff']

    graphHelper.updateNodes(graph, {
      color: {
        type: 'calculated',
        method: 'degree',
        colorscale,
        mode: 'categorical',
        colorscaleDirection: 'normal',
        opacity: 50
      }
    })
    expect(graph.export().nodes).to.eql([
      {
        key: '1',
        attributes: {
          data: { type: 0, node_id: 1 },
          color: '#aaaaff80'
        }
      },
      {
        key: '2',
        attributes: {
          data: { type: 0, node_id: 2 },
          color: '#8888ff80'
        }
      },
      {
        key: '3',
        attributes: {
          data: { type: 0, node_id: 3 },
          color: '#8888ff80'
        }
      }
    ])

    graphHelper.updateNodes(graph, {
      color: {
        type: 'calculated',
        method: 'outDegree',
        colorscale,
        mode: 'categorical',
        colorscaleDirection: 'reversed',
        opacity: 50
      }
    })

    expect(graph.export().nodes).to.eql([
      {
        key: '1',
        attributes: {
          data: { type: 0, node_id: 1 },
          color: '#0000ff80'
        }
      },
      {
        key: '2',
        attributes: {
          data: { type: 0, node_id: 2 },
          color: '#4444ff80'
        }
      },
      {
        key: '3',
        attributes: {
          data: { type: 0, node_id: 3 },
          color: '#0000ff80'
        }
      }
    ])

    graphHelper.updateNodes(graph, {
      color: {
        type: 'calculated',
        method: 'degree',
        colorscale,
        mode: 'continious',
        colorscaleDirection: 'normal',
        opacity: 100
      }
    })
    expect(graph.export().nodes).to.eql([
      {
        key: '1',
        attributes: {
          data: { type: 0, node_id: 1 },
          color: '#aaaaffff'
        }
      },
      {
        key: '2',
        attributes: {
          data: { type: 0, node_id: 2 },
          color: '#0000ffff'
        }
      },
      {
        key: '3',
        attributes: {
          data: { type: 0, node_id: 3 },
          color: '#0000ffff'
        }
      }
    ])

    graphHelper.updateNodes(graph, {
      color: {
        type: 'calculated',
        method: 'degree',
        colorscale,
        mode: 'continious',
        colorscaleDirection: 'reversed',
        opacity: 100
      }
    })

    expect(graph.export().nodes).to.eql([
      {
        key: '1',
        attributes: {
          data: { type: 0, node_id: 1 },
          color: '#0000ffff'
        }
      },
      {
        key: '2',
        attributes: {
          data: { type: 0, node_id: 2 },
          color: '#aaaaffff'
        }
      },
      {
        key: '3',
        attributes: {
          data: { type: 0, node_id: 3 },
          color: '#aaaaffff'
        }
      }
    ])
  })

  it('udpateEdges - direction', () => {
    const dataSources = {
      doc: [
        '{"type": 0, "node_id": 1}',
        '{"type": 0, "node_id": 2}',
        '{"type": 1, "source": 1, "target": 2}'
      ]
    }
    const graph = new Graph()
    const options = {
      structure: {
        nodeId: 'node_id',
        objectType: 'type',
        edgeSource: 'source',
        edgeTarget: 'target'
      }
    }
    graphHelper.buildNodes(graph, dataSources, options)
    graphHelper.buildEdges(graph, dataSources, options)
    graphHelper.updateEdges(graph, {
      showDirection: true
    })
    expect(graph.export().edges.map(edge => edge.attributes)).to.eql([
      {
        data: { type: 1, source: 1, target: 2 },
        type: 'arrow'
      }
    ])

    graphHelper.updateEdges(graph, {
      showDirection: false
    })
    expect(graph.export().edges.map(edge => edge.attributes)).to.eql([
      {
        data: { type: 1, source: 1, target: 2 },
        type: 'line'
      }
    ])
  })
})
