import { expect } from 'chai'
import sinon from 'sinon'
import { mount, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import Inquiries from '@/views/Main/Inquiries'
import storedInquiries from '@/lib/storedInquiries'
import mutations from '@/store/mutations'
import fu from '@/lib/utils/fileIo'

describe('Inquiries.vue', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('Shows start-guide message if there are no saved and predefined inquiries', () => {
    sinon.stub(storedInquiries, 'readPredefinedInquiries').resolves([])
    sinon.stub(storedInquiries, 'getStoredInquiries').returns([])
    const state = {
      predefinedInquiries: []
    }
    const mutations = {
      updatePredefinedInquiries: sinon.stub()
    }
    const store = new Vuex.Store({ state, mutations })
    const wrapper = shallowMount(Inquiries, { store })

    expect(wrapper.find('#start-guide').exists()).to.equal(true)
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
    sinon.stub(storedInquiries, 'getStoredInquiries').returns([
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
    ])
    const state = {
      predefinedInquiries: []
    }

    const store = new Vuex.Store({ state, mutations })
    const wrapper = shallowMount(Inquiries, { store })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await storedInquiries.getStoredInquiries.returnValues[0]
    await wrapper.vm.$nextTick()

    expect(wrapper.find('#start-guide').exists()).to.equal(false)
    expect(wrapper.find('#toolbar-btns-import').isVisible()).to.equal(true)
    expect(wrapper.find('#toolbar-btns-export').isVisible()).to.equal(false)
    expect(wrapper.find('#toolbar-btns-delete').isVisible()).to.equal(false)

    const rows = wrapper.findAll('tbody tr')
    expect(rows).to.have.lengthOf(3)
    expect(rows.at(0).findAll('td').at(0).text()).to.contains('hello_world')
    expect(rows.at(0).findAll('td').at(1).text()).to.equals('8 March 2020 20:57')
    expect(rows.at(1).findAll('td').at(0).text()).to.equals('foo')
    expect(rows.at(1).findAll('td').at(1).text()).to.equals('3 November 2020 20:57')
    expect(rows.at(2).findAll('td').at(0).text()).to.equals('bar')
    expect(rows.at(2).findAll('td').at(1).text()).to.equals('4 December 2020 19:53')
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
    sinon.stub(storedInquiries, 'getStoredInquiries').returns([
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
    ])
    const state = {
      predefinedInquiries: []
    }

    const store = new Vuex.Store({ state, mutations })
    const wrapper = mount(Inquiries, { store })
    await wrapper.find('#toolbar-search input').setValue('OO')
    await wrapper.vm.$nextTick()

    const rows = wrapper.findAll('tbody tr')
    expect(rows).to.have.lengthOf(1)
    expect(rows.at(0).findAll('td').at(0).text()).to.equals('foo')
    expect(rows.at(0).findAll('td').at(1).text()).to.contains('3 November 2020 20:57')
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
    sinon.stub(storedInquiries, 'getStoredInquiries').returns([
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
    ])
    const state = {
      predefinedInquiries: []
    }

    const store = new Vuex.Store({ state, mutations })
    const wrapper = mount(Inquiries, { store })
    await wrapper.find('#toolbar-search input').setValue('baz')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('#inquiries-not-found').text()).to.equal('No inquiries found')
    expect(wrapper.find('#start-guide').exists()).to.equal(false)
    expect(wrapper.find('tbody').isVisible()).to.equal(false)
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
    sinon.stub(storedInquiries, 'getStoredInquiries').returns([
      {
        id: 1,
        name: 'foo',
        query: '',
        viewType: 'chart',
        viewOptions: [],
        createdAt: '2020-11-03T19:57:56.299Z'
      }
    ])
    const state = {
      predefinedInquiries: []
    }

    const store = new Vuex.Store({ state, mutations })
    const wrapper = shallowMount(Inquiries, { store })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await storedInquiries.getStoredInquiries.returnValues[0]
    await wrapper.vm.$nextTick()

    const rows = wrapper.findAll('tbody tr')
    expect(rows.at(0).find('td .badge').exists()).to.equals(true)
    expect(rows.at(1).find('td .badge').exists()).to.equals(false)
  })

  it('Exports one inquiry', async () => {
    sinon.stub(storedInquiries, 'readPredefinedInquiries').resolves([])
    sinon.stub(storedInquiries, 'getStoredInquiries').returns([
      {
        id: 1,
        name: 'foo',
        query: '',
        viewType: 'chart',
        viewOptions: [],
        createdAt: '2020-11-03T19:57:56.299Z'
      }
    ])
    sinon.stub(storedInquiries, 'serialiseInquiries').returns('I am a serialized inquiry')
    sinon.stub(fu, 'exportToFile')
    const state = {
      predefinedInquiries: []
    }

    const store = new Vuex.Store({ state, mutations })
    const wrapper = mount(Inquiries, { store })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await storedInquiries.getStoredInquiries.returnValues[0]
    await wrapper.vm.$nextTick()
    await wrapper.findComponent({ name: 'ExportIcon' }).find('svg').trigger('click')
    expect(fu.exportToFile.calledOnceWith('I am a serialized inquiry', 'foo.json')).to.equals(true)
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
    sinon.stub(storedInquiries, 'getStoredInquiries').returns([inquiryInStorage])
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
      predefinedInquiries: []
    }
    const store = new Vuex.Store({ state, mutations })

    const wrapper = mount(Inquiries, { store })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await storedInquiries.getStoredInquiries.returnValues[0]
    await wrapper.vm.$nextTick()
    await wrapper.findComponent({ name: 'CopyIcon' }).find('svg').trigger('click')

    expect(storedInquiries.duplicateInquiry.calledOnceWith(inquiryInStorage)).to.equals(true)

    const rows = wrapper.findAll('tbody tr')
    expect(rows).to.have.lengthOf(2)
    expect(rows.at(1).findAll('td').at(0).text()).to.equals('foo copy')
    expect(rows.at(1).findAll('td').at(1).text()).to.contains('3 December 2020 20:57')
    expect(
      storedInquiries.updateStorage.calledOnceWith(sinon.match([inquiryInStorage, newInquiry]))
    ).to.equals(true)
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
      sinon.stub(storedInquiries, 'getStoredInquiries').returns([inquiryInStorage])
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
        predefinedInquiries: []
      }
      const store = new Vuex.Store({ state, mutations })

      const wrapper = mount(Inquiries, { store })
      await storedInquiries.readPredefinedInquiries.returnValues[0]
      await storedInquiries.getStoredInquiries.returnValues[0]
      await wrapper.vm.$nextTick()
      await wrapper.findComponent({ ref: 'mainCheckBox' }).find('.checkbox-container')
        .trigger('click')
      await wrapper.findComponent({ name: 'CopyIcon' }).find('svg').trigger('click')

      const checkboxes = wrapper.findAllComponents({ ref: 'rowCheckBox' })
      expect(checkboxes.at(0).vm.checked).to.equals(true)
      expect(checkboxes.at(1).vm.checked).to.equals(false)
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
    sinon.stub(storedInquiries, 'getStoredInquiries').returns([inquiryInStorage])

    const state = {
      predefinedInquiries: []
    }
    const actions = { addTab: sinon.stub().resolves(1) }
    sinon.spy(mutations, 'setCurrentTabId')
    const $router = { push: sinon.stub() }
    const store = new Vuex.Store({ state, mutations, actions })

    const wrapper = shallowMount(Inquiries, {
      store,
      mocks: { $router }
    })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await storedInquiries.getStoredInquiries.returnValues[0]
    await wrapper.vm.$nextTick()
    await wrapper.find('tbody tr').trigger('click')

    expect(actions.addTab.calledOnce).to.equals(true)
    expect(actions.addTab.getCall(0).args[1]).to.equals(inquiryInStorage)
    await actions.addTab.returnValues[0]
    expect(mutations.setCurrentTabId.calledOnceWith(state, 1)).to.equals(true)
    expect($router.push.calledOnceWith('/workspace')).to.equals(true)
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
    sinon.stub(storedInquiries, 'getStoredInquiries').returns([])

    const state = {
      predefinedInquiries: []
    }
    const store = new Vuex.Store({ state, mutations })

    const wrapper = mount(Inquiries, { store })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await storedInquiries.getStoredInquiries.returnValues[0]
    await wrapper.vm.$nextTick()
    expect(wrapper.findComponent({ name: 'RenameIcon' }).exists()).to.equals(false)
  })

  it('Renames an inquiry', async () => {
    sinon.stub(storedInquiries, 'readPredefinedInquiries').resolves([])
    sinon.stub(storedInquiries, 'getStoredInquiries').returns([
      {
        id: 1,
        name: 'foo',
        query: '',
        viewType: 'chart',
        viewOptions: [],
        createdAt: '2020-11-03T19:57:56.299Z'
      }
    ])
    sinon.stub(storedInquiries, 'updateStorage')
    const state = {
      tabs: [{ id: 1, name: 'foo' }],
      predefinedInquiries: []
    }
    const store = new Vuex.Store({ state, mutations })

    const wrapper = mount(Inquiries, { store })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await storedInquiries.getStoredInquiries.returnValues[0]
    await wrapper.vm.$nextTick()

    // click Rename icon in the grid
    await wrapper.findComponent({ name: 'RenameIcon' }).find('svg').trigger('click')

    // check that rename dialog is open
    expect(wrapper.find('[data-modal="rename"]').exists()).to.equal(true)

    // check that input is filled by the current inquiry name
    expect(wrapper.find('.dialog-body input').element.value).to.equals('foo')

    // change the name
    await wrapper.find('.dialog-body input').setValue('bar')

    // find Rename in the dialog and click
    await wrapper
      .findAll('.dialog-buttons-container button').wrappers
      .find(button => button.text() === 'Rename')
      .trigger('click')

    // check that the name in the grid is changed
    expect(wrapper.find('tbody tr td').text()).to.equals('bar')

    // check that storage is updated
    expect(storedInquiries.updateStorage.calledOnceWith(sinon.match([{
      id: 1,
      name: 'bar',
      query: '',
      viewType: 'chart',
      viewOptions: [],
      createdAt: '2020-11-03T19:57:56.299Z'
    }]))).to.equals(true)

    // check that coresponding tab also changed the name
    expect(state.tabs[0].name).to.equals('bar')

    // check that rename dialog is closed
    expect(wrapper.find('[data-modal="rename"]').exists()).to.equal(false)
  })

  it('Shows an error if try to rename to empty string', async () => {
    sinon.stub(storedInquiries, 'readPredefinedInquiries').resolves([])
    sinon.stub(storedInquiries, 'getStoredInquiries').returns([
      {
        id: 1,
        name: 'foo',
        query: '',
        viewType: 'chart',
        viewOptions: [],
        createdAt: '2020-11-03T19:57:56.299Z'
      }
    ])
    sinon.stub(storedInquiries, 'updateStorage')
    const state = {
      tabs: [{ id: 1, name: 'foo' }],
      predefinedInquiries: []
    }
    const store = new Vuex.Store({ state, mutations })

    const wrapper = mount(Inquiries, { store })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await storedInquiries.getStoredInquiries.returnValues[0]
    await wrapper.vm.$nextTick()

    // click Rename icon in the grid
    await wrapper.findComponent({ name: 'RenameIcon' }).find('svg').trigger('click')

    // change the name
    await wrapper.find('.dialog-body input').setValue('')

    // find Rename in the dialog and click
    await wrapper
      .findAll('.dialog-buttons-container button').wrappers
      .find(button => button.text() === 'Rename')
      .trigger('click')

    expect(wrapper.find('.dialog-body .text-field-error').text())
      .to.equals("Inquiry name can't be empty")
    // check that rename dialog is still open
    expect(wrapper.find('[data-modal="rename"]').exists()).to.equal(true)
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
    sinon.stub(storedInquiries, 'getStoredInquiries').returns([inquiryInStorage])
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
      predefinedInquiries: []
    }
    const store = new Vuex.Store({ state, mutations })

    const wrapper = shallowMount(Inquiries, { store })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await storedInquiries.getStoredInquiries.returnValues[0]
    await wrapper.vm.$nextTick()

    // click Import
    await wrapper.find('#toolbar-btns-import').trigger('click')

    const rows = wrapper.findAll('tbody tr')
    expect(rows).to.have.lengthOf(2)
    expect(rows.at(1).findAll('td').at(0).text()).to.equals('bar')
    expect(rows.at(1).findAll('td').at(1).text()).to.equals('3 December 2020 20:57')
    expect(storedInquiries.updateStorage.calledOnceWith(
      sinon.match([inquiryInStorage, importedInquiry])
    )).to.equals(true)
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
    sinon.stub(storedInquiries, 'getStoredInquiries').returns([inquiryInStorage])
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
      predefinedInquiries: []
    }
    const store = new Vuex.Store({ state, mutations })

    const wrapper = mount(Inquiries, { store })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await storedInquiries.getStoredInquiries.returnValues[0]
    await wrapper.vm.$nextTick()

    // click on master checkbox
    await wrapper.findComponent({ ref: 'mainCheckBox' }).find('.checkbox-container')
      .trigger('click')

    // click Import
    await wrapper.find('#toolbar-btns-import').trigger('click')

    const checkboxes = wrapper.findAllComponents({ ref: 'rowCheckBox' })
    expect(wrapper.findComponent({ ref: 'mainCheckBox' }).vm.checked).to.equals(false)
    expect(checkboxes.at(0).vm.checked).to.equals(true)
    expect(checkboxes.at(1).vm.checked).to.equals(false)
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
    sinon.stub(storedInquiries, 'getStoredInquiries').returns([])

    const state = {
      predefinedInquiries: []
    }
    const store = new Vuex.Store({ state, mutations })

    const wrapper = mount(Inquiries, { store })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await storedInquiries.getStoredInquiries.returnValues[0]
    await wrapper.vm.$nextTick()
    expect(wrapper.findComponent({ name: 'DeleteIcon' }).exists()).to.equals(false)
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
    sinon.stub(storedInquiries, 'getStoredInquiries').returns([foo, bar])
    sinon.stub(storedInquiries, 'updateStorage')

    const state = {
      tabs: [{ id: 1 }, { id: 2 }],
      predefinedInquiries: []
    }
    const store = new Vuex.Store({ state, mutations })

    const wrapper = mount(Inquiries, { store })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await storedInquiries.getStoredInquiries.returnValues[0]
    await wrapper.vm.$nextTick()
    // click Delete icon in the first row of the grid
    await wrapper.findComponent({ name: 'DeleteIcon' }).find('svg').trigger('click')

    // check that delete dialog is open
    expect(wrapper.find('[data-modal="delete"]').exists()).to.equal(true)

    // check the message in the dialog
    expect(wrapper.find('.dialog-body').text()).to.contains('"foo"?')

    // find Delete in the dialog and click
    await wrapper
      .findAll('.dialog-buttons-container button').wrappers
      .find(button => button.text() === 'Delete')
      .trigger('click')

    // check the rows in the grid
    expect(wrapper.findAll('tbody tr')).to.have.lengthOf(1)
    expect(wrapper.findAll('tbody tr').at(0).find('td').text()).to.equals('bar')

    // check that deleted inquiry was also deleted from tabs
    expect(state.tabs).to.have.lengthOf(1)
    expect(state.tabs[0].id).to.equals(2)

    // check that storage is updated
    expect(storedInquiries.updateStorage.calledOnceWith(sinon.match([bar]))).to.equals(true)

    // check that delete dialog is closed
    expect(wrapper.find('[data-modal="delete"]').exists()).to.equal(false)
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
    sinon.stub(storedInquiries, 'getStoredInquiries').returns([
      {
        id: 1,
        name: 'foo',
        query: '',
        viewType: 'chart',
        viewOptions: [],
        createdAt: '2020-11-03T19:57:56.299Z'
      }
    ])

    const state = {
      predefinedInquiries: []
    }
    const store = new Vuex.Store({ state, mutations })

    const wrapper = mount(Inquiries, { store })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await storedInquiries.getStoredInquiries.returnValues[0]
    await wrapper.vm.$nextTick()

    expect(wrapper.find('#toolbar-btns-export').isVisible()).to.equal(false)
    expect(wrapper.find('#toolbar-btns-delete').isVisible()).to.equal(false)

    const rows = wrapper.findAll('tbody tr')

    // Select a predefined inquiry
    await rows.at(0).find('.checkbox-container').trigger('click')
    expect(wrapper.find('#toolbar-btns-export').isVisible()).to.equal(true)
    expect(wrapper.find('#toolbar-btns-delete').isVisible()).to.equal(false)

    // Select also not predefined inquiry
    await rows.at(1).find('.checkbox-container').trigger('click')
    expect(wrapper.find('#toolbar-btns-export').isVisible()).to.equal(true)
    expect(wrapper.find('#toolbar-btns-delete').isVisible()).to.equal(true)

    // Uncheck a predefined inquiry
    await rows.at(0).find('.checkbox-container').trigger('click')
    expect(wrapper.find('#toolbar-btns-export').isVisible()).to.equal(true)
    expect(wrapper.find('#toolbar-btns-delete').isVisible()).to.equal(true)
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
    sinon.stub(storedInquiries, 'getStoredInquiries').returns([inquiryInStore, {
      id: 2,
      name: 'bar',
      query: '',
      viewType: 'chart',
      viewOptions: [],
      createdAt: '2020-03-08T19:57:56.299Z'
    }])

    sinon.stub(storedInquiries, 'serialiseInquiries').returns('I am a serialized inquiries')
    sinon.stub(fu, 'exportToFile')

    const state = {
      predefinedInquiries: []
    }
    const store = new Vuex.Store({ state, mutations })

    const wrapper = mount(Inquiries, { store })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await storedInquiries.getStoredInquiries.returnValues[0]
    await wrapper.vm.$nextTick()

    const rows = wrapper.findAll('tbody tr')

    // Select inquiries
    await rows.at(0).find('.checkbox-container').trigger('click')
    await rows.at(1).find('.checkbox-container').trigger('click')

    await wrapper.find('#toolbar-btns-export').trigger('click')

    expect(storedInquiries.serialiseInquiries.calledOnceWith(
      sinon.match([predefinedInquiry, inquiryInStore])
    )).to.equals(true)

    expect(
      fu.exportToFile.calledOnceWith('I am a serialized inquiries', 'My sqliteviz inquiries.json')
    ).to.equals(true)
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
    sinon.stub(storedInquiries, 'getStoredInquiries').returns([inquiryInStore])

    sinon.stub(storedInquiries, 'serialiseInquiries').returns('I am a serialized inquiries')
    sinon.stub(fu, 'exportToFile')

    const state = {
      predefinedInquiries: []
    }
    const store = new Vuex.Store({ state, mutations })

    const wrapper = mount(Inquiries, { store })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await storedInquiries.getStoredInquiries.returnValues[0]
    await wrapper.vm.$nextTick()

    await wrapper.findComponent({ ref: 'mainCheckBox' }).find('.checkbox-container')
      .trigger('click')

    await wrapper.find('#toolbar-btns-export').trigger('click')

    expect(storedInquiries.serialiseInquiries.calledOnceWith(
      sinon.match([predefinedInquiry, inquiryInStore])
    )).to.equals(true)

    expect(
      fu.exportToFile.calledOnceWith('I am a serialized inquiries', 'My sqliteviz inquiries.json')
    ).to.equals(true)
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
    sinon.stub(storedInquiries, 'getStoredInquiries').returns([foo, bar, baz])

    sinon.stub(storedInquiries, 'updateStorage')

    const state = {
      tabs: [{ id: 1 }, { id: 2 }, { id: 0 }, { id: 3 }],
      predefinedInquiries: []
    }
    const store = new Vuex.Store({ state, mutations })

    const wrapper = mount(Inquiries, { store })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await storedInquiries.getStoredInquiries.returnValues[0]
    await wrapper.vm.$nextTick()

    const rows = wrapper.findAll('tbody tr')

    // Select inquiries (don't select predefined inquiries)
    await rows.at(1).find('.checkbox-container').trigger('click')
    await rows.at(2).find('.checkbox-container').trigger('click')

    await wrapper.find('#toolbar-btns-delete').trigger('click')

    // check that delete dialog is open
    expect(wrapper.find('[data-modal="delete"]').exists()).to.equal(true)

    // check the message in the dialog
    expect(wrapper.find('.dialog-body').text())
      .to.contains('Are you sure you want to delete 2 inquiries?')

    // find Delete in the dialog and click
    await wrapper
      .findAll('.dialog-buttons-container button').wrappers
      .find(button => button.text() === 'Delete')
      .trigger('click')

    // check the rows in the grid
    expect(wrapper.findAll('tbody tr')).to.have.lengthOf(2)
    expect(wrapper.findAll('tbody tr').at(0).find('td').text()).to.contains('hello_world')
    expect(wrapper.findAll('tbody tr').at(1).find('td').text()).to.equals('baz')

    // check that deleted inquiry was also deleted from tabs
    expect(state.tabs).to.have.lengthOf(2)
    expect(state.tabs[0].id).to.equals(0)
    expect(state.tabs[1].id).to.equals(3)

    // check that storage is updated
    expect(storedInquiries.updateStorage.calledOnceWith(sinon.match([baz]))).to.equals(true)

    // check that delete dialog is closed
    expect(wrapper.find('[data-modal="delete"]').exists()).to.equal(false)
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
    sinon.stub(storedInquiries, 'getStoredInquiries').returns([foo, bar])
    sinon.stub(storedInquiries, 'updateStorage')

    const state = {
      tabs: [],
      predefinedInquiries: []
    }
    const store = new Vuex.Store({ state, mutations })

    const wrapper = mount(Inquiries, { store })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await storedInquiries.getStoredInquiries.returnValues[0]
    await wrapper.vm.$nextTick()

    const rows = wrapper.findAll('tbody tr')

    // Select inquiries (select also predefined inquiries)
    await rows.at(0).find('.checkbox-container').trigger('click')
    await rows.at(1).find('.checkbox-container').trigger('click')

    await wrapper.find('#toolbar-btns-delete').trigger('click')

    // check that delete dialog is open
    expect(wrapper.find('[data-modal="delete"]').exists()).to.equal(true)

    // check the message in the dialog
    expect(wrapper.find('.dialog-body').text())
      .to.contains('Are you sure you want to delete 1 inquiry?')

    expect(wrapper.find('.dialog-body #note').isVisible()).to.equals(true)

    // find Delete in the dialog and click
    await wrapper
      .findAll('.dialog-buttons-container button').wrappers
      .find(button => button.text() === 'Delete')
      .trigger('click')

    // check the rows in the grid
    expect(wrapper.findAll('tbody tr')).to.have.lengthOf(2)
    expect(wrapper.findAll('tbody tr').at(0).find('td').text()).to.contains('hello_world')
    expect(wrapper.findAll('tbody tr').at(1).find('td').text()).to.equals('bar')

    // check that storage is updated
    expect(storedInquiries.updateStorage.calledOnceWith(sinon.match([bar]))).to.equals(true)

    // check that delete dialog is closed
    expect(wrapper.find('[data-modal="delete"]').exists()).to.equal(false)
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
    sinon.stub(storedInquiries, 'getStoredInquiries').returns([foo, bar])
    sinon.stub(storedInquiries, 'updateStorage')

    const state = {
      tabs: [],
      predefinedInquiries: []
    }
    const store = new Vuex.Store({ state, mutations })

    const wrapper = mount(Inquiries, { store })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await storedInquiries.getStoredInquiries.returnValues[0]
    await wrapper.vm.$nextTick()

    await wrapper.findComponent({ ref: 'mainCheckBox' }).find('.checkbox-container')
      .trigger('click')

    await wrapper.find('#toolbar-btns-delete').trigger('click')

    // check that delete dialog is open
    expect(wrapper.find('[data-modal="delete"]').exists()).to.equal(true)

    // check the message in the dialog
    expect(wrapper.find('.dialog-body').text())
      .to.contains('Are you sure you want to delete 2 inquiries?')

    expect(wrapper.find('.dialog-body #note').isVisible()).to.equals(true)

    // find Delete in the dialog and click
    await wrapper
      .findAll('.dialog-buttons-container button').wrappers
      .find(button => button.text() === 'Delete')
      .trigger('click')

    // check the rows in the grid
    expect(wrapper.findAll('tbody tr')).to.have.lengthOf(1)
    expect(wrapper.findAll('tbody tr').at(0).find('td').text()).to.contains('hello_world')

    // check that storage is updated
    expect(storedInquiries.updateStorage.calledOnceWith(sinon.match([]))).to.equals(true)

    // check that delete dialog is closed
    expect(wrapper.find('[data-modal="delete"]').exists()).to.equal(false)
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
    sinon.stub(storedInquiries, 'getStoredInquiries').returns([foo, bar])

    const state = {
      predefinedInquiries: []
    }
    const store = new Vuex.Store({ state, mutations })

    const wrapper = mount(Inquiries, { store })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await storedInquiries.getStoredInquiries.returnValues[0]
    await wrapper.vm.$nextTick()

    const mainCheckBox = wrapper.findComponent({ ref: 'mainCheckBox' })
    // Select all with main checkbox
    await mainCheckBox.find('.checkbox-container').trigger('click')

    const checkboxes = wrapper.findAllComponents({ ref: 'rowCheckBox' })
    expect(checkboxes.at(0).vm.checked).to.equals(true)
    expect(checkboxes.at(1).vm.checked).to.equals(true)

    // Uncheck first row - main checkbox bocomes not checked
    await wrapper.find('tbody tr .checkbox-container').trigger('click')
    expect(mainCheckBox.vm.checked).to.equals(false)

    // Select all again ...
    await mainCheckBox.find('.checkbox-container').trigger('click')
    // ... and uncheck all
    await mainCheckBox.find('.checkbox-container').trigger('click')
    expect(checkboxes.at(0).vm.checked).to.equals(false)
    expect(checkboxes.at(0).vm.checked).to.equals(false)
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
    sinon.stub(storedInquiries, 'getStoredInquiries').returns([foo, bar])

    const state = {
      predefinedInquiries: []
    }
    const store = new Vuex.Store({ state, mutations })

    const wrapper = mount(Inquiries, { store })
    await storedInquiries.readPredefinedInquiries.returnValues[0]
    await storedInquiries.getStoredInquiries.returnValues[0]
    await wrapper.vm.$nextTick()

    const mainCheckBox = wrapper.findComponent({ ref: 'mainCheckBox' })
    // Select all with main checkbox
    await mainCheckBox.find('.checkbox-container').trigger('click')
    expect([...wrapper.vm.selectedInquiriesIds]).to.eql([0, 1, 2])
    expect(wrapper.vm.selectedNotPredefinedCount).to.eql(2)
    let checkboxes = wrapper.findAllComponents({ ref: 'rowCheckBox' })
    expect(checkboxes.at(0).vm.checked).to.equals(true)
    expect(checkboxes.at(1).vm.checked).to.equals(true)
    expect(checkboxes.at(2).vm.checked).to.equals(true)

    // Filter
    await wrapper.find('#toolbar-search input').setValue('foo')
    await wrapper.vm.$nextTick()
    expect([...wrapper.vm.selectedInquiriesIds]).to.eql([1])
    expect(wrapper.vm.selectedNotPredefinedCount).to.eql(1)
    checkboxes = wrapper.findAllComponents({ ref: 'rowCheckBox' })
    expect(checkboxes.at(0).vm.checked).to.equals(true)

    // Clear filter
    await wrapper.find('#toolbar-search input').setValue('')
    await wrapper.vm.$nextTick()
    expect([...wrapper.vm.selectedInquiriesIds]).to.eql([1])
    expect(wrapper.vm.selectedNotPredefinedCount).to.eql(1)
    checkboxes = wrapper.findAll('tr .checkbox-container')
    expect(checkboxes.at(0).classes()).to.not.include('checked')
    expect(checkboxes.at(1).classes()).to.include('checked')
    expect(checkboxes.at(2).classes()).to.not.include('checked')

    // Select also first inquiry
    wrapper.find('tbody tr .checkbox-container').trigger('click')
    expect([...wrapper.vm.selectedInquiriesIds]).to.eql([1, 0])
    expect(wrapper.vm.selectedNotPredefinedCount).to.eql(1)

    // Filter
    await wrapper.find('#toolbar-search input').setValue('hello')
    await wrapper.vm.$nextTick()
    expect([...wrapper.vm.selectedInquiriesIds]).to.eql([0])
    expect(wrapper.vm.selectedNotPredefinedCount).to.eql(0)
    checkboxes = wrapper.findAllComponents({ ref: 'rowCheckBox' })
    expect(checkboxes.at(0).vm.checked).to.equals(true)

    // Select all with main checkbox
    await mainCheckBox.find('.checkbox-container').trigger('click')

    // Clear filter - main checkbox bocomes not checked
    await wrapper.find('#toolbar-search input').setValue('')
    await wrapper.vm.$nextTick()
    expect(mainCheckBox.vm.checked).to.equals(false)
  })
})
