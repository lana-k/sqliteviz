<template>
  <Field label="Color">
    <RadioBlocks
      :options="nodeColorTypeOptions"
      :activeOption="modelValue.type"
      @option-change="updateColorType"
    />
    <Field v-if="modelValue.type === 'constant'">
      <ColorPicker
        :selectedColor="modelValue.value"
        @color-change="updateSettings('value', $event)"
      />
    </Field>
    <template v-else>
      <Field>
        <Dropdown
          v-if="modelValue.type === 'variable'"
          :options="keyOptions"
          :value="modelValue.source"
          @change="updateSettings('source', $event)"
        />
        <Dropdown
          v-if="modelValue.type === 'calculated'"
          :options="nodeCalculatedColorMethodOptions"
          :value="modelValue.method"
          @change="updateSettings('method', $event)"
        />
      </Field>

      <Field v-if="modelValue.type === 'variable'">
        <RadioBlocks
          :options="colorSourceUsageOptions"
          :activeOption="modelValue.sourceUsage"
          @option-change="updateSettings('sourceUsage', $event)"
        />
      </Field>

      <Field v-if="modelValue.sourceUsage === 'map_to'">
        <ColorscalePicker
          :selected="modelValue.colorscale"
          className="colorscale-picker"
          @colorscale-change="updateSettings('colorscale', $event)"
        />
      </Field>
    </template>
  </Field>

  <Field
    v-if="modelValue.type !== 'constant' && modelValue.sourceUsage === 'map_to'"
    label="Color as"
  >
    <RadioBlocks
      :options="сolorAsOptions"
      :activeOption="modelValue.mode"
      @option-change="updateSettings('mode', $event)"
    />
  </Field>

  <Field
    v-if="modelValue.type !== 'constant' && modelValue.sourceUsage === 'map_to'"
    label="Colorscale direction"
  >
    <RadioBlocks
      :options="сolorscaleDirections"
      :activeOption="modelValue.colorscaleDirection"
      @option-change="updateSettings('colorscaleDirection', $event)"
    />
  </Field>
</template>

<script>
import { markRaw } from 'vue'
import { applyPureReactInVue } from 'veaury'
import Dropdown from 'react-chart-editor/lib/components/widgets/Dropdown'
import RadioBlocks from 'react-chart-editor/lib/components/widgets/RadioBlocks'
import ColorscalePicker from 'react-chart-editor/lib/components/widgets/ColorscalePicker'
import ColorPicker from 'react-chart-editor/lib/components/widgets/ColorPicker'
import Field from 'react-chart-editor/lib/components/fields/Field'
import 'react-chart-editor/lib/react-chart-editor.css'

export default {
  components: {
    Dropdown: applyPureReactInVue(Dropdown),
    RadioBlocks: applyPureReactInVue(RadioBlocks),
    Field: applyPureReactInVue(Field),
    ColorscalePicker: applyPureReactInVue(ColorscalePicker),
    ColorPicker: applyPureReactInVue(ColorPicker)
  },
  props: {
    modelValue: Object,
    keyOptions: Array
  },
  emits: ['update:modelValue'],
  data() {
    return {
      nodeColorTypeOptions: markRaw([
        { label: 'Constant', value: 'constant' },
        { label: 'Variable', value: 'variable' },
        { label: 'Calculated', value: 'calculated' }
      ]),
      nodeCalculatedColorMethodOptions: markRaw([
        { label: 'Degree', value: 'degree' },
        { label: 'In degree', value: 'inDegree' },
        { label: 'Out degree', value: 'outDegree' }
      ]),
      сolorAsOptions: markRaw([
        { label: 'Continious', value: 'continious' },
        { label: 'Categorical', value: 'categorical' }
      ]),
      сolorscaleDirections: markRaw([
        { label: 'Normal', value: 'normal' },
        { label: 'Recersed', value: 'reversed' }
      ]),
      colorSourceUsageOptions: markRaw([
        { label: 'Direct', value: 'direct' },
        { label: 'Map to', value: 'map_to' }
      ]),
      defaultColorSettings: {
        constant: { value: '#1F77B4' },
        variable: {
          source: null,
          sourceUsage: 'map_to',
          colorscale: null,
          mode: 'categorical',
          colorscaleDirection: 'normal'
        },
        calculated: {
          method: 'degree',
          sourceUsage: 'map_to',
          colorscale: null,
          mode: 'continious',
          colorscaleDirection: 'normal'
        }
      }
    }
  },
  methods: {
    updateColorType(newColorType) {
      const currentColorType = this.modelValue.type
      this.defaultColorSettings[currentColorType] = this.modelValue

      this.$emit('update:modelValue', {
        type: newColorType,
        ...this.defaultColorSettings[newColorType]
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

<style scoped>
:deep(.customPickerContainer) {
  float: right;
}
</style>
