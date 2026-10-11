import { expect } from 'chai'
import { mount } from '@vue/test-utils'
import Graph from 'graphology'
import GraphSearchPanel from '@/components/Graph/GraphSearchPanel.vue'
import sinon from 'sinon'
import { nextTick } from 'vue'

describe('GraphSearchPanel.vue', () => {
  const buildGraph = () => {
    const graph = new Graph()
    graph.addNode('node-1', { label: 'Alpha' })
    graph.addNode('node-2', { label: 'Beta' })
    graph.addNode('node-3', { label: 'Gamma' })
    graph.addNode('node-4', { label: 'Foo' })
    return graph
  }

  it('matches labels and emits node ids for navigation', async () => {
    const clock = sinon.useFakeTimers()
    const wrapper = mount(GraphSearchPanel, {
      props: {
        graph: buildGraph(),
        nodesMatchingSearchQuery: null,
        focusedFoundNodeId: null,
        'onUpdate:nodesMatchingSearchQuery': nodes => {
          wrapper.setProps({ nodesMatchingSearchQuery: nodes })
        },
        'onUpdate:focusedFoundNodeId': nodeId => {
          wrapper.setProps({ focusedFoundNodeId: nodeId })
        }
      }
    })

    await wrapper.find('.query-input input').setValue('a')
    clock.tick(500)

    expect(wrapper.emitted('update:nodesMatchingSearchQuery')[0][0]).to.eql([
      'node-1',
      'node-2',
      'node-3'
    ])
    expect(wrapper.emitted('update:focusedFoundNodeId')[0][0]).to.equal(null)
    await nextTick()
    expect(wrapper.text()).to.contain('3 nodes found')

    await wrapper.find('[data-test="next-match-btn"]').trigger('click')
    expect(wrapper.emitted('update:focusedFoundNodeId')[1][0]).to.equal(
      'node-1'
    )
    await nextTick()
    expect(wrapper.text()).to.contain('1 of 3')

    await wrapper.find('[data-test="next-match-btn"]').trigger('click')
    expect(wrapper.emitted('update:focusedFoundNodeId')[2][0]).to.equal(
      'node-2'
    )
    await nextTick()
    expect(wrapper.text()).to.contain('2 of 3')

    await wrapper.find('[data-test="previous-match-btn"]').trigger('click')
    expect(wrapper.emitted('update:focusedFoundNodeId')[3][0]).to.equal(
      'node-1'
    )

    await nextTick()
    expect(wrapper.text()).to.contain('1 of 3')

    await wrapper.find('[data-test="previous-match-btn"]').trigger('click')
    expect(wrapper.emitted('update:focusedFoundNodeId')[4][0]).to.equal(
      'node-3'
    )

    await nextTick()
    expect(wrapper.text()).to.contain('3 of 3')

    await wrapper.find('[data-test="next-match-btn"]').trigger('click')
    expect(wrapper.emitted('update:focusedFoundNodeId')[5][0]).to.equal(
      'node-1'
    )
    await nextTick()
    expect(wrapper.text()).to.contain('1 of 3')

    await wrapper.find('.query-input input').setValue('Foo')
    clock.tick(500)
    expect(wrapper.emitted('update:nodesMatchingSearchQuery')[1][0]).to.eql([
      'node-4'
    ])
    expect(wrapper.emitted('update:focusedFoundNodeId')[6][0]).to.equal(null)

    await wrapper.find('.query-input input').setValue('')
    clock.tick(500)
    expect(wrapper.emitted('update:nodesMatchingSearchQuery')[2][0]).to.eql(
      null
    )
    expect(wrapper.emitted('update:focusedFoundNodeId')[7][0]).to.equal(null)
    clock.restore()
  })

  it('matches case and uses reg exp', async () => {
    const clock = sinon.useFakeTimers()
    const wrapper = mount(GraphSearchPanel, {
      props: {
        graph: buildGraph(),
        nodesMatchingSearchQuery: null,
        focusedFoundNodeId: null,
        'onUpdate:nodesMatchingSearchQuery': nodes => {
          wrapper.setProps({ nodesMatchingSearchQuery: nodes })
        },
        'onUpdate:focusedFoundNodeId': nodeId => {
          wrapper.setProps({ focusedFoundNodeId: nodeId })
        }
      }
    })

    await wrapper.find('.query-input input').setValue('A')
    clock.tick(500)

    expect(wrapper.emitted('update:nodesMatchingSearchQuery')[0][0]).to.eql([
      'node-1',
      'node-2',
      'node-3'
    ])

    const matchCaseBtn = wrapper.find('[data-test="match-case-btn"]')
    const useRegExpBtn = wrapper.find('[data-test="use-reg-exp-btn"]')

    await matchCaseBtn.trigger('click')
    expect(wrapper.emitted('update:nodesMatchingSearchQuery')[1][0]).to.eql([
      'node-1'
    ])

    await wrapper.find('.query-input input').setValue('a.+a$')
    clock.tick(500)
    expect(wrapper.emitted('update:nodesMatchingSearchQuery')[2][0]).to.eql([])

    await useRegExpBtn.trigger('click')
    expect(wrapper.emitted('update:nodesMatchingSearchQuery')[3][0]).to.eql([
      'node-3'
    ])

    await matchCaseBtn.trigger('click')
    expect(wrapper.emitted('update:nodesMatchingSearchQuery')[4][0]).to.eql([
      'node-1',
      'node-3'
    ])

    clock.restore()
  })

  it('shows No items found and disables navigation arrows', async () => {
    const clock = sinon.useFakeTimers()
    const wrapper = mount(GraphSearchPanel, {
      props: {
        graph: buildGraph(),
        nodesMatchingSearchQuery: null,
        focusedFoundNodeId: null,
        'onUpdate:nodesMatchingSearchQuery': nodes => {
          wrapper.setProps({ nodesMatchingSearchQuery: nodes })
        },
        'onUpdate:focusedFoundNodeId': nodeId => {
          wrapper.setProps({ focusedFoundNodeId: nodeId })
        }
      }
    })

    await wrapper.find('.query-input input').setValue('baz')
    clock.tick(500)

    expect(wrapper.emitted('update:nodesMatchingSearchQuery')[0][0]).to.eql([])
    expect(wrapper.emitted('update:focusedFoundNodeId')[0][0]).to.equal(null)
    await nextTick()
    expect(wrapper.find('[data-test="no-results-text"]').isVisible()).to.be.true

    await expect(
      wrapper.find('[data-test="next-match-btn"]').attributes('disabled')
    ).to.not.equal(undefined)
    await expect(
      wrapper.find('[data-test="previous-match-btn"]').attributes('disabled')
    ).to.not.equal(undefined)
    clock.restore()
  })

  it('handles invalid regular expressions by clearing matches', async () => {
    const clock = sinon.useFakeTimers()
    const wrapper = mount(GraphSearchPanel, {
      props: {
        graph: buildGraph(),
        nodesMatchingSearchQuery: ['node-1'],
        focusedFoundNodeId: 'node-1'
      }
    })

    await wrapper.find('.query-input input').setValue('[')
    clock.tick(500)

    expect(wrapper.emitted('update:nodesMatchingSearchQuery')[0][0]).to.eql([])
    const useRegExpBtn = wrapper.find('[data-test="use-reg-exp-btn"]')

    await useRegExpBtn.trigger('click')

    expect(
      wrapper.emitted('update:nodesMatchingSearchQuery').at(-1)[0]
    ).to.equal(null)
    expect(wrapper.emitted('update:focusedFoundNodeId').at(-1)[0]).to.equal(
      null
    )
    expect(wrapper.text()).to.contain('Invalid regular expression')

    clock.restore()
  })

  it('toggles the search panel visibility', async () => {
    const wrapper = mount(GraphSearchPanel, {
      props: {
        graph: buildGraph(),
        nodesMatchingSearchQuery: null,
        focusedFoundNodeId: null
      },
      attachTo: document.body
    })

    const searchControls = wrapper.find('.graph-search-panel--search-controls')
    expect(searchControls.isVisible()).to.be.false

    const toggleButton = wrapper.find(
      '[data-test="toggle-search-panel-visibility-btn"]'
    )
    await toggleButton.trigger('click')
    expect(searchControls.isVisible()).to.be.true

    await toggleButton.trigger('click')
    expect(wrapper.vm.panelOpen).to.be.false

    wrapper.unmount()
  })
})
