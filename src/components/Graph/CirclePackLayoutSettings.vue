<template>
  <Field
    label="Hierarchy attributes"
    fieldContainerClassName="multiselect-field"
  >
    <multiselect
      :modelValue="modelValue.hierarchyAttributes"
      class="sqliteviz-select"
      :options="keyOptions"
      :multiple="true"
      :hideSelected="true"
      :closeOnSelect="true"
      :showLabels="false"
      :max="keyOptions.length"
      placeholder=""
      openDirection="bottom"
      @update:model-value="update('hierarchyAttributes', $event)"
    >
      <template #maxElements>
        <span class="no-results">No Results</span>
      </template>

      <template #placeholder>Select an Option</template>

      <template #noResult>
        <span class="no-results">No Results</span>
      </template>
    </multiselect>
  </Field>

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
import Dropdown from 'react-chart-editor/lib/components/widgets/Dropdown'
import Multiselect from 'vue-multiselect'
import 'react-chart-editor/lib/react-chart-editor.css'

export default {
  components: {
    Field: applyPureReactInVue(Field),
    NumericInput: applyPureReactInVue(NumericInput),
    Dropdown: applyPureReactInVue(Dropdown),
    Multiselect
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

<style scoped>
:deep(.sqliteviz-select.multiselect--active .multiselect__input) {
  width: 100% !important;
}
:deep(.multiselect-field .field__widget > *) {
  flex-grow: 1 !important;
}
</style>
