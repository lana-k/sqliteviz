<template>
  <div id="schema-container">
    <div id="schema-filter">
      <text-field placeholder="Search table" width="100%" v-model="filter"/>
    </div>
    <div id="db">
      <div @click="schemaVisible = !schemaVisible" class="db-name">
        <tree-chevron v-show="schema.length > 0" :expanded="schemaVisible"/>
        {{ dbName }}
      </div>
      <db-uploader id="db-edit" type="small" />
      <export-icon tooltip="Export database" @click="exportToFile"/>
      <add-table-icon @click="addCsv"/>
    </div>
    <div v-show="schemaVisible" class="schema">
      <table-description
        v-for="table in schema"
        :key="table.name"
        :name="table.name"
        :columns="table.columns"
      />
    </div>

    <!--Parse csv dialog  -->
    <csv-import
      ref="addCsv"
      :file="file"
      :db="$store.state.db"
      dialog-name="addCsv"
    />
  </div>
</template>

<script>
import fIo from '@/lib/utils/fileIo'
import { send } from '@/lib/utils/events'
import TableDescription from './TableDescription'
import TextField from '@/components/TextField'
import TreeChevron from '@/components/svg/treeChevron'
import DbUploader from '@/components/DbUploader'
import ExportIcon from '@/components/svg/export'
import AddTableIcon from '@/components/svg/addTable'
import CsvImport from '@/components/CsvImport'

export default {
  name: 'Schema',
  components: {
    TableDescription,
    TextField,
    TreeChevron,
    DbUploader,
    ExportIcon,
    AddTableIcon,
    CsvImport
  },
  data () {
    return {
      schemaVisible: true,
      filter: null,
      file: null
    }
  },
  computed: {
    schema () {
      if (!this.$store.state.db.schema) {
        return []
      }

      return !this.filter
        ? this.$store.state.db.schema
        : this.$store.state.db.schema.filter(
          table => table.name.toUpperCase().indexOf(this.filter.toUpperCase()) !== -1
        )
    },
    dbName () {
      return this.$store.state.db.dbName
    }
  },
  methods: {
    exportToFile () {
      this.$store.state.db.export(`${this.dbName}.sqlite`)
    },
    async addCsv () {
      this.file = await fIo.getFileFromUser('.csv')
      await this.$nextTick()
      const csvImport = this.$refs.addCsv
      csvImport.reset()
      await csvImport.previewCsv()
      csvImport.open()

      send('database.import', this.file.size, {
        from: 'csv',
        new_db: false
      })
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
  background-image: linear-gradient(white 73%, rgba(255, 255, 255, 0));
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
  margin-right: 6px;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
}

.db-name:hover .chevron-icon path,
>>> .table-name:hover .chevron-icon path {
  fill: var(--color-gray-dark);
}
</style>
