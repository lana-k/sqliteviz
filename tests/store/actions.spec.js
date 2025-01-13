import { expect } from 'chai'
import actions from '@/store/actions'
import sinon from 'sinon'

const {
  addTab,
  addInquiry,
  deleteInquiries,
  renameInquiry,
  saveInquiry
} = actions

describe('actions', () => {
  it('addTab adds new blank tab', async () => {
    const state = {
      tabs: [],
      untitledLastIndex: 0
    }

    let id = await addTab({ state })
    expect(state.tabs[0]).to.include({
      id,
      name: null,
      tempName: 'Untitled',
      viewType: 'chart',
      viewOptions: undefined,
      isSaved: false
    })
    expect(state.untitledLastIndex).to.equal(1)

    id = await addTab({ state })
    expect(state.tabs[1]).to.include({
      id,
      name: null,
      tempName: 'Untitled 1',
      viewType: 'chart',
      viewOptions: undefined,
      isSaved: false
    })
    expect(state.untitledLastIndex).to.equal(2)
  })

  it('addTab adds tab from saved inquiries', async () => {
    const state = {
      tabs: [],
      untitledLastIndex: 0
    }
    const tab = {
      id: 1,
      name: 'test',
      query: 'SELECT * from foo',
      viewType: 'chart',
      viewOptions: 'an object with view options',
      isSaved: true
    }
    await addTab({ state }, tab)
    expect(state.tabs[0]).to.include(tab)
    expect(state.untitledLastIndex).to.equal(0)
  })

  it("addTab doesn't add anything when the inquiry is already opened", async () => {
    const tab1 = {
      id: 1,
      name: 'test',
      tempName: null,
      query: 'SELECT * from foo',
      viewType: 'chart',
      viewOptions: {},
      isSaved: true
    }

    const tab2 = {
      id: 2,
      name: 'bar',
      tempName: null,
      query: 'SELECT * from bar',
      viewType: 'chart',
      viewOptions: {},
      isSaved: true
    }

    const state = {
      tabs: [tab1, tab2],
      untitledLastIndex: 0
    }

    await addTab({ state }, tab1)
    expect(state.tabs).to.have.lengthOf(2)
    expect(state.untitledLastIndex).to.equal(0)
  })

  it('addInquiry', async () => {
    const state = {
      inquiries: [1, 2, 3]
    }

    await addInquiry({ state }, 4)
    expect(state.inquiries).to.eql([1, 2, 3, 4])
  })

  it('deleteInquiries', async () => {
    const state = {
      inquiries: [{ id: 1 }, { id: 2 }, { id: 3 }],
      tabs: [{ id: 3 }, { id: 2 }]
    }
    const commit = sinon.spy()

    await deleteInquiries({ state, commit }, new Set().add(2))
    expect(state.inquiries).to.eql([{ id: 1 }, { id: 3 }])
    expect(commit.calledWith('deleteTab', { id: 2 })).to.equal(true)
  })

  it('renameInquiry', async () => {
    const state = {
      inquiries: [
        { id: 1, name: 'foo' },
        { id: 2, name: 'bar' },
        { id: 3, name: 'baz' }
      ],
      tabs: [{ id: 1, name: 'foo' }, { id: 2, name: 'bar' }]
    }
    const commit = sinon.spy()

    await renameInquiry({ state, commit }, { inquiryId: 2, newName: 'new name' })
    expect(state.inquiries).to.eql([
      { id: 1, name: 'foo' },
      { id: 2, name: 'new name' },
      { id: 3, name: 'baz' }
    ])
    expect(commit.calledWith('updateTab', {
      tab: { id: 2, name: 'bar' },
      newValues: {
        name: 'new name'
      }
    })).to.equal(true)
  })

  it('saveInquiry adds new inquiry in the storage', async () => {
    const now = new Date()
    const nowPlusMinute = new Date(now.getTime() + 60 * 1000)

    const tab = {
      id: 1,
      query: 'select * from foo',
      viewType: 'chart',
      viewOptions: [],
      name: null,
      dataView: {
        getOptionsForSave () {
          return ['chart']
        }
      }
    }
    const state = {
      inquiries: [],
      tabs: [tab]
    }

    const value = await saveInquiry({ state }, {
      inquiryTab: tab,
      newName: 'foo'
    })
    expect(value.id).to.equal(tab.id)
    expect(value.name).to.equal('foo')
    expect(value.query).to.equal(tab.query)
    expect(value.viewOptions).to.eql(['chart'])
    expect(value).to.have.property('createdAt').which.within(now, nowPlusMinute)
    expect(state.inquiries).to.eql([value])
  })

  it('save updates existing inquiry in the storage', async () => {
    const tab = {
      id: 1,
      query: 'select * from foo',
      viewType: 'chart',
      viewOptions: [],
      name: null,
      dataView: {
        getOptionsForSave () {
          return ['chart']
        }
      }
    }

    const state = {
      inquiries: [],
      tabs: [tab]
    }

    const first = await saveInquiry({ state }, {
      inquiryTab: tab,
      newName: 'foo'
    })

    tab.name = 'foo'
    tab.query = 'select * from foo'
    await saveInquiry({ state }, { inquiryTab: tab })
    const inquiries = state.inquiries
    const second = inquiries[0]
    expect(inquiries).has.lengthOf(1)
    expect(second.id).to.equal(first.id)
    expect(second.name).to.equal(first.name)
    expect(second.query).to.equal(tab.query)
    expect(second.viewOptions).to.eql(['chart'])
    expect(new Date(second.createdAt).getTime()).to.equal(first.createdAt.getTime())
  })

  it("save adds a new inquiry with new id if it's based on predefined inquiry", async () => {
    const now = new Date()
    const nowPlusMinute = new Date(now.getTime() + 60 * 1000)
    const tab = {
      id: 1,
      query: 'select * from foo',
      viewType: 'chart',
      viewOptions: [],
      name: 'foo predefined',
      dataView: {
        getOptionsForSave () {
          return ['chart']
        }
      },
      isPredefined: true
    }

    const state = {
      inquiries: [],
      tabs: [tab]
    }

    await saveInquiry({ state }, {
      inquiryTab: tab,
      newName: 'foo'
    })

    const inquiries = state.inquiries
    expect(inquiries).has.lengthOf(1)
    expect(inquiries[0]).to.have.property('id').which.not.equal(tab.id)
    expect(inquiries[0].name).to.equal('foo')
    expect(inquiries[0].query).to.equal(tab.query)
    expect(inquiries[0].viewOptions).to.eql(['chart'])
    expect(new Date(inquiries[0].createdAt)).to.be.within(now, nowPlusMinute)
  })
})
