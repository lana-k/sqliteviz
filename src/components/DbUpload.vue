<template>
  <div class="db-upload-container">
    <label for="assetsFieldHandle">
      <div
        class="drop-area"
        @dragover.prevent="state = 'dragover'"
        @dragleave.prevent="state=''"
        @drop.prevent="drop"
      >
        <input
          type="file"
          id="assetsFieldHandle"
          @change="loadDb"
          ref="file"
          accept=".db,.sqlite,.sqlite3"
        />
        <div class="text">
          Drop the database file here or click to choose a file from your computer.
        </div>
      </div>
    </label>
    <div v-if="illustrated" id="img-container">
      <img id="drop-file-top-img" :src="require('@/assets/images/dropFileTop.png')" />
      <img
        id="left-arm-img"
        :class="{'swing': state === 'dragover'}"
        :src="require('@/assets/images/leftArm.png')"
      />
      <img
        id="file-img"
        ref="fileImg"
        :class="{
          'swing': state === 'dragover',
          'fly': state === 'drop'
        }"
        :src="require('@/assets/images/file.png')"
      />
      <img id="drop-file-bottom-img" :src="require('@/assets/images/dropFileBottom.png')" />
      <img id="body-img" :src="require('@/assets/images/body.png')" />
      <img
        id="right-arm-img"
        :class="{'swing': state === 'dragover'}"
        :src="require('@/assets/images/rightArm.png')"
      />
    </div>
    <div id="error" class="error"></div>
  </div>
</template>

<script>
export default {
  name: 'DbUpload',
  props: {
    illustrated: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
      state: '',
      animationPromise: Promise.resolve()
    }
  },
  mounted () {
    if (this.illustrated) {
      this.animationPromise = new Promise((resolve) => {
        this.$refs.fileImg.addEventListener('animationend', event => {
          if (event.animationName.startsWith('fly')) {
            resolve()
          }
        })
      })
    }
  },
  methods: {
    loadDb () {
      this.state = 'drop'
      return Promise.all([this.$db.loadDb(this.$refs.file.files[0]), this.animationPromise])
        .then(([schema]) => {
          this.$store.commit('saveSchema', schema)
          if (this.$route.path !== '/editor') {
            this.$router.push('/editor')
          }
        })
    },
    drop (event) {
      this.$refs.file.files = event.dataTransfer.files
      this.loadDb()
    }
  }
}
</script>

<style scoped>
label {
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
}

input {
  display: none;
}

#img-container {
  position: absolute;
  top: calc(50% - 120px);
  left: 50%;
  transform: translate(-50%, -50%);
  width: 450px;
  height: 338px;
  pointer-events: none;
}
#drop-file-top-img {
  width: 450px;
  height: 171px;
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
  top: 183px;
  left: 225px;
  transition: top 1s ease-in-out, left 1s ease-in-out;
}
@keyframes fly {
  100% { transform: rotate(360deg) scale(0.5); }
}
</style>
