import { expect } from 'chai'
import { mount } from '@vue/test-utils'
import Pivot from '@/views/Main/Workspace/Tabs/Tab/DataView/Pivot'
import chartHelper from '@/lib/chartHelper'
import fIo from '@/lib/utils/fileIo'
import $ from 'jquery'
import sinon from 'sinon'
import pivotHelper from '@/views/Main/Workspace/Tabs/Tab/DataView/Pivot/pivotHelper'

describe('Pivot.vue', () => {
  let container
  const $store = { state: { isWorkspaceVisible: true } }

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    container.remove()
    sinon.restore()
  })

  it('renders pivot table', () => {
    const wrapper = mount(Pivot, {
      props: {
        dataSources: {
          item: ['foo', 'bar', 'bar', 'bar'],
          year: [2021, 2021, 2020, 2020]
        },
        initOptions: {
          rows: ['item'],
          cols: ['year'],
          colOrder: 'key_a_to_z',
          rowOrder: 'key_a_to_z',
          aggregatorName: 'Count',
          vals: [],
          rendererName: 'Table'
        }
      },
      global: {
        stubs: { 'chart': true }
      }
    })
    const colLabels = wrapper.findAll('.pivot-output thead th.pvtColLabel')
    expect(colLabels[0].text()).to.equal('2020')
    expect(colLabels[1].text()).to.equal('2021')
    const rows = wrapper.findAll('.pivot-output tbody tr')
    // row0: bar - 2 - 1
    expect(rows[0].find('th').text()).to.equal('bar')
    expect(rows[0].find('td.col0').text()).to.equal('2')
    expect(rows[0].find('td.col1').text()).to.equal('1')
    expect(rows[0].find('td.rowTotal').text()).to.equal('3')

    // row1: foo -  - 2
    expect(rows[1].find('th').text()).to.equal('foo')
    expect(rows[1].find('td.col0').text()).to.equal('')
    expect(rows[1].find('td.col1').text()).to.equal('1')
    expect(rows[1].find('td.rowTotal').text()).to.equal('1')
  })

  it('updates when dataSource changes', async () => {
    const wrapper = mount(Pivot, {
      props: {
        dataSources: {
          item: ['foo', 'bar', 'bar', 'bar'],
          year: [2021, 2021, 2020, 2020]
        },
        initOptions: {
          rows: ['item'],
          cols: ['year'],
          colOrder: 'key_a_to_z',
          rowOrder: 'key_a_to_z',
          aggregatorName: 'Count',
          vals: [],
          rendererName: 'Table'
        }
      },
      global: {
        stubs: { 'chart': true }
      }
    })

    await wrapper.setProps({
      dataSources: {
        item: ['foo', 'bar', 'bar', 'bar', 'foo', 'baz'],
        year: [2021, 2021, 2020, 2020, 2021, 2020]
      }
    })

    const colLabels = wrapper.findAll('.pivot-output thead th.pvtColLabel')
    expect(colLabels[0].text()).to.equal('2020')
    expect(colLabels[1].text()).to.equal('2021')
    const rows = wrapper.findAll('.pivot-output tbody tr')
    // row0: bar - 2 - 1
    expect(rows[0].find('th').text()).to.equal('bar')
    expect(rows[0].find('td.col0').text()).to.equal('2')
    expect(rows[0].find('td.col1').text()).to.equal('1')
    expect(rows[0].find('td.rowTotal').text()).to.equal('3')

    // row1: baz - 1 -
    expect(rows[1].find('th').text()).to.equal('baz')
    expect(rows[1].find('td.col0').text()).to.equal('1')
    expect(rows[1].find('td.col1').text()).to.equal('')
    expect(rows[1].find('td.rowTotal').text()).to.equal('1')

    // row2: foo -  - 2
    expect(rows[2].find('th').text()).to.equal('foo')
    expect(rows[2].find('td.col0').text()).to.equal('')
    expect(rows[2].find('td.col1').text()).to.equal('2')
    expect(rows[2].find('td.rowTotal').text()).to.equal('2')
  })

  it('returns options for save', async () => {
    const wrapper = mount(Pivot, {
      props: {
        dataSources: {
          item: ['foo', 'bar', 'bar', 'bar'],
          year: [2021, 2021, 2020, 2020]
        },
        initOptions: {
          rows: ['item'],
          cols: ['year'],
          colOrder: 'key_a_to_z',
          rowOrder: 'key_a_to_z',
          aggregatorName: 'Count',
          vals: [],
          rendererName: 'Table'
        }
      },
      global: {
        mocks: { $store }
      }
    })

    await wrapper.findComponent({ name: 'pivotUi' }).setValue({
      rows: ['year'],
      cols: ['item'],
      colOrder: 'value_a_to_z',
      rowOrder: 'value_z_to_a',
      aggregator: $.pivotUtilities.aggregators.Count(),
      aggregatorName: 'Count',
      renderer: $.pivotUtilities.renderers.Table,
      rendererName: 'Table',
      vals: []
    })
    sinon.stub(wrapper.findComponent({ref: "customChart"}).vm, 'getOptionsForSave')
      .returns({ here_are: 'custom chart settings' })

    let optionsForSave = wrapper.vm.getOptionsForSave()

    expect(optionsForSave.rows).to.eql(['year'])
    expect(optionsForSave.cols).to.eql(['item'])
    expect(optionsForSave.colOrder).to.equal('value_a_to_z')
    expect(optionsForSave.rowOrder).to.equal('value_z_to_a')
    expect(optionsForSave.aggregatorName).to.equal('Count')
    expect(optionsForSave.rendererName).to.equal('Table')
    expect(optionsForSave.rendererOptions).to.equal(undefined)
    expect(optionsForSave.vals).to.eql([])

    await wrapper.findComponent({ name: 'pivotUi' }).setValue({
      rows: ['item'],
      cols: ['year'],
      colOrder: 'value_a_to_z',
      rowOrder: 'value_z_to_a',
      aggregator: $.pivotUtilities.aggregators.Count(),
      aggregatorName: 'Count',
      renderer: $.pivotUtilities.renderers['Custom chart'],
      rendererName: 'Custom chart',
      vals: []
    })

    optionsForSave = wrapper.vm.getOptionsForSave()
    expect(optionsForSave.rows).to.eql(['item'])
    expect(optionsForSave.cols).to.eql(['year'])
    expect(optionsForSave.colOrder).to.equal('value_a_to_z')
    expect(optionsForSave.rowOrder).to.equal('value_z_to_a')
    expect(optionsForSave.aggregatorName).to.equal('Count')
    expect(optionsForSave.rendererName).to.equal('Custom chart')
    expect(optionsForSave.rendererOptions).to.eql({
      customChartOptions: { here_are: 'custom chart settings' }
    })
    expect(optionsForSave.vals).to.eql([])
  })

  it('prepareCopy returns canvas for tables and url for plotly charts', async () => {
    const wrapper = mount(Pivot, {
      props: {
        dataSources: {
          item: ['foo', 'bar', 'bar', 'bar'],
          year: [2021, 2021, 2020, 2020]
        },
        initOptions: {
          rows: ['item'],
          cols: ['year'],
          colOrder: 'key_a_to_z',
          rowOrder: 'key_a_to_z',
          aggregatorName: 'Count',
          vals: [],
          rendererName: 'Table'
        }
      },
      attachTo: container,
      global: {
        mocks: { $store }
      }
    })

    expect(await wrapper.vm.prepareCopy()).to.be.instanceof(HTMLCanvasElement)

    sinon.stub(wrapper.findComponent({ref: "customChart"}).vm, 'prepareCopy')
      .returns(URL.createObjectURL(new Blob()))

    await wrapper.findComponent({ name: 'pivotUi' }).setValue({
      rows: ['item'],
      cols: ['year'],
      colOrder: 'value_a_to_z',
      rowOrder: 'value_z_to_a',
      aggregator: $.pivotUtilities.aggregators.Count(),
      aggregatorName: 'Count',
      renderer: $.pivotUtilities.renderers['Custom chart'],
      rendererName: 'Custom chart',
      vals: []
    })

    expect(await wrapper.vm.prepareCopy()).to.be.a('string')

    await wrapper.findComponent({ name: 'pivotUi' }).setValue({
      rows: ['item'],
      cols: ['year'],
      colOrder: 'value_a_to_z',
      rowOrder: 'value_z_to_a',
      aggregator: $.pivotUtilities.aggregators.Count(),
      aggregatorName: 'Count',
      renderer: $.pivotUtilities.renderers['Bar Chart'],
      rendererName: 'Bar Chart',
      vals: []
    })

    expect(await wrapper.vm.prepareCopy()).to.be.a('string')
  })

  it('saveAsSvg calls chart method if renderer is Custom Chart', async () => {
    const wrapper = mount(Pivot, {
      props: {
        dataSources: {
          item: ['foo', 'bar', 'bar', 'bar'],
          year: [2021, 2021, 2020, 2020]
        },
        initOptions: {
          rows: ['item'],
          cols: ['year'],
          colOrder: 'key_a_to_z',
          rowOrder: 'key_a_to_z',
          aggregatorName: 'Count',
          vals: [],
          renderer: $.pivotUtilities.renderers['Custom chart'],
          rendererName: 'Custom chart',
          rendererOptions: {
            customChartOptions: {
              data: [],
              layout: {},
              frames: []
            }
          }
        }
      },
      attachTo: container,
      global: {
        mocks: { $store }
      }
    })

    const chartComponent = wrapper.findComponent({ref: "customChart"}).vm
    sinon.stub(chartComponent, 'saveAsSvg')

    await wrapper.vm.saveAsSvg()
    expect(chartComponent.saveAsSvg.called).to.equal(true)
  })

  it('saveAsHtml calls chart method if renderer is Custom Chart', async () => {
    const wrapper = mount(Pivot, {
      props: {
        dataSources: {
          item: ['foo', 'bar', 'bar', 'bar'],
          year: [2021, 2021, 2020, 2020]
        },
        initOptions: {
          rows: ['item'],
          cols: ['year'],
          colOrder: 'key_a_to_z',
          rowOrder: 'key_a_to_z',
          aggregatorName: 'Count',
          vals: [],
          renderer: $.pivotUtilities.renderers['Custom chart'],
          rendererName: 'Custom chart',
          rendererOptions: {
            customChartOptions: {
              data: [],
              layout: {},
              frames: []
            }
          }
        }
      },
      attachTo: container,
      global: {
        mocks: { $store }
      }
    })

    const chartComponent = wrapper.findComponent({ref: "customChart"}).vm
    sinon.stub(chartComponent, 'saveAsHtml')

    await wrapper.vm.saveAsHtml()
    expect(chartComponent.saveAsHtml.called).to.equal(true)
  })

  it('saveAsPng calls chart method if renderer is Custom Chart', async () => {
    const wrapper = mount(Pivot, {
      props: {
        dataSources: {
          item: ['foo', 'bar', 'bar', 'bar'],
          year: [2021, 2021, 2020, 2020]
        },
        initOptions: {
          rows: ['item'],
          cols: ['year'],
          colOrder: 'key_a_to_z',
          rowOrder: 'key_a_to_z',
          aggregatorName: 'Count',
          vals: [],
          renderer: $.pivotUtilities.renderers['Custom chart'],
          rendererName: 'Custom chart',
          rendererOptions: {
            customChartOptions: {
              data: [],
              layout: {},
              frames: []
            }
          }
        }
      },
      attachTo: container,
      global: {
        mocks: { $store }
      }
    })

    const chartComponent = wrapper.findComponent({ref: "customChart"}).vm
    sinon.stub(chartComponent, 'saveAsPng')

    await wrapper.vm.saveAsPng()
    expect(chartComponent.saveAsPng.called).to.equal(true)
  })

  it('saveAsSvg - standart chart', async () => {
    sinon.spy(chartHelper, 'getImageDataUrl')

    const wrapper = mount(Pivot, {
      props: {
        dataSources: {
          item: ['foo', 'bar', 'bar', 'bar'],
          year: [2021, 2021, 2020, 2020]
        },
        initOptions: {
          rows: ['item'],
          cols: ['year'],
          colOrder: 'key_a_to_z',
          rowOrder: 'key_a_to_z',
          aggregatorName: 'Count',
          vals: [],
          renderer: $.pivotUtilities.renderers['Bar Chart'],
          rendererName: 'Bar Chart'
        }
      },
      attachTo: container,
      global: {
        stubs: { 'chart': true }
      }
    })

    await wrapper.vm.saveAsSvg()
    expect(chartHelper.getImageDataUrl.calledOnce).to.equal(true)
  })

  it('saveAsHtml - standart chart', async () => {
    sinon.spy(chartHelper, 'getChartData')
    sinon.spy(chartHelper, 'getHtml')

    const wrapper = mount(Pivot, {
      props: {
        dataSources: {
          item: ['foo', 'bar', 'bar', 'bar'],
          year: [2021, 2021, 2020, 2020]
        },
        initOptions: {
          rows: ['item'],
          cols: ['year'],
          colOrder: 'key_a_to_z',
          rowOrder: 'key_a_to_z',
          aggregatorName: 'Count',
          vals: [],
          renderer: $.pivotUtilities.renderers['Bar Chart'],
          rendererName: 'Bar Chart'
        }
      },
      attachTo: container,
      global: {
        stubs: { 'chart': true }
      }
    })

    await wrapper.vm.saveAsHtml()
    expect(chartHelper.getChartData.calledOnce).to.equal(true)
    const chartData = await chartHelper.getChartData.returnValues[0]
    expect(chartHelper.getHtml.calledOnceWith(chartData)).to.equal(true)
  })

  it('saveAsHtml - table', async () => {
    sinon.stub(pivotHelper, 'getPivotHtml')
    sinon.stub(fIo, 'exportToFile')

    const wrapper = mount(Pivot, {
      props: {
        dataSources: {
          item: ['foo', 'bar', 'bar', 'bar'],
          year: [2021, 2021, 2020, 2020]
        },
        initOptions: {
          rows: ['item'],
          cols: ['year'],
          colOrder: 'key_a_to_z',
          rowOrder: 'key_a_to_z',
          aggregatorName: 'Count',
          vals: [],
          renderer: $.pivotUtilities.renderers.Table,
          rendererName: 'Table'
        }
      },
      attachTo: container,
      global: {
        stubs: { 'chart': true }
      }
    })

    await wrapper.vm.saveAsHtml()
    expect(pivotHelper.getPivotHtml.calledOnce).to.equal(true)
    const html = pivotHelper.getPivotHtml.returnValues[0]
    expect(fIo.exportToFile.calledOnceWith(html, 'pivot.html', 'text/html')).to.equal(true)
  })

  it('saveAsPng - standart chart', async () => {
    sinon.stub(chartHelper, 'getImageDataUrl').returns('standat chart data url')
    sinon.stub(fIo, 'downloadFromUrl')

    const wrapper = mount(Pivot, {
      props: {
        dataSources: {
          item: ['foo', 'bar', 'bar', 'bar'],
          year: [2021, 2021, 2020, 2020]
        },
        initOptions: {
          rows: ['item'],
          cols: ['year'],
          colOrder: 'key_a_to_z',
          rowOrder: 'key_a_to_z',
          aggregatorName: 'Count',
          vals: [],
          renderer: $.pivotUtilities.renderers['Bar Chart'],
          rendererName: 'Bar Chart'
        }
      },
      attachTo: container,
      global: {
        stubs: { 'chart': true }
      }
    })

    await wrapper.vm.saveAsPng()
    expect(chartHelper.getImageDataUrl.calledOnce).to.equal(true)
    await chartHelper.getImageDataUrl.returnValues[0]
    expect(wrapper.emitted().loadingImageCompleted.length).to.equal(1)
    expect(fIo.downloadFromUrl.calledOnceWith('standat chart data url', 'pivot')).to.equal(true)
  })

  it('saveAsPng - table', async () => {
    sinon.stub(pivotHelper, 'getPivotCanvas').returns(document.createElement('canvas'))
    sinon.stub(HTMLCanvasElement.prototype, 'toDataURL').returns('canvas data url')
    sinon.stub(fIo, 'downloadFromUrl')

    const wrapper = mount(Pivot, {
      props: {
        dataSources: {
          item: ['foo', 'bar', 'bar', 'bar'],
          year: [2021, 2021, 2020, 2020]
        },
        initOptions: {
          rows: ['item'],
          cols: ['year'],
          colOrder: 'key_a_to_z',
          rowOrder: 'key_a_to_z',
          aggregatorName: 'Count',
          vals: [],
          renderer: $.pivotUtilities.renderers.Table,
          rendererName: 'Table'
        }
      },
      attachTo: container,
      global: {
        stubs: { 'chart': true }
      }
    })

    await wrapper.vm.saveAsPng()
    expect(HTMLCanvasElement.prototype.toDataURL.calledOnce).to.equal(true)
    await HTMLCanvasElement.prototype.toDataURL.returnValues[0]
    expect(wrapper.emitted().loadingImageCompleted.length).to.equal(1)
    expect(fIo.downloadFromUrl.calledOnceWith('canvas data url', 'pivot')).to.equal(true)
  })
})
