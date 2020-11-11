<template>
  <div>
    <div @click="colVisible = !colVisible" class="table-name">
      <svg
        :style="{transform: colVisible ? 'rotate(90deg)' : 'rotate(0)'}"
        class="chevron-icon"
        width="9"
        height="9"
        viewBox="0 0 8 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0.721924 9.93097L4.85292 5.79997L0.721924 1.66897L1.99992 0.399973L7.39992 5.79997L1.99992 11.2L0.721924 9.93097Z"
          :fill="colVisible ? '#506784' : 'rgba(80, 103, 132, 0.5)'"
        />
      </svg>
      {{ name }}
    </div>
    <div v-show="colVisible" class="columns">
      <div v-for="(col, index) in columns" :key="index" class="column">
        {{ col.name }}
        <span class="column-type">{{ col.type }}</span>
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
      // There is a bug is sqlite-parser
      // It throws an error if tokenizer has an arguments:
      // https://github.com/codeschool/sqlite-parser/issues/59
      const fixedSql = this.sql
        .replace(/(?<=tokenize=.+)"tokenchars=.+"/, '')
        .replace(/(?<=tokenize=.+)"remove_diacritics=.+"/, '')
        .replace(/(?<=tokenize=.+)"separators=.+"/, '')
        .replace(/tokenize=.+(?=(,|\)))/, 'tokenize=unicode61')

      return sqliteParser(fixedSql)
    },
    columns () {
      const columns = []

      const columnDefinition = this.ast.statement[0].format === 'table'
        ? this.ast.statement[0].definition
        : this.ast.statement[0].result.args.expression // virtual table

      columnDefinition.forEach(item => {
        if (item.variant === 'column' && ['identifier', 'definition'].includes(item.type)) {
          let type = item.datatype ? item.datatype.variant : 'N/A'
          if (item.datatype && item.datatype.args) {
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
.table-name, .column {
  margin-top: 11px;
}

.table-name:hover {
  cursor: pointer;
}
.columns {
  margin-left: 24px;
}
.column-type {
  display: inline-block;
  background-color: var(--color-gray-light-4);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-small);
  padding: 2px 6px;
  font-size: 11px;
  text-transform: uppercase;
}
</style>
