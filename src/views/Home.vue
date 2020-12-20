<template>
  <div id="dbloader-container">
    <db-upload @dragover="state='dragover'" @dragleave="state=''" @drop="state='drop'"/>
    <div id="img-container">
      <img id="drop-file-top-img" :src="require('@/assets/images/dropFileTop.png')" />
      <img
        id="left-arm-img"
        :class="{'swing': state === 'dragover'}"
        :src="require('@/assets/images/leftArm.png')"
      />
      <img
        id="file-img"
        :class="{
          'swing': state === 'dragover',
          'fly': state === 'drop',
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
    <div id="note">
      Sqliteviz is fully client-side. Your database never leaves your computer.
    </div>
    <button id ="skip" class="secondary" @click="$router.push('/editor')">
      Skip database loading for now
    </button>
  </div>
</template>

<script>
import dbUpload from '@/components/DbUpload'

export default {
  name: 'Home',
  components: { dbUpload },
  data () {
    return {
      state: ''
    }
  }
}
</script>

<style scoped>
#dbloader-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

#note {
  margin-top: 27px;
  font-size: 13px;
  color: var(--color-text-base);
}

#skip {
  margin-top: 83px;
}

#img-container {
  position: absolute;
  top: calc(50% - 120px);
  transform: translate(0, -50%);
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

>>>.drop-area {
  width: 706px;
  height: 482px;
  padding: 0 150px;
  position: relative;
}

>>>.drop-area .text {
  position: absolute;
  bottom: 42px;
  max-width: 300px;
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
