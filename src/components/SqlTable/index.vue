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
      >
      <table ref="table" class="sqliteviz-table">
        <thead>
          <tr>
            <th v-for="(th, index) in columns" :key="index" ref="th">
              <div class="cell-data" :style="cellStyle">{{ th }}</div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rowIndex in currentPageData.count" :key="rowIndex">
            <td v-for="(col, colIndex) in columns" :key="colIndex">
              <div class="cell-data" :style="cellStyle">
                {{ dataSet.values[col][rowIndex - 1 + currentPageData.start] }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
    <div class="table-footer">
      <div class="table-footer-count">
        {{ rowCount }} {{rowCount === 1 ? 'row' : 'rows'}} retrieved
        <span v-if="preview">for preview</span>
        <span v-if="time">in {{ time }}</span>
      </div>
      <pager v-show="pageCount > 1" :page-count="pageCount" v-model="currentPage" />
    </div>
  </div>
</template>

<script>
import Pager from './Pager'

export default {
  name: 'SqlTable',
  components: { Pager },
  props: {
    dataSet: Object,
    time: String,
    pageSize: {
      type: Number,
      default: 20
    },
    preview: Boolean
  },
  data () {
    return {
      header: null,
      tableWidth: null,
      currentPage: 1,
      resizeObserver: null
    }
  },
  computed: {
    columns () {
      return this.dataSet.columns
    },
    rowCount () {
      return this.dataSet.values[this.columns[0]].length
    },
    cellStyle () {
      const eq = this.tableWidth / this.columns.length
      return { maxWidth: `${Math.max(eq, 100)}px` }
    },
    pageCount () {
      return Math.ceil(this.rowCount / this.pageSize)
    },
    currentPageData () {
      const start = (this.currentPage - 1) * this.pageSize
      let end = start + this.pageSize
      if (end > this.rowCount - 1) {
        end = this.rowCount - 1
      }
      return {
        start,
        end,
        count: end - start + 1
      }
    }
  },
  methods: {
    calculateHeadersWidth () {
      this.tableWidth = this.$refs['table-container'].offsetWidth
      this.$nextTick(() => {
        this.header = this.$refs.th.map(th => {
          return { name: th.innerText, width: th.getBoundingClientRect().width }
        })
      })
    },
    onScrollTable () {
      this.$refs['header-container'].scrollLeft = this.$refs['table-container'].scrollLeft
    }
  },
  mounted () {
    this.resizeObserver = new ResizeObserver(this.calculateHeadersWidth)
    this.resizeObserver.observe(this.$refs.table)
    this.calculateHeadersWidth()
  },
  beforeDestroy () {
    this.resizeObserver.unobserve(this.$refs.table)
  },
  watch: {
    currentPageData: 'calculateHeadersWidth',
    dataSet () {
      this.currentPage = 1
    }
  }
}
</script>

<style scoped>
</style>
