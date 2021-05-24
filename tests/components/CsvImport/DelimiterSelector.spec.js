import { expect } from 'chai'
import { mount, shallowMount } from '@vue/test-utils'
import DelimiterSelector from '@/components/CsvImport/DelimiterSelector'

describe('DelimiterSelector', async () => {
  it('shows the name of value', async () => {
    let wrapper = shallowMount(DelimiterSelector, {
      propsData: { value: ',' }
    })
    expect(wrapper.find('input').element.value).to.equal(',')
    expect(wrapper.find('.name').text()).to.equal('comma')

    wrapper = shallowMount(DelimiterSelector, {
      propsData: { value: '\t' }
    })
    expect(wrapper.find('input').element.value).to.equal('\t')
    expect(wrapper.find('.name').text()).to.equal('horizontal tab')

    wrapper = shallowMount(DelimiterSelector, {
      propsData: { value: '' }
    })
    expect(wrapper.find('input').element.value).to.equal('')
    expect(wrapper.find('.name').text()).to.equal('')
  })

  it('clears the field', async () => {
    const wrapper = mount(DelimiterSelector, {
      propsData: { value: ',' }
    })

    await wrapper.findComponent({ name: 'clear-icon' }).trigger('click')

    expect(wrapper.find('input').element.value).to.equal('')
    expect(wrapper.emitted().input).to.equal(undefined)
  })

  it('changes value by typing', async () => {
    const wrapper = shallowMount(DelimiterSelector, {
      propsData: { value: ',' }
    })

    await wrapper.find('input').setValue(';')
    expect(wrapper.emitted().input).to.have.lengthOf(1)
    expect(wrapper.emitted().input[0]).to.eql([';'])
  })

  it('changes value by selection from the list', async () => {
    const wrapper = mount(DelimiterSelector, {
      propsData: { value: '|' }
    })

    await wrapper.findComponent({ name: 'drop-down-chevron' }).trigger('click')
    expect(wrapper.find('.options').isVisible()).to.equal(true)
    await wrapper.find('.option').trigger('click')
    expect(wrapper.find('.options').isVisible()).to.equal(false)
    expect(wrapper.emitted().input).to.have.lengthOf(1)
    expect(wrapper.emitted().input[0]).to.eql([','])
  })

  it("doesn't change value when becomes empty", async () => {
    const wrapper = mount(DelimiterSelector, {
      propsData: { value: '|' }
    })

    await wrapper.find('input').setValue('')
    expect(wrapper.emitted().input).to.equal(undefined)
  })

  it('set focus in input when click on character name', async () => {
    const place = document.createElement('div')
    document.body.appendChild(place)

    const wrapper = mount(DelimiterSelector, {
      attachTo: place,
      propsData: { value: '|' }
    })

    await wrapper.find('.name').trigger('click')
    expect(wrapper.find('input').element).to.equal(document.activeElement)
    place.remove()
    wrapper.destroy()
  })

  it('disabled', async () => {
    const wrapper = mount(DelimiterSelector, {
      propsData: { value: '|', disabled: true }
    })

    await wrapper.findComponent({ name: 'clear-icon' }).trigger('click')

    expect(wrapper.find('input').element.value).to.equal('|')
    expect(wrapper.emitted().input).to.equal(undefined)

    await wrapper.findComponent({ name: 'drop-down-chevron' }).trigger('click')
    expect(wrapper.find('.options').isVisible()).to.equal(false)
  })

  it('has filled class when input is not empty', async () => {
    const wrapper = shallowMount(DelimiterSelector, {
      propsData: { value: ',' }
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('input').classes()).to.include('filled')
    await wrapper.find('input').setValue('')
    expect(wrapper.find('input').classes()).to.not.include('filled')
    await wrapper.find('input').setValue(';')
    expect(wrapper.find('input').classes()).to.include('filled')
  })
})
