import { expect } from 'chai'
import sinon from 'sinon'
import * as chart from '@/chart'
import * as dereference from 'react-chart-editor/lib/lib/dereference'

describe('chart.js', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('getDataSourcesFromSqlResult', () => {
    const sqlResult = {
      columns: ['id', 'name'],
      values: [
        [1, 'foo'],
        [2, 'bar']
      ]
    }

    const ds = chart.getDataSourcesFromSqlResult(sqlResult)
    expect(ds).to.eql({
      id: [1, 2],
      name: ['foo', 'bar']
    })
  })

  it('getOptionsFromDataSources', () => {
    const dataSources = {
      id: [1, 2],
      name: ['foo', 'bar']
    }

    const ds = chart.getOptionsFromDataSources(dataSources)
    expect(ds).to.eql([
      { value: 'id', label: 'id' },
      { value: 'name', label: 'name' }
    ])
  })

  it('getChartStateForSave', () => {
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

    const ds = chart.getChartStateForSave(state, dataSources)

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
