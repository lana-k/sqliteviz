<template>
  <Field label="Initial algorithm">
    <Dropdown
      :options="layoutOptions"
      :value="modelValue.initialAlgorithm"
      :clearable="false"
      className="test_fa2_initial_layout_algorithm_select"
      @change="update('initialAlgorithm', $event)"
    />
  </Field>

  <component
    :is="layoutSettingsComponentMap[modelValue.initialAlgorithm]"
    v-if="modelValue.initialAlgorithm !== 'circular'"
    :model-value="modelValue"
    :keyOptions="keyOptions"
    @update:model-value="this.$emit('update:modelValue', $event)"
  />
</template>

<script>
import { markRaw } from 'vue'
import { applyPureReactInVue } from 'veaury'
import Field from 'react-chart-editor/lib/components/fields/Field'
import NumericInput from 'react-chart-editor/lib/components/widgets/NumericInput'
import Dropdown from 'react-chart-editor/lib/components/widgets/Dropdown'
import 'react-chart-editor/lib/react-chart-editor.css'
import CirclePackLayoutSettings from '@/components/Graph/CirclePackLayoutSettings.vue'
import RandomLayoutSettings from '@/components/Graph/RandomLayoutSettings.vue'

export default {
  components: {
    Field: applyPureReactInVue(Field),
    Dropdown: applyPureReactInVue(Dropdown),
    NumericInput: applyPureReactInVue(NumericInput),
    RandomLayoutSettings,
    CirclePackLayoutSettings
  },
  props: {
    modelValue: Object,
    keyOptions: Array
  },
  emits: ['update:modelValue'],
  data() {
    return {
      layoutOptions: markRaw([
        { label: 'Circular', value: 'circular' },
        { label: 'Random', value: 'random' },
        { label: 'Circle pack', value: 'circlepack' }
      ]),
      layoutSettingsComponentMap: markRaw({
        random: RandomLayoutSettings,
        circlepack: CirclePackLayoutSettings
      })
    }
  },
  methods: {
    update(attributeName, value) {
      this.$emit('update:modelValue', {
        ...this.modelValue,
        [attributeName]: value
      })
    }
  }
}
</script>
