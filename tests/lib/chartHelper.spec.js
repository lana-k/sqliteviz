import { expect } from 'chai'
import sinon from 'sinon'
import * as chartHelper from '@/lib/chartHelper'
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

  it('getImageDataUrl returns dataUrl', async () => {
    const element = document.createElement('div')
    const child = document.createElement('div')
    element.append(child)
    child.classList.add('js-plotly-plot')

    let url = await chartHelper.getImageDataUrl(element, 'png')
    expect(/^data:image\/png/.test(url)).to.equal(true)

    url = await chartHelper.getImageDataUrl(element, 'svg')
    expect(/^data:image\/svg\+xml/.test(url)).to.equal(true)
  })

  it('getChartData returns plotly data and layout from element', async () => {
    const element = document.createElement('div')
    const child = document.createElement('div')
    element.append(child)
    child.classList.add('js-plotly-plot')
    child.data = 'plotly data'
    child.layout = 'plotly layout'

    const chartData = chartHelper.getChartData(element)
    expect(chartData).to.eql({
      data: 'plotly data',
      layout: 'plotly layout'
    })
  })

  it('getHtml returns valid html', async () => {
    const options = {
      data: 'plotly data',
      layout: 'plotly layout'
    }

    const html = chartHelper.getHtml(options)
    const doc = document.createElement('div')
    doc.innerHTML = html

    expect(doc.innerHTML).to.equal(html)
    expect(doc.children).to.have.lengthOf(3)
    expect(doc.children[0].src).to.includes('plotly-latest.js')
    expect(doc.children[1].id).to.have.lengthOf(21)
    expect(doc.children[2].innerHTML).to.includes(doc.children[1].id)
    expect(doc.children[2].innerHTML)
      .to.includes('Plotly.newPlot(el, "plotly data", "plotly layout"')
  })
})
