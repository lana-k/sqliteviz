<template>
  <Field label="Size" fieldContainerClassName="test_node_size">
    <RadioBlocks
      :options="nodeSizeTypeOptions"
      :activeOption="modelValue.type"
      @option-change="updateSizeType"
    />

    <Field fieldContainerClassName="test_node_size_value">
      <NumericInput
        v-if="modelValue.type === 'constant'"
        :value="modelValue.value"
        :min="1"
        class="test_node_size_value"
        @update="updateSettings('value', $event)"
      />
      <Dropdown
        v-if="modelValue.type === 'variable'"
        :options="keyOptions"
        :value="modelValue.source"
        @change="updateSettings('source', $event)"
      />
      <Dropdown
        v-if="modelValue.type === 'calculated'"
        :options="nodeCalculatedSizeMethodOptions"
        :value="modelValue.method"
        :clearable="false"
        @change="updateSettings('method', $event)"
      />
    </Field>
  </Field>

  <template v-if="modelValue.type !== 'constant'">
    <Field label="Size scale" fieldContainerClassName="test_node_size_scale">
      <NumericInput
        :value="modelValue.scale"
        @update="updateSettings('scale', $event)"
      />
    </Field>

    <Field label="Size mode" fieldContainerClassName="test_node_size_mode">
      <RadioBlocks
        :options="nodeSizeModeOptions"
        :activeOption="modelValue.mode"
        @option-change="updateSettings('mode', $event)"
      />
    </Field>

    <Field label="Minimum size" fieldContainerClassName="test_node_size_min">
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
      nodeSizeTypeOptions: markRaw([
        { label: 'Constant', value: 'constant' },
        { label: 'Variable', value: 'variable' },
        { label: 'Calculated', value: 'calculated' }
      ]),
      nodeCalculatedSizeMethodOptions: markRaw([
        { label: 'Degree', value: 'degree' },
        { label: 'In degree', value: 'inDegree' },
        { label: 'Out degree', value: 'outDegree' }
      ]),
      nodeSizeModeOptions: markRaw([
        { label: 'Area', value: 'area' },
        { label: 'Diameter', value: 'diameter' }
      ]),
      defaultSizeSettings: {
        constant: { value: 4 },
        variable: { source: null, scale: 1, mode: 'diameter', min: 1 },
        calculated: { method: 'degree', scale: 1, mode: 'diameter', min: 1 }
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
