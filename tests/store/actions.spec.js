import { expect } from 'chai'
import actions from '@/store/actions'

const { 
  addTab, 
  addInquiry,
  deleteInquiries,
  renameInquiry 
} = actions

describe('actions', () => {
  it('addTab adds new blank tab', async () => {
    const state = {
      tabs: [],
      untitledLastIndex: 0
    }

    let id = await addTab({ state })
    expect(state.tabs[0]).to.include({
      id: id,
      name: null,
      tempName: 'Untitled',
      viewType: 'chart',
      viewOptions: undefined,
      isSaved: false
    })
    expect(state.untitledLastIndex).to.equal(1)

    id = await addTab({ state })
    expect(state.tabs[1]).to.include({
      id: id,
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
      inquiries: [1,2,3]
    }

    await addInquiry({ state }, 4)
    expect(state.inquiries).to.eql([1,2,3,4])
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
        { id: 1, name: 'foo'}, 
        { id: 2, name: 'bar' }, 
        { id: 3, name: 'baz' }, 
      ],
      tabs: [{ id: 1, name: 'foo'}, { id: 2, name: 'bar' }]
    }
    const commit = sinon.spy()

    await renameInquiry({ state, commit }, {inquiryId: 2, newName: 'new name'})
    expect(state.inquiries).to.eql([
      { id: 1, name: 'foo'}, 
      { id: 2, name: 'new name' }, 
      { id: 3, name: 'baz' }, 
    ])
    expect(commit.calledWith('updateTab', {
      tab: { id: 2, name: 'bar' },
      newValues: {
        name: 'new name'
      }
    })).to.equal(true)
  })
})
