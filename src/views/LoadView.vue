<template>
    <div>
      <logs
        id="logs"
        :messages="messages"
      />
      <button
        v-if="hasErrors"
        id="open-workspace-btn"
        class="secondary"
        @click="$router.push('/workspace?hide_schema=1')">
        Open workspace
      </button>
    </div>
</template>

<script>
import fu from '@/lib/utils/fileIo'
import database from '@/lib/database'
import Logs from '@/components/Logs'
import events from '@/lib/utils/events'

export default {
  name: 'LoadView',
  components: {
    Logs
  },
  data () {
    return {
      newDb: null,
      messages: [],
      dataMsg: {},
      inquiryMsg: {}
    }
  },
  computed: {
    hasErrors () {
      return this.dataMsg.type === 'error' || this.inquiryMsg.type === 'error'
    }
  },
  async created () {
    const {
      data_url: dataUrl,
      data_format: dataFormat,
      inquiry_url: inquiryUrl,
      inquiry_id: inquiryIds,
      maximize
    } = this.$route.query

    events.send('share.load', null, {
      has_data_url: !!dataUrl,
      data_format: dataFormat,
      has_inquiry_url: !!inquiryUrl,
      inquiry_id_count: (inquiryIds || []).length,
      maximize
    })

    await this.loadData(dataUrl, dataFormat)
    const inquiries = await this.loadInquiries(inquiryUrl, inquiryIds)
    if (inquiries && inquiries.length > 0) {
      await this.openInquiries(inquiries, maximize)
    }
    if (!this.hasErrors) {
      this.$router.push('/workspace?hide_schema=1')
    }
  },
  methods: {
    async loadData (dataUrl, dataFormat) {
      this.newDb = database.getNewDatabase()
      if (dataUrl) {
        this.dataMsg = {
          message: 'Preparing data...',
          type: 'info'
        }
        this.messages.push(this.dataMsg)

        // Show loading indicator after 1 second
        const loadingDataIndicator = setTimeout(() => {
          if (this.dataMsg.type === 'info') {
            this.dataMsg.type = 'loading'
          }
        }, 1000)

        if (dataFormat === 'sqlite') {
          await this.getSqliteDb(dataUrl)
        } else {
          this.dataMsg.message = 'Unknown data format'
          this.dataMsg.type = 'error'
        }

        // Loading indicator is not needed anymore
        clearTimeout(loadingDataIndicator)
      } else {
        await this.newDb.loadDb()
      }
      this.$store.commit('setDb', this.newDb)
    },
    async getSqliteDb (dataUrl) {
      try {
        const filename = new URL(dataUrl).pathname.split('/').pop()
        const res = await fu.readFile(dataUrl)
        if (!res.ok) {
          throw new Error('Fetching DB failed')
        }
        const file = await res.blob()
        file.name = filename

        await this.newDb.loadDb(file)
        this.dataMsg.message = 'Data is ready'
        this.dataMsg.type = 'success'
      } catch (error) {
        console.error(error)
        this.dataMsg.message = error
        this.dataMsg.type = 'error'
      }
    },
    async loadInquiries (inquiryUrl, inquiryIds = []) {
      if (!inquiryUrl) {
        return []
      }
      // Show loading indicator after 1 second
      const loadingInquiriesIndicator = setTimeout(() => {
        if (this.inquiryMsg.type === 'info') {
          this.inquiryMsg.type = 'loading'
        }
      }, 1000)
      try {
        this.inquiryMsg = {
          message: 'Preparing inquiries...',
          type: 'info'
        }
        this.messages.push(this.inquiryMsg)

        const res = await fu.readFile(inquiryUrl)
        const file = await res.json()

        this.inquiryMsg.message = 'Inquiries are ready'
        this.inquiryMsg.type = 'success'

        return inquiryIds.length > 0
          ? file.inquiries.filter(inquiry => inquiryIds.includes(inquiry.id))
          : file.inquiries
      } catch (error) {
        console.error(error)
        this.inquiryMsg.message = error
        this.inquiryMsg.type = 'error'
      }
      // Loading indicator is not needed anymore
      clearTimeout(loadingInquiriesIndicator)
    },
    async openInquiries (inquiries, maximize) {
      let tabToOpen = null
      const layout = maximize ? this.getLayout(maximize) : undefined
      for (const inquiry of inquiries) {
        const tabId = await this.$store.dispatch('addTab', {
          ...inquiry,
          id: undefined,
          layout,
          maximize
        })
        if (!tabToOpen) {
          tabToOpen = tabId
          this.$store.commit('setCurrentTabId', tabToOpen)
        }
      }

      this.$store.state.currentTab.execute()
    },

    getLayout (panelToMaximize) {
      if (panelToMaximize === 'dataView') {
        return {
          sqlEditor: 'hidden',
          table: 'above',
          dataView: 'bottom'
        }
      } else {
        return {
          sqlEditor: 'above',
          table: 'bottom',
          dataView: 'hidden'
        }
      }
    }
  }
}
</script>

<style scoped>
#logs {
  margin: 8px auto;
  max-width: 800px;

}

#open-workspace-btn {
  margin: 16px auto;
  display: block;
}
</style>
