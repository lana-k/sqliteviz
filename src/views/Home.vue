<template>
  <div id="dbloader-container">
    <h1>Sqliteviz</h1>
    <db-upload />
    <button id ="skip" class="secondary" @click="$router.push('/editor')">
      Skip database loading for now
    </button>
  </div>
</template>

<script>
import dbUpload from '@/components/DbUpload'

export default {
  name: 'Home',
  components: { dbUpload }
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

h1 {
  color: var(--color-accent);
}

#skip {
  position: absolute;
  bottom: 50px;
}

>>>.drop-area {
  width: 628px;
  height: 490px;
  padding: 0 150px;
}
</style>
