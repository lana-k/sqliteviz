<template>
  <div class="record-view">
    <div class="table-container">
      <table
        ref="table"
        class="sqliteviz-table"
        tabindex="0"
        @keydown="onTableKeydown"
      >
        <thead>
          <tr>
            <th/>
            <th>
              <div class="cell-data">
                Row #{{ currentRowIndex + 1 }}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(col, index) in columns" :key="index">
            <th>{{ col }}</th>
            <td
              :data-col="1"
              :data-row="index"
              :key="index"
              :aria-selected="false"
              @click="onCellClick"
            >
              <div class="cell-data">
                {{ dataSet.values[col][currentRowIndex] }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="table-footer">
      <div class="table-footer-count">
        {{ rowCount }} {{rowCount === 1 ? 'row' : 'rows'}} retrieved
        <span v-if="time">in {{ time }}</span>
      </div>

     <row-navigator v-model="currentRowIndex" :total="rowCount"/>
    </div>
  </div>
</template>

<script>
import RowNavigator from './RowNavigator.vue'

export default {
  components: { RowNavigator },
  props: {
    dataSet: Object,
    time: String,
    rowIndex: { type: Number, default: 0 },
    selectedColumnIndex: Number
  },
  data () {
    return {
      selectedCellElement: null,
      currentRowIndex: this.rowIndex
    }
  },
  computed: {
    columns () {
      return this.dataSet.columns
    },
    rowCount () {
      return this.dataSet.values[this.columns[0]].length
    }
  },
  mounted () {
    const cell = this.$refs.table
      .querySelector(`td[data-col="1"][data-row="${this.selectedColumnIndex}"]`)
    if (cell) {
      this.selectCell(cell)
    }
  },
  watch: {
    currentRowIndex () {
      if (this.selectedCellElement) {
        const previouslySelected = this.selectedCellElement
        this.selectCell(null)
        this.selectCell(previouslySelected)
      }
    }
  },
  methods: {
    onTableKeydown (e) {
      const keyCodeMap = {
        38: 'up',
        40: 'down'
      }

      if (
        !this.selectedCellElement ||
        !Object.keys(keyCodeMap).includes(e.keyCode.toString())
      ) {
        return
      }
      e.preventDefault()

      this.moveFocusInTable(this.selectedCellElement, keyCodeMap[e.keyCode])
    },
    onCellClick (e) {
      this.selectCell(e.target.closest('td'), false)
    },
    selectCell (cell, scrollTo = true) {
      if (!cell) {
        if (this.selectedCellElement) {
          this.selectedCellElement.ariaSelected = 'false'
        }
        this.selectedCellElement = cell
      } else if (!cell.ariaSelected || cell.ariaSelected === 'false') {
        if (this.selectedCellElement) {
          this.selectedCellElement.ariaSelected = 'false'
        }
        cell.ariaSelected = 'true'
        this.selectedCellElement = cell
      } else {
        cell.ariaSelected = 'false'
        this.selectedCellElement = null
      }

      if (this.selectedCellElement && scrollTo) {
        this.selectedCellElement.scrollIntoView()
      }

      this.$emit('updateSelectedCell', this.selectedCellElement)
    },
    moveFocusInTable (initialCell, direction) {
      const currentRowIndex = +initialCell.dataset.row
      const newRowIndex = direction === 'up'
        ? currentRowIndex - 1
        : currentRowIndex + 1

      const newCell = this.$refs.table
        .querySelector(`td[data-col="1"][data-row="${newRowIndex}"]`)
      if (newCell) {
        this.selectCell(newCell)
      }
    }
  }
}
</script>

<style scoped>
table.sqliteviz-table:focus {
  outline: none;
}
.sqliteviz-table tbody td:hover {
  background-color: var(--color-bg-light-3);
}
.sqliteviz-table tbody td[aria-selected="true"] {
  box-shadow: inset 0 0 0 1px var(--color-accent);
}

table.sqliteviz-table {
  margin-top: 0;
}
.sqliteviz-table thead tr th {
  border-bottom: 1px solid var(--color-border-light);
}
.sqliteviz-table tbody tr th {
  font-size: 14px;
  font-weight: 600;
  box-sizing: border-box;
  background-color: var(--color-bg-dark);
  color: var(--color-text-light);
  border-bottom: 1px solid var(--color-border-light);
  border-right: 1px solid var(--color-border-light);
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

.table-footer {
  align-items: center;
}
.record-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.table-container {
  flex-grow: 1;
  overflow: auto;
}
</style>
