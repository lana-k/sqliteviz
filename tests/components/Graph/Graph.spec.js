import { expect } from 'chai'
import sinon from 'sinon'
import { mount, flushPromises } from '@vue/test-utils'
import Graph from '@/components/Graph/index.vue'

function getPixels(canvas) {
  const context = canvas.getContext('webgl2')
  const width = context.canvas.width
  const height = context.canvas.height

  // Create arrays to hold the pixel data
  const pixels = new Uint8Array(width * height * 4)

  // Read pixels from canvas
  context.readPixels(
    0,
    0,
    width,
    height,
    context.RGBA,
    context.UNSIGNED_BYTE,
    pixels
  )
  return pixels.join(' ')
}

describe('Graph.vue', () => {
  const $store = { state: { isWorkspaceVisible: true } }

  afterEach(() => {
    sinon.restore()
  })

  it('shows message when no data', () => {
    const wrapper = mount(Graph, {
      global: {
        stubs: {
          GraphEditor: true
        }
      },
      attachTo: document.body
    })
    expect(wrapper.find('.no-data').isVisible()).to.equal(true)
    expect(wrapper.find('.invalid-data').isVisible()).to.equal(false)
    wrapper.unmount()
  })

  it('shows message when data is invalid', () => {
    const wrapper = mount(Graph, {
      props: {
        dataSources: {
          column1: ['value1', 'value2']
        }
      },
      global: {
        stubs: {
          GraphEditor: true
        }
      },
      attachTo: document.body
    })
    expect(wrapper.find('.no-data').isVisible()).to.equal(false)
    expect(wrapper.find('.invalid-data').isVisible()).to.equal(true)
    wrapper.unmount()
  })

  it('emits update when graph editor updates', async () => {
    const wrapper = mount(Graph, {
      global: {
        stubs: {
          GraphEditor: true
        }
      }
    })
    wrapper.findComponent({ ref: 'graphEditor' }).vm.$emit('update')
    expect(wrapper.emitted('update')).to.have.lengthOf(1)
  })

  it('the graph resizes when the container resizes', async () => {
    const wrapper = mount(Graph, {
      attachTo: document.body,
      props: {
        dataSources: {
          doc: [
            '{"object_type":0,"node_id":"Gryffindor"}',
            '{"object_type":0,"node_id":"Hufflepuff"}'
          ]
        },
        initOptions: {
          structure: {
            nodeId: 'node_id',
            objectType: 'object_type',
            edgeSource: 'source',
            edgeTarget: 'target'
          },
          style: {
            backgroundColor: 'white',
            nodes: {
              size: {
                type: 'constant',
                value: 10
              },
              color: {
                type: 'constant',
                value: '#1F77B4'
              },
              label: {
                source: null,
                color: '#444444'
              }
            },
            edges: {
              showDirection: true,
              size: {
                type: 'constant',
                value: 2
              },
              color: {
                type: 'constant',
                value: '#a2b1c6'
              },
              label: {
                source: null,
                color: '#a2b1c6'
              }
            }
          },
          layout: {
            type: 'circular',
            options: null
          }
        }
      },
      global: {
        mocks: { $store },
        provide: {
          tabLayout: { dataView: 'above' }
        }
      }
    })

    const container =
      wrapper.find('.graph-container').wrapperElement.parentElement
    const canvas = wrapper.find('canvas.sigma-nodes').wrapperElement

    const initialContainerWidth = container.scrollWidth
    const initialContainerHeight = container.scrollHeight

    const initialCanvasWidth = canvas.scrollWidth
    const initialCanvasHeight = canvas.scrollHeight

    const newContainerWidth = initialContainerWidth * 2 || 1000
    const newContainerHeight = initialContainerHeight * 2 || 2000

    container.style.width = `${newContainerWidth}px`
    container.style.height = `${newContainerHeight}px`

    await flushPromises()

    expect(canvas.scrollWidth).not.to.equal(initialCanvasWidth)
    expect(canvas.scrollHeight).not.to.equal(initialCanvasHeight)

    wrapper.unmount()
  })

  it('nodes and edges are rendered', async () => {
    const wrapper = mount(Graph, {
      attachTo: document.body,
      props: {
        showViewSettings: true,
        dataSources: {
          doc: [
            '{"object_type": 0, "node_id": 1}',
            '{"object_type": 0, "node_id": 2}',
            '{"object_type": 1, "source": 1, "target": 2}'
          ]
        }
      },
      global: {
        mocks: { $store },
        provide: {
          tabLayout: { dataView: 'above' }
        }
      }
    })

    const container =
      wrapper.find('.graph-container').wrapperElement.parentElement
    container.style.height = '400px'

    await wrapper
      .find('.test_object_type_select.dropdown-container .Select__indicator')
      .wrapperElement.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      )

    let options = wrapper.findAll('.Select__menu .Select__option')

    await options[0].trigger('click')

    const nodeCanvasPixelsBefore = getPixels(
      wrapper.find('.test_graph_output canvas.sigma-nodes').wrapperElement
    )
    const edgeCanvasPixelsBefore = getPixels(
      wrapper.find('.test_graph_output canvas.sigma-edges').wrapperElement
    )

    await wrapper
      .find('.test_node_id_select.dropdown-container .Select__indicator')
      .wrapperElement.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      )

    options = wrapper.findAll('.Select__menu .Select__option')
    await options[1].trigger('click')

    await wrapper
      .find('.test_edge_source_select.dropdown-container .Select__indicator')
      .wrapperElement.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      )

    options = wrapper.findAll('.Select__menu .Select__option')
    await options[2].trigger('click')

    await wrapper
      .find('.test_edge_target_select.dropdown-container .Select__indicator')
      .wrapperElement.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      )

    options = wrapper.findAll('.Select__menu .Select__option')
    await options[3].trigger('click')

    const nodeCanvasPixelsAfter = getPixels(
      wrapper.find('.test_graph_output canvas.sigma-nodes').wrapperElement
    )
    const edgeCanvasPixelsAfter = getPixels(
      wrapper.find('.test_graph_output canvas.sigma-edges').wrapperElement
    )

    expect(nodeCanvasPixelsBefore).not.equal(nodeCanvasPixelsAfter)
    expect(edgeCanvasPixelsBefore).not.equal(edgeCanvasPixelsAfter)

    wrapper.unmount()
  })

  it('rerenders when dataSource changes but does not rerender if dataSources is empty', async () => {
    const wrapper = mount(Graph, {
      attachTo: document.body,
      props: {
        showViewSettings: true,
        dataSources: {
          doc: [
            '{"object_type": 0, "node_id": 1}',
            '{"object_type": 0, "node_id": 2}',
            '{"object_type": 1, "source": 1, "target": 2}'
          ]
        }
      },
      global: {
        mocks: { $store },
        provide: {
          tabLayout: { dataView: 'above' }
        }
      }
    })

    const container =
      wrapper.find('.graph-container').wrapperElement.parentElement
    container.style.height = '400px'

    await wrapper
      .find('.test_object_type_select.dropdown-container .Select__indicator')
      .wrapperElement.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      )

    let options = wrapper.findAll('.Select__menu .Select__option')

    await options[0].trigger('click')

    await wrapper
      .find('.test_node_id_select.dropdown-container .Select__indicator')
      .wrapperElement.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      )

    options = wrapper.findAll('.Select__menu .Select__option')
    await options[1].trigger('click')

    await wrapper
      .find('.test_edge_source_select.dropdown-container .Select__indicator')
      .wrapperElement.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      )

    options = wrapper.findAll('.Select__menu .Select__option')
    await options[2].trigger('click')

    await wrapper
      .find('.test_edge_target_select.dropdown-container .Select__indicator')
      .wrapperElement.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      )

    options = wrapper.findAll('.Select__menu .Select__option')
    await options[3].trigger('click')

    const nodeCanvasPixelsBefore = getPixels(
      wrapper.find('.test_graph_output canvas.sigma-nodes').wrapperElement
    )
    const edgeCanvasPixelsBefore = getPixels(
      wrapper.find('.test_graph_output canvas.sigma-edges').wrapperElement
    )
    await wrapper.setProps({
      dataSources: {
        doc: [
          '{"object_type": 0, "node_id": 1}',
          '{"object_type": 0, "node_id": 2}',
          '{"object_type": 0, "node_id": 3}',
          '{"object_type": 1, "source": 1, "target": 2}',
          '{"object_type": 1, "source": 1, "target": 3}'
        ]
      }
    })

    const nodeCanvasPixelsAfter = getPixels(
      wrapper.find('.test_graph_output canvas.sigma-nodes').wrapperElement
    )
    const edgeCanvasPixelsAfter = getPixels(
      wrapper.find('.test_graph_output canvas.sigma-edges').wrapperElement
    )

    expect(nodeCanvasPixelsBefore).not.equal(nodeCanvasPixelsAfter)
    expect(edgeCanvasPixelsBefore).not.equal(edgeCanvasPixelsAfter)

    await wrapper.setProps({
      dataSources: null
    })

    const nodeCanvasPixelsAfterEmtyData = getPixels(
      wrapper.find('.test_graph_output canvas.sigma-nodes').wrapperElement
    )
    const edgeCanvasPixelsAfterEmtyData = getPixels(
      wrapper.find('.test_graph_output canvas.sigma-edges').wrapperElement
    )

    expect(nodeCanvasPixelsAfterEmtyData).equal(nodeCanvasPixelsAfter)
    expect(edgeCanvasPixelsAfterEmtyData).equal(edgeCanvasPixelsAfter)

    wrapper.unmount()
  })

  it('saveAsPng', async () => {
    const wrapper = mount(Graph, {
      props: {
        dataSources: {
          doc: [
            '{"object_type":0,"node_id":"Gryffindor"}',
            '{"object_type":0,"node_id":"Hufflepuff"}'
          ]
        },
        initOptions: {
          structure: {
            nodeId: 'node_id',
            objectType: 'object_type',
            edgeSource: 'source',
            edgeTarget: 'target'
          },
          style: {
            backgroundColor: 'white',
            nodes: {
              size: {
                type: 'constant',
                value: 10
              },
              color: {
                type: 'constant',
                value: '#1F77B4'
              },
              label: {
                source: null,
                color: '#444444'
              }
            },
            edges: {
              showDirection: true,
              size: {
                type: 'constant',
                value: 2
              },
              color: {
                type: 'constant',
                value: '#a2b1c6'
              },
              label: {
                source: null,
                color: '#a2b1c6'
              }
            }
          },
          layout: {
            type: 'circular',
            options: null
          }
        }
      },
      global: {
        mocks: { $store },
        provide: {
          tabLayout: { dataView: 'above' }
        }
      }
    })
    sinon.stub(wrapper.vm.$refs.graphEditor, 'saveAsPng')
    await wrapper.vm.saveAsPng()
    expect(wrapper.emitted().loadingImageCompleted.length).to.equal(1)
  })

  it('hides and shows controls depending on showViewSettings and resizes the graph', async () => {
    const wrapper = mount(Graph, {
      attachTo: document.body,
      props: {
        dataSources: {
          doc: [
            '{"object_type":0,"node_id":"Gryffindor"}',
            '{"object_type":0,"node_id":"Hufflepuff"}'
          ]
        },
        initOptions: {
          structure: {
            nodeId: 'node_id',
            objectType: 'object_type',
            edgeSource: 'source',
            edgeTarget: 'target'
          },
          style: {
            backgroundColor: 'white',
            nodes: {
              size: {
                type: 'constant',
                value: 10
              },
              color: {
                type: 'constant',
                value: '#1F77B4'
              },
              label: {
                source: null,
                color: '#444444'
              }
            },
            edges: {
              showDirection: true,
              size: {
                type: 'constant',
                value: 2
              },
              color: {
                type: 'constant',
                value: '#a2b1c6'
              },
              label: {
                source: null,
                color: '#a2b1c6'
              }
            }
          },
          layout: {
            type: 'circular',
            options: null
          }
        }
      },
      global: {
        mocks: { $store },
        provide: {
          tabLayout: { dataView: 'above' }
        }
      }
    })

    const canvas = wrapper.find('canvas.sigma-nodes').wrapperElement

    const initialPlotWidth = canvas.scrollWidth
    const initialPlotHeight = canvas.scrollHeight

    expect(
      wrapper.find('.plotly_editor .editor_controls').isVisible()
    ).to.equal(false)

    await wrapper.setProps({ showViewSettings: true })

    await flushPromises()

    expect(canvas.scrollWidth).not.to.equal(initialPlotWidth)
    expect(canvas.scrollHeight).to.equal(initialPlotHeight)
    expect(
      wrapper.find('.plotly_editor .editor_controls').isVisible()
    ).to.equal(true)
    wrapper.unmount()
  })
})
