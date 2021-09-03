import { expect } from 'chai'
import { mount, createWrapper } from '@vue/test-utils'
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
      propsData: {
        result: {
          columns: ['id', 'name'],
          values: {
            id: [1],
            name: ['foo']
          }
        }
      }
    })

    const copyBtn = createWrapper(wrapper.findComponent({ name: 'clipboardIcon' }).vm.$parent)
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
      propsData: {
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
    const copyBtn = createWrapper(wrapper.findComponent({ name: 'clipboardIcon' }).vm.$parent)
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
      propsData: {
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
    const copyBtn = createWrapper(wrapper.findComponent({ name: 'clipboardIcon' }).vm.$parent)
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
      propsData: {
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
    const copyBtn = createWrapper(wrapper.findComponent({ name: 'clipboardIcon' }).vm.$parent)
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
})
