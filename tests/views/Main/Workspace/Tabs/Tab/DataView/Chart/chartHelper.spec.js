import { expect } from 'chai'
import sinon from 'sinon'
import * as chartHelper from '@/views/Main/Workspace/Tabs/Tab/DataView/Chart/chartHelper'
import * as dereference from 'react-chart-editor/lib/lib/dereference'

describe('chartHelper.js', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('getOptionsFromDataSources', () => {
    const dataSources = {
      id: [1, 2],
      name: ['foo', 'bar']
    }

    const ds = chartHelper.getOptionsFromDataSources(dataSources)
    expect(ds).to.eql([
      { value: 'id', label: 'id' },
      { value: 'name', label: 'name' }
    ])
  })

  it('getOptionsForSave', () => {
    const state = {
      data: {
        foo: {},
        bar: {}
      },
      layout: {},
      frames: {}
    }
    const dataSources = {
      id: [1, 2],
      name: ['foo', 'bar']
    }
    sinon.stub(dereference, 'default')
    sinon.spy(JSON, 'parse')

    const ds = chartHelper.getOptionsForSave(state, dataSources)

    expect(dereference.default.calledOnce).to.equal(true)

    const args = dereference.default.firstCall.args
    expect(args[0]).to.eql({
      foo: {},
      bar: {}
    })
    expect(args[1]).to.eql({
      id: [],
      name: []
    })

    expect(ds).to.equal(JSON.parse.returnValues[0])
  })
})
