<template>
  <div id="app-info-container">
    <img
      id="app-info-icon"
      src="~@/assets/images/info.svg"
      @click="$modal.show('app-info')"
    />
    <modal modalId="app-info" class="dialog" contentClass="app-info-modal">
      <div class="dialog-header">
        App info
        <close-icon @click="$modal.hide('app-info')" />
      </div>
      <div class="dialog-body">
        <div v-for="(item, index) in info" :key="index" class="info-item">
          {{ item.name }}
          <div class="divider" />
          <div class="options">
            <div v-for="(opt, optIndex) in item.info" :key="optIndex">
              {{ opt }}
            </div>
          </div>
        </div>
      </div>
    </modal>
  </div>
</template>

<script>
import CloseIcon from '@/components/svg/close'
import { version } from '../../package.json'

export default {
  name: 'AppDiagnosticInfo',
  components: { CloseIcon },
  data() {
    return {
      info: [
        {
          name: 'sqliteviz version',
          info: [version]
        }
      ]
    }
  },

  async created() {
    const state = this.$store.state
    let result = (await state.db.execute('select sqlite_version()')).values
    this.info.push({
      name: 'SQLite version',
      info: result['sqlite_version()']
    })

    result = (await state.db.execute('PRAGMA compile_options')).values
    this.info.push({
      name: 'SQLite compile options',
      info: result.compile_options
    })
  }
}
</script>

<style>
.app-info-modal {
  width: 400px;
}
</style>

<style scoped>
#app-info-icon {
  cursor: pointer;
  width: 24px;
}
#app-info-container {
  display: flex;
  justify-content: center;
  margin-left: 32px;
}
.divider {
  height: 1px;
  background-color: var(--color-border);
  margin: 4px 0;
}
.options {
  font-family: monospace;
  font-size: 13px;
  margin-left: 8px;
  overflow: auto;
  max-height: 170px;
}
.info-item {
  margin-bottom: 32px;
  font-size: 14px;
}
.info-item:last-child {
  margin-bottom: 0;
}
</style>
