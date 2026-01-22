import { expect } from 'chai'
import { mount } from '@vue/test-utils'
import GraphEditor from '@/components/Graph/GraphEditor.vue'
import { nextTick, ref } from 'vue'
import FA2Layout from 'graphology-layout-forceatlas2/worker'
import sinon from 'sinon'
import { waitCondition } from '/tests/testUtils'
import time from '@/lib/utils/time'
import * as forceAtlas2 from 'graphology-layout-forceatlas2'

const defaultInitOptions = {
  structure: {
    nodeId: null,
    objectType: null,
    edgeSource: null,
    edgeTarget: null
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
        value: '#1F77B4',
        opacity: 100
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

describe('GraphEditor', () => {
  afterEach(() => {
    sinon.restore()
  })
  it('sets graph structure', async () => {
    const wrapper = mount(GraphEditor, {
      attachTo: document.body,
      props: {
        dataSources: {
          doc: [
            '{"object_type": 0, "node_id": 1}',
            '{"object_type": 0, "node_id": 2}',
            '{"object_type": 1, "source": 1, "target": 2}'
          ]
        },
        showViewSettings: true
      },
      global: {
        provide: {
          tabLayout: { dataView: 'above' }
        }
      }
    })

    const graph = wrapper.vm.graph

    await wrapper
      .find('.test_object_type_select.dropdown-container .Select__indicator')
      .wrapperElement.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      )

    let options = wrapper.findAll('.Select__menu .Select__option')
    expect(options.length).to.equal(4)
    expect(wrapper.find('.Select__menu').text()).to.contain(
      'object_type' + 'node_id' + 'source' + 'target'
    )

    await options[0].trigger('click')
    expect(graph.export().nodes.length).to.equal(0)
    expect(graph.export().edges.length).to.equal(0)

    await wrapper
      .find('.test_node_id_select.dropdown-container .Select__indicator')
      .wrapperElement.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      )

    options = wrapper.findAll('.Select__menu .Select__option')
    await options[1].trigger('click')
    expect(graph.export().nodes.length).to.equal(2)
    expect(graph.export().edges.length).to.equal(0)

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
    expect(graph.export().nodes.length).to.equal(2)
    expect(graph.export().edges.length).to.equal(1)

    wrapper.unmount()
  })

  it('changes background color', async () => {
    const wrapper = mount(GraphEditor, {
      attachTo: document.body,
      props: {
        dataSources: {
          doc: []
        },
        showViewSettings: true
      },
      global: {
        provide: {
          tabLayout: { dataView: 'above' }
        },
        stubs: {
          ColorPicker: true
        }
      }
    })

    const styleMenuItem = wrapper.findAll('.sidebar__group__title')[1]
    await styleMenuItem.trigger('click')

    const generalMenuItem = wrapper.findAll('.sidebar__item')[1]
    await generalMenuItem.trigger('click')
    await wrapper
      .findComponent({ name: 'ColorPicker' })
      .vm.$emit('colorChange', '#ff00ff')

    expect(
      wrapper.find('.test_graph_output').wrapperElement.style.backgroundColor
    ).to.equal('rgb(255, 0, 255)')
    wrapper.unmount()
  })

  it('sets node labels', async () => {
    const wrapper = mount(GraphEditor, {
      attachTo: document.body,
      props: {
        dataSources: {
          doc: [
            '{"object_type": 0, "node_id": 1, "name": "foo"}',
            '{"object_type": 0, "node_id": 2, "name": "bar"}',
            '{"object_type": 1, "source": 1, "target": 2}'
          ]
        },
        initOptions: {
          ...defaultInitOptions,
          structure: {
            nodeId: 'node_id',
            objectType: 'object_type',
            edgeSource: 'source',
            edgeTarget: 'target'
          }
        },
        showViewSettings: true
      },
      global: {
        provide: {
          tabLayout: { dataView: 'above' }
        }
      }
    })

    const graph = wrapper.vm.graph

    const styleMenuItem = wrapper.findAll('.sidebar__group__title')[1]
    await styleMenuItem.trigger('click')

    const nodesMenuItem = wrapper.findAll('.sidebar__item')[2]
    await nodesMenuItem.trigger('click')

    await wrapper
      .find('.test_label_select.dropdown-container .Select__indicator')
      .wrapperElement.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      )

    await wrapper.findAll('.Select__menu .Select__option')[2].trigger('click')

    expect(graph.export().nodes[0].attributes.label).to.equal('foo')
    expect(graph.export().nodes[1].attributes.label).to.equal('bar')

    wrapper.unmount()
  })

  it('sets node label color', async () => {
    const wrapper = mount(GraphEditor, {
      attachTo: document.body,
      props: {
        dataSources: {
          doc: [
            '{"object_type": 0, "node_id": 1, "name": "foo"}',
            '{"object_type": 0, "node_id": 2, "name": "bar"}',
            '{"object_type": 1, "source": 1, "target": 2}'
          ]
        },
        initOptions: {
          ...defaultInitOptions,
          structure: {
            nodeId: 'node_id',
            objectType: 'object_type',
            edgeSource: 'source',
            edgeTarget: 'target'
          }
        },
        showViewSettings: true
      },
      global: {
        provide: {
          tabLayout: { dataView: 'above' }
        },
        stubs: {
          ColorPicker: true
        }
      }
    })

    const graph = wrapper.vm.graph

    const styleMenuItem = wrapper.findAll('.sidebar__group__title')[1]
    await styleMenuItem.trigger('click')

    const nodesMenuItem = wrapper.findAll('.sidebar__item')[2]
    await nodesMenuItem.trigger('click')

    await wrapper
      .findComponent({ name: 'ColorPicker' })
      .vm.$emit('colorChange', '#ff00ff')

    expect(graph.export().nodes[0].attributes.labelColor).to.equal('#ff00ff')
    expect(graph.export().nodes[1].attributes.labelColor).to.equal('#ff00ff')

    wrapper.unmount()
  })

  it('sets node size', async () => {
    const wrapper = mount(GraphEditor, {
      attachTo: document.body,
      props: {
        dataSources: {
          doc: [
            '{"object_type": 0, "node_id": 1, "points": 32}',
            '{"object_type": 0, "node_id": 2, "points": 8}',
            '{"object_type": 1, "source": 1, "target": 2}',
            '{"object_type": 1, "source": 1, "target": 2}',
            '{"object_type": 1, "source": 1, "target": 2}',
            '{"object_type": 1, "source": 1, "target": 2}',
            '{"object_type": 1, "source": 2, "target": 1}'
          ]
        },
        initOptions: {
          ...defaultInitOptions,
          structure: {
            nodeId: 'node_id',
            objectType: 'object_type',
            edgeSource: 'source',
            edgeTarget: 'target'
          }
        },
        showViewSettings: true
      },
      global: {
        provide: {
          tabLayout: { dataView: 'above' }
        }
      }
    })

    const graph = wrapper.vm.graph

    const styleMenuItem = wrapper.findAll('.sidebar__group__title')[1]
    await styleMenuItem.trigger('click')

    const nodesMenuItem = wrapper.findAll('.sidebar__item')[2]
    await nodesMenuItem.trigger('click')

    // Set constant size = 50
    const sizeInput = wrapper.find('.test_node_size_value input')
    await sizeInput.setValue(50)
    sizeInput.wrapperElement.dispatchEvent(new Event('blur', { bubbles: true }))
    // Call nextTick after setting number input,
    // otherwise the value will be changed beck to initial for some reason
    await nextTick()

    expect(graph.export().nodes[0].attributes.size).to.equal(50)
    expect(graph.export().nodes[1].attributes.size).to.equal(50)

    // Switch to Variable
    const variable = wrapper.findAll('.test_node_size .radio-block__option')[1]
    await variable.trigger('click')

    // Select points as size source
    await wrapper
      .find('.test_node_size_value .dropdown-container .Select__indicator')
      .wrapperElement.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      )

    await wrapper.findAll('.Select__menu .Select__option')[2].trigger('click')

    expect(graph.export().nodes[0].attributes.size).to.equal(16)
    expect(graph.export().nodes[1].attributes.size).to.equal(4)

    // Set size scale
    const sizeScale = wrapper.find('.test_node_size_scale input')
    sizeScale.wrapperElement.value = 4
    sizeScale.wrapperElement.dispatchEvent(new Event('blur', { bubbles: true }))
    await nextTick()

    expect(graph.export().nodes[0].attributes.size).to.equal(64)
    expect(graph.export().nodes[1].attributes.size).to.equal(16)

    // Switch to Area
    const mode = wrapper.findAll('.test_node_size_mode .radio-block__option')[0]
    await mode.trigger('click')

    expect(graph.export().nodes[0].attributes.size).to.equal(8)
    expect(graph.export().nodes[1].attributes.size).to.equal(4)

    // Set min
    const sizeMin = wrapper.find('.test_node_size_min input')
    await sizeMin.setValue(12)
    sizeMin.wrapperElement.dispatchEvent(new Event('blur', { bubbles: true }))
    await nextTick()

    expect(graph.export().nodes[0].attributes.size).to.equal(8)
    expect(graph.export().nodes[1].attributes.size).to.equal(6)

    // Switch to Calculated
    const calculated = wrapper.findAll(
      '.test_node_size .radio-block__option'
    )[2]
    await calculated.trigger('click')
    expect(graph.export().nodes[0].attributes.size).to.equal(2.5)
    expect(graph.export().nodes[1].attributes.size).to.equal(2.5)
    await nextTick()

    // Choose in-degree
    await wrapper
      .find('.test_node_size_value .dropdown-container .Select__indicator')
      .wrapperElement.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      )

    await wrapper.findAll('.Select__menu .Select__option')[1].trigger('click')

    expect(graph.export().nodes[0].attributes.size).to.equal(0.5)
    expect(graph.export().nodes[1].attributes.size).to.equal(2)

    // Switch to Variable
    await variable.trigger('click')

    // The latest settings from variable mode are applied
    expect(graph.export().nodes[0].attributes.size).to.equal(8)
    expect(graph.export().nodes[1].attributes.size).to.equal(6)

    // Switch to Constant
    const constant = wrapper.findAll('.test_node_size .radio-block__option')[0]
    await constant.trigger('click')

    // The latest settings from constant mode are applied
    expect(graph.export().nodes[0].attributes.size).to.equal(50)
    expect(graph.export().nodes[1].attributes.size).to.equal(50)

    wrapper.unmount()
  })

  it('sets node color', async () => {
    const wrapper = mount(GraphEditor, {
      attachTo: document.body,
      props: {
        dataSources: {
          doc: [
            '{"type": 0, "node_id": 1, "color": "#ff0000", "points": 5}',
            '{"type": 0, "node_id": 2, "color": "#abcdff", "points": 15}',
            '{"type": 0, "node_id": 3, "color": "#12345680", "points": 10}',
            '{"type": 1, "source": 2, "target": 3}'
          ]
        },
        initOptions: {
          ...defaultInitOptions,
          structure: {
            nodeId: 'node_id',
            objectType: 'type',
            edgeSource: 'source',
            edgeTarget: 'target'
          }
        },
        showViewSettings: true
      },
      global: {
        provide: {
          tabLayout: { dataView: 'above' }
        },
        stubs: {
          ColorPicker: true
        }
      }
    })

    const graph = wrapper.vm.graph

    const styleMenuItem = wrapper.findAll('.sidebar__group__title')[1]
    await styleMenuItem.trigger('click')

    const nodesMenuItem = wrapper.findAll('.sidebar__item')[2]
    await nodesMenuItem.trigger('click')

    // Set constant color
    await wrapper
      .findAllComponents({ name: 'ColorPicker' })[1]
      .vm.$emit('colorChange', '#ff00ff80')

    expect(graph.export().nodes[0].attributes.color).to.equal('#ff00ff80')
    expect(graph.export().nodes[1].attributes.color).to.equal('#ff00ff80')
    expect(graph.export().nodes[2].attributes.color).to.equal('#ff00ff80')

    // Switch to Variable
    const variable = wrapper.findAll('.test_node_color .radio-block__option')[1]
    await variable.trigger('click')

    // Select "color" as color source
    await wrapper
      .find('.test_node_color_value .dropdown-container .Select__indicator')
      .wrapperElement.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      )

    await wrapper.findAll('.Select__menu .Select__option')[2].trigger('click')

    expect(graph.export().nodes[0].attributes.color).to.equal('#fafa6eff')
    expect(graph.export().nodes[1].attributes.color).to.equal('#bdea75ff')
    expect(graph.export().nodes[2].attributes.color).to.equal('#86d780ff')

    // Select Direct mapping
    await wrapper
      .find('.test_node_color_mapping_mode .radio-block__option')
      .trigger('click')

    expect(graph.export().nodes[0].attributes.color).to.equal('#ff0000ff')
    expect(graph.export().nodes[1].attributes.color).to.equal('#abcdffff')
    expect(graph.export().nodes[2].attributes.color).to.equal('#12345680')

    // Switch to Calculated
    const calculated = wrapper.findAll(
      '.test_node_color .radio-block__option'
    )[2]
    await calculated.trigger('click')
    expect(graph.export().nodes[0].attributes.color).to.equal('#fafa6eff')
    expect(graph.export().nodes[1].attributes.color).to.equal('#2a4858ff')
    expect(graph.export().nodes[2].attributes.color).to.equal('#2a4858ff')
    await nextTick()

    // Choose in-degree
    await wrapper
      .find('.test_node_color_value .dropdown-container .Select__indicator')
      .wrapperElement.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      )

    await wrapper.findAll('.Select__menu .Select__option')[1].trigger('click')

    expect(graph.export().nodes[0].attributes.color).to.equal('#fafa6eff')
    expect(graph.export().nodes[1].attributes.color).to.equal('#fafa6eff')
    expect(graph.export().nodes[2].attributes.color).to.equal('#2a4858ff')
    await nextTick()

    // Set another opacity for calculated color
    let opacityInput = wrapper.find(
      '.test_node_opacity input.numeric-input__number'
    )
    await opacityInput.setValue(50)
    opacityInput.wrapperElement.dispatchEvent(
      new Event('blur', { bubbles: true })
    )
    expect(graph.export().nodes[0].attributes.color).to.equal('#fafa6e80')
    expect(graph.export().nodes[1].attributes.color).to.equal('#fafa6e80')
    expect(graph.export().nodes[2].attributes.color).to.equal('#2a485880')
    await nextTick()

    // Set Color as to Categorical
    await wrapper
      .findAll('.test_node_color_as .radio-block__option')[1]
      .trigger('click')
    expect(graph.export().nodes[0].attributes.color).to.equal('#fafa6e80')
    expect(graph.export().nodes[1].attributes.color).to.equal('#fafa6e80')
    expect(graph.export().nodes[2].attributes.color).to.equal('#bdea7580')
    await nextTick()

    // Change colorscale direction
    await wrapper
      .findAll('.test_node_color_colorscale_direction .radio-block__option')[1]
      .trigger('click')
    expect(graph.export().nodes[0].attributes.color).to.equal('#2a485880')
    expect(graph.export().nodes[1].attributes.color).to.equal('#2a485880')
    expect(graph.export().nodes[2].attributes.color).to.equal('#1f5f7080')
    await nextTick()

    // Switch to Variable
    await variable.trigger('click')

    // The latest settings from variable mode are applied
    expect(graph.export().nodes[0].attributes.color).to.equal('#ff0000ff')
    expect(graph.export().nodes[1].attributes.color).to.equal('#abcdffff')
    expect(graph.export().nodes[2].attributes.color).to.equal('#12345680')

    // Switch to Constant
    const constant = wrapper.findAll('.test_node_color .radio-block__option')[0]
    await constant.trigger('click')

    // The latest settings from constant mode are applied
    expect(graph.export().nodes[0].attributes.color).to.equal('#ff00ff80')
    expect(graph.export().nodes[1].attributes.color).to.equal('#ff00ff80')
    expect(graph.export().nodes[2].attributes.color).to.equal('#ff00ff80')

    // Set another opacity for constant color
    await opacityInput.setValue(50)
    opacityInput.wrapperElement.dispatchEvent(
      new Event('blur', { bubbles: true })
    )
    expect(graph.export().nodes[0].attributes.color).to.equal('#ff00ff40')
    expect(graph.export().nodes[1].attributes.color).to.equal('#ff00ff40')
    expect(graph.export().nodes[2].attributes.color).to.equal('#ff00ff40')
    await nextTick()

    wrapper.unmount()
  })

  it('shows and hide arrows', async () => {
    const wrapper = mount(GraphEditor, {
      attachTo: document.body,
      props: {
        dataSources: {
          doc: [
            '{"object_type": 0, "node_id": 1}',
            '{"object_type": 0, "node_id": 2}',
            '{"object_type": 1, "source": 1, "target": 2}'
          ]
        },
        initOptions: {
          ...defaultInitOptions,
          structure: {
            nodeId: 'node_id',
            objectType: 'object_type',
            edgeSource: 'source',
            edgeTarget: 'target'
          }
        },
        showViewSettings: true
      },
      global: {
        provide: {
          tabLayout: { dataView: 'above' }
        }
      }
    })

    const graph = wrapper.vm.graph

    expect(graph.export().edges[0].attributes.type).to.equal('arrow')

    const styleMenuItem = wrapper.findAll('.sidebar__group__title')[1]
    await styleMenuItem.trigger('click')

    const edgesMenuItem = wrapper.findAll('.sidebar__item')[3]
    await edgesMenuItem.trigger('click')

    // Switch showing direction
    const variable = wrapper.findAll(
      '.test_edge_direction .radio-block__option'
    )[1]
    await variable.trigger('click')

    expect(graph.export().edges[0].attributes.type).to.equal('line')
    wrapper.unmount()
  })

  it('sets edge labels', async () => {
    const wrapper = mount(GraphEditor, {
      attachTo: document.body,
      props: {
        dataSources: {
          doc: [
            '{"object_type": 0, "node_id": 1}',
            '{"object_type": 0, "node_id": 2}',
            '{"object_type": 1, "source": 1, "target": 2, "name": "bar"}'
          ]
        },
        initOptions: {
          ...defaultInitOptions,
          structure: {
            nodeId: 'node_id',
            objectType: 'object_type',
            edgeSource: 'source',
            edgeTarget: 'target'
          }
        },
        showViewSettings: true
      },
      global: {
        provide: {
          tabLayout: { dataView: 'above' }
        }
      }
    })

    const graph = wrapper.vm.graph
    expect(graph.export().edges[0].attributes.label).to.equal('')

    const styleMenuItem = wrapper.findAll('.sidebar__group__title')[1]
    await styleMenuItem.trigger('click')

    const edgesMenuItem = wrapper.findAll('.sidebar__item')[3]
    await edgesMenuItem.trigger('click')

    await wrapper
      .find('.test_edge_label_select.dropdown-container .Select__indicator')
      .wrapperElement.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      )

    await wrapper.findAll('.Select__menu .Select__option')[4].trigger('click')

    expect(graph.export().edges[0].attributes.label).to.equal('bar')

    wrapper.unmount()
  })

  it('sets edge label color', async () => {
    const wrapper = mount(GraphEditor, {
      attachTo: document.body,
      props: {
        dataSources: {
          doc: [
            '{"object_type": 0, "node_id": 1, "name": "foo"}',
            '{"object_type": 0, "node_id": 2, "name": "bar"}',
            '{"object_type": 1, "source": 1, "target": 2}'
          ]
        },
        initOptions: {
          ...defaultInitOptions,
          structure: {
            nodeId: 'node_id',
            objectType: 'object_type',
            edgeSource: 'source',
            edgeTarget: 'target'
          }
        },
        showViewSettings: true
      },
      global: {
        provide: {
          tabLayout: { dataView: 'above' }
        },
        stubs: {
          ColorPicker: true
        }
      }
    })

    const graph = wrapper.vm.graph

    const styleMenuItem = wrapper.findAll('.sidebar__group__title')[1]
    await styleMenuItem.trigger('click')

    const edgesMenuItem = wrapper.findAll('.sidebar__item')[3]
    await edgesMenuItem.trigger('click')

    await wrapper
      .findComponent({ name: 'ColorPicker' })
      .vm.$emit('colorChange', '#ff00ff')

    expect(graph.export().edges[0].attributes.labelColor).to.equal('#ff00ff')

    wrapper.unmount()
  })

  it('sets edge size', async () => {
    const wrapper = mount(GraphEditor, {
      attachTo: document.body,
      props: {
        dataSources: {
          doc: [
            '{"object_type": 0, "node_id": 1}',
            '{"object_type": 0, "node_id": 2}',
            '{"object_type": 1, "source": 1, "target": 2, "weight": 1}',
            '{"object_type": 1, "source": 2, "target": 1, "weight": 15}'
          ]
        },
        initOptions: {
          ...defaultInitOptions,
          structure: {
            nodeId: 'node_id',
            objectType: 'object_type',
            edgeSource: 'source',
            edgeTarget: 'target'
          }
        },
        showViewSettings: true
      },
      global: {
        provide: {
          tabLayout: { dataView: 'above' }
        }
      }
    })

    const graph = wrapper.vm.graph

    const styleMenuItem = wrapper.findAll('.sidebar__group__title')[1]
    await styleMenuItem.trigger('click')

    const edgeMenuItem = wrapper.findAll('.sidebar__item')[3]
    await edgeMenuItem.trigger('click')

    // Set constant size = 50
    const sizeInput = wrapper.find('.test_edge_size_value input')
    await sizeInput.setValue(50)
    sizeInput.wrapperElement.dispatchEvent(new Event('blur', { bubbles: true }))
    // Call nextTick after setting number input,
    // otherwise the value will be changed beck to initial for some reason
    await nextTick()

    expect(graph.export().edges[0].attributes.size).to.equal(50)
    expect(graph.export().edges[1].attributes.size).to.equal(50)

    // Switch to Variable
    const variable = wrapper.findAll('.test_edge_size .radio-block__option')[1]
    await variable.trigger('click')

    // Select points as size source
    await wrapper
      .find('.test_edge_size_value .dropdown-container .Select__indicator')
      .wrapperElement.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      )
    await wrapper.findAll('.Select__menu .Select__option')[4].trigger('click')

    expect(graph.export().edges[0].attributes.size).to.equal(1)
    expect(graph.export().edges[1].attributes.size).to.equal(15)

    // Set size scale
    const sizeScale = wrapper.find('.test_edge_size_scale input')
    sizeScale.wrapperElement.value = 4
    sizeScale.wrapperElement.dispatchEvent(new Event('blur', { bubbles: true }))
    await nextTick()

    expect(graph.export().edges[0].attributes.size).to.equal(4)
    expect(graph.export().edges[1].attributes.size).to.equal(60)

    // Set min
    const sizeMin = wrapper.find('.test_edge_size_min input')
    await sizeMin.setValue(12)
    sizeMin.wrapperElement.dispatchEvent(new Event('blur', { bubbles: true }))
    await nextTick()

    expect(graph.export().edges[0].attributes.size).to.equal(12)
    expect(graph.export().edges[1].attributes.size).to.equal(60)

    // Switch to Constant
    const constant = wrapper.findAll('.test_edge_size .radio-block__option')[0]
    await constant.trigger('click')

    // The latest settings from constant mode are applied
    expect(graph.export().edges[0].attributes.size).to.equal(50)
    expect(graph.export().edges[1].attributes.size).to.equal(50)

    wrapper.unmount()
  })

  it('sets edge color', async () => {
    const wrapper = mount(GraphEditor, {
      attachTo: document.body,
      props: {
        dataSources: {
          doc: [
            '{"type": 0, "node_id": 1}',
            '{"type": 0, "node_id": 2}',
            '{"type": 0, "node_id": 3}',
            '{"type": 1, "source": 1, "target": 3, "color": "#ff0000", "weight": 1}',
            '{"type": 1, "source": 2, "target": 3, "color": "#abcdff", "weight": 5}',
            '{"type": 1, "source": 1, "target": 2, "color": "#123456", "weight": 10}'
          ]
        },
        initOptions: {
          ...defaultInitOptions,
          structure: {
            nodeId: 'node_id',
            objectType: 'type',
            edgeSource: 'source',
            edgeTarget: 'target'
          }
        },
        showViewSettings: true
      },
      global: {
        provide: {
          tabLayout: { dataView: 'above' }
        },
        stubs: {
          ColorPicker: true
        }
      }
    })

    const graph = wrapper.vm.graph

    const styleMenuItem = wrapper.findAll('.sidebar__group__title')[1]
    await styleMenuItem.trigger('click')

    const edgesMenuItem = wrapper.findAll('.sidebar__item')[3]
    await edgesMenuItem.trigger('click')

    // Set constant color
    await wrapper
      .findAllComponents({ name: 'ColorPicker' })[1]
      .vm.$emit('colorChange', '#ff00ff')

    expect(graph.export().edges[0].attributes.color).to.equal('#ff00ff')
    expect(graph.export().edges[1].attributes.color).to.equal('#ff00ff')
    expect(graph.export().edges[2].attributes.color).to.equal('#ff00ff')

    // Switch to Variable
    const variable = wrapper.findAll('.test_edge_color .radio-block__option')[1]
    await variable.trigger('click')

    // Select "weight" as color source
    await wrapper
      .find('.test_edge_color_value .dropdown-container .Select__indicator')
      .wrapperElement.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      )
    await wrapper.findAll('.Select__menu .Select__option')[5].trigger('click')

    expect(graph.export().edges[0].attributes.color).to.equal('#fafa6eff')
    expect(graph.export().edges[1].attributes.color).to.equal('#bdea75ff')
    expect(graph.export().edges[2].attributes.color).to.equal('#86d780ff')

    // Set Color as to Continious
    await wrapper
      .findAll('.test_edge_color_as .radio-block__option')[0]
      .trigger('click')
    expect(graph.export().edges[0].attributes.color).to.equal('#fafa6eff')
    expect(graph.export().edges[1].attributes.color).to.equal('#39b48dff')
    expect(graph.export().edges[2].attributes.color).to.equal('#2a4858ff')
    await nextTick()

    // Change colorscale direction
    await wrapper
      .findAll('.test_edge_color_colorscale_direction .radio-block__option')[1]
      .trigger('click')
    expect(graph.export().edges[0].attributes.color).to.equal('#2a4858ff')
    expect(graph.export().edges[1].attributes.color).to.equal('#139f8eff')
    expect(graph.export().edges[2].attributes.color).to.equal('#fafa6eff')
    await nextTick()

    // Clear color source
    await wrapper
      .find('.test_edge_color_value .dropdown-container .Select__indicator')
      .wrapperElement.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      )

    // Select "color" as color source
    await wrapper
      .find('.test_edge_color_value .dropdown-container .Select__indicator')
      .wrapperElement.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      )

    await wrapper.findAll('.Select__menu .Select__option')[4].trigger('click')

    // Select Direct mapping
    await wrapper
      .find('.test_edge_color_mapping_mode .radio-block__option')
      .trigger('click')

    expect(graph.export().edges[0].attributes.color).to.equal('#ff0000ff')
    expect(graph.export().edges[1].attributes.color).to.equal('#abcdffff')
    expect(graph.export().edges[2].attributes.color).to.equal('#123456ff')

    // Switch to Constant
    const constant = wrapper.findAll('.test_edge_color .radio-block__option')[0]
    await constant.trigger('click')

    // The latest settings from constant mode are applied
    expect(graph.export().edges[0].attributes.color).to.equal('#ff00ff')
    expect(graph.export().edges[1].attributes.color).to.equal('#ff00ff')
    expect(graph.export().edges[2].attributes.color).to.equal('#ff00ff')

    wrapper.unmount()
  })

  it('sets random layout with seed value', async () => {
    const wrapper = mount(GraphEditor, {
      attachTo: document.body,
      props: {
        dataSources: {
          doc: [
            '{"type": 0, "node_id": 1}',
            '{"type": 0, "node_id": 2}',
            '{"type": 0, "node_id": 3}',
            '{"type": 0, "node_id": 4}'
          ]
        },
        initOptions: {
          ...defaultInitOptions,
          structure: {
            nodeId: 'node_id',
            objectType: 'type',
            edgeSource: 'source',
            edgeTarget: 'target'
          }
        },
        showViewSettings: true
      },
      global: {
        provide: {
          tabLayout: { dataView: 'above' }
        }
      }
    })

    const graph = wrapper.vm.graph

    const initialCoordinates = graph
      .export()
      .nodes.map(node => `x:${node.attributes.x},y:${node.attributes.y}`)
      .join()

    const styleMenuItem = wrapper.findAll('.sidebar__group__title')[1]
    await styleMenuItem.trigger('click')

    const layoutMenuItem = wrapper.findAll('.sidebar__item')[4]
    await layoutMenuItem.trigger('click')

    // Set random layout
    await wrapper
      .find(
        '.test_layout_algorithm_select .dropdown-container .Select__indicator'
      )
      .wrapperElement.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      )

    await wrapper.findAll('.Select__menu .Select__option')[1].trigger('click')

    const randomCoordinatesSeed1 = graph
      .export()
      .nodes.map(node => `x:${node.attributes.x},y:${node.attributes.y}`)
      .join()

    expect(initialCoordinates).to.not.equal(randomCoordinatesSeed1)

    // Set another seed value
    const seedInput = wrapper.find('input.numeric-input__number ')
    await seedInput.setValue(2)
    seedInput.wrapperElement.dispatchEvent(new Event('blur', { bubbles: true }))
    await nextTick()

    const randomCoordinatesSeed2 = graph
      .export()
      .nodes.map(node => `x:${node.attributes.x},y:${node.attributes.y}`)
      .join()

    expect(randomCoordinatesSeed2).to.not.equal(randomCoordinatesSeed1)

    // Set previous seed value
    await seedInput.setValue(1)
    seedInput.wrapperElement.dispatchEvent(new Event('blur', { bubbles: true }))
    await nextTick()

    const randomCoordinatesSeed1After = graph
      .export()
      .nodes.map(node => `x:${node.attributes.x},y:${node.attributes.y}`)
      .join()

    expect(randomCoordinatesSeed1After).to.equal(randomCoordinatesSeed1)

    wrapper.unmount()
  })

  it('sets circle pack layout with seed value', async () => {
    const wrapper = mount(GraphEditor, {
      attachTo: document.body,
      props: {
        dataSources: {
          doc: [
            '{"type": 0, "node_id": 1, "size": 20}',
            '{"type": 0, "node_id": 2, "size": 2}',
            '{"type": 0, "node_id": 3, "size": 2}',
            '{"type": 0, "node_id": 4, "size": 2}'
          ]
        },
        initOptions: {
          ...defaultInitOptions,
          structure: {
            nodeId: 'node_id',
            objectType: 'type',
            edgeSource: 'source',
            edgeTarget: 'target'
          },
          style: {
            ...defaultInitOptions.style,
            nodes: {
              size: {
                type: 'variable',
                source: 'size',
                scale: 2,
                mode: 'diameter',
                min: 1
              },
              color: {
                type: 'constant',
                value: '#1F77B4'
              },
              label: {
                source: null,
                color: '#444444'
              }
            }
          }
        },
        showViewSettings: true
      },
      global: {
        provide: {
          tabLayout: { dataView: 'above' }
        }
      }
    })

    const graph = wrapper.vm.graph
    const initialCoordinates = graph
      .export()
      .nodes.map(node => `x:${node.attributes.x},y:${node.attributes.y}`)
      .join()

    const styleMenuItem = wrapper.findAll('.sidebar__group__title')[1]
    await styleMenuItem.trigger('click')

    const layoutMenuItem = wrapper.findAll('.sidebar__item')[4]
    await layoutMenuItem.trigger('click')

    // Set circle pack layout
    await wrapper
      .find(
        '.test_layout_algorithm_select .dropdown-container .Select__indicator'
      )
      .wrapperElement.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      )

    await wrapper.findAll('.Select__menu .Select__option')[2].trigger('click')

    const circlePackCoordinatesSeed1 = graph
      .export()
      .nodes.map(node => `x:${node.attributes.x},y:${node.attributes.y}`)
      .join()

    expect(initialCoordinates).to.not.equal(circlePackCoordinatesSeed1)

    // Set another seed value
    const seedInput = wrapper.find('input.numeric-input__number ')
    await seedInput.setValue(2)
    seedInput.wrapperElement.dispatchEvent(new Event('blur', { bubbles: true }))
    await nextTick()

    const circlePackCoordinatesSeed2 = graph
      .export()
      .nodes.map(node => `x:${node.attributes.x},y:${node.attributes.y}`)
      .join()

    expect(circlePackCoordinatesSeed2).to.not.equal(circlePackCoordinatesSeed1)

    // Set previous seed value
    await seedInput.setValue(1)
    seedInput.wrapperElement.dispatchEvent(new Event('blur', { bubbles: true }))
    await nextTick()

    const circlePackCoordinatesSeed1After = graph
      .export()
      .nodes.map(node => `x:${node.attributes.x},y:${node.attributes.y}`)
      .join()

    expect(circlePackCoordinatesSeed1After).to.equal(circlePackCoordinatesSeed1)

    wrapper.unmount()
  })

  it('sets different hierarchy in circle pack', async () => {
    const wrapper = mount(GraphEditor, {
      attachTo: document.body,
      props: {
        dataSources: {
          doc: [
            '{"type": 0, "node_id": 1, "size": 20, "color": "red"}',
            '{"type": 0, "node_id": 2, "size": 2, "color": "blue"}',
            '{"type": 0, "node_id": 3, "size": 2, "color": "red"}',
            '{"type": 0, "node_id": 4, "size": 2, "color": "green"}'
          ]
        },
        initOptions: {
          ...defaultInitOptions,
          structure: {
            nodeId: 'node_id',
            objectType: 'type',
            edgeSource: 'source',
            edgeTarget: 'target'
          },
          style: {
            ...defaultInitOptions.style,
            nodes: {
              size: {
                type: 'variable',
                source: 'size',
                scale: 2,
                mode: 'diameter',
                min: 1
              },
              color: {
                type: 'constant',
                value: '#1F77B4'
              },
              label: {
                source: null,
                color: '#444444'
              }
            }
          }
        },
        showViewSettings: true
      },
      global: {
        provide: {
          tabLayout: { dataView: 'above' }
        }
      }
    })

    const graph = wrapper.vm.graph
    const initialCoordinates = graph
      .export()
      .nodes.map(node => `x:${node.attributes.x},y:${node.attributes.y}`)
      .join()

    const styleMenuItem = wrapper.findAll('.sidebar__group__title')[1]
    await styleMenuItem.trigger('click')

    const layoutMenuItem = wrapper.findAll('.sidebar__item')[4]
    await layoutMenuItem.trigger('click')

    // Set circle pack layout
    await wrapper
      .find(
        '.test_layout_algorithm_select .dropdown-container .Select__indicator'
      )
      .wrapperElement.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      )

    await wrapper.findAll('.Select__menu .Select__option')[2].trigger('click')

    const circlePackCoordinatesNoHierarchy = graph
      .export()
      .nodes.map(node => `x:${node.attributes.x},y:${node.attributes.y}`)
      .join()

    expect(initialCoordinates).to.not.equal(circlePackCoordinatesNoHierarchy)

    // Set another hierarchy
    const hierarchyInput = wrapper.find(
      '.multiselect.sqliteviz-select .multiselect__select'
    )
    await hierarchyInput.trigger('mousedown')
    await wrapper
      .find('ul.multiselect__content')
      .findAll('li')[2]
      .find('span')
      .trigger('click')
    await nextTick()

    let nodes = graph.export().nodes
    const circlePackCoordinatesWithHierarchy = nodes
      .map(node => `x:${node.attributes.x},y:${node.attributes.y}`)
      .join()

    expect(circlePackCoordinatesWithHierarchy).to.not.equal(
      circlePackCoordinatesNoHierarchy
    )
    expect(nodes[0].attributes.hierarchyAttribute0).to.equal(20)
    expect(nodes[1].attributes.hierarchyAttribute0).to.equal(2)
    expect(nodes[2].attributes.hierarchyAttribute0).to.equal(2)
    expect(nodes[3].attributes.hierarchyAttribute0).to.equal(2)

    // Set another hierarchy
    await wrapper.find('.multiselect__tag-icon').trigger('mousedown')
    await nextTick()
    await hierarchyInput.trigger('mousedown')
    await wrapper
      .find('ul.multiselect__content')
      .findAll('li')[3]
      .find('span')
      .trigger('click')
    await nextTick()

    nodes = graph.export().nodes
    const circlePackCoordinatesWithAnotherHierarchy = nodes
      .map(node => `x:${node.attributes.x},y:${node.attributes.y}`)
      .join()

    expect(circlePackCoordinatesWithHierarchy).to.not.equal(
      circlePackCoordinatesWithAnotherHierarchy
    )
    expect(nodes[0].attributes.hierarchyAttribute0).to.equal('red')
    expect(nodes[1].attributes.hierarchyAttribute0).to.equal('blue')
    expect(nodes[2].attributes.hierarchyAttribute0).to.equal('red')
    expect(nodes[3].attributes.hierarchyAttribute0).to.equal('green')

    wrapper.unmount()
  })

  it('FA2: runs and stops automatically when switch to FA2', async () => {
    const stopSpy = sinon.spy(FA2Layout.prototype, 'stop')
    const startSpy = sinon.spy(FA2Layout.prototype, 'start')
    const wrapper = mount(GraphEditor, {
      attachTo: document.body,
      props: {
        dataSources: {
          doc: [
            '{"type": 0, "node_id": 1, "size": 20}',
            '{"type": 0, "node_id": 2, "size": 2}',
            '{"type": 0, "node_id": 3, "size": 2}',
            '{"type": 0, "node_id": 4, "size": 2}'
          ]
        },
        initOptions: {
          ...defaultInitOptions,
          structure: {
            nodeId: 'node_id',
            objectType: 'type',
            edgeSource: 'source',
            edgeTarget: 'target'
          }
        },
        showViewSettings: true
      },
      global: {
        provide: {
          tabLayout: { dataView: 'above' }
        }
      }
    })

    const graph = wrapper.vm.graph
    const initialCoordinates = graph
      .export()
      .nodes.map(node => `x:${node.attributes.x},y:${node.attributes.y}`)
      .join()

    const styleMenuItem = wrapper.findAll('.sidebar__group__title')[1]
    await styleMenuItem.trigger('click')

    const layoutMenuItem = wrapper.findAll('.sidebar__item')[4]
    await layoutMenuItem.trigger('click')

    // Set FA2 pack layout
    await wrapper
      .find(
        '.test_layout_algorithm_select .dropdown-container .Select__indicator'
      )
      .wrapperElement.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      )

    await wrapper.findAll('.Select__menu .Select__option')[3].trigger('click')

    expect(startSpy.calledOnce).to.equal(true)
    await waitCondition(() => stopSpy.callCount === 1)
    expect(wrapper.text()).to.contain('Start')

    const coordinates = graph
      .export()
      .nodes.map(node => `x:${node.attributes.x},y:${node.attributes.y}`)
      .join()

    expect(coordinates).not.to.equal(initialCoordinates)

    wrapper.unmount()
  })

  it('FA2: starts, stops and resets parameters to initial', async () => {
    const stopSpy = sinon.spy(FA2Layout.prototype, 'stop')
    const startSpy = sinon.spy(FA2Layout.prototype, 'start')
    const wrapper = mount(GraphEditor, {
      attachTo: document.body,
      props: {
        dataSources: {
          doc: [
            '{"type": 0, "node_id": 1, "size": 20}',
            '{"type": 0, "node_id": 2, "size": 2}',
            '{"type": 0, "node_id": 3, "size": 2}',
            '{"type": 0, "node_id": 4, "size": 2}',
            '{"type": 1, "source": 1, "target": 3, "wgt": 20}',
            '{"type": 1, "source": 1, "target": 2, "wgt": 15}',
            '{"type": 1, "source": 1, "target": 4, "wgt": 5}'
          ]
        },
        initOptions: {
          ...defaultInitOptions,
          structure: {
            nodeId: 'node_id',
            objectType: 'type',
            edgeSource: 'source',
            edgeTarget: 'target'
          },
          layout: {
            type: 'forceAtlas2',
            options: {
              initialIterationsAmount: 55,
              gravity: 1.5,
              scalingRatio: 1.2,
              adjustSizes: true,
              barnesHutOptimize: true,
              barnesHutTheta: 0.5,
              strongGravityMode: false,
              linLogMode: true,
              outboundAttractionDistribution: false,
              slowDown: 1,
              weightSource: 'wgt',
              edgeWeightInfluence: 0.5
            }
          }
        },
        showViewSettings: true
      },
      global: {
        provide: {
          tabLayout: { dataView: 'above' }
        }
      }
    })

    const graph = wrapper.vm.graph

    const styleMenuItem = wrapper.findAll('.sidebar__group__title')[1]
    await styleMenuItem.trigger('click')

    const layoutMenuItem = wrapper.findAll('.sidebar__item')[4]
    await layoutMenuItem.trigger('click')

    expect(startSpy.calledOnce).to.equal(true)
    await waitCondition(() => stopSpy.callCount === 1)
    expect(wrapper.text()).to.contain('Start')

    const initialCoordinates = graph
      .export()
      .nodes.map(node => `x:${node.attributes.x},y:${node.attributes.y}`)
      .join()

    // Change gravity
    const gravityInput = wrapper.find('.test_fa2_gravity input')
    await gravityInput.setValue(12)
    gravityInput.wrapperElement.dispatchEvent(
      new Event('blur', { bubbles: true })
    )
    // Call nextTick after setting number input,
    // otherwise the value will be changed beck to initial for some reason
    await nextTick()

    expect(wrapper.vm.settings.layout.options.gravity).to.equal(12)

    // Algorithm wasn't called
    expect(startSpy.calledOnce).to.equal(true)

    // Change scaling ratio
    const scalingInput = wrapper.find('.test_fa2_scaling input')
    await scalingInput.setValue(2)
    scalingInput.wrapperElement.dispatchEvent(
      new Event('blur', { bubbles: true })
    )
    await nextTick()
    expect(wrapper.vm.settings.layout.options.scalingRatio).to.equal(2)

    // Change Prevent overlaping (adjustSizes)
    await wrapper
      .findAll('.test_fa2_adjustSizes .radio-block__option')[1]
      .trigger('click')
    await nextTick()
    expect(wrapper.vm.settings.layout.options.adjustSizes).to.equal(false)

    // Change barnes-hut theta
    const barnesThetaInput = wrapper.find('.test_fa2_barnes_theta input')
    await barnesThetaInput.setValue(2)
    barnesThetaInput.wrapperElement.dispatchEvent(
      new Event('blur', { bubbles: true })
    )
    await nextTick()
    expect(wrapper.vm.settings.layout.options.barnesHutTheta).to.equal(2)

    // Disable barnes-hut
    await wrapper
      .findAll('.test_fa2_barnes_hut .radio-block__option')[1]
      .trigger('click')
    await nextTick()
    expect(wrapper.vm.settings.layout.options.barnesHutOptimize).to.equal(false)
    expect(wrapper.find('.test_fa2_barnes_theta').isVisible()).to.equal(false)

    // Enable strong gravity
    await wrapper
      .findAll('.test_fa2_strong_gravity .radio-block__option')[0]
      .trigger('click')
    await nextTick()
    expect(wrapper.vm.settings.layout.options.strongGravityMode).to.equal(true)

    // Disable LinLog
    await wrapper
      .findAll('.test_fa2_lin_log .radio-block__option')[1]
      .trigger('click')
    await nextTick()
    expect(wrapper.vm.settings.layout.options.linLogMode).to.equal(false)

    // Enable outbound attraction
    await wrapper
      .findAll('.test_fa2_outbound_attraction .radio-block__option')[0]
      .trigger('click')
    await nextTick()
    expect(
      wrapper.vm.settings.layout.options.outboundAttractionDistribution
    ).to.equal(true)

    // Change slow down
    const slowDownInput = wrapper.find('.test_fa2_slow_down input')
    await slowDownInput.setValue(0.1)
    slowDownInput.wrapperElement.dispatchEvent(
      new Event('blur', { bubbles: true })
    )
    await nextTick()
    expect(wrapper.vm.settings.layout.options.slowDown).to.equal(0.1)

    // Change weight influence
    const weightInfluenceInput = wrapper.find(
      '.test_fa2_weight_influence input'
    )
    await weightInfluenceInput.setValue(0.8)
    weightInfluenceInput.wrapperElement.dispatchEvent(
      new Event('blur', { bubbles: true })
    )
    await nextTick()
    expect(wrapper.vm.settings.layout.options.edgeWeightInfluence).to.equal(0.8)

    // Clear weight source
    await wrapper
      .find('.test_fa2_weight_source .dropdown-container .Select__indicator')
      .wrapperElement.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      )

    expect(wrapper.vm.settings.layout.options.weightSource).to.equal(null)
    expect(wrapper.find('.test_fa2_weight_influence').isVisible()).to.equal(
      false
    )

    // Click Start
    const toggleButton = wrapper.find('button.test_fa2_toggle')
    await toggleButton.trigger('click')
    expect(toggleButton.text()).to.contain('Stop')
    expect(startSpy.callCount).to.equal(2)

    // Wait a bit and click Stop
    await time.sleep(500)
    await toggleButton.trigger('click')
    expect(stopSpy.callCount).to.equal(2)

    const coordinates = graph
      .export()
      .nodes.map(node => `x:${node.attributes.x},y:${node.attributes.y}`)
      .join()

    expect(coordinates).not.to.equal(initialCoordinates)

    // Click Reset
    await wrapper.find('button.test_fa2_reset').trigger('click')
    expect(toggleButton.text()).to.contain('Start')
    expect(startSpy.callCount).to.equal(2)
    expect(wrapper.vm.settings.layout.options).to.eql({
      initialIterationsAmount: 55,
      gravity: 1.5,
      scalingRatio: 1.2,
      adjustSizes: true,
      barnesHutOptimize: true,
      barnesHutTheta: 0.5,
      strongGravityMode: false,
      linLogMode: true,
      outboundAttractionDistribution: false,
      slowDown: 1,
      weightSource: 'wgt',
      edgeWeightInfluence: 0.5
    })

    wrapper.unmount()
  })

  it('FA2: resets parameters to default', async () => {
    const wrapper = mount(GraphEditor, {
      attachTo: document.body,
      props: {
        dataSources: {
          doc: [
            '{"type": 0, "node_id": 1, "size": 20}',
            '{"type": 0, "node_id": 2, "size": 2}',
            '{"type": 0, "node_id": 3, "size": 2}',
            '{"type": 0, "node_id": 4, "size": 2}',
            '{"type": 1, "source": 1, "target": 3, "wgt": 20}',
            '{"type": 1, "source": 1, "target": 2, "wgt": 15}',
            '{"type": 1, "source": 1, "target": 4, "wgt": 5}'
          ]
        },
        initOptions: {
          ...defaultInitOptions,
          structure: {
            nodeId: 'node_id',
            objectType: 'type',
            edgeSource: 'source',
            edgeTarget: 'target'
          }
        },
        showViewSettings: true
      },
      global: {
        provide: {
          tabLayout: { dataView: 'above' }
        }
      }
    })

    const styleMenuItem = wrapper.findAll('.sidebar__group__title')[1]
    await styleMenuItem.trigger('click')

    const layoutMenuItem = wrapper.findAll('.sidebar__item')[4]
    await layoutMenuItem.trigger('click')

    // Set FA2 pack layout
    await wrapper
      .find(
        '.test_layout_algorithm_select .dropdown-container .Select__indicator'
      )
      .wrapperElement.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      )

    await wrapper.findAll('.Select__menu .Select__option')[3].trigger('click')

    const defaultRecommendedSettings = JSON.stringify(
      wrapper.vm.settings.layout.options
    )

    // Change initial iteration amount
    const iterationInput = wrapper.find('.test_fa2_iteration_amount input')
    await iterationInput.setValue(120)
    iterationInput.wrapperElement.dispatchEvent(
      new Event('blur', { bubbles: true })
    )
    await nextTick()

    // Change gravity
    const gravityInput = wrapper.find('.test_fa2_gravity input')
    await gravityInput.setValue(12)
    gravityInput.wrapperElement.dispatchEvent(
      new Event('blur', { bubbles: true })
    )
    await nextTick()

    // Change scaling ratio
    const scalingInput = wrapper.find('.test_fa2_scaling input')
    await scalingInput.setValue(2)
    scalingInput.wrapperElement.dispatchEvent(
      new Event('blur', { bubbles: true })
    )
    await nextTick()

    // Change Prevent overlaping (adjustSizes)
    await wrapper
      .findAll('.test_fa2_adjustSizes .radio-block__option')[0]
      .trigger('click')

    // Enable barnes-hut
    await wrapper
      .findAll('.test_fa2_barnes_hut .radio-block__option')[0]
      .trigger('click')

    // Change barnes-hut theta
    const barnesThetaInput = wrapper.find('.test_fa2_barnes_theta input')
    await barnesThetaInput.setValue(0.8)
    barnesThetaInput.wrapperElement.dispatchEvent(
      new Event('blur', { bubbles: true })
    )
    await nextTick()

    // Disable strong gravity
    await wrapper
      .findAll('.test_fa2_strong_gravity .radio-block__option')[1]
      .trigger('click')

    // Enable LinLog
    await wrapper
      .findAll('.test_fa2_lin_log .radio-block__option')[0]
      .trigger('click')

    // Disable outbound attraction
    await wrapper
      .findAll('.test_fa2_outbound_attraction .radio-block__option')[1]
      .trigger('click')

    // Change slow down
    const slowDownInput = wrapper.find('.test_fa2_slow_down input')
    await slowDownInput.setValue(3.5)
    slowDownInput.wrapperElement.dispatchEvent(
      new Event('blur', { bubbles: true })
    )
    await nextTick()

    // Set weight source
    await wrapper
      .find('.test_fa2_weight_source .dropdown-container .Select__indicator')
      .wrapperElement.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      )
    await wrapper.findAll('.Select__menu .Select__option')[5].trigger('click')

    // Change weight influence
    const weightInfluenceInput = wrapper.find(
      '.test_fa2_weight_influence input'
    )
    await weightInfluenceInput.setValue(0.8)
    weightInfluenceInput.wrapperElement.dispatchEvent(
      new Event('blur', { bubbles: true })
    )
    await nextTick()

    expect(wrapper.vm.settings.layout.options).to.eql({
      initialIterationsAmount: 120,
      gravity: 12,
      scalingRatio: 2,
      adjustSizes: true,
      barnesHutOptimize: true,
      barnesHutTheta: 0.8,
      strongGravityMode: false,
      linLogMode: true,
      outboundAttractionDistribution: false,
      slowDown: 3.5,
      weightSource: 'wgt',
      edgeWeightInfluence: 0.8
    })

    // Click Reset
    await wrapper.find('button.test_fa2_reset').trigger('click')
    expect(wrapper.vm.settings.layout.options).to.eql(
      JSON.parse(defaultRecommendedSettings)
    )

    wrapper.unmount()
  })

  it('calls scheduleRendering when tab becomes visible', async () => {
    const tabLayout = ref({ dataView: 'hidden' })
    const wrapper = mount(GraphEditor, {
      attachTo: document.body,
      props: {
        dataSources: {
          doc: ['{"type": 0, "node_id": 1}', '{"type": 0, "node_id": 2}']
        },
        initOptions: {
          ...defaultInitOptions,
          structure: {
            nodeId: 'node_id',
            objectType: 'type',
            edgeSource: 'source',
            edgeTarget: 'target'
          }
        },
        showViewSettings: true
      },
      global: {
        provide: {
          tabLayout
        }
      }
    })

    sinon.spy(wrapper.vm.renderer, 'scheduleRender')

    tabLayout.value = { dataView: 'above' }
    await nextTick()
    expect(wrapper.vm.renderer.scheduleRender.calledOnce).to.equal(true)

    tabLayout.value = { dataView: 'hidden' }
    await nextTick()
    expect(wrapper.vm.renderer.scheduleRender.calledOnce).to.equal(true)
    wrapper.unmount()
  })

  it('FA2: stops running and auto run when data changes', async () => {
    const stopSpy = sinon.spy(FA2Layout.prototype, 'stop')
    const startSpy = sinon.spy(FA2Layout.prototype, 'start')
    const wrapper = mount(GraphEditor, {
      attachTo: document.body,
      props: {
        dataSources: {
          doc: [
            '{"type": 0, "node_id": 1}',
            '{"type": 0, "node_id": 2}',
            '{"type": 1, "source": 1, "target": 2}'
          ]
        },
        initOptions: {
          ...defaultInitOptions,
          structure: {
            nodeId: 'node_id',
            objectType: 'type',
            edgeSource: 'source',
            edgeTarget: 'target'
          },
          layout: {
            type: 'forceAtlas2',
            options: {
              initialIterationsAmount: 50,
              gravity: 1.5,
              scalingRatio: 1.2,
              adjustSizes: true,
              barnesHutOptimize: true,
              barnesHutTheta: 0.5,
              strongGravityMode: false,
              linLogMode: true,
              outboundAttractionDistribution: false,
              slowDown: 1,
              edgeWeightInfluence: 0
            }
          }
        },
        showViewSettings: true
      },
      global: {
        provide: {
          tabLayout: { dataView: 'above' }
        }
      }
    })

    const styleMenuItem = wrapper.findAll('.sidebar__group__title')[1]
    await styleMenuItem.trigger('click')

    const layoutMenuItem = wrapper.findAll('.sidebar__item')[4]
    await layoutMenuItem.trigger('click')

    expect(startSpy.calledOnce).to.equal(true)
    await waitCondition(() => stopSpy.callCount === 1)

    // Click Start
    const toggleButton = wrapper.find('button.test_fa2_toggle')
    await toggleButton.trigger('click')
    expect(startSpy.callCount).to.equal(2)

    await time.sleep(10)

    await wrapper.setProps({
      dataSources: {
        doc: [
          '{"type": 0, "node_id": 1}',
          '{"type": 0, "node_id": 2}',
          '{"type": 0, "node_id": 3}',
          '{"type": 1, "source": 1, "target": 2}',
          '{"type": 1, "source": 1, "target": 3}'
        ]
      }
    })
    expect(stopSpy.calledTwice).to.equal(true)
    expect(startSpy.callCount).to.equal(3)
    await waitCondition(() => stopSpy.callCount === 3)

    wrapper.unmount()
  })

  it('FA2: replaces recommended slowdown with 1 if it is Infinity', async () => {
    const stopSpy = sinon.spy(FA2Layout.prototype, 'stop')
    const startSpy = sinon.spy(FA2Layout.prototype, 'start')

    sinon.stub(forceAtlas2.default, 'inferSettings').returns({
      initialIterationsAmount: 1,
      adjustSizes: false,
      barnesHutOptimize: false,
      barnesHutTheta: 0.9,
      edgeWeightInfluence: 0,
      gravity: 0.5,
      linLogMode: true,
      outboundAttractionDistribution: false,
      scalingRatio: 1.5,
      slowDown: -Infinity,
      strongGravityMode: false
    })
    const wrapper = mount(GraphEditor, {
      attachTo: document.body,
      props: {
        dataSources: {
          doc: [
            '{"type": 0, "node_id": 1, "size": 20}',
            '{"type": 0, "node_id": 2, "size": 2}',
            '{"type": 0, "node_id": 3, "size": 2}',
            '{"type": 0, "node_id": 4, "size": 2}'
          ]
        },
        initOptions: {
          ...defaultInitOptions,
          structure: {
            nodeId: 'node_id',
            objectType: 'type',
            edgeSource: 'source',
            edgeTarget: 'target'
          }
        },
        showViewSettings: true
      },
      global: {
        provide: {
          tabLayout: { dataView: 'above' }
        }
      }
    })

    const graph = wrapper.vm.graph
    const initialCoordinates = graph
      .export()
      .nodes.map(node => `x:${node.attributes.x},y:${node.attributes.y}`)
      .join()

    const styleMenuItem = wrapper.findAll('.sidebar__group__title')[1]
    await styleMenuItem.trigger('click')

    const layoutMenuItem = wrapper.findAll('.sidebar__item')[4]
    await layoutMenuItem.trigger('click')

    // Set FA2 pack layout
    await wrapper
      .find(
        '.test_layout_algorithm_select .dropdown-container .Select__indicator'
      )
      .wrapperElement.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      )

    await wrapper.findAll('.Select__menu .Select__option')[3].trigger('click')

    expect(startSpy.calledOnce).to.equal(true)
    await waitCondition(() => stopSpy.callCount === 1)
    expect(wrapper.text()).to.contain('Start')

    const coordinates = graph
      .export()
      .nodes.map(node => `x:${node.attributes.x},y:${node.attributes.y}`)
      .join()

    expect(coordinates).not.to.equal(initialCoordinates)

    wrapper.unmount()
  })
})
