<template>
  <div class="record-navigator">
    <icon-button
      :disabled="modelValue === 0"
      tooltip="First row"
      tooltipPosition="top-left"
      class="first"
      @click="$emit('update:modelValue', 0)"
    >
      <edge-arrow-icon :disabled="false" />
    </icon-button>
    <icon-button
      :disabled="modelValue === 0"
      tooltip="Previous row"
      tooltipPosition="top-left"
      class="prev"
      @click="$emit('update:modelValue', modelValue - 1)"
    >
      <arrow-icon :disabled="false" />
    </icon-button>
    <icon-button
      :disabled="modelValue === total - 1"
      tooltip="Next row"
      tooltipPosition="top-left"
      class="next"
      @click="$emit('update:modelValue', modelValue + 1)"
    >
      <arrow-icon :disabled="false" />
    </icon-button>
    <icon-button
      :disabled="modelValue === total - 1"
      tooltip="Last row"
      tooltipPosition="top-left"
      class="last"
      @click="$emit('update:modelValue', total - 1)"
    >
      <edge-arrow-icon :disabled="false" />
    </icon-button>
  </div>
</template>

<script>
import IconButton from '@/components/Common/IconButton'
import ArrowIcon from '@/components/svg/arrow'
import EdgeArrowIcon from '@/components/svg/edgeArrow'

export default {
  components: {
    IconButton,
    ArrowIcon,
    EdgeArrowIcon
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

.record-navigator .next,
.record-navigator .last {
  transform: rotate(180deg);
}
</style>
