import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import CheckBox from '@/components/CheckBox'

describe('CheckBox', () => {
  it('unchecked by default', () => {
    const wrapper = shallowMount(CheckBox, {
      props: { init: false },
      attachTo: document.body
    })
    expect(wrapper.find('img').isVisible()).to.equal(false)
    wrapper.unmount()
  })

  it('gets init state according to passed props', () => {
    const wrapperChecked = shallowMount(CheckBox, {
      props: { init: true },
      attachTo: document.body
    })
    expect(wrapperChecked.find('img.checked').isVisible()).to.equal(true)
    wrapperChecked.unmount()
    
    const wrapperUnchecked = shallowMount(CheckBox, {
      props: { init: false },
      attachTo: document.body
    })
    expect(wrapperUnchecked.find('img').isVisible()).to.equal(false)
    wrapperUnchecked.unmount()
  })

  it('checked on click', async () => {
    const wrapper = shallowMount(CheckBox, { attachTo: document.body })
    await wrapper.trigger('click')
    expect(wrapper.find('img.checked').isVisible()).to.equal(true)
    wrapper.unmount()
  })

  it('emits event on click', async () => {
    const wrapper = shallowMount(CheckBox)
    await wrapper.trigger('click')
    expect(wrapper.emitted().click).to.have.lengthOf(1)
    expect(wrapper.emitted().click[0]).to.eql([true])
    await wrapper.trigger('click')
    expect(wrapper.emitted().click).to.have.lengthOf(2)
    expect(wrapper.emitted().click[1]).to.eql([false])
  })

  it('disabled', async () => {
    const wrapper = shallowMount(CheckBox, {
      props: { disabled: true }
    })
    expect(wrapper.find('.checkbox-container').classes()).to.include('disabled')
    expect(wrapper.find('.checkbox-container').classes()).to.not.include('checked')
    await wrapper.trigger('click')
    expect(wrapper.emitted().click).to.equal(undefined)
    expect(wrapper.find('.checkbox-container').classes()).to.not.include('checked')
  })
})
