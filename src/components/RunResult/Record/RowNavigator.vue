<template>
  <div class="record-navigator">
    <icon-button
      icon="myicon myicon-edge-arrow"
      iconColor="var(--color-text-base)"
      :disabled="modelValue === 0"
      tooltip="First row"
      tooltipPosition="top-left"
      class="first"
      @click="$emit('update:modelValue', 0)"
    />
    <icon-button
      icon="myicon myicon-arrow"
      iconColor="var(--color-text-base)"
      :disabled="modelValue === 0"
      tooltip="Previous row"
      tooltipPosition="top-left"
      class="prev"
      @click="$emit('update:modelValue', modelValue - 1)"
    />
    <icon-button
      icon="myicon myicon-arrow"
      iconColor="var(--color-text-base)"
      :disabled="modelValue === total - 1"
      tooltip="Next row"
      tooltipPosition="top-left"
      class="next"
      @click="$emit('update:modelValue', modelValue + 1)"
    />
    <icon-button
      icon="myicon myicon-edge-arrow"
      iconColor="var(--color-text-base)"
      :disabled="modelValue === total - 1"
      tooltip="Last row"
      tooltipPosition="top-left"
      class="last"
      @click="$emit('update:modelValue', total - 1)"
    />
  </div>
</template>

<script>
import IconButton from '@/components/Common/IconButton'

export default {
  components: {
    IconButton
  },
  props: {
    modelValue: Number,
    total: Number
  },
  emits: ['update:modelValue']
}
</script>

<style scoped>
.record-navigator {
  display: flex;
}

.record-navigator .next :deep(i),
.record-navigator .last :deep(i) {
  transform: rotate(180deg);
}
</style>
