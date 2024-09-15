<template>
  <modal
    :name="dialogName"
    classes="dialog"
    height="auto"
    width="80%"
    scrollable
    :clickToClose="false"
  >
    <div class="dialog-header">
      {{ typeName }} import
      <close-icon @click="cancelImport" :disabled="disableDialog"/>
    </div>
    <div class="dialog-body">
      <text-field
        label="Table name"
        v-model="tableName"
        width="484px"
        :disabled="disableDialog"
        :error-msg="tableNameError"
        id="csv-json-table-name"
      />
      <div v-if="!isJson && !isNdJson" class="chars">
        <delimiter-selector
          v-model="delimiter"
          width="210px"
          class="char-input"
          :disabled="disableDialog"
          @input="preview"
        />
        <text-field
          label="Quote char"
          hint="The character used to quote fields."
          v-model="quoteChar"
          width="93px"
          :disabled="disableDialog"
          class="char-input"
          id="quote-char"
          @input="preview"
        />
        <text-field
          label="Escape char"
          hint='
            The character used to escape the quote character within a field
            (e.g. "column with ""quotes"" in text").
          '
          max-hint-width="242px"
          v-model="escapeChar"
          width="93px"
          :disabled="disableDialog"
          class="char-input"
          id="escape-char"
          @input="preview"
        />
      </div>
      <check-box
        v-if="!isJson && !isNdJson"
        :init="header"
        label="Use first row as column headers"
        :disabled="disableDialog"
        @click="changeHeaderDisplaying"
      />
      <sql-table
        v-if="previewData && previewData.rowCount > 0"
        :data-set="previewData"
        :preview="true"
        class="preview-table"
      />
      <div v-else class="no-data">No data</div>
      <logs
        class="import-errors"
        :messages="importMessages"
      />
    </div>
    <div class="dialog-buttons-container">
      <button
        class="secondary"
        :disabled="disableDialog"
        @click="cancelImport"
        id="import-cancel"
      >
        Cancel
      </button>
      <button
        v-show="!importCompleted"
        class="primary"
        :disabled="disableDialog || disableImport"
        @click="loadToDb(file)"
        id="import-start"
      >
        Import
      </button>
      <button
        v-show="importCompleted"
        class="primary"
        :disabled="disableDialog"
        @click="finish"
        id="import-finish"
      >
        Finish
      </button>
    </div>
  </modal>
</template>

<script>
import csv from '@/lib/csv'
import CloseIcon from '@/components/svg/close'
import TextField from '@/components/TextField'
import DelimiterSelector from './DelimiterSelector'
import CheckBox from '@/components/CheckBox'
import SqlTable from '@/components/SqlTable'
import Logs from '@/components/Logs'
import time from '@/lib/utils/time'
import fIo from '@/lib/utils/fileIo'
import events from '@/lib/utils/events'

export default {
  name: 'CsvJsonImport',
  components: {
    CloseIcon,
    TextField,
    DelimiterSelector,
    CheckBox,
    SqlTable,
    Logs
  },
  props: {
    file: File,
    db: Object,
    dialogName: String
  },
  data () {
    return {
      disableDialog: false,
      disableImport: false,
      tableName: '',
      delimiter: '',
      quoteChar: '"',
      escapeChar: '"',
      header: true,
      importCompleted: false,
      importMessages: [],
      previewData: null,
      addedTable: null,
      tableNameError: ''
    }
  },
  computed: {
    isJson () {
      return fIo.isJSON(this.file)
    },
    isNdJson () {
      return fIo.isNDJSON(this.file)
    },
    typeName () {
      return this.isJson || this.isNdJson ? 'JSON' : 'CSV'
    }
  },
  watch: {
    isJson () {
      if (this.isJson) {
        this.delimiter = '\u001E'
        this.header = false
      }
    },
    isNdJson () {
      if (this.isNdJson) {
        this.delimiter = '\u001E'
        this.header = false
      }
    },
    tableName: time.debounce(function () {
      this.tableNameError = ''
      if (!this.tableName) {
        return
      }
      this.db.validateTableName(this.tableName)
        .catch(err => {
          this.tableNameError = err.message + '. Try another table name.'
        })
    }, 400)
  },
  methods: {
    changeHeaderDisplaying (e) {
      this.header = e
      this.preview()
    },
    cancelImport () {
      if (!this.disableDialog) {
        if (this.addedTable) {
          this.db.execute(`DROP TABLE "${this.addedTable}"`)
          this.db.refreshSchema()
        }
        this.$modal.hide(this.dialogName)
        this.$emit('cancel')
      }
    },
    reset () {
      this.header = !this.isJson && !this.isNdJson
      this.quoteChar = '"'
      this.escapeChar = '"'
      this.delimiter = !this.isJson && !this.isNdJson ? '' : '\u001E'
      this.tableName = ''
      this.disableDialog = false
      this.disableImport = false
      this.importCompleted = false
      this.importMessages = []
      this.previewData = null
      this.addedTable = null
      this.tableNameError = ''
    },
    open () {
      this.tableName = this.db.sanitizeTableName(fIo.getFileName(this.file))
      this.$modal.show(this.dialogName)
    },
    async preview () {
      this.disableImport = false
      if (!this.file) {
        return
      }
      this.importCompleted = false
      const config = {
        preview: 3,
        quoteChar: this.quoteChar || '"',
        escapeChar: this.escapeChar,
        header: this.header,
        delimiter: this.delimiter,
        columns: !this.isJson && !this.isNdJson ? null : ['doc']
      }
      try {
        const start = new Date()
        const parseResult = this.isJson
          ? await this.getJsonParseResult(this.file)
          : await csv.parse(this.file, config)
        const end = new Date()
        this.previewData = parseResult.data
        this.previewData.rowCount = parseResult.rowCount
        this.delimiter = parseResult.delimiter

        // In parseResult.messages we can get parse errors
        this.importMessages = parseResult.messages || []

        if (this.previewData.rowCount === 0) {
          this.disableImport = true
          this.importMessages.push({
            type: 'info',
            message: 'No rows to import.'
          })
        }

        if (!parseResult.hasErrors) {
          this.importMessages.push({
            message: `Preview parsing is completed in ${time.getPeriod(start, end)}.`,
            type: 'success'
          })
        }
      } catch (err) {
        console.error(err)
        this.importMessages = [{
          message: err,
          type: 'error'
        }]
      }
    },
    async getJsonParseResult (file) {
      const jsonContent = await fIo.getFileContent(file)
      const isEmpty = !jsonContent.trim()
      return {
        data: {
          columns: ['doc'],
          values: { doc: !isEmpty ? [jsonContent] : [] }
        },
        hasErrors: false,
        messages: [],
        rowCount: +(!isEmpty)
      }
    },
    async loadToDb (file) {
      if (!this.tableName) {
        this.tableNameError = "Table name can't be empty"
        return
      }

      this.disableDialog = true
      const config = {
        quoteChar: this.quoteChar || '"',
        escapeChar: this.escapeChar,
        header: this.header,
        delimiter: this.delimiter,
        columns: !this.isJson && !this.isNdJson ? null : ['doc']
      }
      const parsingMsg = {
        message: `Parsing ${this.typeName}...`,
        type: 'info'
      }
      this.importMessages.push(parsingMsg)
      const parsingLoadingIndicator = setTimeout(() => { parsingMsg.type = 'loading' }, 1000)

      const importMsg = {
        message: `Importing ${this.typeName} into a SQLite database...`,
        type: 'info'
      }
      let importLoadingIndicator = null

      const updateProgress = progress => {
        this.$set(importMsg, 'progress', progress)
      }
      const progressCounterId = this.db.createProgressCounter(updateProgress)

      try {
        let start = new Date()
        const parseResult = this.isJson
          ? await this.getJsonParseResult(file)
          : await csv.parse(this.file, config)

        let end = new Date()

        if (!parseResult.hasErrors) {
          const rowCount = parseResult.rowCount
          let period = time.getPeriod(start, end)
          parsingMsg.type = 'success'

          if (parseResult.messages.length > 0) {
            this.importMessages = this.importMessages.concat(parseResult.messages)
            parsingMsg.message = `${rowCount} rows are parsed in ${period}.`
          } else {
            // Inform about parsing success
            parsingMsg.message = `${rowCount} rows are parsed successfully in ${period}.`
          }

          // Loading indicator for parsing is not needed anymore
          clearTimeout(parsingLoadingIndicator)

          // Add info about import start
          this.importMessages.push(importMsg)

          // Show import progress after 1 second
          importLoadingIndicator = setTimeout(() => {
            importMsg.type = 'loading'
          }, 1000)

          // Add table
          start = new Date()
          await this.db.addTableFromCsv(this.tableName, parseResult.data, progressCounterId)
          end = new Date()

          this.addedTable = this.tableName
          // Inform about import success
          period = time.getPeriod(start, end)
          importMsg.message = `Importing ${this.typeName} ` +
          `into a SQLite database is completed in ${period}.`
          importMsg.type = 'success'

          // Loading indicator for import is not needed anymore
          clearTimeout(importLoadingIndicator)

          this.importCompleted = true
        } else {
          parsingMsg.message = 'Parsing ended with errors.'
          parsingMsg.type = 'info'
          this.importMessages = this.importMessages.concat(parseResult.messages)
        }
      } catch (err) {
        console.error(err)
        if (parsingMsg.type === 'loading') {
          parsingMsg.type = 'info'
        }

        if (importMsg.type === 'loading') {
          importMsg.type = 'info'
        }

        this.importMessages.push({
          message: err,
          type: 'error'
        })
      }

      clearTimeout(parsingLoadingIndicator)
      clearTimeout(importLoadingIndicator)
      this.db.deleteProgressCounter(progressCounterId)
      this.disableDialog = false
    },
    async finish () {
      this.$modal.hide(this.dialogName)
      const stmt = this.getQueryExample()
      const tabId = await this.$store.dispatch('addTab', { query: stmt })
      this.$store.commit('setCurrentTabId', tabId)
      this.importCompleted = false
      this.$emit('finish')
      events.send('inquiry.create', null, { auto: true })
    },
    getQueryExample () {
      return this.isNdJson ? this.getNdJsonQueryExample()
        : this.isJson ? this.getJsonQueryExample()
          : [
            '/*',
        ` * Your CSV file has been imported into ${this.addedTable} table.`,
        ' * You can run this SQL query to make all CSV records available for charting.',
        ' */',
        `SELECT * FROM "${this.addedTable}"`
          ].join('\n')
    },
    getNdJsonQueryExample () {
      try {
        const firstRowJson = JSON.parse(this.previewData.values.doc[0])
        const firstKey = Object.keys(firstRowJson)[0]
        return [
          '/*',
          ` * Your NDJSON file has been imported into ${this.addedTable} table.`,
          ` * Run this SQL query to get values of property ${firstKey} ` +
          'and make them available for charting.',
          ' */',
          `SELECT doc->>'${firstKey}'`,
          `FROM "${this.addedTable}"`
        ].join('\n')
      } catch (err) {
        console.error(err)
        return [
          '/*',
          ` * Your NDJSON file has been imported into ${this.addedTable} table.`,
          ' */',
          'SELECT *',
          `FROM "${this.addedTable}"`
        ].join('\n')
      }
    },
    getJsonQueryExample () {
      try {
        const firstRowJson = JSON.parse(this.previewData.values.doc[0])
        const firstKey = Object.keys(firstRowJson)[0]
        return [
          '/*',
          ` * Your JSON file has been imported into ${this.addedTable} table.`,
          ` * Run this SQL query to get values of property ${firstKey} ` +
          'and make them available for charting.',
          ' */',
          'SELECT *',
          `FROM "${this.addedTable}"`,
          `JOIN json_each(doc, '$.${firstKey}')`
        ].join('\n')
      } catch (err) {
        console.error(err)
        return [
          '/*',
          ` * Your NDJSON file has been imported into ${this.addedTable} table.`,
          ' */',
          'SELECT *',
          `FROM "${this.addedTable}"`
        ].join('\n')
      }
    }
  }
}
</script>

<style scoped>
.dialog-body {
  padding-bottom: 0;
}

#csv-json-table-name {
margin-bottom: 24px;
}

.chars {
  display: flex;
  align-items: flex-end;
  margin: 0 0 20px;
}
.char-input {
  margin-right: 44px;
}
.preview-table {
  margin-top: 18px;
}

.import-errors {
  height: 136px;
  margin-top: 8px;
}
.no-data {
  margin-top: 32px;
  background-color: white;
  border-radius: 5px;
  position: relative;
  border: 1px solid var(--color-border-light);
  box-sizing: border-box;
  height: 147px;
  font-size: 13px;
  color: var(--color-text-base);
  display: flex;
  justify-content: center;
  align-items: center;
}

/* https://github.com/euvl/vue-js-modal/issues/623 */
>>> .vm--modal {
  max-width: 1152px;
  margin: auto;
  left: 0 !important;
}
</style>
