import { expect } from 'chai'
import { mount } from '@vue/test-utils'
import TextField from '@/components/Common/TextField'

describe('TextField.vue', () => {
  it('renders the model value, placeholder, and configured width', () => {
    const wrapper = mount(TextField, {
      props: {
        modelValue: 'initial value',
        placeholder: 'Enter a value',
        width: '240px'
      }
    })
    const input = wrapper.find('input')

    expect(input.element.value).to.equal('initial value')
    expect(input.attributes('placeholder')).to.equal('Enter a value')
    expect(input.element.style.width).to.equal('240px')
    expect(wrapper.find('.text-field-label').exists()).to.equal(false)
    expect(wrapper.find('.clear-btn').exists()).to.equal(false)
  })

  it('emits update:modelValue when the input changes', async () => {
    const wrapper = mount(TextField, {
      props: { modelValue: 'before' }
    })

    await wrapper.find('input').setValue('after')

    expect(wrapper.emitted('update:modelValue')).to.eql([['after']])
  })

  it('renders label and hint with the configured tooltip width', () => {
    const wrapper = mount(TextField, {
      props: {
        label: 'Name',
        hint: 'A helpful hint',
        maxHintWidth: '200px'
      }
    })

    expect(wrapper.find('.text-field-label').text()).to.include('Name')
    expect(wrapper.find('.icon-tooltip').text()).to.equal('A helpful hint')
    expect(wrapper.find('.icon-tooltip').element.style.maxWidth).to.equal(
      '200px'
    )
  })

  it('shows the error message and applies error classes', () => {
    const wrapper = mount(TextField, {
      props: {
        label: 'Name',
        errorMsg: 'A value is required'
      }
    })

    expect(wrapper.find('.text-field-label').classes()).to.include('error')
    expect(wrapper.find('input').classes()).to.include('error')
    expect(wrapper.find('.text-field-error').isVisible()).to.equal(true)
    expect(wrapper.find('.text-field-error').text()).to.equal(
      'A value is required'
    )
  })

  it('hides the error message when there is no error', () => {
    const wrapper = mount(TextField)

    expect(wrapper.find('.text-field-error').element.style.display).to.equal(
      'none'
    )
  })

  it('emits an empty value when the clear button is clicked', async () => {
    const wrapper = mount(TextField, {
      props: { modelValue: 'to clear', showClearButton: true }
    })

    await wrapper.find('.clear-btn').trigger('click')

    expect(wrapper.emitted('update:modelValue')).to.eql([['']])
  })

  it('disables the input and clear button', () => {
    const wrapper = mount(TextField, {
      props: {
        disabled: true,
        label: 'Name',
        showClearButton: true
      }
    })

    expect(wrapper.find('input').element.disabled).to.equal(true)
    expect(wrapper.find('.clear-btn').element.disabled).to.equal(true)
    expect(wrapper.find('.text-field-container').classes()).to.include(
      'disabled'
    )
    expect(wrapper.find('.text-field-label').classes()).to.include('disabled')
  })
})
