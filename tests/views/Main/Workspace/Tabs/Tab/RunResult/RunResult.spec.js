import { expect } from 'chai'
import { mount, DOMWrapper } from '@vue/test-utils'
import RunResult from '@/views/Main/Workspace/Tabs/Tab/RunResult'
import csv from '@/lib/csv'
import sinon from 'sinon'

describe('RunResult.vue', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('shows alert when ClipboardItem is not supported', async () => {
    const ClipboardItem = window.ClipboardItem
    delete window.ClipboardItem
    sinon.spy(window, 'alert')
    const wrapper = mount(RunResult, {
      props: {
        tab: { id: 1 },
        result: {
          columns: ['id', 'name'],
          values: {
            id: [1],
            name: ['foo']
          }
        }
      }
    })

    const copyBtn = new DOMWrapper(wrapper.findComponent({ name: 'clipboardIcon' }).vm.$parent)
    await copyBtn.trigger('click')

    expect(
      window.alert.calledOnceWith(
        "Your browser doesn't support copying into the clipboard. " +
        'If you use Firefox you can enable it ' +
        'by setting dom.events.asyncClipboard.clipboardItem to true.'
      )
    ).to.equal(true)

    window.ClipboardItem = ClipboardItem
  })

  it('copy to clipboard more than 1 sec', async () => {
    sinon.stub(window.navigator.clipboard, 'writeText').resolves()
    const clock = sinon.useFakeTimers()
    const wrapper = mount(RunResult, {
      props: {
        tab: { id: 1 },
        result: {
          columns: ['id', 'name'],
          values: {
            id: [1],
            name: ['foo']
          }
        }
      }
    })
    sinon.stub(csv, 'serialize').callsFake(() => {
      clock.tick(5000)
    })

    // Click copy to clipboard
    const copyBtn = new DOMWrapper(wrapper.findComponent({ name: 'clipboardIcon' }).vm.$parent)
    await copyBtn.trigger('click')

    // The dialog is shown...
    expect(wrapper.find('[data-modal="prepareCSVCopy"]').exists()).to.equal(true)

    // ... with Building message...
    expect(wrapper.find('.dialog-body').text()).to.equal('Building CSV...')

    // Switch to microtasks (let serialize run)
    clock.tick(0)
    await wrapper.vm.$nextTick()

    // The dialog is shown...
    expect(wrapper.find('[data-modal="prepareCSVCopy"]').exists()).to.equal(true)

    // ... with Ready message...
    expect(wrapper.find('.dialog-body').text()).to.equal('CSV is ready')

    // Click copy
    await wrapper.find('.dialog-buttons-container button.primary').trigger('click')

    // The dialog is not shown...
    expect(wrapper.find('[data-modal="prepareCSVCopy"]').exists()).to.equal(false)
  })

  it('copy to clipboard less than 1 sec', async () => {
    sinon.stub(window.navigator.clipboard, 'writeText').resolves()
    const clock = sinon.useFakeTimers()
    const wrapper = mount(RunResult, {
      props: {
        tab: { id: 1 },
        result: {
          columns: ['id', 'name'],
          values: {
            id: [1],
            name: ['foo']
          }
        }
      }
    })
    sinon.spy(wrapper.vm, 'copyToClipboard')
    sinon.stub(csv, 'serialize').callsFake(() => {
      clock.tick(500)
    })

    // Click copy to clipboard
    const copyBtn = new DOMWrapper(wrapper.findComponent({ name: 'clipboardIcon' }).vm.$parent)
    await copyBtn.trigger('click')

    // Switch to microtasks (let serialize run)
    clock.tick(0)
    await wrapper.vm.$nextTick()

    // The dialog is not shown...
    expect(wrapper.find('[data-modal="prepareCSVCopy"]').exists()).to.equal(false)
    // copyToClipboard is called
    expect(wrapper.vm.copyToClipboard.calledOnce).to.equal(true)
  })

  it('cancel long copy', async () => {
    sinon.stub(window.navigator.clipboard, 'writeText').resolves()
    const clock = sinon.useFakeTimers()
    const wrapper = mount(RunResult, {
      props: {
        tab: { id: 1 },
        result: {
          columns: ['id', 'name'],
          values: {
            id: [1],
            name: ['foo']
          }
        }
      }
    })
    sinon.spy(wrapper.vm, 'copyToClipboard')
    sinon.stub(csv, 'serialize').callsFake(() => {
      clock.tick(5000)
    })

    // Click copy to clipboard
    const copyBtn = new DOMWrapper(wrapper.findComponent({ name: 'clipboardIcon' }).vm.$parent)
    await copyBtn.trigger('click')

    // Switch to microtasks (let serialize run)
    clock.tick(0)
    await wrapper.vm.$nextTick()

    // Click cancel
    await wrapper.find('.dialog-buttons-container button.secondary').trigger('click')

    // The dialog is not shown...
    expect(wrapper.find('[data-modal="prepareCSVCopy"]').exists()).to.equal(false)
    // copyToClipboard is not called
    expect(wrapper.vm.copyToClipboard.calledOnce).to.equal(false)
  })

  it('shows value of selected cell - result set', async () => {
    const wrapper = mount(RunResult, {
      props: {
        tab: { id: 1 },
        result: {
          columns: ['id', 'name'],
          values: {
            id: [1, 2],
            name: ['foo', 'bar']
          }
        }
      }
    })

    // Open cell value panel
    const viewValueBtn = new DOMWrapper(
      wrapper.findComponent({ name: 'viewCellValueIcon' }).vm.$parent
    )
    await viewValueBtn.trigger('click')

    /*
    Result set:
    |1 | foo
    +--+-----
    |2 | bar
    */

    // Click on '1' cell
    const rows = wrapper.findAll('table tbody tr')
    await rows[0].findAll('td')[0].trigger('click')

    expect(wrapper.find('.value-body').text()).to.equals('1')

    // Go to 'foo' with right arrow key
    await wrapper.find('table').trigger('keydown.right')
    expect(wrapper.find('.value-body').text()).to.equals('foo')

    // Go to 'bar' with down arrow key
    await wrapper.find('table').trigger('keydown.down')
    expect(wrapper.find('.value-body').text()).to.equals('bar')

    // Go to '2' with left arrow key
    await wrapper.find('table').trigger('keydown.left')
    expect(wrapper.find('.value-body').text()).to.equals('2')

    // Go to '1' with up arrow key
    await wrapper.find('table').trigger('keydown.up')
    expect(wrapper.find('.value-body').text()).to.equals('1')

    // Click on 'bar' cell
    await rows[1].findAll('td')[1].trigger('click')

    expect(wrapper.find('.value-body').text()).to.equals('bar')

    // Click on 'bar' cell again
    await rows[1].findAll('td')[1].trigger('click')

    expect(wrapper.find('.value-viewer-container .table-preview').text())
      .to.equals('No cell selected to view')
  })

  it('shows value of selected cell - record view', async () => {
    const wrapper = mount(RunResult, {
      props: {
        tab: { id: 1 },
        result: {
          columns: ['id', 'name'],
          values: {
            id: [1, 2],
            name: ['foo', 'bar']
          }
        }
      }
    })

    // Open cell value panel
    const viewValueBtn = new DOMWrapper(
      wrapper.findComponent({ name: 'viewCellValueIcon' }).vm.$parent
    )
    await viewValueBtn.trigger('click')

    // Go to record view
    const vierRecordBtn = new DOMWrapper(
      wrapper.findComponent({ name: 'rowIcon' }).vm.$parent
    )
    await vierRecordBtn.trigger('click')

    /*
    Record 1:
    |id   | 1
    +-----+-----
    |name | foo

    Record 2:
    |id   | 2
    +-----+-----
    |name | bar

    */

    // Click '1' is selected by default
    expect(wrapper.find('.value-body').text()).to.equals('1')

    // Go to 'foo' with down arrow key
    await wrapper.find('table').trigger('keydown.down')
    expect(wrapper.find('.value-body').text()).to.equals('foo')

    // Go to next record
    await wrapper.find('.icon-btn.next').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.value-body').text()).to.equals('bar')

    // Go to '2' with up arrow key
    await wrapper.find('table').trigger('keydown.up')
    expect(wrapper.find('.value-body').text()).to.equals('2')

    // Go to prev record
    await wrapper.find('.icon-btn.prev').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.value-body').text()).to.equals('1')

    // Click on 'foo' cell
    const rows = wrapper.findAll('table tbody tr')
    await rows[1].find('td').trigger('click')
    expect(wrapper.find('.value-body').text()).to.equals('foo')

    // Click on 'foo' cell again
    await rows[1].find('td').trigger('click')
    expect(wrapper.find('.value-viewer-container .table-preview').text())
      .to.equals('No cell selected to view')
  })

  it('keeps selected cell when switch between record and regular view', async () => {
    const wrapper = mount(RunResult, {
      props: {
        tab: { id: 1 },
        result: {
          columns: ['id', 'name'],
          values: {
            id: [...Array(30)].map((x, i) => i),
            name: [...Array(30)].map((x, i) => `name-${i}`)
          }
        }
      }
    })

    // Open cell value panel
    const viewValueBtn = new DOMWrapper(
      wrapper.findComponent({ name: 'viewCellValueIcon' }).vm.$parent
    )
    await viewValueBtn.trigger('click')

    // Click on 'name-1' cell
    const rows = wrapper.findAll('table tbody tr')
    await rows[1].findAll('td')[1].trigger('click')

    expect(wrapper.find('.value-body').text()).to.equals('name-1')

    // Go to record view
    const vierRecordBtn = new DOMWrapper(
      wrapper.findComponent({ name: 'rowIcon' }).vm.$parent
    )
    await vierRecordBtn.trigger('click')

    // 'name-1' is selected
    expect(wrapper.find('.value-body').text()).to.equals('name-1')
    let selectedCell = wrapper
      .find('.sqliteviz-table tbody td[aria-selected="true"]')
    expect(selectedCell.text()).to.equals('name-1')

    // Go to last record
    await wrapper.find('.icon-btn.last').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.value-body').text()).to.equals('name-29')

    // Go to '29' with up arrow key
    await wrapper.find('table').trigger('keydown.up')
    expect(wrapper.find('.value-body').text()).to.equals('29')

    // Go to regular view
    await vierRecordBtn.trigger('click')

    // '29' is selected
    expect(wrapper.find('.value-body').text()).to.equals('29')
    selectedCell = wrapper
      .find('.sqliteviz-table tbody td[aria-selected="true"]')
    expect(selectedCell.text()).to.equals('29')
  })
})
