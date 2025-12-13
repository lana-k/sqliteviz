import { expect } from 'chai'
import { mount } from '@vue/test-utils'
import GraphEditor from '@/components/Graph/GraphEditor.vue'
import { nextTick } from 'vue'

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

describe('GraphEditor', () => {
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
            '{"type": 0, "node_id": 3, "color": "#123456", "points": 10}',
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
      .vm.$emit('colorChange', '#ff00ff')

    expect(graph.export().nodes[0].attributes.color).to.equal('#ff00ff')
    expect(graph.export().nodes[1].attributes.color).to.equal('#ff00ff')
    expect(graph.export().nodes[2].attributes.color).to.equal('#ff00ff')

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

    expect(graph.export().nodes[0].attributes.color).to.equal('#fafa6e')
    expect(graph.export().nodes[1].attributes.color).to.equal('#bdea75')
    expect(graph.export().nodes[2].attributes.color).to.equal('#86d780')

    // Select Direct mapping
    await wrapper
      .find('.test_node_color_mapping_mode .radio-block__option')
      .trigger('click')

    expect(graph.export().nodes[0].attributes.color).to.equal('#ff0000')
    expect(graph.export().nodes[1].attributes.color).to.equal('#abcdff')
    expect(graph.export().nodes[2].attributes.color).to.equal('#123456')

    // Switch to Calculated
    const calculated = wrapper.findAll(
      '.test_node_color .radio-block__option'
    )[2]
    await calculated.trigger('click')
    expect(graph.export().nodes[0].attributes.color).to.equal('#fafa6e')
    expect(graph.export().nodes[1].attributes.color).to.equal('#2a4858')
    expect(graph.export().nodes[2].attributes.color).to.equal('#2a4858')
    await nextTick()

    // Choose in-degree
    await wrapper
      .find('.test_node_color_value .dropdown-container .Select__indicator')
      .wrapperElement.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      )

    await wrapper.findAll('.Select__menu .Select__option')[1].trigger('click')

    expect(graph.export().nodes[0].attributes.color).to.equal('#fafa6e')
    expect(graph.export().nodes[1].attributes.color).to.equal('#fafa6e')
    expect(graph.export().nodes[2].attributes.color).to.equal('#2a4858')
    await nextTick()

    // Set Color as to Categorical
    await wrapper
      .findAll('.test_node_color_as .radio-block__option')[1]
      .trigger('click')
    expect(graph.export().nodes[0].attributes.color).to.equal('#fafa6e')
    expect(graph.export().nodes[1].attributes.color).to.equal('#fafa6e')
    expect(graph.export().nodes[2].attributes.color).to.equal('#bdea75')
    await nextTick()

    // Change colorscale direction
    await wrapper
      .findAll('.test_node_color_colorscale_direction .radio-block__option')[1]
      .trigger('click')
    expect(graph.export().nodes[0].attributes.color).to.equal('#2a4858')
    expect(graph.export().nodes[1].attributes.color).to.equal('#2a4858')
    expect(graph.export().nodes[2].attributes.color).to.equal('#1f5f70')
    await nextTick()

    // Switch to Variable
    await variable.trigger('click')

    // The latest settings from variable mode are applied
    expect(graph.export().nodes[0].attributes.color).to.equal('#ff0000')
    expect(graph.export().nodes[1].attributes.color).to.equal('#abcdff')
    expect(graph.export().nodes[2].attributes.color).to.equal('#123456')

    // Switch to Constant
    const constant = wrapper.findAll('.test_node_color .radio-block__option')[0]
    await constant.trigger('click')

    // The latest settings from constant mode are applied
    expect(graph.export().nodes[0].attributes.color).to.equal('#ff00ff')
    expect(graph.export().nodes[1].attributes.color).to.equal('#ff00ff')
    expect(graph.export().nodes[2].attributes.color).to.equal('#ff00ff')

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

    expect(graph.export().edges[0].attributes.color).to.equal('#fafa6e')
    expect(graph.export().edges[1].attributes.color).to.equal('#bdea75')
    expect(graph.export().edges[2].attributes.color).to.equal('#86d780')

    // Set Color as to Continious
    await wrapper
      .findAll('.test_edge_color_as .radio-block__option')[0]
      .trigger('click')
    expect(graph.export().edges[0].attributes.color).to.equal('#fafa6e')
    expect(graph.export().edges[1].attributes.color).to.equal('#39b48d')
    expect(graph.export().edges[2].attributes.color).to.equal('#2a4858')
    await nextTick()

    // Change colorscale direction
    await wrapper
      .findAll('.test_edge_color_colorscale_direction .radio-block__option')[1]
      .trigger('click')
    expect(graph.export().edges[0].attributes.color).to.equal('#2a4858')
    expect(graph.export().edges[1].attributes.color).to.equal('#139f8e')
    expect(graph.export().edges[2].attributes.color).to.equal('#fafa6e')
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

    expect(graph.export().edges[0].attributes.color).to.equal('#ff0000')
    expect(graph.export().edges[1].attributes.color).to.equal('#abcdff')
    expect(graph.export().edges[2].attributes.color).to.equal('#123456')

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

    const circlePackCoordinatesWithHierarchy = graph
      .export()
      .nodes.map(node => `x:${node.attributes.x},y:${node.attributes.y}`)
      .join()

    expect(circlePackCoordinatesWithHierarchy).to.not.equal(
      circlePackCoordinatesNoHierarchy
    )

    wrapper.unmount()
  })
})
