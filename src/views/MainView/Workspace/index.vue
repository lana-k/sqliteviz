<template>
  <div>
    <splitpanes
      class="schema-tabs-splitter"
      :before="{ size: schemaWidth, max: 30 }"
      :after="{ size: 100 - schemaWidth, max: 100 }"
      :default="{ before: 20, after: 80 }"
    >
      <template #left-pane>
        <schema />
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
import events from '@/lib/utils/events'

export default {
  name: 'Workspace',
  components: {
    Schema,
    Splitpanes,
    Tabs
  },
  data() {
    return {
      schemaWidth: this.$route.query.hide_schema === '1' ? 0 : 20
    }
  },
  async beforeCreate() {
    const schema = this.$store.state.db.schema
    if (
      (!schema || schema.length === 0) &&
      this.$store.state.tabs.length === 0
    ) {
      const stmt = [
        '/*',
        ' * Your database is empty. In order to start building data visualisations',
        ' * you should create tables and insert data into them.',
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
        "('Slytherin', 80);",
        '',
        'CREATE TABLE student',
        '(',
        '  id INTEGER,',
        '  name TEXT,',
        '  house TEXT',
        ');',
        'INSERT INTO student VALUES',
        "(1, 'Harry Potter', 'Gryffindor'),",
        "(2, 'Ron Weasley', 'Gryffindor'),",
        "(3, 'Draco Malfoy', 'Slytherin'),",
        "(4, 'Luna Lovegood', 'Ravenclaw'),",
        "(5, 'Cedric Diggory', 'Hufflepuff');"
      ].join('\n')

      const tabId = await this.$store.dispatch('addTab', { query: stmt })
      this.$store.commit('setCurrentTabId', tabId)

      events.send('inquiry.create', null, { auto: true })
    }
  },
  activated() {
    this.$store.commit('setIsWorkspaceVisible', true)
  },
  deactivated() {
    this.$store.commit('setIsWorkspaceVisible', false)
  }
}
</script>

<style scoped>
.schema-tabs-splitter {
  height: 100%;
  background-color: var(--color-white);
}
</style>
