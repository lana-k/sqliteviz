<template>
  <div>
    <splitpanes
      class="schema-tabs-splitter"
      :before="{ size: 20, max: 30 }"
      :after="{ size: 80, max: 100 }"
    >
      <template #left-pane>
        <schema/>
      </template>
      <template #right-pane>
        <tabs />
      </template>
    </splitpanes>
  </div>
</template>

<script>
import Splitpanes from '@/components/Splitpanes'
import Schema from './Schema'
import Tabs from './Tabs'
import database from '@/lib/database'
import store from '@/store'

export default {
  name: 'Editor',
  components: {
    Schema,
    Splitpanes,
    Tabs
  },
  async beforeRouteEnter (to, from, next) {
    if (!store.state.schema) {
      const newDb = database.getNewDatabase()
      const newSchema = await newDb.loadDb()
      store.commit('setDb', newDb)
      store.commit('saveSchema', newSchema)
      const stmt = [
        '/*',
        ' * Your database is empty. In order to start building charts',
        ' * you should create a table and insert data into it.',
        ' */',
        'CREATE TABLE house',
        '(',
        '  name TEXT,',
        '  points INTEGER',
        ');',
        'INSERT INTO house VALUES',
        "('Gryffindor', 100),",
        "('Hufflepuff', 90),",
        "('Ravenclaw', 95),",
        "('Slytherin', 80);"
      ].join('\n')

      const tabId = await store.dispatch('addTab', { query: stmt })
      store.commit('setCurrentTabId', tabId)
    }
    next()
  }
}
</script>

<style scoped>
.schema-tabs-splitter {
  height: 100%;
  background-color: var(--color-white);
}
</style>
