import { expect } from 'chai'
import actions from '@/store/actions'

const { addTab } = actions

describe('actions', () => {
  it('addTab adds new blank tab', async () => {
    const state = {
      tabs: [],
      untitledLastIndex: 0
    }

    const id = await addTab({ state })
    expect(state.tabs[0].id).to.eql(id)
    expect(state.tabs[0].name).to.eql(null)
    expect(state.tabs[0].tempName).to.eql('Untitled')
    expect(state.tabs[0].isUnsaved).to.eql(true)
    expect(state.untitledLastIndex).to.equal(1)
  })

  it('addTab adds tab from saved inquiries', async () => {
    const state = {
      tabs: [],
      untitledLastIndex: 0
    }
    const tab = {
      id: 1,
      name: 'test',
      tempName: null,
      query: 'SELECT * from foo',
      viewType: 'chart',
      viewOptions: {},
      isUnsaved: false
    }
    await addTab({ state }, tab)
    expect(state.tabs[0]).to.eql(tab)
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
      isUnsaved: false
    }

    const tab2 = {
      id: 2,
      name: 'bar',
      tempName: null,
      query: 'SELECT * from bar',
      viewType: 'chart',
      viewOptions: {},
      isUnsaved: false
    }

    const state = {
      tabs: [tab1, tab2],
      untitledLastIndex: 0
    }

    await addTab({ state }, tab1)
    expect(state.tabs).to.have.lengthOf(2)
    expect(state.untitledLastIndex).to.equal(0)
  })
})
