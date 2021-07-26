import { expect } from 'chai'
import { mount, createWrapper } from '@vue/test-utils'
import DataView from '@/views/Main/Editor/Tabs/Tab/DataView'
import sinon from 'sinon'

describe('DataView.vue', () => {
  it('emits update on mode changing', async () => {
    const wrapper = mount(DataView)

    const pivotBtn = createWrapper(wrapper.findComponent({ name: 'pivotIcon' }).vm.$parent)
    await pivotBtn.trigger('click')

    expect(wrapper.emitted('update')).to.have.lengthOf(1)
  })

  it('method getOptionsForSave call the same method of the current view component', async () => {
    const wrapper = mount(DataView)

    const chart = wrapper.findComponent({ name: 'Chart' }).vm
    sinon.stub(chart, 'getOptionsForSave').returns({ here_are: 'chart_settings' })

    expect(wrapper.vm.getOptionsForSave()).to.eql({ here_are: 'chart_settings' })

    const pivotBtn = createWrapper(wrapper.findComponent({ name: 'pivotIcon' }).vm.$parent)
    await pivotBtn.trigger('click')

    const pivot = wrapper.findComponent({ name: 'pivot' }).vm
    sinon.stub(pivot, 'getOptionsForSave').returns({ here_are: 'pivot_settings' })

    expect(wrapper.vm.getOptionsForSave()).to.eql({ here_are: 'pivot_settings' })
  })
})
