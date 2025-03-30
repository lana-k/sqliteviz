import { expect } from 'chai'
import sinon from 'sinon'
import { shallowMount, mount } from '@vue/test-utils'
import mutations from '@/store/mutations'
import { createStore } from 'vuex'
import Tabs from '@/views/MainView/Workspace/Tabs'
import eventBus from '@/lib/eventBus'

describe('Tabs.vue', () => {
  let clock

  beforeEach(() => {
    clock = sinon.useFakeTimers()
    sinon.spy(eventBus, '$emit')
  })

  afterEach(() => {
    sinon.restore()
  })

  it('Renders start guide when there is no opened tabs', () => {
    // mock store state
    const state = {
      tabs: []
    }
    const store = createStore({ state })

    // mount the component
    const wrapper = shallowMount(Tabs, {
      global: {
        stubs: ['router-link'],
        plugins: [store]
      }
    })

    // check start-guide visibility
    expect(wrapper.find('#start-guide').isVisible()).to.equal(true)
    wrapper.unmount()
  })

  it('Renders tabs', () => {
    // mock store state
    const state = {
      tabs: [
        {
          id: 1,
          name: 'foo',
          query: 'select * from foo',
          chart: [],
          isSaved: true
        },
        {
          id: 2,
          name: null,
          tempName: 'Untitled',
          query: '',
          chart: [],
          isSaved: false
        }
      ],
      currentTabId: 2
    }
    const store = createStore({ state })

    // mount the component
    const wrapper = shallowMount(Tabs, {
      attachTo: document.body,
      global: {
        stubs: ['router-link'],
        plugins: [store]
      }
    })

    // check start-guide visibility
    expect(wrapper.find('#start-guide').isVisible()).to.equal(false)

    // check tabs
    expect(wrapper.findAllComponents({ name: 'Tab' })).to.have.lengthOf(2)

    const firstTab = wrapper.findAll('.tab')[0]
    expect(firstTab.text()).to.include('foo')
    expect(firstTab.find('.star').isVisible()).to.equal(false)
    expect(firstTab.classes()).to.not.include('tab-selected')

    const secondTab = wrapper.findAll('.tab')[1]
    expect(secondTab.text()).to.include('Untitled')
    expect(secondTab.find('.star').isVisible()).to.equal(true)
    expect(secondTab.classes()).to.include('tab-selected')
    wrapper.unmount()
  })

  it('Selects the tab on click', async () => {
    // mock store state
    const state = {
      tabs: [
        {
          id: 1,
          name: 'foo',
          query: 'select * from foo',
          chart: [],
          isSaved: true
        },
        {
          id: 2,
          name: null,
          tempName: 'Untitled',
          query: '',
          chart: [],
          isSaved: false
        }
      ],
      currentTabId: 2
    }

    const store = createStore({ state, mutations })

    // mount the component
    const wrapper = shallowMount(Tabs, {
      global: {
        stubs: ['router-link'],
        plugins: [store]
      }
    })

    // click on the first tab
    const firstTab = wrapper.findAll('.tab')[0]
    await firstTab.trigger('click')

    // check that first tab is the current now
    expect(firstTab.classes()).to.include('tab-selected')
    const secondTab = wrapper.findAll('.tab')[1]
    expect(secondTab.classes()).to.not.include('tab-selected')
    expect(state.currentTabId).to.equal(1)
    wrapper.unmount()
  })

  it("Deletes the tab on close if it's saved", async () => {
    // mock store state
    const state = {
      tabs: [
        {
          id: 1,
          name: 'foo',
          query: 'select * from foo',
          viewType: 'chart',
          viewOptions: {},
          layout: {
            sqlEditor: 'above',
            table: 'bottom',
            dataView: 'hidden'
          },
          isSaved: true
        },
        {
          id: 2,
          name: null,
          tempName: 'Untitled',
          query: '',
          viewType: 'chart',
          viewOptions: {},
          layout: {
            sqlEditor: 'above',
            table: 'bottom',
            dataView: 'hidden'
          },
          isSaved: false
        }
      ],
      currentTabId: 2
    }

    const store = createStore({ state, mutations })

    // mount the component
    const wrapper = mount(Tabs, {
      global: {
        stubs: ['router-link'],
        plugins: [store]
      }
    })

    // click on the close icon of the first tab
    const firstTabCloseIcon = wrapper.findAll('.tab')[0].find('.close-icon')
    await firstTabCloseIcon.trigger('click')

    // check that the only one tab left and it's opened
    expect(wrapper.findAllComponents({ name: 'Tab' })).to.have.lengthOf(1)

    const firstTab = wrapper.findAll('.tab')[0]
    expect(firstTab.text()).to.include('Untitled')
    expect(firstTab.find('.star').isVisible()).to.equal(true)
    expect(firstTab.classes()).to.include('tab-selected')
    wrapper.unmount()
  })

  it("Doesn't delete tab on close if user cancel closing", async () => {
    // mock store state
    const state = {
      tabs: [
        {
          id: 1,
          name: 'foo',
          query: 'select * from foo',
          viewType: 'chart',
          viewOptions: {},
          layout: {
            sqlEditor: 'above',
            table: 'bottom',
            dataView: 'hidden'
          },
          isSaved: true
        },
        {
          id: 2,
          name: null,
          tempName: 'Untitled',
          query: '',
          viewType: 'chart',
          viewOptions: {},
          layout: {
            sqlEditor: 'above',
            table: 'bottom',
            dataView: 'hidden'
          },
          isSaved: false
        }
      ],
      currentTabId: 2
    }

    const store = createStore({ state, mutations })

    // mount the component
    const wrapper = mount(Tabs, {
      attachTo: document.body,
      global: {
        stubs: {
          'router-link': true,
          teleport: true,
          transition: false
        },
        plugins: [store]
      }
    })

    // click on the close icon of the second tab
    const secondTabCloseIcon = wrapper.findAll('.tab')[1].find('.close-icon')
    await secondTabCloseIcon.trigger('click')

    // check that Close Tab dialog is visible
    const modal = wrapper.find('.dialog.vfm')
    expect(modal.exists()).to.equal(true)
    expect(modal.find('.dialog-header').text()).to.contain('Close tab')

    // find Cancel in the dialog
    const cancelBtn = wrapper
      .findAll('.dialog-buttons-container button')
      .find(button => button.text() === "Don't close")

    // click Cancel in the dialog
    await cancelBtn.trigger('click')

    // check that tab is still opened
    expect(wrapper.findAllComponents({ name: 'Tab' })).to.have.lengthOf(2)

    // check that the dialog is closed
    await clock.tick(100)
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(false)
    wrapper.unmount()
  })

  it('Closes without saving', async () => {
    // mock store state
    const state = {
      tabs: [
        {
          id: 1,
          name: 'foo',
          query: 'select * from foo',
          viewType: 'chart',
          viewOptions: {},
          layout: {
            sqlEditor: 'above',
            table: 'bottom',
            dataView: 'hidden'
          },
          isSaved: true
        },
        {
          id: 2,
          name: null,
          tempName: 'Untitled',
          query: '',
          viewType: 'chart',
          viewOptions: {},
          layout: {
            sqlEditor: 'above',
            table: 'bottom',
            dataView: 'hidden'
          },
          isSaved: false
        }
      ],
      currentTabId: 2
    }

    const store = createStore({ state, mutations })

    // mount the component
    const wrapper = mount(Tabs, {
      attachTo: document.body,
      global: {
        stubs: {
          'router-link': true,
          teleport: true,
          transition: false
        },
        plugins: [store]
      }
    })

    // click on the close icon of the second tab
    const secondTabCloseIcon = wrapper.findAll('.tab')[1].find('.close-icon')
    await secondTabCloseIcon.trigger('click')

    // find 'Close without saving' in the dialog
    const closeBtn = wrapper
      .findAll('.dialog-buttons-container button')
      .find(button => button.text() === 'Close without saving')

    // click 'Close without saving' in the dialog
    await closeBtn.trigger('click')

    // check that tab is closed
    expect(wrapper.findAllComponents({ name: 'Tab' })).to.have.lengthOf(1)
    const firstTab = wrapper.findAll('.tab')[0]
    expect(firstTab.text()).to.include('foo')
    expect(firstTab.find('.star').isVisible()).to.equal(false)
    expect(firstTab.classes()).to.include('tab-selected')

    // check that 'saveInquiry' event was not emited
    expect(eventBus.$emit.calledWith('saveInquiry')).to.equal(false)

    // check that the dialog is closed
    await clock.tick(100)
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(false)
    wrapper.unmount()
  })

  it('Closes with saving', async () => {
    // mock store state
    const state = {
      tabs: [
        {
          id: 1,
          name: 'foo',
          query: 'select * from foo',
          viewType: 'chart',
          viewOptions: {},
          layout: {
            sqlEditor: 'above',
            table: 'bottom',
            dataView: 'hidden'
          },
          isSaved: true
        },
        {
          id: 2,
          name: null,
          tempName: 'Untitled',
          query: '',
          viewType: 'chart',
          viewOptions: {},
          layout: {
            sqlEditor: 'above',
            table: 'bottom',
            dataView: 'hidden'
          },
          isSaved: false
        }
      ],
      currentTabId: 2
    }

    const store = createStore({ state, mutations })

    // mount the component
    const wrapper = mount(Tabs, {
      attachTo: document.body,
      global: {
        stubs: {
          'router-link': true,
          teleport: true,
          transition: false
        },
        plugins: [store]
      }
    })

    // click on the close icon of the second tab
    const secondTabCloseIcon = wrapper.findAll('.tab')[1].find('.close-icon')
    await secondTabCloseIcon.trigger('click')

    // find 'Save and close' in the dialog
    const closeBtn = wrapper
      .findAll('.dialog-buttons-container button')
      .find(button => button.text() === 'Save and close')

    // click 'Save and close' in the dialog
    await closeBtn.trigger('click')

    // pretend like saving is completed - trigger 'inquirySaved' on eventBus
    await eventBus.$emit('inquirySaved')

    // check that tab is closed
    expect(wrapper.findAllComponents({ name: 'Tab' })).to.have.lengthOf(1)
    const firstTab = wrapper.findAll('.tab')[0]
    expect(firstTab.text()).to.include('foo')
    expect(firstTab.find('.star').isVisible()).to.equal(false)
    expect(firstTab.classes()).to.include('tab-selected')

    // check that 'saveInquiry' event was emited
    expect(eventBus.$emit.calledWith('saveInquiry')).to.equal(true)

    // check that the dialog is closed
    await clock.tick(100)
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(false)
    wrapper.unmount()
  })

  it('Prevents closing a tab of a browser if there is unsaved inquiry', () => {
    // mock store state
    const state = {
      tabs: [
        {
          id: 1,
          name: 'foo',
          query: 'select * from foo',
          chart: [],
          isSaved: true
        },
        {
          id: 2,
          name: null,
          tempName: 'Untitled',
          query: '',
          chart: [],
          isSaved: false
        }
      ],
      currentTabId: 2
    }

    const store = createStore({ state, mutations })

    // mount the component
    const wrapper = shallowMount(Tabs, {
      global: {
        stubs: ['router-link'],
        plugins: [store]
      }
    })

    const event = new Event('beforeunload')
    sinon.spy(event, 'preventDefault')
    wrapper.vm.leavingSqliteviz(event)

    expect(event.preventDefault.calledOnce).to.equal(true)
    wrapper.unmount()
  })

  it("Doesn't prevent closing a tab of a browser if there is unsaved inquiry", () => {
    // mock store state
    const state = {
      tabs: [
        {
          id: 1,
          name: 'foo',
          query: 'select * from foo',
          chart: [],
          isSaved: true
        }
      ],
      currentTabId: 1
    }

    const store = createStore({ state, mutations })

    // mount the component
    const wrapper = shallowMount(Tabs, {
      global: {
        stubs: ['router-link'],
        plugins: [store]
      }
    })

    const event = new Event('beforeunload')
    sinon.spy(event, 'preventDefault')
    wrapper.vm.leavingSqliteviz(event)

    expect(event.preventDefault.calledOnce).to.equal(false)
    wrapper.unmount()
  })
})
