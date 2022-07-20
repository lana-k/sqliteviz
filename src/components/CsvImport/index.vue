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
      CSV import
      <close-icon @click="cancelCsvImport" :disabled="disableDialog"/>
    </div>
    <div class="dialog-body">
      <text-field
        label="Table name"
        v-model="tableName"
        width="484px"
        :disabled="disableDialog"
        :error-msg="tableNameError"
        id="csv-table-name"
      />
      <div class="chars">
        <delimiter-selector
          v-model="delimiter"
          width="210px"
          class="char-input"
          @input="previewCsv"
          :disabled="disableDialog"
        />
        <text-field
          label="Quote char"
          hint="The character used to quote fields."
          v-model="quoteChar"
          width="93px"
          :disabled="disableDialog"
          class="char-input"
          id="quote-char"
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
        />
      </div>
      <check-box
        @click="header = $event"
        :init="true"
        label="Use first row as column headers"
        :disabled="disableDialog"
      />
      <sql-table
        v-if="previewData
          && (previewData.rowCount > 0 || Object.keys(previewData).length > 0)
        "
        :data-set="previewData"
        class="preview-table"
        :preview="true"
      />
      <div v-else class="no-data">No data</div>
      <logs
        class="import-csv-errors"
        :messages="importCsvMessages"
      />
    </div>
    <div class="dialog-buttons-container">
      <button
        class="secondary"
        :disabled="disableDialog"
        @click="cancelCsvImport"
        id="csv-cancel"
      >
        Cancel
      </button>
      <button
        v-show="!importCsvCompleted"
        class="primary"
        :disabled="disableDialog"
        @click="loadFromCsv(file)"
        id="csv-import"
      >
        Import
      </button>
      <button
        v-show="importCsvCompleted"
        class="primary"
        :disabled="disableDialog"
        @click="finish"
        id="csv-finish"
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
  name: 'CsvImport',
  components: {
    CloseIcon,
    TextField,
    DelimiterSelector,
    CheckBox,
    SqlTable,
    Logs
  },
  props: ['file', 'db', 'dialogName'],
  data () {
    return {
      disableDialog: false,
      tableName: '',
      delimiter: '',
      quoteChar: '"',
      escapeChar: '"',
      header: true,
      importCsvCompleted: false,
      importCsvMessages: [],
      previewData: null,
      addedTable: null,
      tableNameError: ''
    }
  },
  watch: {
    quoteChar () {
      this.previewCsv()
    },

    escapeChar () {
      this.previewCsv()
    },

    header () {
      this.previewCsv()
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
    cancelCsvImport () {
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
      this.header = true
      this.quoteChar = '"'
      this.escapeChar = '"'
      this.delimiter = ''
      this.tableName = ''
      this.disableDialog = false
      this.importCsvCompleted = false
      this.importCsvMessages = []
      this.previewData = null
      this.addedTable = null
      this.tableNameError = ''
    },
    open () {
      this.tableName = this.db.sanitizeTableName(fIo.getFileName(this.file))
      this.$modal.show(this.dialogName)
    },
    async previewCsv () {
      this.importCsvCompleted = false
      const config = {
        preview: 3,
        quoteChar: this.quoteChar || '"',
        escapeChar: this.escapeChar,
        header: this.header,
        delimiter: this.delimiter
      }
      try {
        const start = new Date()
        const parseResult = await csv.parse(this.file, config)
        const end = new Date()
        this.previewData = parseResult.data
        this.delimiter = parseResult.delimiter

        // In parseResult.messages we can get parse errors
        this.importCsvMessages = parseResult.messages || []

        if (!parseResult.hasErrors) {
          this.importCsvMessages.push({
            message: `Preview parsing is completed in ${time.getPeriod(start, end)}.`,
            type: 'success'
          })
        }
      } catch (err) {
        this.importCsvMessages = [{
          message: err,
          type: 'error'
        }]
      }
    },
    async loadFromCsv (file) {
      if (!this.tableName) {
        this.tableNameError = "Table name can't be empty"
        return
      }

      this.disableDialog = true
      const config = {
        quoteChar: this.quoteChar || '"',
        escapeChar: this.escapeChar,
        header: this.header,
        delimiter: this.delimiter
      }
      const parseCsvMsg = {
        message: 'Parsing CSV...',
        type: 'info'
      }
      this.importCsvMessages.push(parseCsvMsg)
      const parseCsvLoadingIndicator = setTimeout(() => { parseCsvMsg.type = 'loading' }, 1000)

      const importMsg = {
        message: 'Importing CSV into a SQLite database...',
        type: 'info'
      }
      let importLoadingIndicator = null

      const updateProgress = progress => {
        this.$set(importMsg, 'progress', progress)
      }
      const progressCounterId = this.db.createProgressCounter(updateProgress)

      try {
        let start = new Date()
        const parseResult = await csv.parse(this.file, config)
        let end = new Date()

        if (!parseResult.hasErrors) {
          const rowCount = parseResult.rowCount
          let period = time.getPeriod(start, end)
          parseCsvMsg.type = 'success'

          if (parseResult.messages.length > 0) {
            this.importCsvMessages = this.importCsvMessages.concat(parseResult.messages)
            parseCsvMsg.message = `${rowCount} rows are parsed in ${period}.`
          } else {
            // Inform about csv parsing success
            parseCsvMsg.message = `${rowCount} rows are parsed successfully in ${period}.`
          }

          // Loading indicator for csv parsing is not needed anymore
          clearTimeout(parseCsvLoadingIndicator)

          // Add info about import start
          this.importCsvMessages.push(importMsg)

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
          importMsg.message = `Importing CSV into a SQLite database is completed in ${period}.`
          importMsg.type = 'success'

          // Loading indicator for import is not needed anymore
          clearTimeout(importLoadingIndicator)

          this.importCsvCompleted = true
        } else {
          parseCsvMsg.message = 'Parsing ended with errors.'
          parseCsvMsg.type = 'info'
          this.importCsvMessages = this.importCsvMessages.concat(parseResult.messages)
        }
      } catch (err) {
        if (parseCsvMsg.type === 'loading') {
          parseCsvMsg.type = 'info'
        }

        if (importMsg.type === 'loading') {
          importMsg.type = 'info'
        }

        this.importCsvMessages.push({
          message: err,
          type: 'error'
        })
      }

      clearTimeout(parseCsvLoadingIndicator)
      clearTimeout(importLoadingIndicator)
      this.db.deleteProgressCounter(progressCounterId)
      this.disableDialog = false
    },
    async finish () {
      this.$modal.hide(this.dialogName)
      const stmt = [
        '/*',
        ` * Your CSV file has been imported into ${this.addedTable} table.`,
        ' * You can run this SQL query to make all CSV records available for charting.',
        ' */',
        `SELECT * FROM "${this.addedTable}"`
      ].join('\n')
      const tabId = await this.$store.dispatch('addTab', { query: stmt })
      this.$store.commit('setCurrentTabId', tabId)
      this.importCsvCompleted = false
      this.$emit('finish')
      events.send('inquiry.create', null, { auto: true })
    }
  }
}
</script>

<style scoped>
.dialog-body {
  padding-bottom: 0;
}

.chars {
  display: flex;
  align-items: flex-end;
  margin: 24px 0 20px;
}
.char-input {
  margin-right: 44px;
}
.preview-table {
  margin-top: 18px;
}

.import-csv-errors {
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
