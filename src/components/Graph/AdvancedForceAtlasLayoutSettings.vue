<template>
  <Field label="Scaling ratio">
    <NumericInput
      :value="modelValue.scalingRatio"
      @update="update('scalingRatio', $event)"
    />
  </Field>

  <Field label="Prevent overlapping">
    <RadioBlocks
      :options="booleanOptions"
      :activeOption="modelValue.adjustSizes"
      @option-change="update('adjustSizes', $event)"
    />
  </Field>

  <Field label="Barnes-Hut optimize">
    <RadioBlocks
      :options="booleanOptions"
      :activeOption="modelValue.barnesHutOptimize"
      @option-change="update('barnesHutOptimize', $event)"
    />
  </Field>

  <Field v-show="modelValue.barnesHutOptimize" label="Barnes-Hut Theta">
    <NumericInput
      :value="modelValue.barnesHutTheta"
      @update="update('barnesHutTheta', $event)"
    />
  </Field>

  <Field label="Strong gravity mode">
    <RadioBlocks
      :options="booleanOptions"
      :activeOption="modelValue.strongGravityMode"
      @option-change="update('strongGravityMode', $event)"
    />
  </Field>

  <Field label="Noack's LinLog model">
    <RadioBlocks
      :options="booleanOptions"
      :activeOption="modelValue.linLogMode"
      @option-change="update('linLogMode', $event)"
    />
  </Field>

  <Field label="Out bound attraction distribution">
    <RadioBlocks
      :options="booleanOptions"
      :activeOption="modelValue.outboundAttractionDistribution"
      @option-change="update('outboundAttractionDistribution', $event)"
    />
  </Field>

  <Field label="Slow down">
    <NumericInput
      :value="modelValue.slowDown"
      :min="0"
      @update="update('slowDown', $event)"
    />
  </Field>

  <Field label="Edge weight">
    <Dropdown
      :options="keyOptions"
      :value="modelValue.weightSource"
      @change="update('weightSource', $event)"
    />
  </Field>
  <Field v-show="modelValue.weightSource" label="Edge weight influence">
    <NumericInput
      :value="modelValue.edgeWeightInfluence"
      @update="update('edgeWeightInfluence', $event)"
    />
  </Field>
</template>

<script>
import { markRaw } from 'vue'
import { applyPureReactInVue } from 'veaury'
import Field from 'react-chart-editor/lib/components/fields/Field'
import RadioBlocks from 'react-chart-editor/lib/components/widgets/RadioBlocks'
import NumericInput from 'react-chart-editor/lib/components/widgets/NumericInput'
import Dropdown from 'react-chart-editor/lib/components/widgets/Dropdown'
import 'react-chart-editor/lib/react-chart-editor.css'

export default {
  components: {
    Field: applyPureReactInVue(Field),
    RadioBlocks: applyPureReactInVue(RadioBlocks),
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
      booleanOptions: markRaw([
        { label: 'Yes', value: true },
        { label: 'No', value: false }
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
