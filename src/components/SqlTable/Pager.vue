<template>
  <paginate
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
    v-model="page"
  />
</template>

<script>
import Paginate from 'vuejs-paginate'

export default {
  name: 'Pager',
  components: { Paginate },
  props: ['pageCount', 'value'],
  data () {
    return {
      page: this.value,
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
    page () {
      this.$emit('input', this.page)
    },
    value () {
      this.page = this.value
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
>>> .paginator-page-link {
  padding: 2px 3px;
  margin: 0 5px;
  display: block;
  color: var(--color-text-base);
  font-size: 11px;
}
>>> .paginator-page-link:hover {
  color: var(--color-text-active);
}
>>> .paginator-page-link:active,
>>> .paginator-page-link:visited,
>>> .paginator-page-link:focus,
>>> .paginator-next:active,
>>> .paginator-next:visited,
>>> .paginator-next:focus,
>>> .paginator-prev:active,
>>> .paginator-prev:visited,
>>> .paginator-prev:focus {
  outline: none;
}

>>> .paginator-active-page,
>>> .paginator-active-page:hover {
  color: var(--color-accent);
}

>>> .paginator-break:hover,
>>> .paginator-disabled:hover {
  cursor: default;
}

>>> .paginator-prev svg {
  transform: rotate(180deg);
}

>>> .paginator-next:hover path,
>>> .paginator-prev:hover path {
   fill: var(--color-text-active);
}
>>> .paginator-disabled path,
>>> .paginator-disabled:hover path {
  fill: var(--color-text-light-2);
}
</style>
