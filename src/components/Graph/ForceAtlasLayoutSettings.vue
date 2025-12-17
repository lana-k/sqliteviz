<template>
  <Field
    label="Initial iterations"
    fieldContainerClassName="test_fa2_iteration_amount"
  >
    <NumericInput
      :value="modelValue.initialIterationsAmount"
      :min="1"
      @update="update('initialIterationsAmount', $event)"
    />
  </Field>

  <Field label="Gravity" fieldContainerClassName="test_fa2_gravity">
    <NumericInput
      :value="modelValue.gravity"
      @update="update('gravity', $event)"
    />
  </Field>
</template>

<script>
import { applyPureReactInVue } from 'veaury'
import Field from 'react-chart-editor/lib/components/fields/Field'
import NumericInput from 'react-chart-editor/lib/components/widgets/NumericInput'
import 'react-chart-editor/lib/react-chart-editor.css'

export default {
  components: {
    Field: applyPureReactInVue(Field),
    NumericInput: applyPureReactInVue(NumericInput)
  },
  props: {
    modelValue: Object,
    keyOptions: Array
  },
  emits: ['update:modelValue'],
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
