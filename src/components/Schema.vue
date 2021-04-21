<template>
  <div id="schema-container">
    <div id="schema-filter">
      <text-field placeholder="Search table" width="100%" v-model="filter"/>
    </div>
    <div id="db">
      <div @click="schemaVisible = !schemaVisible" class="db-name">
        <tree-chevron :expanded="schemaVisible"/>
        {{ dbName }}
      </div>
        <db-uploader id="db-edit" type="small" />
    </div>
    <div v-show="schemaVisible" class="schema">
      <table-description
        v-for="table in schema"
        :key="table.name"
        :name="table.name"
        :columns="table.columns"
      />
    </div>
  </div>
</template>

<script>
import TableDescription from '@/components/TableDescription'
import TextField from '@/components/TextField'
import TreeChevron from '@/components/svg/treeChevron'
import DbUploader from '@/components/DbUploader'

export default {
  name: 'Schema',
  components: {
    TableDescription,
    TextField,
    TreeChevron,
    DbUploader
  },
  data () {
    return {
      schemaVisible: true,
      filter: null
    }
  },
  computed: {
    schema () {
      if (!this.$store.state.schema) {
        return []
      }

      return !this.filter
        ? this.$store.state.schema
        : this.$store.state.schema.filter(
          table => table.name.toUpperCase().indexOf(this.filter.toUpperCase()) !== -1
        )
    },
    dbName () {
      return this.$store.state.dbName
    }
  }
}
</script>

<style scoped>
#schema-container {
  position: relative;
  padding-bottom: 24px;
}

.schema {
  margin-left: 12px;
  padding: 0 12px;
}
#schema-filter {
  padding: 32px 12px;
  position: sticky;
  position: -webkit-sticky;
  top: 0;
  width: 100%;
  height: 100px;
  box-sizing: border-box;
  background-image: linear-gradient(white 73%, transparent);;
  z-index: 2;
}
.schema, .db-name {
  color: var(--color-text-base);
  font-size: 13px;
  white-space: nowrap;
}
#db {
  display: flex;
  align-items: center;
  margin-top: -5px;
  padding: 0 12px;
}

.db-name {
  cursor: pointer;
}

.db-name:hover .chevron-icon path,
>>> .table-name:hover .chevron-icon path {
  fill: var(--color-gray-dark);
}
</style>
