<template>
  <div id="dbloader-container">
    <db-uploader type="illustrated" />
    <div id="note">
      Sqliteviz is fully client-side. Your database never leaves your computer.
    </div>
    <button id="skip" class="secondary" @click="$router.push('/workspace')">
      Create empty database
    </button>
  </div>
</template>

<script>
import DbUploader from '@/components/DbUploader'

export default {
  name: 'Welcome',
  components: { DbUploader }
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
  margin-top: 42px;
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
</style>
