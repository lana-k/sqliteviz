<template>
    <div class="record-navigator">
        <icon-button
            :disabled="value === 0"
            tooltip="First row"
            tooltip-position="top-left"
            class="first"
            @click="$emit('input', 0)"
        >
            <edge-arrow-icon :disabled="false" />
        </icon-button>
        <icon-button
            :disabled="value === 0"
            tooltip="Previous row"
            tooltip-position="top-left"
            class="prev"
            @click="$emit('input', value - 1)"
        >
            <arrow-icon :disabled="false" />
        </icon-button>
        <icon-button
            :disabled="value === total - 1"
            tooltip="Next row"
            tooltip-position="top-left"
            class="next"
            @click="$emit('input', value + 1)"
        >
            <arrow-icon :disabled="false" />
        </icon-button>
        <icon-button
            :disabled="value === total - 1"
            tooltip="Last row"
            tooltip-position="top-left"
            class="last"
            @click="$emit('input', total - 1)"
        >
            <edge-arrow-icon :disabled="false" />
        </icon-button>
    </div>
</template>

<script>
import IconButton from '@/components/IconButton'
import ArrowIcon from '@/components/svg/arrow'
import EdgeArrowIcon from '@/components/svg/edgeArrow'

export default {
  components: {
    IconButton,
    ArrowIcon,
    EdgeArrowIcon
  },
  props: {
    value: Number,
    total: Number
  }
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
