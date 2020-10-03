<template>
  <div>
    <div id="rounded-bg">
      <div id="header-container" ref="header-container">
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
      <div id="table-container" ref="table-container" @scroll="onScrollTable" :style="{height: `${height}px`}">
      <table id="table">
        <thead>
          <tr>
            <th v-for="(th,index) in data.columns" :key="index">
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
        this.header = Array.from(document.querySelectorAll('th')).map(th => {
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
    new ResizeObserver(this.calculateHeadersWidth).observe(document.getElementById('table'))
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
#rounded-bg {
  padding: 40px 5px 5px;
  background-color: white;
  border-radius: 5px;
  position: relative;
}
#header-container {
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  padding-left: 6px;
  width: 100%;
  box-sizing: border-box;
  background-color: var(--color-bg-dark);
  border-radius: 5px 5px 0 0;
}

#header-container div {
  display: flex;
  width: fit-content;
  padding-right: 10px;
}
#table-container {
  width: 100%;
  /* height: 200px; */
  overflow: auto;
}
table {
  min-width: 100%;
  margin-top: -40px;
  border-collapse: collapse;
}
thead th, .fixed-header {
  font-size: 14px;
  font-weight: 600;
  box-sizing: border-box;
  background-color: var(--color-bg-dark);
  color: var(--color-text-light);
  border-right: 1px solid var(--color-border-light);
}
tbody td {
  font-size: 13px;
  background-color:white;
  color: var(--color-text-base);
  box-sizing: border-box;
  border-bottom: 1px solid var(--color-border-light);
  border-right: 1px solid var(--color-border-light);
}
td, th, .fixed-header {
  padding: 12px 24px;
  white-space: nowrap;
}

tbody tr td:last-child,
thead tr th:last-child,
#header-container div .fixed-header:last-child {
  border-right: none;
}

td > div.cell-data {
  width: -webkit-max-content;
  width: -moz-max-content;
  width: max-content;
  white-space: nowrap;
  /* max-width: 250px; */
  overflow: hidden;
  text-overflow: ellipsis;
}
.table-footer {
  display: flex;
  justify-content: space-between;
  padding: 6px 12px;
}
.table-footer-count {
  font-size: 11px;
  color: var(--color-text-base);
}
</style>
