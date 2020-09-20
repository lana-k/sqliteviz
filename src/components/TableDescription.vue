<template>
  <div>
    <div @click="colVisible = !colVisible" class="table-name">{{ name }}</div>
    <div v-show="colVisible" class="columns">
      <div v-for="(col, index) in columns" :key="index">
        {{ col.name }}, {{ col.type }}
      </div>
    </div>
  </div>
</template>

<script>
import sqliteParser from 'sqlite-parser'

export default {
  name: 'TableDescription',
  props: ['name', 'sql'],
  data () {
    return {
      colVisible: false
    }
  },
  computed: {
    ast () {
      return sqliteParser(this.sql)
    },
    columns () {
      const columns = []
      this.ast.statement[0].definition.forEach(item => {
        if (item.variant === 'column') {
          let type = item.datatype.variant
          if (item.datatype.args) {
            type = type + '(' + item.datatype.args.expression[0].value
            if (item.datatype.args.expression.length === 2) {
              type = type + ', ' + item.datatype.args.expression[1].value
            }
            type = type + ')'
          }
          columns.push({ name: item.name, type: type })
        }
      })
      return columns
    }
  }
}
</script>
<style scoped>
.table-name:hover {
  cursor: pointer;
}
.columns {
  margin-left: 30px;
}
</style>
