<template>
  <svg
    :class="['sort-icon', { horizontal }, { asc }]"
    width="6"
    height="12"
    viewBox="0 0 6 12"
    fill="none"
  >
    <path
      d="M2.99932 -3.63032e-05C2.75092 -3.63032e-05 2.54932 0.201563 2.54932 0.449964L2.54932
        11.55C2.54932 11.7984 2.75092 12 2.99932 12C3.24772 12 3.44932 11.7984 3.44932
        11.55L3.44932 0.449964C3.44932 0.201563 3.24772 -3.63032e-05 2.99932 -3.63032e-05Z"
      fill="#506784"
    />
    <path
      d="M2.99915 1.80492e-05C2.8839 1.80492e-05 2.76865 0.0438534 2.68109 0.132073L0.581055
        2.232C0.405273 2.40789 0.405273 2.69287 0.581055 2.86865C0.756946 3.04443 1.04193 3.04443
        1.21771 2.86865L2.99969 1.08667L4.78168 2.86865C4.95746 3.04443 5.24255 3.04443 5.41833
        2.86865C5.59412 2.69287 5.59412 2.40789 5.41833 2.232L3.3183 0.132073C3.22953 0.0438534
        3.11428 1.80492e-05 2.99915 1.80492e-05V1.80492e-05Z"
      fill="#506784"
    />
  </svg>
</template>

<script>
export default {
  name: 'SortIcon',
  props: {
    horizontal: {
      type: Boolean,
      required: false,
      default: false
    },
    asc: {
      type: Boolean,
      required: false,
      default: true
    }
  }
}
</script>

<style scoped>
svg.asc {
  transform: rotate(180deg);
}

svg.horizontal {
  transform: rotate(-90deg);
}

svg.horizontal.asc {
  transform: rotate(90deg);
}
</style>
