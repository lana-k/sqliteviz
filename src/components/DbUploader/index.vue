<template>
  <div class="db-uploader-container" :style="{ width }">
    <change-db-icon v-if="type === 'small'" @click.native="browse"/>
    <div v-if="type === 'illustrated'" class="drop-area-container">
      <div
        class="drop-area"
        @dragover.prevent="state = 'dragover'"
        @dragleave.prevent="state=''"
        @drop.prevent="drop"
        @click="browse"
      >
        <div class="text">
          Drop the database or CSV file here or click to choose a file from your computer.
        </div>
      </div>
    </div>
    <div v-if="type === 'illustrated'" id="img-container">
      <img id="drop-file-top-img" :src="require('@/assets/images/top.svg')" />
      <img
        id="left-arm-img"
        :class="{'swing': state === 'dragover'}"
        :src="require('@/assets/images/leftArm.svg')"
      />
      <img
        id="file-img"
        ref="fileImg"
        :class="{
          'swing': state === 'dragover',
          'fly': state === 'dropping',
          'hidden': state === 'dropped'
        }"
        :src="require('@/assets/images/file.png')"
      />
      <img id="drop-file-bottom-img" :src="require('@/assets/images/bottom.svg')" />
      <img id="body-img" :src="require('@/assets/images/body.svg')" />
      <img
        id="right-arm-img"
        :class="{'swing': state === 'dragover'}"
        :src="require('@/assets/images/rightArm.svg')"
      />
    </div>
    <div id="error" class="error"></div>

    <!--Parse csv dialog  -->
    <modal name="parse" classes="dialog" height="auto" width="60%" :clickToClose="false">
      <div class="dialog-header">
        Import CSV
        <close-icon @click="cancelCsvImport" :disabled="disableDialog"/>
      </div>
      <div class="dialog-body">
        <div class="chars">
          <delimiter-selector
            v-model="delimiter"
            width="210px"
            class="char-input"
            @input="previewCSV"
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
            hint='The character used to escape the quote character within a field (e.g. "column with ""quotes"" in text").'
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
          v-if="previewData"
          :data-set="previewData"
          height="160"
          class="preview-table"
          :preview="true"
        />
        <div v-if="!previewData" class="no-data">No data</div>
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
  </div>
</template>

<script>
import fu from '@/lib/utils/fileIo'
import csv from './csv'
import CloseIcon from '@/components/svg/close'
import TextField from '@/components/TextField'
import DelimiterSelector from './DelimiterSelector'
import CheckBox from '@/components/CheckBox'
import SqlTable from '@/components/SqlTable'
import Logs from '@/components/Logs'
import ChangeDbIcon from '@/components/svg/changeDb'
import time from '@/lib/utils/time'
import database from '@/lib/database'

const csvMimeTypes = [
  'text/csv',
  'text/x-csv',
  'application/x-csv',
  'application/csv',
  'text/x-comma-separated-values',
  'text/comma-separated-values'
]

export default {
  name: 'DbUploader',
  props: {
    type: {
      type: String,
      required: false,
      default: 'small',
      validator: (value) => {
        return ['illustrated', 'small'].includes(value)
      }
    },
    width: {
      type: String,
      required: false,
      default: 'unset'
    }
  },
  components: {
    ChangeDbIcon,
    TextField,
    DelimiterSelector,
    CloseIcon,
    CheckBox,
    SqlTable,
    Logs
  },
  data () {
    return {
      state: '',
      animationPromise: Promise.resolve(),
      file: null,
      schema: null,
      delimiter: '',
      quoteChar: '"',
      escapeChar: '"',
      header: true,
      previewData: null,
      importCsvMessages: [],
      disableDialog: false,
      importCsvCompleted: false,
      newDb: null
    }
  },
  mounted () {
    if (this.type === 'illustrated') {
      this.animationPromise = new Promise((resolve) => {
        this.$refs.fileImg.addEventListener('animationend', event => {
          if (event.animationName.startsWith('fly')) {
            this.state = 'dropped'
            resolve()
          }
        })
      })
    }
  },
  watch: {
    quoteChar () {
      this.previewCSV()
    },

    escapeChar () {
      this.previewCSV()
    },

    header () {
      this.previewCSV()
    }
  },
  methods: {
    cancelCsvImport () {
      if (!this.disableDialog) {
        this.$modal.hide('parse')
        if (this.newDb) {
          this.newDb.shutDown()
          this.newDb = null
        }
      }
    },

    async finish () {
      this.$store.commit('setDb', this.newDb)
      this.$store.commit('saveSchema', this.schema)
      if (this.importCsvCompleted) {
        this.$modal.hide('parse')
        const stmt = [
          '/*',
          ' * Your CSV file has been imported into csv_import table.',
          ' * You can run this SQL query to make all CSV records available for charting.',
          ' */',
          'SELECT * FROM csv_import'
        ].join('\n')
        const tabId = await this.$store.dispatch('addTab', { query: stmt })
        this.$store.commit('setCurrentTabId', tabId)
        this.importCsvCompleted = false
      }
      if (this.$route.path !== '/editor') {
        this.$router.push('/editor')
      }
    },

    async previewCSV () {
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

    loadDb (file) {
      this.newDb = database.getNewDatabase()
      return Promise.all([this.newDb.loadDb(file), this.animationPromise])
        .then(([schema]) => {
          this.schema = schema
          this.finish()
        })
    },

    async loadFromCsv (file) {
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
      this.newDb = database.getNewDatabase()
      const progressCounterId = this.newDb.createProgressCounter(updateProgress)

      try {
        let start = new Date()
        const parseResult = await csv.parse(this.file, config)
        let end = new Date()

        if (!parseResult.hasErrors) {
          const rowCount = parseResult.data.values.length
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

          // Create db with csv table and get schema
          const name = file.name.replace(/\.[^.]+$/, '')
          start = new Date()
          this.schema = await this.newDb.importDb(name, parseResult.data, progressCounterId)
          end = new Date()

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
      this.newDb.deleteProgressCounter(progressCounterId)
      this.disableDialog = false
    },

    async checkFile (file) {
      this.state = 'dropping'
      if (csvMimeTypes.includes(file.type)) {
        this.file = file
        this.header = true
        this.quoteChar = '"'
        this.escapeChar = '"'
        this.delimiter = ''
        return Promise.all([this.previewCSV(), this.animationPromise])
          .then(() => {
            this.$modal.show('parse')
          })
      } else {
        this.loadDb(file)
      }
    },
    browse () {
      fu.getFileFromUser('.db,.sqlite,.sqlite3,.csv')
        .then(this.checkFile)
    },

    drop (event) {
      this.checkFile(event.dataTransfer.files[0])
    }
  }
}
</script>

<style scoped>
.db-uploader-container {
  position: relative;
}
.drop-area-container {
  display: inline-block;
  border: 1px dashed var(--color-border);
  padding: 8px;
  border-radius: var(--border-radius-big);
  height: 100%;
  width: 100%;
  box-sizing: border-box;
}

.drop-area {
  background-color: var(--color-bg-light-3);
  border-radius: var(--border-radius-big);
  color: var(--color-text-base);
  font-size: 13px;
  text-align: center;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  cursor: pointer;
}

#img-container {
  position: absolute;
  top: 54px;
  left: 50%;
  transform: translate(-50%, 0);
  width: 450px;
  height: 338px;
  pointer-events: none;
}

#drop-file-top-img {
  width: 450px;
  height: 175px;
  position: absolute;
  top: 0;
  left: 0;
}
#drop-file-bottom-img {
  width: 450px;
  height: 167px;
  position: absolute;
  bottom: 0;
  left: 0;
}
#body-img {
  width: 74px;
  position: absolute;
  top: 94.05px;
  left: 46px;
}
#right-arm-img {
  width: 106px;
  position: absolute;
  top: 110.05px;
  left: 78px;
}
#left-arm-img {
  width: 114px;
  position: absolute;
  top: 69.05px;
  left: 69px;
}
#file-img {
  width: 125px;
  position: absolute;
  top: 15.66px;
  left: 152px;
}

.swing {
  animation: swing ease-in-out 0.6s infinite alternate;
}
#left-arm-img.swing {
  transform-origin: 9px 83px;
}
#right-arm-img.swing {
  transform-origin: 0 56px;
}
#file-img.swing {
   transform-origin: -74px 139px;
}
@keyframes swing {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(-7deg); }
}

#file-img.fly {
  animation: fly ease-in-out 1s 1 normal;
  transform-origin: center center;
}
@keyframes fly {
  100% {
    transform: rotate(360deg) scale(0.5);
    top: 183px;
    left: 225px;
  }
}

#file-img.hidden {
  display: none;
}

/* Parse CSV dialog */
.chars {
  display: flex;
  align-items: flex-end;
  margin-bottom: 20px;
}
.char-input {
  margin-right: 44px;
}
.preview-table {
  margin-top: 32px;
}

.import-csv-errors {
  height: 160px;
  margin-top: 32px;
}
.no-data {
  margin-top: 32px;
  background-color: white;
  border-radius: 5px;
  position: relative;
  border: 1px solid var(--color-border-light);
  box-sizing: border-box;
  height: 160px;
  font-size: 13px;
  color: var(--color-text-base);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
