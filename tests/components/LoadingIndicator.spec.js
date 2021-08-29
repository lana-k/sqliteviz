import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import LoadingIndicator from '@/components/LoadingIndicator'

describe('LoadingIndicator.vue', () => {
  it('Calculates animation class', async () => {
    const wrapper = shallowMount(LoadingIndicator, {
      propsData: { progress: 0 }
    })
    expect(wrapper.find('svg').classes()).to.contain('progress')
    await wrapper.setProps({ progress: undefined })
    expect(wrapper.find('svg').classes()).to.not.contain('progress')
    expect(wrapper.find('svg').classes()).to.contain('loading')
  })

  it('Calculates arc', async () => {
    const wrapper = shallowMount(LoadingIndicator, {
      propsData: { progress: 50 }
    })
    // The lendth of circle in the component is 50.24. If progress is 50% then resulting arc
    // should be 25.12
    expect(wrapper.find('.loader-svg.front').element.style.strokeDasharray)
      .to.equal('25.12px, 25.12px')
  })
})
