<template>
  <Field label="Seed value">
    <NumericInput
      :value="modelValue.seedValue"
      @update="update('seedValue', $event)"
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
    modelValue: Object
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
