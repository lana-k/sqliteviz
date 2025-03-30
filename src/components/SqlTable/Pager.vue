<template>
  <paginate
    v-model="page"
    :page-count="pageCount"
    :page-range="5"
    :margin-pages="1"
    :prev-text="chevron"
    :next-text="chevron"
    :no-li-surround="true"
    container-class="paginator-continer"
    page-link-class="paginator-page-link"
    active-class="paginator-active-page"
    break-view-link-class="paginator-break"
    next-link-class="paginator-next"
    prev-link-class="paginator-prev"
    disabled-class="paginator-disabled"
  />
</template>

<script>
import Paginate from 'vuejs-paginate-next'

export default {
  name: 'Pager',
  components: { Paginate },
  props: {
    pageCount: Number,
    modelValue: Number
  },
  emits: ['update:modelValue'],
  data() {
    return {
      page: this.modelValue,
      chevron: `
        <svg width="9" height="9" viewBox="0 0 8 12" fill="none">
        <path
          d="M0.721924 9.93097L4.85292 5.79997L0.721924 1.66897L1.99992 0.399973L7.39992
            5.79997L1.99992 11.2L0.721924 9.93097Z" fill="#506784"
        />
        </svg>
      `
    }
  },
  watch: {
    page() {
      this.$emit('update:modelValue', this.page)
    },
    modelValue() {
      this.page = this.modelValue
    }
  }
}
</script>

<style scoped>
.paginator-continer {
  display: flex;
  align-items: center;
  line-height: 10px;
}
:deep(a) {
  cursor: pointer;
}

:deep(.paginator-page-link) {
  padding: 2px 3px;
  margin: 0 5px;
  display: block;
  color: var(--color-text-base);
  font-size: 11px;
}
:deep(.paginator-page-link:hover) {
  color: var(--color-text-active);
}
:deep(.paginator-page-link:active),
:deep(.paginator-page-link:visited),
:deep(.paginator-page-link:focus),
:deep(.paginator-next:active),
:deep(.paginator-next:visited),
:deep(.paginator-next:focus),
:deep(.paginator-prev:active),
:deep(.paginator-prev:visited),
:deep(.paginator-prev:focus) {
  outline: none;
}

:deep(.paginator-active-page),
:deep(.paginator-active-page:hover) {
  color: var(--color-accent);
}

:deep(.paginator-break:hover),
:deep(.paginator-disabled:hover) {
  cursor: default;
}

:deep(.paginator-prev svg) {
  transform: rotate(180deg);
}

:deep(.paginator-next:hover path),
:deep(.paginator-prev:hover path) {
  fill: var(--color-text-active);
}
:deep(.paginator-disabled path),
:deep(.paginator-disabled:hover path) {
  fill: var(--color-text-light-2);
}
</style>
