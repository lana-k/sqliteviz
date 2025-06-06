<template>
  <Field label="Size">
    <RadioBlocks
      :options="edgeSizeTypeOptions"
      :activeOption="modelValue.type"
      @option-change="updateSizeType"
    />

    <Field>
      <NumericInput
        v-if="modelValue.type === 'constant'"
        :value="modelValue.value"
        :min="1"
        @update="updateSettings('value', $event)"
      />
      <Dropdown
        v-if="modelValue.type === 'variable'"
        :options="keyOptions"
        :value="modelValue.source"
        @change="updateSettings('source', $event)"
      />
    </Field>
  </Field>

  <template v-if="modelValue.type !== 'constant'">
    <Field label="Size scale">
      <NumericInput
        :value="modelValue.scale"
        @update="updateSettings('scale', $event)"
      />
    </Field>

    <Field label="Minimum size">
      <NumericInput
        :value="modelValue.min"
        @update="updateSettings('min', $event)"
      />
    </Field>
  </template>
</template>

<script>
import { markRaw } from 'vue'
import { applyPureReactInVue } from 'veaury'
import NumericInput from 'react-chart-editor/lib/components/widgets/NumericInput'
import Dropdown from 'react-chart-editor/lib/components/widgets/Dropdown'
import RadioBlocks from 'react-chart-editor/lib/components/widgets/RadioBlocks'
import Field from 'react-chart-editor/lib/components/fields/Field'
import 'react-chart-editor/lib/react-chart-editor.css'

export default {
  components: {
    Dropdown: applyPureReactInVue(Dropdown),
    NumericInput: applyPureReactInVue(NumericInput),
    RadioBlocks: applyPureReactInVue(RadioBlocks),
    Field: applyPureReactInVue(Field)
  },
  props: {
    modelValue: Object,
    keyOptions: Array
  },
  emits: ['update:modelValue'],
  data() {
    return {
      edgeSizeTypeOptions: markRaw([
        { label: 'Constant', value: 'constant' },
        { label: 'Variable', value: 'variable' }
      ]),
      defaultSizeSettings: {
        constant: { value: 4 },
        variable: { source: null, scale: 1, min: 1 }
      }
    }
  },
  methods: {
    updateSizeType(newSizeType) {
      const currentSizeType = this.modelValue.type
      this.defaultSizeSettings[currentSizeType] = this.modelValue

      this.$emit('update:modelValue', {
        type: newSizeType,
        ...this.defaultSizeSettings[newSizeType]
      })
    },
    updateSettings(attributeName, value) {
      this.$emit('update:modelValue', {
        ...this.modelValue,
        [attributeName]: value
      })
    }
  }
}
</script>
