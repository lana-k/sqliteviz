import { expect } from 'chai'
import sinon from 'sinon'
import { mount, shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'
import Inquiries from '@/views/Main/Inquiries'
import storedInquiries from '@/lib/storedInquiries'
import mutations from '@/store/mutations'
import actions from '@/store/actions'
import fu from '@/lib/utils/fileIo'
import { nextTick } from 'vue'


describe('Inquiries.vue', () => {
  let clock

  beforeEach(() => {
    clock = sinon.useFakeTimers()
  })

  afterEach(() => {
    sinon.restore()
  })

  it('Shows start-guide message if there are no saved and predefined inquiries', () => {
    sinon.stub(storedInquiries, 'readPredefinedInquiries').resolves([])
    const state = {
      predefinedInquiries: [],
      inquiries: []
    }
    const mutations = {
      setPredefinedInquiriesLoaded: sinon.stub(),
      updatePredefinedInquiries: sinon.stub(),
      setLoadingPredefinedInquiries: sinon.stub()
    }
    const store = createStore({ state, mutations, actions })
    const wrapper = shallowMount(Inquiries, {
      global: {
        plugins: [store]
      }
    })

    expect(wrapper.find('#start-guide').exists()).to.equal(true)
    wrapper.unmount()
  })

  it('Renders the list of saved and predefined inquiries', async () => {
    sinon.stub(storedInquiries, 'readPredefinedInquiries').resolves([
      {
        id: 0,
        name: 'hello_world',
        query: '',
        viewType: 'chart',
        viewOptions: [],
        createdAt: '2020-03-08T19:57:56.299Z'
      }
    ])

    const state = {
      predefinedInquiries: [],
      inquiries: [
        {
          id: 1,
          name: 'foo',
          query: '',
          viewType: 'chart',
          viewOptions: [],
          createdAt: '2020-11-03T19:57:56.299Z'
        },
        {
          id: 2,
          name: 'bar',
          query: '',
          viewType: 'chart',
          viewOptions: [],
          createdAt: '2020-12-04T18:53:56.299Z'
        }
      ]
    }

    const store = createStore({ state, mutations, actions })
    const wrapper = shallowMount(Inquiries, {
      attachTo: document.body,
      global: { plugins: [store] } 
    })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await nextTick()

    expect(wrapper.find('#start-guide').exists()).to.equal(false)
    expect(wrapper.find('#toolbar-btns-import').isVisible()).to.equal(true)
    expect(wrapper.find('#toolbar-btns-export').isVisible()).to.equal(false)
    expect(wrapper.find('#toolbar-btns-delete').isVisible()).to.equal(false)

    const rows = wrapper.findAll('tbody tr')
    expect(rows).to.have.lengthOf(3)
    expect(rows[0].findAll('td')[0].text()).to.contains('hello_world')
    expect(rows[0].findAll('td')[1].text()).to.equals('8 March 2020 20:57')
    expect(rows[1].findAll('td')[0].text()).to.equals('foo')
    expect(rows[1].findAll('td')[1].text()).to.equals('3 November 2020 20:57')
    expect(rows[2].findAll('td')[0].text()).to.equals('bar')
    expect(rows[2].findAll('td')[1].text()).to.equals('4 December 2020 19:53')
    wrapper.unmount()
  })

  it('Filters the list of inquiries', async () => {
    sinon.stub(storedInquiries, 'readPredefinedInquiries').resolves([
      {
        id: 0,
        name: 'hello_world',
        query: '',
        viewType: 'chart',
        viewOptions: [],
        createdAt: '2020-03-08T19:57:56.299Z'
      }
    ])

    const state = {
      predefinedInquiries: [],
      inquiries: [
        {
          id: 1,
          name: 'foo',
          query: '',
          viewType: 'chart',
          viewOptions: [],
          createdAt: '2020-11-03T19:57:56.299Z'
        },
        {
          id: 2,
          name: 'bar',
          query: '',
          viewType: 'chart',
          viewOptions: [],
          createdAt: '2020-12-04T18:53:56.299Z'
        }
      ]
    }

    const store = createStore({ state, mutations, actions })
    const wrapper = mount(Inquiries, {
      global: {
        plugins: [store]
      }
    })
    await wrapper.find('#toolbar-search input').setValue('OO')
    await nextTick()

    const rows = wrapper.findAll('tbody tr')
    expect(rows).to.have.lengthOf(1)
    expect(rows[0].findAll('td')[0].text()).to.equals('foo')
    expect(rows[0].findAll('td')[1].text()).to.contains('3 November 2020 20:57')
    wrapper.unmount()
  })

  it('Shows No found message when filter returns nothing', async () => {
    sinon.stub(storedInquiries, 'readPredefinedInquiries').resolves([
      {
        id: 0,
        name: 'hello_world',
        query: '',
        viewType: 'chart',
        viewOptions: [],
        createdAt: '2020-03-08T19:57:56.299Z'
      }
    ])

    const state = {
      predefinedInquiries: [],
      inquiries: [
        {
          id: 1,
          name: 'foo',
          query: '',
          viewType: 'chart',
          viewOptions: [],
          createdAt: '2020-11-03T19:57:56.299Z'
        },
        {
          id: 2,
          name: 'bar',
          query: '',
          viewType: 'chart',
          viewOptions: [],
          createdAt: '2020-12-04T18:53:56.299Z'
        }
      ]
    }

    const store = createStore({ state, mutations, actions })
    const wrapper = mount(Inquiries, {
      attachTo: document.body, 
      global: { plugins: [store] } 
    })
    await wrapper.find('#toolbar-search input').setValue('baz')
    await nextTick()

    expect(wrapper.find('#inquiries-not-found').text()).to.equal('No inquiries found')
    expect(wrapper.find('#start-guide').exists()).to.equal(false)
    expect(wrapper.find('tbody').isVisible()).to.equal(false)
    wrapper.unmount()
  })

  it('Predefined inquiry has a badge', async () => {
    sinon.stub(storedInquiries, 'readPredefinedInquiries').resolves([
      {
        id: 0,
        name: 'hello_world',
        query: '',
        viewType: 'chart',
        viewOptions: [],
        createdAt: '2020-03-08T19:57:56.299Z'
      }
    ])

    const state = {
      predefinedInquiries: [],
      inquiries: [
        {
          id: 1,
          name: 'foo',
          query: '',
          viewType: 'chart',
          viewOptions: [],
          createdAt: '2020-11-03T19:57:56.299Z'
        }
      ]
    }

    const store = createStore({ state, mutations, actions })
    const wrapper = shallowMount(Inquiries, {
      global: {
        plugins: [store]
      }
    })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await nextTick()

    const rows = wrapper.findAll('tbody tr')
    expect(rows[0].find('td .badge').exists()).to.equals(true)
    expect(rows[1].find('td .badge').exists()).to.equals(false)
    wrapper.unmount()
  })

  it('Exports one inquiry', async () => {
    sinon.stub(storedInquiries, 'readPredefinedInquiries').resolves([])
    sinon.stub(storedInquiries, 'serialiseInquiries').returns('I am a serialized inquiry')
    sinon.stub(fu, 'exportToFile')
    const state = {
      predefinedInquiries: [],
      inquiries: [
        {
          id: 1,
          name: 'foo',
          query: '',
          viewType: 'chart',
          viewOptions: [],
          createdAt: '2020-11-03T19:57:56.299Z'
        }
      ]
    }

    const store = createStore({ state, mutations, actions })
    const wrapper = mount(Inquiries, { global: { plugins: [store] } })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await nextTick()
    await wrapper.findComponent({ name: 'ExportIcon' }).find('svg').trigger('click')
    expect(fu.exportToFile.calledOnceWith('I am a serialized inquiry', 'foo.json')).to.equals(true)
    wrapper.unmount()
  })

  it('Duplicates an inquiry', async () => {
    sinon.stub(storedInquiries, 'readPredefinedInquiries').resolves([])
    const inquiryInStorage = {
      id: 1,
      name: 'foo',
      query: '',
      viewType: 'chart',
      viewOptions: [],
      createdAt: '2020-11-03T19:57:56.299Z'
    }
    sinon.stub(storedInquiries, 'updateStorage')
    const newInquiry = {
      id: 2,
      name: 'foo copy',
      query: '',
      viewType: 'chart',
      viewOptions: [],
      createdAt: '2020-12-03T19:57:56.299Z'
    }
    sinon.stub(storedInquiries, 'duplicateInquiry').returns(newInquiry)
    const state = {
      predefinedInquiries: [],
      inquiries: [inquiryInStorage]
    }
    const store = createStore({ state, mutations, actions })

    const wrapper = mount(Inquiries, { global: { plugins: [store] } })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await nextTick()
    await wrapper.findComponent({ name: 'CopyIcon' }).find('svg').trigger('click')

    expect(storedInquiries.duplicateInquiry.calledOnceWith(inquiryInStorage)).to.equals(true)

    const rows = wrapper.findAll('tbody tr')
    expect(rows).to.have.lengthOf(2)
    expect(rows[1].findAll('td')[0].text()).to.equals('foo copy')
    expect(rows[1].findAll('td')[1].text()).to.contains('3 December 2020 20:57')
    expect(state.inquiries).to.eql([inquiryInStorage, newInquiry])
    wrapper.unmount()
  })

  it('The copy of the inquiry is not selected if all inquiries were selected before duplication',
    async () => {
      sinon.stub(storedInquiries, 'readPredefinedInquiries').resolves([])
      const inquiryInStorage = {
        id: 1,
        name: 'foo',
        query: '',
        viewType: 'chart',
        viewOptions: [],
        createdAt: '2020-11-03T19:57:56.299Z'
      }
      const newInquiry = {
        id: 2,
        name: 'foo copy',
        query: '',
        viewType: 'chart',
        viewOptions: [],
        createdAt: '2020-12-03T19:57:56.299Z'
      }
      sinon.stub(storedInquiries, 'duplicateInquiry').returns(newInquiry)
      const state = {
        predefinedInquiries: [],
        inquiries: [inquiryInStorage]
      }
      const store = createStore({ state, mutations, actions })

      const wrapper = mount(Inquiries, { global: { plugins: [store] } })
      await storedInquiries.readPredefinedInquiries.returnValues[0]
      await nextTick()
      await wrapper.findComponent({ ref: 'mainCheckBox' }).find('.checkbox-container')
        .trigger('click')
      await wrapper.findComponent({ name: 'CopyIcon' }).find('svg').trigger('click')

      const checkboxes = wrapper.findAllComponents('[data-test="rowCheckBox"]')
      expect(checkboxes[0].vm.checked).to.equals(true)
      expect(checkboxes[1].vm.checked).to.equals(false)
      wrapper.unmount()
    })

  it('Opens an inquiry', async () => {
    sinon.stub(storedInquiries, 'readPredefinedInquiries').resolves([])
    const inquiryInStorage = {
      id: 1,
      name: 'foo',
      query: '',
      viewType: 'chart',
      viewOptions: [],
      createdAt: '2020-11-03T19:57:56.299Z'
    }

    const state = {
      tabs: [],
      predefinedInquiries: [],
      inquiries: [inquiryInStorage]
    }
    const actions = { addTab: sinon.stub().resolves(1) }
    sinon.spy(mutations, 'setCurrentTabId')
    const $router = { push: sinon.stub() }
    const store = createStore({ state, mutations, actions })

    const wrapper = shallowMount(Inquiries, {
      global: {
        mocks: { $router },
        plugins: [store]
      }
    })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await nextTick()
    await wrapper.find('tbody tr').trigger('click')
    await clock.tick(0)

    expect(actions.addTab.calledOnce).to.equals(true)
    expect(actions.addTab.getCall(0).args[1]).to.eql(inquiryInStorage)
    await actions.addTab.returnValues[0]
    expect(mutations.setCurrentTabId.calledOnceWith(state, 1)).to.equals(true)
    expect($router.push.calledOnceWith('/workspace')).to.equals(true)
    wrapper.unmount()
  })

  it('Rename is not available for predefined inquiries', async () => {
    sinon.stub(storedInquiries, 'readPredefinedInquiries').resolves([
      {
        id: 0,
        name: 'hello_world',
        query: '',
        viewType: 'chart',
        viewOptions: [],
        createdAt: '2020-03-08T19:57:56.299Z'
      }
    ])

    const state = {
      predefinedInquiries: [],
      inquiries: []
    }
    const store = createStore({ state, mutations, actions })

    const wrapper = mount(Inquiries, { global: { plugins: [store] } })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await nextTick()
    expect(wrapper.findComponent({ name: 'RenameIcon' }).exists()).to.equals(false)
    wrapper.unmount()
  })

  it('Renames an inquiry', async () => {
    sinon.stub(storedInquiries, 'readPredefinedInquiries').resolves([])
    sinon.stub(storedInquiries, 'updateStorage')
    const state = {
      tabs: [{ id: 1, name: 'foo' }],
      predefinedInquiries: [],
      inquiries: [
        {
          id: 1,
          name: 'foo',
          query: '',
          viewType: 'chart',
          viewOptions: [],
          createdAt: '2020-11-03T19:57:56.299Z'
        }
      ]
    }
    const store = createStore({ state, mutations, actions })
    const wrapper = mount(Inquiries, {
      attachTo: document.body,
      global: { 
        plugins: [store],
        stubs: { teleport: true, transition: false }
      }
    })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await nextTick()

    // click Rename icon in the grid
    await wrapper.findComponent({ name: 'RenameIcon' }).find('svg').trigger('click')

    // check that rename dialog is open
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(true)
    expect(wrapper.find('.dialog.vfm .dialog-header').text())
      .to.contain('Rename inquiry')

    // check that input is filled by the current inquiry name
    expect(wrapper.find('.dialog-body input').element.value).to.equals('foo')

    // change the name
    await wrapper.find('.dialog-body input').setValue('bar')

    // find Rename in the dialog and click
    await wrapper
      .findAll('.dialog-buttons-container button')
      .find(button => button.text() === 'Rename')
      .trigger('click')
    await nextTick()

    // check that the name in the grid is changed
    expect(wrapper.find('tbody tr td').text()).to.equals('bar')

    // check that storage is updated
    expect(state.inquiries).to.eql([{
      id: 1,
      name: 'bar',
      query: '',
      viewType: 'chart',
      viewOptions: [],
      createdAt: '2020-11-03T19:57:56.299Z'
    }])

    // check that coresponding tab also changed the name
    expect(state.tabs[0].name).to.equals('bar')

    // check that rename dialog is closed
    await clock.tick(100)
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(false)
    wrapper.unmount()
  })

  it('Shows an error if try to rename to empty string', async () => {
    sinon.stub(storedInquiries, 'readPredefinedInquiries').resolves([])
    sinon.stub(storedInquiries, 'updateStorage')
    const state = {
      tabs: [{ id: 1, name: 'foo' }],
      predefinedInquiries: [],
      inquiries: [
        {
          id: 1,
          name: 'foo',
          query: '',
          viewType: 'chart',
          viewOptions: [],
          createdAt: '2020-11-03T19:57:56.299Z'
        }
      ]
    }
    const store = createStore({ state, mutations, actions })

    const wrapper = mount(Inquiries, {
      attachTo: document.body,
      global: {
        plugins: [store],
        stubs: { teleport: true, transition: false }
      }
    })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await nextTick()

    // click Rename icon in the grid
    await wrapper.findComponent({ name: 'RenameIcon' }).find('svg').trigger('click')

    // change the name
    await wrapper.find('.dialog-body input').setValue('')

    // find Rename in the dialog and click
    await wrapper
      .findAll('.dialog-buttons-container button')
      .find(button => button.text() === 'Rename')
      .trigger('click')

    expect(wrapper.find('.dialog-body .text-field-error').text())
      .to.equals("Inquiry name can't be empty")
    // check that rename dialog is still open
    await clock.tick(100)
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(true)
    wrapper.unmount()
  })

  it('Imports inquiries', async () => {
    sinon.stub(storedInquiries, 'readPredefinedInquiries').resolves([])
    const inquiryInStorage = {
      id: 1,
      name: 'foo',
      query: '',
      viewType: 'chart',
      viewOptions: [],
      createdAt: '2020-11-03T19:57:56.299Z'
    }
    sinon.stub(storedInquiries, 'updateStorage')
    const importedInquiry = {
      id: 2,
      name: 'bar',
      query: '',
      viewType: 'chart',
      viewOptions: [],
      createdAt: '2020-12-03T19:57:56.299Z'
    }
    sinon.stub(storedInquiries, 'importInquiries').resolves([importedInquiry])
    const state = {
      predefinedInquiries: [],
      inquiries: [inquiryInStorage]
    }
    const store = createStore({ state, mutations, actions })

    const wrapper = shallowMount(Inquiries, { global: { plugins: [store] } })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await nextTick()

    // click Import
    await wrapper.find('#toolbar-btns-import').trigger('click')

    const rows = wrapper.findAll('tbody tr')
    expect(rows).to.have.lengthOf(2)
    expect(rows[1].findAll('td')[0].text()).to.equals('bar')
    expect(rows[1].findAll('td')[1].text()).to.equals('3 December 2020 20:57')
    expect(state.inquiries).to.eql([inquiryInStorage, importedInquiry])
    wrapper.unmount()
  })

  it('Imported inquiries are not selected if master check box was checked', async () => {
    sinon.stub(storedInquiries, 'readPredefinedInquiries').resolves([])
    const inquiryInStorage = {
      id: 1,
      name: 'foo',
      query: '',
      viewType: 'chart',
      viewOptions: [],
      createdAt: '2020-11-03T19:57:56.299Z'
    }
    sinon.stub(storedInquiries, 'updateStorage')
    const importedInquiry = {
      id: 2,
      name: 'bar',
      query: '',
      viewType: 'chart',
      viewOptions: [],
      createdAt: '2020-12-03T19:57:56.299Z'
    }
    sinon.stub(storedInquiries, 'importInquiries').resolves([importedInquiry])
    const state = {
      predefinedInquiries: [],
      inquiries: [inquiryInStorage]
    }
    const store = createStore({ state, mutations, actions })

    const wrapper = mount(Inquiries, { global: { plugins: [store] } })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await nextTick()

    // click on master checkbox
    await wrapper.findComponent({ ref: 'mainCheckBox' }).find('.checkbox-container')
      .trigger('click')

    // click Import
    await wrapper.find('#toolbar-btns-import').trigger('click')

    const checkboxes = wrapper.findAllComponents('[data-test="rowCheckBox"]')
    expect(wrapper.findComponent({ ref: 'mainCheckBox' }).vm.checked).to.equals(false)
    expect(checkboxes[0].vm.checked).to.equals(true)
    expect(checkboxes[1].vm.checked).to.equals(false)
    wrapper.unmount()
  })
  
  it('Deletion is not available for predefined inquiries', async () => {
    sinon.stub(storedInquiries, 'readPredefinedInquiries').resolves([
      {
        id: 0,
        name: 'hello_world',
        query: '',
        viewType: 'chart',
        viewOptions: [],
        createdAt: '2020-03-08T19:57:56.299Z'
      }
    ])

    const state = {
      predefinedInquiries: [],
      inquiries: []
    }
    const store = createStore({ state, mutations, actions })

    const wrapper = mount(Inquiries, { global: { plugins: [store] } })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await nextTick()
    expect(wrapper.findComponent({ name: 'DeleteIcon' }).exists()).to.equals(false)
    wrapper.unmount()
  })

  it('Delete an inquiry', async () => {
    sinon.stub(storedInquiries, 'readPredefinedInquiries').resolves([])
    const foo = {
      id: 1,
      name: 'foo',
      query: '',
      viewType: 'chart',
      viewOptions: [],
      createdAt: '2020-11-03T19:57:56.299Z'
    }
    const bar = {
      id: 2,
      name: 'bar',
      query: '',
      viewType: 'chart',
      viewOptions: [],
      createdAt: '2020-11-03T19:57:56.299Z'
    }
    sinon.stub(storedInquiries, 'updateStorage')

    const state = {
      tabs: [{ id: 1 }, { id: 2 }],
      predefinedInquiries: [],
      inquiries: [foo, bar]
    }
    const store = createStore({ state, mutations, actions })

    const wrapper = mount(Inquiries, {
      attachTo: document.body,
      global: { 
        plugins: [store],
        stubs: { teleport: true, transition: false }
      }
     })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await nextTick()
    // click Delete icon in the first row of the grid
    await wrapper.findComponent({ name: 'DeleteIcon' }).find('svg').trigger('click')

    // check that delete dialog is open
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(true)
    expect(wrapper.find('.dialog.vfm .dialog-header').text())
    .to.contain('Delete inquiry')

    // check the message in the dialog
    expect(wrapper.find('.dialog-body').text()).to.contains('"foo"?')

    // find Delete in the dialog and click
    await wrapper
      .findAll('.dialog-buttons-container button')
      .find(button => button.text() === 'Delete')
      .trigger('click')

    // check the rows in the grid
    expect(wrapper.findAll('tbody tr')).to.have.lengthOf(1)
    expect(wrapper.findAll('tbody tr')[0].find('td').text()).to.equals('bar')

    // check that deleted inquiry was also deleted from tabs
    expect(state.tabs).to.have.lengthOf(1)
    expect(state.tabs[0].id).to.equals(2)

    // check that storage is updated
    expect(state.inquiries).to.eql([bar])

    // check that delete dialog is closed
    await clock.tick(100)
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(false)
    wrapper.unmount()
  })

  it('Group operations are available when there are checked rows', async () => {
    sinon.stub(storedInquiries, 'readPredefinedInquiries').resolves([
      {
        id: 0,
        name: 'hello_world',
        query: '',
        viewType: 'chart',
        viewOptions: [],
        createdAt: '2020-03-08T19:57:56.299Z'
      }
    ])

    const state = {
      predefinedInquiries: [],
      inquiries: [
        {
          id: 1,
          name: 'foo',
          query: '',
          viewType: 'chart',
          viewOptions: [],
          createdAt: '2020-11-03T19:57:56.299Z'
        }
      ]
    }
    const store = createStore({ state, mutations, actions })

    const wrapper = mount(Inquiries, {
      attachTo: document.body,
      global: { plugins: [store] }
    })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await nextTick()

    expect(wrapper.find('#toolbar-btns-export').isVisible()).to.equal(false)
    expect(wrapper.find('#toolbar-btns-delete').isVisible()).to.equal(false)

    const rows = wrapper.findAll('tbody tr')

    // Select a predefined inquiry
    await rows[0].find('.checkbox-container').trigger('click')
    expect(wrapper.find('#toolbar-btns-export').isVisible()).to.equal(true)
    expect(wrapper.find('#toolbar-btns-delete').isVisible()).to.equal(false)

    // Select also not predefined inquiry
    await rows[1].find('.checkbox-container').trigger('click')
    expect(wrapper.find('#toolbar-btns-export').isVisible()).to.equal(true)
    expect(wrapper.find('#toolbar-btns-delete').isVisible()).to.equal(true)

    // Uncheck a predefined inquiry
    await rows[0].find('.checkbox-container').trigger('click')
    expect(wrapper.find('#toolbar-btns-export').isVisible()).to.equal(true)
    expect(wrapper.find('#toolbar-btns-delete').isVisible()).to.equal(true)
    wrapper.unmount()
  })

  it('Exports a group of inquiries', async () => {
    const predefinedInquiry = {
      id: 0,
      name: 'hello_world',
      query: '',
      viewType: 'chart',
      viewOptions: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }
    sinon.stub(storedInquiries, 'readPredefinedInquiries').resolves([predefinedInquiry])
    const inquiryInStore = {
      id: 1,
      name: 'foo',
      query: '',
      viewType: 'chart',
      viewOptions: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }

    sinon.stub(storedInquiries, 'serialiseInquiries').returns('I am a serialized inquiries')
    sinon.stub(fu, 'exportToFile')

    const state = {
      predefinedInquiries: [],
      inquiries: [inquiryInStore, {
        id: 2,
        name: 'bar',
        query: '',
        viewType: 'chart',
        viewOptions: [],
        createdAt: '2020-03-08T19:57:56.299Z'
      }]
    }
    const store = createStore({ state, mutations, actions })

    const wrapper = mount(Inquiries, { global: { plugins: [store] } })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await nextTick()

    const rows = wrapper.findAll('tbody tr')

    // Select inquiries
    await rows[0].find('.checkbox-container').trigger('click')
    await rows[1].find('.checkbox-container').trigger('click')

    await wrapper.find('#toolbar-btns-export').trigger('click')

    expect(storedInquiries.serialiseInquiries.calledOnceWith(
      sinon.match([predefinedInquiry, inquiryInStore])
    )).to.equals(true)

    expect(
      fu.exportToFile.calledOnceWith('I am a serialized inquiries', 'My sqliteviz inquiries.json')
    ).to.equals(true)
    wrapper.unmount()
  })

  it('Exports all inquiries', async () => {
    const predefinedInquiry = {
      id: 0,
      name: 'hello_world',
      query: '',
      viewType: 'chart',
      viewOptions: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }
    sinon.stub(storedInquiries, 'readPredefinedInquiries').resolves([predefinedInquiry])
    const inquiryInStore = {
      id: 1,
      name: 'foo',
      query: '',
      viewType: 'chart',
      viewOptions: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }

    sinon.stub(storedInquiries, 'serialiseInquiries').returns('I am a serialized inquiries')
    sinon.stub(fu, 'exportToFile')

    const state = {
      predefinedInquiries: [],
      inquiries: [inquiryInStore]
    }
    const store = createStore({ state, mutations, actions })

    const wrapper = mount(Inquiries, { global: { plugins: [store] } })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await nextTick()

    await wrapper.findComponent({ ref: 'mainCheckBox' }).find('.checkbox-container')
      .trigger('click')

    await wrapper.find('#toolbar-btns-export').trigger('click')

    expect(storedInquiries.serialiseInquiries.calledOnceWith(
      sinon.match([predefinedInquiry, inquiryInStore])
    )).to.equals(true)

    expect(
      fu.exportToFile.calledOnceWith('I am a serialized inquiries', 'My sqliteviz inquiries.json')
    ).to.equals(true)
    wrapper.unmount()
  })

  it('Deletes a group of inquiries', async () => {
    const predefinedInquiry = {
      id: 0,
      name: 'hello_world',
      query: '',
      viewType: 'chart',
      viewOptions: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }
    sinon.stub(storedInquiries, 'readPredefinedInquiries').resolves([predefinedInquiry])
    const foo = {
      id: 1,
      name: 'foo',
      query: '',
      viewType: 'chart',
      viewOptions: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }
    const bar = {
      id: 2,
      name: 'bar',
      query: '',
      viewType: 'chart',
      viewOptions: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }
    const baz = {
      id: 3,
      name: 'baz',
      query: '',
      viewType: 'chart',
      viewOptions: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }

    sinon.stub(storedInquiries, 'updateStorage')

    const state = {
      tabs: [{ id: 1 }, { id: 2 }, { id: 0 }, { id: 3 }],
      predefinedInquiries: [],
      inquiries: [foo, bar, baz]
    }
    const store = createStore({ state, mutations, actions })

    const wrapper = mount(Inquiries, {
      attachTo: document.body,
      global: { 
        plugins: [store],
        stubs: { teleport: true, transition: false }
       }
    })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await nextTick()

    const rows = wrapper.findAll('tbody tr')

    // Select inquiries (don't select predefined inquiries)
    await rows[1].find('.checkbox-container').trigger('click')
    await rows[2].find('.checkbox-container').trigger('click')

    await wrapper.find('#toolbar-btns-delete').trigger('click')

    // check that delete dialog is open
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(true)

    // check the message in the dialog
    expect(wrapper.find('.dialog-body').text())
      .to.contains('Are you sure you want to delete 2 inquiries?')

    // find Delete in the dialog and click
    await wrapper
      .findAll('.dialog-buttons-container button')
      .find(button => button.text() === 'Delete')
      .trigger('click')

    // check the rows in the grid
    expect(wrapper.findAll('tbody tr')).to.have.lengthOf(2)
    expect(wrapper.findAll('tbody tr')[0].find('td').text()).to.contains('hello_world')
    expect(wrapper.findAll('tbody tr')[1].find('td').text()).to.equals('baz')

    // check that deleted inquiry was also deleted from tabs
    expect(state.tabs).to.have.lengthOf(2)
    expect(state.tabs[0].id).to.equals(0)
    expect(state.tabs[1].id).to.equals(3)

    // check that storage is updated
    expect(state.inquiries).to.eql([baz])

    // check that delete dialog is closed
    await clock.tick(100)
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(false)
    wrapper.unmount()
  })

  it('Ignores predefined inquiries during deletion', async () => {
    const predefinedInquiry = {
      id: 0,
      name: 'hello_world',
      query: '',
      viewType: 'chart',
      viewOptions: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }
    sinon.stub(storedInquiries, 'readPredefinedInquiries').resolves([predefinedInquiry])
    const foo = {
      id: 1,
      name: 'foo',
      query: '',
      viewType: 'chart',
      viewOptions: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }
    const bar = {
      id: 2,
      name: 'bar',
      query: '',
      viewType: 'chart',
      viewOptions: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }
    sinon.stub(storedInquiries, 'updateStorage')

    const state = {
      tabs: [],
      predefinedInquiries: [],
      inquiries: [foo, bar]
    }
    const store = createStore({ state, mutations, actions })

    const wrapper = mount(Inquiries, {
      attachTo: document.body,
      global: {
        plugins: [store],
        stubs: { teleport: true, transition: false } 
      }
    })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await nextTick()

    const rows = wrapper.findAll('tbody tr')

    // Select inquiries (select also predefined inquiries)
    await rows[0].find('.checkbox-container').trigger('click')
    await rows[1].find('.checkbox-container').trigger('click')

    await wrapper.find('#toolbar-btns-delete').trigger('click')

    // check that delete dialog is open
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(true)

    // check the message in the dialog
    expect(wrapper.find('.dialog-body').text())
      .to.contains('Are you sure you want to delete 1 inquiry?')

    expect(wrapper.find('.dialog-body #note').isVisible()).to.equals(true)

    // find Delete in the dialog and click
    await wrapper
      .findAll('.dialog-buttons-container button')
      .find(button => button.text() === 'Delete')
      .trigger('click')

    // check the rows in the grid
    expect(wrapper.findAll('tbody tr')).to.have.lengthOf(2)
    expect(wrapper.findAll('tbody tr')[0].find('td').text()).to.contains('hello_world')
    expect(wrapper.findAll('tbody tr')[1].find('td').text()).to.equals('bar')

    // check that storage is updated
    expect(state.inquiries).to.eql([bar])

    // check that delete dialog is closed
    await clock.tick(100)
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(false)
    wrapper.unmount()
  })

  it('Deletes all inquiries ignoring predefined ones', async () => {
    const predefinedInquiry = {
      id: 0,
      name: 'hello_world',
      query: '',
      viewType: 'chart',
      viewOptions: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }
    sinon.stub(storedInquiries, 'readPredefinedInquiries').resolves([predefinedInquiry])
    const foo = {
      id: 1,
      name: 'foo',
      query: '',
      viewType: 'chart',
      viewOptions: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }
    const bar = {
      id: 2,
      name: 'bar',
      query: '',
      viewType: 'chart',
      viewOptions: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }
    sinon.stub(storedInquiries, 'updateStorage')

    const state = {
      tabs: [],
      predefinedInquiries: [],
      inquiries: [foo, bar]
    }
    const store = createStore({ state, mutations, actions })

    const wrapper = mount(Inquiries, {
      attachTo: document.body,
      global: {
        plugins: [store],
        stubs: { teleport: true, transition: false }
      }
    })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await nextTick()

    await wrapper.findComponent({ ref: 'mainCheckBox' }).find('.checkbox-container')
      .trigger('click')

    await wrapper.find('#toolbar-btns-delete').trigger('click')

    // check that delete dialog is open
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(true)

    // check the message in the dialog
    expect(wrapper.find('.dialog-body').text())
      .to.contains('Are you sure you want to delete 2 inquiries?')

    expect(wrapper.find('.dialog-body #note').isVisible()).to.equals(true)

    // find Delete in the dialog and click
    await wrapper
      .findAll('.dialog-buttons-container button')
      .find(button => button.text() === 'Delete')
      .trigger('click')

    // check the rows in the grid
    expect(wrapper.findAll('tbody tr')).to.have.lengthOf(1)
    expect(wrapper.findAll('tbody tr')[0].find('td').text()).to.contains('hello_world')

    // check that storage is updated
    expect(state.inquiries).to.eql([])

    // check that delete dialog is closed
    await clock.tick(100)
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(false)
    wrapper.unmount()
  })

  it('Main checkbox', async () => {
    sinon.stub(storedInquiries, 'readPredefinedInquiries').resolves([])
    const foo = {
      id: 1,
      name: 'foo',
      query: '',
      viewType: 'chart',
      viewOptions: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }
    const bar = {
      id: 2,
      name: 'bar',
      query: '',
      viewType: 'chart',
      viewOptions: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }

    const state = {
      predefinedInquiries: [],
      inquiries: [foo, bar]
    }
    const store = createStore({ state, mutations, actions })

    const wrapper = mount(Inquiries, { global: { plugins: [store] } })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await nextTick()

    const mainCheckBox = wrapper.findComponent({ ref: 'mainCheckBox' })
    // Select all with main checkbox
    await mainCheckBox.find('.checkbox-container').trigger('click')

    const checkboxes = wrapper.findAllComponents('[data-test="rowCheckBox"]')
    expect(checkboxes[0].vm.checked).to.equals(true)
    expect(checkboxes[1].vm.checked).to.equals(true)

    // Uncheck first row - main checkbox bocomes not checked
    await wrapper.find('tbody tr .checkbox-container').trigger('click')
    expect(mainCheckBox.vm.checked).to.equals(false)

    // Select all again ...
    await mainCheckBox.find('.checkbox-container').trigger('click')
    // ... and uncheck all
    await mainCheckBox.find('.checkbox-container').trigger('click')
    expect(checkboxes[0].vm.checked).to.equals(false)
    expect(checkboxes[0].vm.checked).to.equals(false)
    wrapper.unmount()
  })

  it('Selection and filter', async () => {
    sinon.stub(storedInquiries, 'readPredefinedInquiries').resolves([
      {
        id: 0,
        name: 'hello_world',
        query: '',
        viewType: 'chart',
        viewOptions: [],
        createdAt: '2020-03-08T19:57:56.299Z'
      }
    ])
    const foo = {
      id: 1,
      name: 'foo',
      query: '',
      viewType: 'chart',
      viewOptions: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }
    const bar = {
      id: 2,
      name: 'bar',
      query: '',
      viewType: 'chart',
      viewOptions: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }

    const state = {
      predefinedInquiries: [],
      inquiries: [foo, bar]
    }
    const store = createStore({ state, mutations, actions })

    const wrapper = mount(Inquiries, { global: { plugins: [store] } })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await nextTick()

    const mainCheckBox = wrapper.findComponent({ ref: 'mainCheckBox' })
    // Select all with main checkbox
    await mainCheckBox.find('.checkbox-container').trigger('click')
    expect([...wrapper.vm.selectedInquiriesIds]).to.eql([0, 1, 2])
    expect(wrapper.vm.selectedNotPredefinedCount).to.eql(2)
    let checkboxes = wrapper.findAllComponents('[data-test="rowCheckBox"]')
    expect(checkboxes[0].vm.checked).to.equals(true)
    expect(checkboxes[1].vm.checked).to.equals(true)
    expect(checkboxes[2].vm.checked).to.equals(true)

    // Filter
    await wrapper.find('#toolbar-search input').setValue('foo')
    await nextTick()
    expect([...wrapper.vm.selectedInquiriesIds]).to.eql([1])
    expect(wrapper.vm.selectedNotPredefinedCount).to.eql(1)
    checkboxes = wrapper.findAllComponents('[data-test="rowCheckBox"]')
    expect(checkboxes[0].vm.checked).to.equals(true)

    // Clear filter
    await wrapper.find('#toolbar-search input').setValue('')
    await nextTick()
    expect([...wrapper.vm.selectedInquiriesIds]).to.eql([1])
    expect(wrapper.vm.selectedNotPredefinedCount).to.eql(1)
    checkboxes = wrapper.findAll('tr .checkbox-container')
    expect(checkboxes[0].classes()).to.not.include('checked')
    expect(checkboxes[1].classes()).to.include('checked')
    expect(checkboxes[2].classes()).to.not.include('checked')

    // Select also first inquiry
    wrapper.find('tbody tr .checkbox-container').trigger('click')
    expect([...wrapper.vm.selectedInquiriesIds]).to.eql([1, 0])
    expect(wrapper.vm.selectedNotPredefinedCount).to.eql(1)

    // Filter
    await wrapper.find('#toolbar-search input').setValue('hello')
    await nextTick()
    expect([...wrapper.vm.selectedInquiriesIds]).to.eql([0])
    expect(wrapper.vm.selectedNotPredefinedCount).to.eql(0)
    checkboxes = wrapper.findAllComponents('[data-test="rowCheckBox"]')
    expect(checkboxes[0].vm.checked).to.equals(true)

    // Select all with main checkbox
    await mainCheckBox.find('.checkbox-container').trigger('click')

    // Clear filter - main checkbox bocomes not checked
    await wrapper.find('#toolbar-search input').setValue('')
    await nextTick()
    expect(mainCheckBox.vm.checked).to.equals(false)
    wrapper.unmount()
  })
})
