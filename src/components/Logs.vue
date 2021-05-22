<template>
  <div class="logs-container" ref="logsContainer">
    <div v-for="(msg, index) in messages" :key="index" class="msg">
      <img v-if="msg.type === 'error'" :src="require('@/assets/images/error.svg')">
      <img v-if="msg.type === 'info'" :src="require('@/assets/images/info.svg')" width="20px">
      <img v-if="msg.type === 'success'" :src="require('@/assets/images/success.svg')">
      <loading-indicator v-if="msg.type === 'loading'" :progress="msg.progress" />
      <span class="msg-text">{{ serializeMessage(msg) }}</span>
    </div>
  </div>
</template>

<script>
import LoadingIndicator from '@/components/LoadingIndicator'

export default {
  name: 'logs',
  props: ['messages'],
  components: { LoadingIndicator },
  watch: {
    'messages.length': 'scrollToBottom'
  },
  mounted () {
    this.scrollToBottom()
  },
  methods: {
    async scrollToBottom () {
      const container = this.$refs.logsContainer
      if (container) {
        await this.$nextTick()
        container.scrollTop = container.scrollHeight
      }
    },

    serializeMessage (msg) {
      let result = ''
      if (msg.row !== null && msg.row !== undefined) {
        if (msg.type === 'error') {
          result += `Error in row ${msg.row}. `
        } else {
          result += `Information about row ${msg.row}. `
        }
      }

      result += msg.message
      if (!(/(\.|!|\?)$/.test(result))) {
        result += '.'
      }

      if (msg.hint) {
        result += ` ${msg.hint}`
      }
      return result
    }
  }
}
</script>

<style scoped>
.logs-container {
  background-color: var(--color-white);
  padding: 0 5px;
  border-radius: 5px;
  border: 1px solid var(--color-border-light);
  box-sizing: border-box;
  overflow-y: auto;
  color: var(--color-text-base);
}
.msg {
  padding: 12px 7px;
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  align-items: flex-start;
  font-family: monospace;
  font-size: 13px;
}

.msg:last-child {
  border-bottom: none;
}

.msg-text {
  margin-left: 6px;
  margin-top: 2px;
}
</style>
