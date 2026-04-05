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

  <Field
    v-if="modelValue.initialAlgorithm === 'random'"
    label="Seed value"
    fieldContainerClassName="test_fa2_seed_value"
  >
    <NumericInput
      :value="modelValue.seedValue"
      @update="update('seedValue', $event)"
    />
  </Field>
</template>

<script>
import { markRaw } from 'vue'
import { applyPureReactInVue } from 'veaury'
import Field from 'react-chart-editor/lib/components/fields/Field'
import NumericInput from 'react-chart-editor/lib/components/widgets/NumericInput'
import Dropdown from 'react-chart-editor/lib/components/widgets/Dropdown'
import 'react-chart-editor/lib/react-chart-editor.css'

export default {
  components: {
    Field: applyPureReactInVue(Field),
    Dropdown: applyPureReactInVue(Dropdown),
    NumericInput: applyPureReactInVue(NumericInput)
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
        { label: 'Random', value: 'random' }
      ])
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
