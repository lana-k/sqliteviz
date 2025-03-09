import { expect } from 'chai'
import sinon from 'sinon'
import { createStore } from 'vuex'
import { mount } from '@vue/test-utils'
import CsvJsonImport from '@/components/CsvJsonImport'
import csv from '@/lib/csv'
import { nextTick } from 'vue'


describe('CsvJsonImport.vue', () => {
  let state = {}
  let actions = {}
  let mutations = {}
  let clock
  let wrapper
  const newTabId = 1
  const file = new File([], 'my data.csv')

  beforeEach(() => {
    clock = sinon.useFakeTimers()

    // mock store state and mutations
    state = {}
    mutations = {
      setDb: sinon.stub(),
      setCurrentTabId: sinon.stub()
    }
    actions = {
      addTab: sinon.stub().resolves(newTabId)
    }
    const store = createStore({ state, mutations, actions })

    const db = {
      sanitizeTableName: sinon.stub().returns('my_data'),
      addTableFromCsv: sinon.stub().resolves(),
      createProgressCounter: sinon.stub().returns(1),
      deleteProgressCounter: sinon.stub(),
      validateTableName: sinon.stub().resolves(),
      execute: sinon.stub().resolves(),
      refreshSchema: sinon.stub().resolves()
    }

    // mount the component
    wrapper = mount(CsvJsonImport, {
      global: {
        plugins: [store],
        stubs: {
          teleport: true,
          transition: false
        }
      },
      props: {
        file,
        dialogName: 'addCsvJson',
        db
      },
      attachTo: document.body
    })
  })

  afterEach(() => {
    sinon.restore()
    wrapper.unmount()
  })

  it('previews', async () => {
    sinon.stub(csv, 'parse').resolves({
      delimiter: '|',
      data: {
        columns: ['col2', 'col1'],
        values: {
          col1: [1, 2],
          col2: ['foo', 'bar']
        }
      },
      rowCount: 2,
      messages: [{
        code: 'UndetectableDelimiter',
        message: 'Comma was used as a standart delimiter',
        row: 0,
        type: 'info',
        hint: undefined
      }]
    })

    wrapper.vm.preview()
    await wrapper.vm.open()
    await nextTick()
    await nextTick()
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(true)
    expect(wrapper.find('.dialog-header').text()).to.equal('CSV import')
    expect(wrapper.find('#csv-json-table-name input').element.value).to.equal('my_data')
    expect(wrapper.findComponent({ name: 'delimiter-selector' }).props('modelValue')).to.equal('|')
    expect(wrapper.find('#quote-char input').element.value).to.equal('"')
    expect(wrapper.find('#escape-char input').element.value).to.equal('"')
    expect(wrapper.findComponent({ name: 'check-box' }).vm.checked).to.equal(true)
    const rows = wrapper.findAll('tbody tr')
    expect(rows).to.have.lengthOf(2)
    expect(rows[0].findAll('td')[0].text()).to.equal('foo')
    expect(rows[0].findAll('td')[1].text()).to.equal('1')
    expect(rows[1].findAll('td')[0].text()).to.equal('bar')
    expect(rows[1].findAll('td')[1].text()).to.equal('2')
    expect(wrapper.findComponent({ name: 'logs' }).text())
      .to.include('Information about row 0. Comma was used as a standart delimiter.')
    expect(wrapper.findComponent({ name: 'logs' }).text())
      .to.include('Preview parsing is completed in')
    expect(wrapper.find('#import-finish').isVisible()).to.equal(false)
    expect(wrapper.find('#import-start').isVisible()).to.equal(true)
    expect(wrapper.find('#import-start').attributes().disabled).to.equal(undefined)
  })

  it('disables import if no rows found', async () => {
    sinon.stub(csv, 'parse').resolves({
      delimiter: '|',
      data: {
        columns: ['col2', 'col1'],
        values: {
          col1: [],
          col2: []
        }
      },
      rowCount: 0,
      messages: []
    })

    await wrapper.vm.preview()
    await wrapper.vm.open()
    await nextTick()
    await nextTick()
    const rows = wrapper.findAll('tbody tr')
    expect(rows).to.have.lengthOf(0)
    expect(wrapper.findComponent({ name: 'logs' }).text())
      .to.include('No rows to import.')
    expect(wrapper.find('.no-data').isVisible()).to.equal(true)
    expect(wrapper.find('#import-finish').isVisible()).to.equal(false)
    expect(wrapper.find('#import-start').isVisible()).to.equal(true)
    expect(wrapper.find('#import-start').attributes().disabled).to.equal('')
  })

  it('reparses when parameters changes', async () => {
    const parse = sinon.stub(csv, 'parse')
    parse.onCall(0).resolves({
      delimiter: '|',
      data: {
        columns: ['col2', 'col1'],
        values: {
          col1: [1],
          col2: ['foo']
        }
      },
      rowCount: 1
    })

    wrapper.vm.preview()
    wrapper.vm.open()
    await csv.parse.returnValues[0]
    await nextTick()
    await nextTick()

    parse.onCall(1).resolves({
      delimiter: ',',
      data: {
        columns: ['col2', 'col1'],
        values: {
          col1: [2],
          col2: ['bar']
        }
      },
      rowCount: 1,
      hasErrors: false
    })
    await wrapper.find('.delimiter-selector-container input').setValue(',')
    expect(parse.callCount).to.equal(2)
    await csv.parse.returnValues[1]

    let rows = wrapper.findAll('tbody tr')
    expect(rows).to.have.lengthOf(1)
    expect(rows[0].findAll('td')[0].text()).to.equal('bar')
    expect(rows[0].findAll('td')[1].text()).to.equal('2')
    expect(wrapper.findComponent({ name: 'logs' }).text())
      .to.include('Preview parsing is completed in')

    parse.onCall(2).resolves({
      delimiter: ',',
      data: {
        columns: ['col2', 'col1'],
        values: {
          col1: [3],
          col2: ['baz']
        }
      },
      rowCount: 1,
      hasErrors: true,
      messages: [{
        code: 'MissingQuotes',
        message: 'Quote is missed',
        row: 0,
        type: 'error',
        hint: 'Edit your CSV so that the field has a closing quote char.'
      }]
    })

    await wrapper.find('#quote-char input').setValue("'")
    expect(parse.callCount).to.equal(3)
    await csv.parse.returnValues[2]
    rows = wrapper.findAll('tbody tr')
    expect(rows).to.have.lengthOf(1)
    expect(rows[0].findAll('td')[0].text()).to.equal('baz')
    expect(rows[0].findAll('td')[1].text()).to.equal('3')
    expect(wrapper.findComponent({ name: 'logs' }).text())
      .to.contain(
        'Error in row 0. Quote is missed. ' +
        'Edit your CSV so that the field has a closing quote char.'
      )
    expect(wrapper.findComponent({ name: 'logs' }).text())
      .to.not.contain('Preview parsing is completed in')

    parse.onCall(3).resolves({
      delimiter: ',',
      data: {
        columns: ['col2', 'col1'],
        values: {
          col1: [4],
          col2: ['qux']
        }
      },
      rowCount: 1,
      hasErrors: false
    })
    await wrapper.find('#escape-char input').setValue("'")
    expect(parse.callCount).to.equal(4)
    await csv.parse.returnValues[3]
    rows = wrapper.findAll('tbody tr')
    expect(rows).to.have.lengthOf(1)
    expect(rows[0].findAll('td')[0].text()).to.equal('qux')
    expect(rows[0].findAll('td')[1].text()).to.equal('4')
    expect(wrapper.findComponent({ name: 'logs' }).text())
      .to.contain('Preview parsing is completed in')

    parse.onCall(4).resolves({
      delimiter: ',',
      data: {
        columns: ['col2', 'col1'],
        values: {
          col1: [5],
          col2: ['corge']
        }
      },
      rowCount: 1,
      hasErrors: false
    })
    await wrapper.findComponent({ name: 'check-box' }).trigger('click')
    expect(parse.callCount).to.equal(5)
    await csv.parse.returnValues[4]
    rows = wrapper.findAll('tbody tr')
    expect(rows).to.have.lengthOf(1)
    expect(rows[0].findAll('td')[0].text()).to.equal('corge')
    expect(rows[0].findAll('td')[1].text()).to.equal('5')

    expect(wrapper.findComponent({ name: 'logs' }).text())
      .to.include('Preview parsing is completed in')
  })

  it('has proper state before parsing is complete', async () => {
    const parse = sinon.stub(csv, 'parse')
    parse.onCall(0).resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: {
          col1: [1],
          col2: ['foo']
        }
      },
      rowCount: 1,
      messages: []
    })

    wrapper.vm.preview()
    wrapper.vm.open()
    await nextTick()
    await nextTick()

    let resolveParsing
    parse.onCall(1).returns(new Promise(resolve => {
      resolveParsing = () => resolve({
        delimiter: '|',
        data: {
          columns: ['col1', 'col2'],
          values: {
            col1: [1],
            col2: ['foo']
          }
        },
        rowCount: 1,
        messages: []
      })
    }))

    await wrapper.find('#csv-json-table-name input').setValue('foo')
    await wrapper.find('#import-start').trigger('click')

    // "Parsing CSV..." in the logs
    expect(wrapper.findComponent({ name: 'logs' }).findAll('.msg')[1].text())
      .to.equal('Parsing CSV...')

    // After 1 second - loading indicator is shown
    await clock.tick(1000)
    expect(
      wrapper.findComponent({ name: 'logs' }).findComponent({ name: 'LoadingIndicator' }).exists()
    ).to.equal(true)

    // All the dialog controls are disabled
    expect(wrapper.findComponent({ name: 'delimiter-selector' }).vm.disabled).to.equal(true)
    expect(wrapper.find('#quote-char input').element.disabled).to.equal(true)
    expect(wrapper.find('#escape-char input').element.disabled).to.equal(true)
    expect(wrapper.findComponent({ name: 'check-box' }).vm.disabled).to.equal(true)
    expect(wrapper.find('#import-cancel').element.disabled).to.equal(true)
    expect(wrapper.find('#import-finish').element.disabled).to.equal(true)
    expect(wrapper.findComponent({ name: 'close-icon' }).vm.disabled).to.equal(true)
    expect(wrapper.find('#import-finish').isVisible()).to.equal(false)
    expect(wrapper.find('#import-start').isVisible()).to.equal(true)
    await resolveParsing()
    await parse.returnValues[1]

    // Loading indicator is not shown when parsing is compete
    expect(
      wrapper.findComponent({ name: 'logs' }).findComponent({ name: 'LoadingIndicator' }).exists()
    ).to.equal(false)
  })

  it('parsing is completed successfully', async () => {
    const parse = sinon.stub(csv, 'parse')
    parse.onCall(0).resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: {
          col1: [1],
          col2: ['foo']
        }
      },
      rowCount: 1,
      hasErrors: false,
      messages: []
    })

    parse.onCall(1).resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: {
          col1: [1, 2],
          col2: ['foo', 'bar']
        }
      },
      rowCount: 2,
      hasErrors: false,
      messages: []
    })

    wrapper.vm.preview()
    wrapper.vm.open()
    await nextTick()
    await nextTick()

    let resolveImport
    wrapper.vm.db.addTableFromCsv.onCall(0).returns(new Promise(resolve => {
      resolveImport = resolve
    }))

    await wrapper.find('#csv-json-table-name input').setValue('foo')
    await wrapper.find('#import-start').trigger('click')
    await csv.parse.returnValues[1]

    // Parsing success in the logs
    expect(wrapper.findComponent({ name: 'logs' }).findAll('.msg')[1].text())
      .to.include('2 rows are parsed successfully in')

    // All the dialog controls are disabled
    expect(wrapper.findComponent({ name: 'delimiter-selector' }).vm.disabled).to.equal(true)
    expect(wrapper.find('#quote-char input').element.disabled).to.equal(true)
    expect(wrapper.find('#escape-char input').element.disabled).to.equal(true)
    expect(wrapper.findComponent({ name: 'check-box' }).vm.disabled).to.equal(true)
    expect(wrapper.find('#import-cancel').element.disabled).to.equal(true)
    expect(wrapper.find('#import-finish').element.disabled).to.equal(true)
    expect(wrapper.findComponent({ name: 'close-icon' }).vm.disabled).to.equal(true)
    expect(wrapper.find('#import-finish').isVisible()).to.equal(false)
    expect(wrapper.find('#import-start').isVisible()).to.equal(true)
    await resolveImport()
  })

  it('parsing is completed with notes', async () => {
    const parse = sinon.stub(csv, 'parse')
    parse.onCall(0).resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: {
          col1: [1],
          col2: ['foo']
        }
      },
      rowCount: 1,
      hasErrors: false,
      messages: []
    })

    parse.onCall(1).resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: {
          col1: [1, 2],
          col2: ['foo', 'bar']
        }
      },
      rowCount: 2,
      hasErrors: false,
      messages: [{
        code: 'UndetectableDelimiter',
        message: 'Comma was used as a standart delimiter',
        type: 'info',
        hint: undefined
      }]
    })

    let resolveImport
    wrapper.vm.db.addTableFromCsv.onCall(0).returns(new Promise(resolve => {
      resolveImport = resolve
    }))

    wrapper.vm.preview()
    wrapper.vm.open()
    await nextTick()
    await nextTick()

    await wrapper.find('#csv-json-table-name input').setValue('foo')
    await wrapper.find('#import-start').trigger('click')
    await csv.parse.returnValues[1]

    // Parsing success in the logs
    const logs = wrapper.findComponent({ name: 'logs' }).findAll('.msg')
    expect(logs).to.have.lengthOf(4)
    expect(logs[1].text()).to.include('2 rows are parsed in')
    expect(logs[2].text()).to.equals('Comma was used as a standart delimiter.')

    // All the dialog controls are disabled
    expect(wrapper.findComponent({ name: 'delimiter-selector' }).vm.disabled).to.equal(true)
    expect(wrapper.find('#quote-char input').element.disabled).to.equal(true)
    expect(wrapper.find('#escape-char input').element.disabled).to.equal(true)
    expect(wrapper.findComponent({ name: 'check-box' }).vm.disabled).to.equal(true)
    expect(wrapper.find('#import-cancel').element.disabled).to.equal(true)
    expect(wrapper.find('#import-finish').element.disabled).to.equal(true)
    expect(wrapper.findComponent({ name: 'close-icon' }).vm.disabled).to.equal(true)
    expect(wrapper.find('#import-finish').isVisible()).to.equal(false)
    expect(wrapper.find('#import-start').isVisible()).to.equal(true)
    await resolveImport()
  })

  it('parsing is completed with errors', async () => {
    const parse = sinon.stub(csv, 'parse')
    parse.onCall(0).resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: {
          col1: [1],
          col2: ['foo']
        }
      },
      rowCount: 1,
      hasErrors: false,
      messages: []
    })

    parse.onCall(1).resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: {
          col1: [1, 2],
          col2: ['foo', 'bar']
        }
      },
      rowCount: 2,
      hasErrors: true,
      messages: [{
        code: 'Error',
        message: 'Something is wrong',
        type: 'error',
        hint: undefined
      }]
    })

    wrapper.vm.preview()
    wrapper.vm.open()
    await nextTick()
    await nextTick()

    await wrapper.find('#csv-json-table-name input').setValue('foo')
    await wrapper.find('#import-start').trigger('click')
    await csv.parse.returnValues[1]

    // Parsing success in the logs
    const logs = wrapper.findComponent({ name: 'logs' }).findAll('.msg')
    expect(logs).to.have.lengthOf(3)
    expect(logs[1].text()).to.include('Parsing ended with errors.')
    expect(logs[2].text()).to.equals('Something is wrong.')

    // All the dialog controls are enabled
    expect(wrapper.findComponent({ name: 'delimiter-selector' }).vm.disabled).to.equal(false)
    expect(wrapper.find('#quote-char input').element.disabled).to.equal(false)
    expect(wrapper.find('#escape-char input').element.disabled).to.equal(false)
    expect(wrapper.findComponent({ name: 'check-box' }).vm.disabled).to.equal(false)
    expect(wrapper.find('#import-cancel').element.disabled).to.equal(false)
    expect(wrapper.find('#import-finish').element.disabled).to.equal(false)
    expect(wrapper.findComponent({ name: 'close-icon' }).vm.disabled).to.equal(false)
    expect(wrapper.find('#import-finish').isVisible()).to.equal(false)
    expect(wrapper.find('#import-start').isVisible()).to.equal(true)
  })

  it('has proper state before import is completed', async () => {
    const parse = sinon.stub(csv, 'parse')
    parse.onCall(0).resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: {
          col1: [1],
          col2: ['foo']
        }
      },
      rowCount: 1,
      hasErrors: false,
      messages: []
    })

    parse.onCall(1).resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: {
          col1: [1, 2],
          col2: ['foo', 'bar']
        }
      },
      rowCount: 2,
      hasErrors: false,
      messages: []
    })

    let resolveImport = sinon.stub()
    wrapper.vm.db.addTableFromCsv = sinon.stub()
      .resolves(new Promise(resolve => { resolveImport = resolve }))

    wrapper.vm.preview()
    wrapper.vm.open()
    await nextTick()
    await nextTick()

    await wrapper.find('#csv-json-table-name input').setValue('foo')
    await wrapper.find('#import-start').trigger('click')
    await csv.parse.returnValues[1]

    // Parsing success in the logs
    expect(wrapper.findComponent({ name: 'logs' }).findAll('.msg')[2].text())
      .to.equal('Importing CSV into a SQLite database...')

    // After 1 second - loading indicator is shown
    await clock.tick(1000)
    expect(
      wrapper.findComponent({ name: 'logs' }).findComponent({ name: 'LoadingIndicator' }).exists()
    ).to.equal(true)

    // All the dialog controls are disabled
    expect(wrapper.findComponent({ name: 'delimiter-selector' }).vm.disabled).to.equal(true)
    expect(wrapper.find('#quote-char input').element.disabled).to.equal(true)
    expect(wrapper.find('#escape-char input').element.disabled).to.equal(true)
    expect(wrapper.findComponent({ name: 'check-box' }).vm.disabled).to.equal(true)
    expect(wrapper.find('#import-cancel').element.disabled).to.equal(true)
    expect(wrapper.find('#import-finish').element.disabled).to.equal(true)
    expect(wrapper.findComponent({ name: 'close-icon' }).vm.disabled).to.equal(true)
    expect(wrapper.find('#import-finish').isVisible()).to.equal(false)
    expect(wrapper.find('#import-start').isVisible()).to.equal(true)
    expect(wrapper.vm.db.addTableFromCsv.getCall(0).args[0]).to.equal('foo') // table name

    // After resolving - loading indicator is not shown
    await resolveImport()
    await wrapper.vm.db.addTableFromCsv.returnValues[0]
    expect(
      wrapper.findComponent({ name: 'logs' }).findComponent({ name: 'LoadingIndicator' }).exists()
    ).to.equal(false)
  })

  it('import success', async () => {
    const parse = sinon.stub(csv, 'parse')
    parse.onCall(0).resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: {
          col1: [1],
          col2: ['foo']
        }
      },
      rowCount: 1,
      hasErrors: false,
      messages: []
    })
    // we need to separate calles because messages will mutate
    parse.onCall(1).resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: {
          col1: [1, 2],
          col2: ['foo', 'bar']
        }
      },
      rowCount: 2,
      hasErrors: false,
      messages: []
    })

    wrapper.vm.preview()
    wrapper.vm.open()
    await nextTick()
    await nextTick()

    await wrapper.find('#csv-json-table-name input').setValue('foo')
    await wrapper.find('#import-start').trigger('click')
    await csv.parse.returnValues[1]

    // Import success in the logs
    const logs = wrapper.findComponent({ name: 'logs' }).findAll('.msg')
    expect(logs).to.have.lengthOf(3)
    expect(logs[2].text()).to.contain('Importing CSV into a SQLite database is completed in')

    // All the dialog controls are enabled
    expect(wrapper.findComponent({ name: 'delimiter-selector' }).vm.disabled).to.equal(false)
    expect(wrapper.find('#quote-char input').element.disabled).to.equal(false)
    expect(wrapper.find('#escape-char input').element.disabled).to.equal(false)
    expect(wrapper.findComponent({ name: 'check-box' }).vm.disabled).to.equal(false)
    expect(wrapper.find('#import-cancel').element.disabled).to.equal(false)
    expect(wrapper.find('#import-finish').element.disabled).to.equal(false)
    expect(wrapper.findComponent({ name: 'close-icon' }).vm.disabled).to.equal(false)
    expect(wrapper.find('#import-finish').isVisible()).to.equal(true)
  })

  it('import fails', async () => {
    const parse = sinon.stub(csv, 'parse')
    parse.onCall(0).resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: {
          col1: [1],
          col2: ['foo']
        }
      },
      rowCount: 1,
      hasErrors: false,
      messages: []
    })
    // we need to separate calles because messages will mutate
    parse.onCall(1).resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: {
          col1: [1, 2],
          col2: ['foo', 'bar']
        }
      },
      rowCount: 2,
      hasErrors: false,
      messages: []
    })

    wrapper.vm.db.addTableFromCsv = sinon.stub().rejects(new Error('fail'))

    wrapper.vm.preview()
    wrapper.vm.open()
    await nextTick()
    await nextTick()

    await wrapper.find('#csv-json-table-name input').setValue('foo')
    await wrapper.find('#import-start').trigger('click')
    await csv.parse.returnValues[1]

    // Import success in the logs
    const logs = wrapper.findComponent({ name: 'logs' }).findAll('.msg')
    expect(logs).to.have.lengthOf(4)
    expect(logs[2].text()).to.contain('Importing CSV into a SQLite database...')
    expect(logs[3].text()).to.equal('Error: fail.')

    // All the dialog controls are enabled
    expect(wrapper.findComponent({ name: 'delimiter-selector' }).vm.disabled).to.equal(false)
    expect(wrapper.find('#quote-char input').element.disabled).to.equal(false)
    expect(wrapper.find('#escape-char input').element.disabled).to.equal(false)
    expect(wrapper.findComponent({ name: 'check-box' }).vm.disabled).to.equal(false)
    expect(wrapper.find('#import-cancel').element.disabled).to.equal(false)
    expect(wrapper.find('#import-finish').element.disabled).to.equal(false)
    expect(wrapper.findComponent({ name: 'close-icon' }).vm.disabled).to.equal(false)
    expect(wrapper.find('#import-finish').isVisible()).to.equal(false)
  })

  it('import finish', async () => {
    sinon.stub(csv, 'parse').resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: {
          col1: [1],
          col2: ['foo']
        }
      },
      rowCount: 1,
      hasErrors: false,
      messages: []
    })

    wrapper.vm.preview()
    wrapper.vm.open()
    await nextTick()
    await nextTick()

    await wrapper.find('#import-start').trigger('click')
    await nextTick()

    await wrapper.find('#import-finish').trigger('click')
    await clock.tick(100)
    expect(actions.addTab.calledOnce).to.equal(true)
    await actions.addTab.returnValues[0]
    expect(mutations.setCurrentTabId.calledOnceWith(state, newTabId)).to.equal(true)
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(false)
    expect(wrapper.emitted('finish')).to.have.lengthOf(1)
  })

  it('import cancel', async () => {
    sinon.stub(csv, 'parse').resolves({
      delimiter: '|',
      data: {
        columns: ['col1', 'col2'],
        values: {
          col1: [1],
          col2: ['foo']
        }
      },
      rowCount: 1,
      hasErrors: false,
      messages: []
    })

    await wrapper.vm.preview()
    await wrapper.vm.open()
    await nextTick()
    await nextTick()

    await wrapper.find('#import-start').trigger('click')
    await nextTick()

    await wrapper.find('#import-cancel').trigger('click')
    await clock.tick(100)
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(false)
    expect(wrapper.vm.db.execute.calledOnceWith('DROP TABLE "my_data"')).to.equal(true)
    expect(wrapper.vm.db.refreshSchema.calledOnce).to.equal(true)
    expect(wrapper.emitted('cancel')).to.have.lengthOf(1)
  })

  it('checks table name', async () => {
    sinon.stub(csv, 'parse').resolves({
      data: {},
      hasErrors: false,
      messages: []
    })
    await wrapper.vm.preview()
    await wrapper.vm.open()
    await nextTick()
    await nextTick()

    await wrapper.find('#csv-json-table-name input').setValue('foo')
    await clock.tick(400)
    await nextTick()
    expect(wrapper.find('#csv-json-table-name .text-field-error').text()).to.equal('')

    wrapper.vm.db.validateTableName = sinon.stub().rejects(new Error('this is a bad table name'))
    await wrapper.find('#csv-json-table-name input').setValue('bar')
    await clock.tick(400)
    await nextTick()
    expect(wrapper.find('#csv-json-table-name .text-field-error').text())
      .to.equal('this is a bad table name. Try another table name.')

    await wrapper.find('#csv-json-table-name input').setValue('')
    await clock.tick(400)
    await nextTick()
    expect(wrapper.find('#csv-json-table-name .text-field-error').text()).to.equal('')

    await wrapper.find('#import-start').trigger('click')
    expect(wrapper.find('#csv-json-table-name .text-field-error').text())
      .to.equal("Table name can't be empty")
    expect(wrapper.vm.db.addTableFromCsv.called).to.equal(false)
  })
})

describe('CsvJsonImport.vue - json', () => {
  let state = {}
  let actions = {}
  let mutations = {}
  let clock
  let wrapper
  const newTabId = 1
  const file = new File(
    [new Blob(
      [JSON.stringify({ foo: [1, 2, 3] }, null, 2)],
      { type: 'application/json' }
    )],
    'my data.json',
    { type: 'application/json' })

  beforeEach(() => {
    clock = sinon.useFakeTimers()

    // mock store state and mutations
    state = {}
    mutations = {
      setDb: sinon.stub(),
      setCurrentTabId: sinon.stub()
    }
    actions = {
      addTab: sinon.stub().resolves(newTabId)
    }
    const store = createStore({ state, mutations, actions })

    const db = {
      sanitizeTableName: sinon.stub().returns('my_data'),
      addTableFromCsv: sinon.stub().resolves(),
      createProgressCounter: sinon.stub().returns(1),
      deleteProgressCounter: sinon.stub(),
      validateTableName: sinon.stub().resolves(),
      execute: sinon.stub().resolves(),
      refreshSchema: sinon.stub().resolves()
    }

    // mount the component
    wrapper = mount(CsvJsonImport, {
      global: { 
        plugins: [store],
        stubs: {
          teleport: true,
          transition: false
        }
      },
      props: {
        file,
        dialogName: 'addCsvJson',
        db
      },
      attachTo: document.body
    })
  })

  afterEach(() => {
    sinon.restore()
    wrapper.unmount()
  })

  it('previews', async () => {
    await wrapper.vm.preview()
    await wrapper.vm.open()
    await nextTick()
    await nextTick()
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(true)
    expect(wrapper.find('.dialog-header').text()).to.equal('JSON import')
    expect(wrapper.find('#csv-json-table-name input').element.value).to.equal('my_data')
    expect(wrapper.findComponent({ name: 'delimiter-selector' }).exists()).to.equal(false)
    expect(wrapper.find('#quote-char input').exists()).to.equal(false)
    expect(wrapper.find('#escape-char input').exists()).to.equal(false)
    expect(wrapper.findComponent({ name: 'check-box' }).exists()).to.equal(false)
    const rows = wrapper.findAll('tbody tr')
    expect(rows).to.have.lengthOf(1)
    expect(rows[0].findAll('td')[0].text()).to.equal([
      '{',
      '  "foo": [',
      '    1,',
      '    2,',
      '    3',
      '  ]',
      '}'
    ].join('\n')
    )
    expect(wrapper.findComponent({ name: 'logs' }).text())
      .to.include('Preview parsing is completed in')
    expect(wrapper.find('#import-finish').isVisible()).to.equal(false)
    expect(wrapper.find('#import-start').isVisible()).to.equal(true)
  })

  it('has proper state before parsing is complete', async () => {
    const getJsonParseResult = sinon.stub(wrapper.vm, 'getJsonParseResult')
    getJsonParseResult.onCall(0).returns({
      delimiter: '|',
      data: {
        columns: ['doc'],
        values: {
          doc: ['{ "foo": [ 1, 2, 3 ] }']
        }
      },
      rowCount: 1,
      hasErrors: false,
      messages: []
    })

    let resolveParsing
    getJsonParseResult.onCall(1).returns(new Promise(resolve => {
      resolveParsing = () => resolve({
        delimiter: '|',
        data: {
          columns: ['doc'],
          values: {
            doc: ['{ "foo": [ 1, 2, 3 ] }']
          }
        },
        rowCount: 1,
        hasErrors: false,
        messages: []
      })
    }))

    await wrapper.vm.preview()
    await wrapper.vm.open()
    await nextTick()
    await nextTick()

    await wrapper.find('#csv-json-table-name input').setValue('foo')
    await wrapper.find('#import-start').trigger('click')
    await nextTick()

    // "Parsing JSON..." in the logs
    expect(wrapper.findComponent({ name: 'logs' }).findAll('.msg')[1].text())
      .to.equal('Parsing JSON...')

    // After 1 second - loading indicator is shown
    await clock.tick(1000)
    expect(
      wrapper.findComponent({ name: 'logs' }).findComponent({ name: 'LoadingIndicator' }).exists()
    ).to.equal(true)

    // All the dialog controls are disabled
    expect(wrapper.find('#import-cancel').element.disabled).to.equal(true)
    expect(wrapper.find('#import-finish').element.disabled).to.equal(true)
    expect(wrapper.findComponent({ name: 'close-icon' }).vm.disabled).to.equal(true)
    expect(wrapper.find('#import-finish').isVisible()).to.equal(false)
    expect(wrapper.find('#import-start').isVisible()).to.equal(true)
    await resolveParsing()
    await getJsonParseResult.returnValues[1]

    // Loading indicator is not shown when parsing is compete
    expect(
      wrapper.findComponent({ name: 'logs' }).findComponent({ name: 'LoadingIndicator' }).exists()
    ).to.equal(false)
  })

  it('has proper state before import is completed', async () => {
    const getJsonParseResult = sinon.spy(wrapper.vm, 'getJsonParseResult')

    let resolveImport = sinon.stub()
    wrapper.vm.db.addTableFromCsv = sinon.stub()
      .resolves(new Promise(resolve => { resolveImport = resolve }))

    await wrapper.vm.preview()
    await wrapper.vm.open()
    await nextTick()
    await nextTick()

    await wrapper.find('#csv-json-table-name input').setValue('foo')
    await wrapper.find('#import-start').trigger('click')
    await getJsonParseResult.returnValues[1]
    await nextTick()

    // Parsing success in the logs
    expect(wrapper.findComponent({ name: 'logs' }).findAll('.msg')[2].text())
      .to.equal('Importing JSON into a SQLite database...')

    // After 1 second - loading indicator is shown
    await clock.tick(1000)
    expect(
      wrapper.findComponent({ name: 'logs' }).findComponent({ name: 'LoadingIndicator' }).exists()
    ).to.equal(true)

    // All the dialog controls are disabled
    expect(wrapper.find('#import-cancel').element.disabled).to.equal(true)
    expect(wrapper.find('#import-finish').element.disabled).to.equal(true)
    expect(wrapper.findComponent({ name: 'close-icon' }).vm.disabled).to.equal(true)
    expect(wrapper.find('#import-finish').isVisible()).to.equal(false)
    expect(wrapper.find('#import-start').isVisible()).to.equal(true)
    expect(wrapper.vm.db.addTableFromCsv.getCall(0).args[0]).to.equal('foo') // table name

    // After resolving - loading indicator is not shown
    await resolveImport()
    await wrapper.vm.db.addTableFromCsv.returnValues[0]
    expect(
      wrapper.findComponent({ name: 'logs' }).findComponent({ name: 'LoadingIndicator' }).exists()
    ).to.equal(false)
  })

  it('import success', async () => {
    const getJsonParseResult = sinon.spy(wrapper.vm, 'getJsonParseResult')

    await wrapper.vm.preview()
    await wrapper.vm.open()
    await nextTick()
    await nextTick()

    await wrapper.find('#csv-json-table-name input').setValue('foo')
    await wrapper.find('#import-start').trigger('click')
    await getJsonParseResult.returnValues[1]
    await nextTick()
    await nextTick()

    // Import success in the logs
    const logs = wrapper.findComponent({ name: 'logs' }).findAll('.msg')
    expect(logs).to.have.lengthOf(3)
    expect(logs[2].text()).to.contain('Importing JSON into a SQLite database is completed in')

    // All the dialog controls are enabled
    expect(wrapper.find('#import-cancel').element.disabled).to.equal(false)
    expect(wrapper.find('#import-finish').element.disabled).to.equal(false)
    expect(wrapper.findComponent({ name: 'close-icon' }).vm.disabled).to.equal(false)
    expect(wrapper.find('#import-finish').isVisible()).to.equal(true)
  })
})

describe('CsvJsonImport.vue - ndjson', () => {
  let state = {}
  let actions = {}
  let mutations = {}
  let clock
  let wrapper
  const newTabId = 1
  const file = new File([], 'my data.ndjson')

  beforeEach(() => {
    clock = sinon.useFakeTimers()

    // mock store state and mutations
    state = {}
    mutations = {
      setDb: sinon.stub(),
      setCurrentTabId: sinon.stub()
    }
    actions = {
      addTab: sinon.stub().resolves(newTabId)
    }
    const store = createStore({ state, mutations, actions })

    const db = {
      sanitizeTableName: sinon.stub().returns('my_data'),
      addTableFromCsv: sinon.stub().resolves(),
      createProgressCounter: sinon.stub().returns(1),
      deleteProgressCounter: sinon.stub(),
      validateTableName: sinon.stub().resolves(),
      execute: sinon.stub().resolves(),
      refreshSchema: sinon.stub().resolves()
    }

    // mount the component
    wrapper = mount(CsvJsonImport, {
      global: {
        plugins: [store],
        stubs: {
          teleport: true,
          transition: false
        }
      },
      props: {
        file,
        dialogName: 'addCsvJson',
        db
      },
      attachTo: document.body
    })
  })

  afterEach(() => {
    sinon.restore()
    wrapper.unmount()
  })

  it('previews', async () => {
    sinon.stub(csv, 'parse').resolves({
      delimiter: '|',
      data: {
        columns: ['doc'],
        values: {
          doc: ['{ "foo": [ 1, 2, 3 ] }']
        }
      },
      rowCount: 1,
      messages: []
    })

    wrapper.vm.preview()
    await wrapper.vm.open()
    await nextTick()
    await nextTick()
    expect(wrapper.find('.dialog.vfm').exists()).to.equal(true)
    expect(wrapper.find('.dialog-header').text()).to.equal('JSON import')
    expect(wrapper.find('#csv-json-table-name input').element.value).to.equal('my_data')
    expect(wrapper.findComponent({ name: 'delimiter-selector' }).exists()).to.equal(false)
    expect(wrapper.find('#quote-char input').exists()).to.equal(false)
    expect(wrapper.find('#escape-char input').exists()).to.equal(false)
    expect(wrapper.findComponent({ name: 'check-box' }).exists()).to.equal(false)
    const rows = wrapper.findAll('tbody tr')
    expect(rows).to.have.lengthOf(1)
    expect(rows[0].findAll('td')[0].text()).to.equal('{ "foo": [ 1, 2, 3 ] }')
    expect(wrapper.findComponent({ name: 'logs' }).text())
      .to.include('Preview parsing is completed in')
    expect(wrapper.find('#import-finish').isVisible()).to.equal(false)
    expect(wrapper.find('#import-start').isVisible()).to.equal(true)
  })

  it('has proper state before parsing is complete', async () => {
    const parse = sinon.stub(csv, 'parse')
    parse.onCall(0).resolves({
      delimiter: '|',
      data: {
        columns: ['doc'],
        values: {
          doc: ['{ "foo": [ 1, 2, 3 ] }']
        }
      },
      rowCount: 1
    })

    wrapper.vm.preview()
    wrapper.vm.open()
    await nextTick()
    await nextTick()

    let resolveParsing
    parse.onCall(1).returns(new Promise(resolve => {
      resolveParsing = () => resolve({
        delimiter: '|',
        data: {
          columns: ['doc'],
          values: {
            doc: ['{ "foo": [ 1, 2, 3 ] }']
          }
        },
        rowCount: 1,
        messages: []
      })
    }))

    await wrapper.find('#csv-json-table-name input').setValue('foo')
    await wrapper.find('#import-start').trigger('click')
    await nextTick()

    // "Parsing JSON..." in the logs
    expect(wrapper.findComponent({ name: 'logs' }).findAll('.msg')[1].text())
      .to.equal('Parsing JSON...')

    // After 1 second - loading indicator is shown
    await clock.tick(1000)
    expect(
      wrapper.findComponent({ name: 'logs' }).findComponent({ name: 'LoadingIndicator' }).exists()
    ).to.equal(true)

    // All the dialog controls are disabled
    expect(wrapper.find('#import-cancel').element.disabled).to.equal(true)
    expect(wrapper.find('#import-finish').element.disabled).to.equal(true)
    expect(wrapper.findComponent({ name: 'close-icon' }).vm.disabled).to.equal(true)
    expect(wrapper.find('#import-finish').isVisible()).to.equal(false)
    expect(wrapper.find('#import-start').isVisible()).to.equal(true)
    await resolveParsing()
    await parse.returnValues[1]

    // Loading indicator is not shown when parsing is compete
    expect(
      wrapper.findComponent({ name: 'logs' }).findComponent({ name: 'LoadingIndicator' }).exists()
    ).to.equal(false)
  })

  it('has proper state before import is completed', async () => {
    const parse = sinon.stub(csv, 'parse')
    parse.onCall(0).resolves({
      delimiter: '|',
      data: {
        columns: ['doc'],
        values: {
          doc: ['{ "foo": [ 1, 2, 3 ] }']
        }
      },
      rowCount: 1,
      hasErrors: false,
      messages: []
    })

    parse.onCall(1).resolves({
      delimiter: '|',
      data: {
        columns: ['doc'],
        values: {
          doc: ['{ "foo": [ 1, 2, 3 ] }']
        }
      },
      rowCount: 1,
      hasErrors: false,
      messages: []
    })

    let resolveImport = sinon.stub()
    wrapper.vm.db.addTableFromCsv = sinon.stub()
      .resolves(new Promise(resolve => { resolveImport = resolve }))

    wrapper.vm.preview()
    wrapper.vm.open()
    await nextTick()
    await nextTick()

    await wrapper.find('#csv-json-table-name input').setValue('foo')
    await wrapper.find('#import-start').trigger('click')
    await csv.parse.returnValues[1]
    await nextTick()

    // Parsing success in the logs
    expect(wrapper.findComponent({ name: 'logs' }).findAll('.msg')[2].text())
      .to.equal('Importing JSON into a SQLite database...')

    // After 1 second - loading indicator is shown
    await clock.tick(1000)
    expect(
      wrapper.findComponent({ name: 'logs' }).findComponent({ name: 'LoadingIndicator' }).exists()
    ).to.equal(true)

    // All the dialog controls are disabled
    expect(wrapper.find('#import-cancel').element.disabled).to.equal(true)
    expect(wrapper.find('#import-finish').element.disabled).to.equal(true)
    expect(wrapper.findComponent({ name: 'close-icon' }).vm.disabled).to.equal(true)
    expect(wrapper.find('#import-finish').isVisible()).to.equal(false)
    expect(wrapper.find('#import-start').isVisible()).to.equal(true)
    expect(wrapper.vm.db.addTableFromCsv.getCall(0).args[0]).to.equal('foo') // table name

    // After resolving - loading indicator is not shown
    await resolveImport()
    await wrapper.vm.db.addTableFromCsv.returnValues[0]
    expect(
      wrapper.findComponent({ name: 'logs' }).findComponent({ name: 'LoadingIndicator' }).exists()
    ).to.equal(false)
  })

  it('import success', async () => {
    const parse = sinon.stub(csv, 'parse')
    parse.onCall(0).resolves({
      delimiter: '|',
      data: {
        columns: ['doc'],
        values: {
          doc: ['{ "foo": [ 1, 2, 3 ] }']
        }
      },
      rowCount: 1,
      hasErrors: false,
      messages: []
    })
    // we need to separate calles because messages will mutate
    parse.onCall(1).resolves({
      delimiter: '|',
      data: {
        columns: ['doc'],
        values: {
          doc: ['{ "foo": [ 1, 2, 3 ] }']
        }
      },
      rowCount: 2,
      hasErrors: false,
      messages: []
    })

    wrapper.vm.preview()
    wrapper.vm.open()
    await nextTick()
    await nextTick()

    await wrapper.find('#csv-json-table-name input').setValue('foo')
    await wrapper.find('#import-start').trigger('click')
    await csv.parse.returnValues[1]
    await nextTick()

    // Import success in the logs
    const logs = wrapper.findComponent({ name: 'logs' }).findAll('.msg')
    expect(logs).to.have.lengthOf(3)
    expect(logs[2].text()).to.contain('Importing JSON into a SQLite database is completed in')

    // All the dialog controls are enabled
    expect(wrapper.find('#import-cancel').element.disabled).to.equal(false)
    expect(wrapper.find('#import-finish').element.disabled).to.equal(false)
    expect(wrapper.findComponent({ name: 'close-icon' }).vm.disabled).to.equal(false)
    expect(wrapper.find('#import-finish').isVisible()).to.equal(true)
  })
})
