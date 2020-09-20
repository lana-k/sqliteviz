<template>
  <vue-good-table v-if="data" :columns="columns" :rows="rows"/>
</template>

<script>
import 'vue-good-table/dist/vue-good-table.css'
import { VueGoodTable } from 'vue-good-table'

export default {
  name: 'SqlTable',
  components: { VueGoodTable },
  props: ['data'],
  computed: {
    columns () {
      const columns = []
      this.data.columns.forEach(column => {
        columns.push({ label: column, field: column })
      })
      return columns
    },
    rows () {
      const rows = []
      this.data.values.forEach(row => {
        const newRow = {}
        row.forEach((value, index) => {
          const column = this.data.columns[index]
          newRow[column] = value
        })
        rows.push(newRow)
      })
      return rows
    }
  }
}
</script>
