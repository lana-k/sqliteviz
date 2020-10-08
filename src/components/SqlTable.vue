<template>
  <div>
    <div class="rounded-bg">
      <div class="header-container" ref="header-container">
        <div>
          <div
            v-for="(th, index) in header"
            class="fixed-header"
            :style="{ width: `${th.width}px` }"
            :key="index"
          >
            {{ th.name }}
          </div>
      </div>
      </div>
      <div
        class="table-container"
        ref="table-container"
        @scroll="onScrollTable"
        :style="{height: `${height}px`}"
      >
      <table ref="table">
        <thead>
          <tr>
            <th v-for="(th,index) in data.columns" :key="index" ref="th">
              <div class="cell-data" :style="cellStyle">{{ th }}</div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row,index) in currentPageData" :key="index">
            <td v-for="(value, valIndex) in row" :key="valIndex">
              <div class="cell-data" :style="cellStyle">{{ value }}</div>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
    <div class="table-footer">
      <div class="table-footer-count">
        {{ data.values.length}} {{data.values.length === 1 ? 'row' : 'rows'}} retrieved
      </div>
      <pager v-show="pageCount > 1" :page-count="pageCount" v-model="currentPage" />
    </div>
  </div>
</template>

<script>
import Pager from '@/components/Pager'

export default {
  name: 'SqlTable',
  components: { Pager },
  props: ['data', 'height'],
  data () {
    return {
      header: null,
      tableWidth: null,
      currentPage: 1
    }
  },
  computed: {
    cellStyle () {
      const eq = this.tableWidth / this.data.columns.length

      return { maxWidth: `${Math.max(eq, 100)}px` }
    },
    pageSize () {
      return Math.max(Math.floor(this.height / 40), 20)
    },
    pageCount () {
      return Math.ceil(this.data.values.length / this.pageSize)
    },
    currentPageData () {
      const start = (this.currentPage - 1) * this.pageSize
      return this.data.values.slice(start, start + this.pageSize)
    }
  },
  methods: {
    calculateHeadersWidth () {
      this.tableWidth = this.$refs['table-container'].offsetWidth
      this.$nextTick(() => {
        this.header = this.$refs.th.map(th => {
          return { name: th.innerText, width: th.offsetWidth }
        })
      })
    },
    onScrollTable () {
      this.$refs['header-container'].scrollLeft = this.$refs['table-container'].scrollLeft
    },
    functionName () {

    }
  },
  mounted () {
    new ResizeObserver(this.calculateHeadersWidth).observe(this.$refs.table)
    this.calculateHeadersWidth()
  },
  watch: {
    currentPageData: 'calculateHeadersWidth',
    data () {
      this.currentPage = 1
    }
  }
}
</script>

<style scoped>
</style>
