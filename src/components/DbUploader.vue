<template>
  <div class="db-uploader-container" :style="{ width }">
    <change-db-icon v-if="type === 'small'" @click="browse"/>
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
    <csv-import
      ref="addCsv"
      :file="file"
      :db="newDb"
      dialog-name="importFromCsv"
      @cancel="cancelCsvImport"
      @finish="finish"
    />
  </div>
</template>

<script>
import fIo from '@/lib/utils/fileIo'
import ChangeDbIcon from '@/components/svg/changeDb'
import database from '@/lib/database'
import CsvImport from '@/components/CsvImport'
import events from '@/lib/utils/events'

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
    CsvImport
  },
  data () {
    return {
      state: '',
      animationPromise: Promise.resolve(),
      file: null,
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
  methods: {
    cancelCsvImport () {
      if (this.newDb) {
        this.newDb.shutDown()
        this.newDb = null
      }
    },

    async finish () {
      this.$store.commit('setDb', this.newDb)
      if (this.$route.path !== '/workspace') {
        this.$router.push('/workspace')
      }
    },

    loadDb (file) {
      return Promise.all([this.newDb.loadDb(file), this.animationPromise])
        .then(this.finish)
    },

    async checkFile (file) {
      this.state = 'dropping'
      this.newDb = database.getNewDatabase()

      if (fIo.isDatabase(file)) {
        this.loadDb(file)
      } else {
        events.send('database.import', file.size, {
          from: 'csv',
          new_db: true
        })

        this.file = file
        await this.$nextTick()
        const csvImport = this.$refs.addCsv
        csvImport.reset()
        return Promise.all([csvImport.previewCsv(), this.animationPromise])
          .then(csvImport.open)
      }
    },
    browse () {
      fIo.getFileFromUser('.db,.sqlite,.sqlite3,.csv')
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
</style>
