<template>
  <div id="app-info-container">
    <img
      id="app-info-icon"
      :src="require('@/assets/images/info.svg')"
      @click="$modal.show('app-info')"
    />
    <modal name="app-info" classes="dialog" height="auto" width="400px">
      <div class="dialog-header">
        App info
        <close-icon @click="$modal.hide('app-info')"/>
      </div>
      <div class="dialog-body">
        <div v-for="(item, index) in info" :key="index" class="info-item">
          {{item.name}}
          <div class="divider"/>
          <div class="options">
            <div v-for="(opt, index) in item.info" :key="index">
              {{opt}}
            </div>
          </div>
        </div>
      </div>
    </modal>
  </div>
</template>

<script>
import CloseIcon from '@/components/svg/close'

export default {
  name: 'AppDiagnosticInfo',
  components: { CloseIcon },
  data () {
    return {
      info: [
        {
          name: 'sqliteviz version',
          info: [require('../../../package.json').version]
        }
      ]
    }
  },

  async created () {
    const state = this.$store.state
    let result = await state.db.execute('select sqlite_version()')
    this.info.push({
      name: 'SQLite version',
      info: result.values[0]
    })

    result = await state.db.execute('PRAGMA compile_options')
    this.info.push({
      name: 'SQLite compile options',
      info: result.values.map(row => row[0])
    })
  }
}
</script>

<style scoped>
#app-info-icon {
  cursor: pointer;
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
  overflow: scroll;
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
