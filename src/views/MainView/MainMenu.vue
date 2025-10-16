<template>
  <nav>
    <div id="nav-links">
      <a href="https://sqliteviz.com">
        <img src="~@/assets/images/logo_simple.svg" />
      </a>
      <router-link to="/workspace">Workspace</router-link>
      <router-link to="/inquiries">Inquiries</router-link>
      <a href="https://sqliteviz.com/docs" target="_blank">Help</a>
    </div>
    <div id="nav-buttons">
      <button
        v-show="currentInquiryTab && $route.path === '/workspace'"
        id="save-btn"
        class="primary"
        :disabled="isSaved"
        @click="onSave(false)"
      >
        Save
      </button>
      <button
        v-show="currentInquiryTab && $route.path === '/workspace'"
        id="save-as-btn"
        class="primary"
        @click="onSaveAs"
      >
        Save as
      </button>
      <button id="create-btn" class="primary" @click="createNewInquiry">
        Create
      </button>
      <app-diagnostic-info />
    </div>

    <!--Save Inquiry dialog  -->
    <modal modalId="save" class="dialog" contentStyle="width: 560px;">
      <div class="dialog-header">
        Save inquiry
        <close-icon @click="cancelSave" />
      </div>
      <div class="dialog-body">
        <div v-show="isPredefined" id="save-note">
          <img src="~@/assets/images/info.svg" />
          Note: Predefined inquiries can't be edited. That's why your
          modifications will be saved as a new inquiry. Enter the name for it.
        </div>
        <text-field
          v-model="name"
          label="Inquiry name"
          :errorMsg="errorMsg"
          width="100%"
        />
      </div>
      <div class="dialog-buttons-container">
        <button class="secondary" @click="cancelSave">Cancel</button>
        <button class="primary" @click="validateSaveFormAndSaveInquiry">
          Save
        </button>
      </div>
    </modal>

    <!-- Inquiery saving conflict dialog -->
    <modal
      modalId="inquiry-conflict"
      class="dialog"
      contentStyle="width: 560px;"
    >
      <div class="dialog-header">
        Inquiry saving conflict
        <close-icon @click="cancelSave" />
      </div>
      <div class="dialog-body">
        <div id="save-note">
          <img src="~@/assets/images/info.svg" />
          This inquiry has been modified in the mean time. This can happen if an
          inquiry is saved in another window or browser tab. Do you want to
          overwrite that changes or save the current state as a new inquiry?
        </div>
      </div>
      <div class="dialog-buttons-container">
        <button class="secondary" @click="cancelSave">Cancel</button>
        <button class="primary" @click="onSave(true)">Overwrite</button>
        <button class="primary" @click="onSaveAs">Save as new</button>
      </div>
    </modal>
  </nav>
</template>

<script>
import TextField from '@/components/TextField'
import CloseIcon from '@/components/svg/close'
import storedInquiries from '@/lib/storedInquiries'
import AppDiagnosticInfo from './AppDiagnosticInfo'
import events from '@/lib/utils/events'
import eventBus from '@/lib/eventBus'

export default {
  name: 'MainMenu',
  components: {
    TextField,
    CloseIcon,
    AppDiagnosticInfo
  },
  data() {
    return {
      name: '',
      errorMsg: null
    }
  },
  computed: {
    inquiries() {
      return this.$store.state.inquiries
    },
    currentInquiryTab() {
      return this.$store.state.currentTab
    },
    isSaved() {
      return this.currentInquiryTab && this.currentInquiryTab.isSaved
    },
    isPredefined() {
      return this.currentInquiryTab && this.currentInquiryTab.isPredefined
    },
    runDisabled() {
      return (
        this.currentInquiryTab &&
        (!this.$store.state.db || !this.currentInquiryTab.query)
      )
    }
  },
  created() {
    eventBus.$on('createNewInquiry', this.createNewInquiry)
    eventBus.$on('saveInquiry', this.onSave)
    document.addEventListener('keydown', this._keyListener)
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this._keyListener)
  },
  methods: {
    createNewInquiry() {
      this.$store.dispatch('addTab').then(id => {
        this.$store.commit('setCurrentTabId', id)
        if (this.$route.path !== '/workspace') {
          this.$router.push('/workspace')
        }
      })

      events.send('inquiry.create', null, { auto: false })
    },
    cancelSave() {
      this.errorMsg = null
      this.name = ''
      this.$modal.hide('save')
      this.$modal.hide('inquiry-conflict')
      eventBus.$off('inquirySaved')
    },
    onSave(skipConcurrentEditingCheck = false) {
      if (storedInquiries.isTabNeedName(this.currentInquiryTab)) {
        this.openSaveModal()
        return
      }

      if (!skipConcurrentEditingCheck) {
        const inquiryInStore = this.inquiries.find(
          inquiry => inquiry.id === this.currentInquiryTab.id
        )

        if (
          inquiryInStore &&
          inquiryInStore.updatedAt !== this.currentInquiryTab.updatedAt
        ) {
          this.$modal.show('inquiry-conflict')
          return
        }
      }
      this.saveInquiry()
    },
    onSaveAs() {
      this.openSaveModal()
    },
    openSaveModal() {
      this.$modal.hide('inquiry-conflict')
      this.errorMsg = null
      this.name = ''
      this.$modal.show('save')
    },
    validateSaveFormAndSaveInquiry() {
      if (!this.name) {
        this.errorMsg = "Inquiry name can't be empty"
        return
      }
      this.saveInquiry()
    },
    async saveInquiry() {
      const eventName =
        this.currentInquiryTab.name && this.name
          ? 'inquiry.saveAs'
          : 'inquiry.save'

      // Save inquiry
      const value = await this.$store.dispatch('saveInquiry', {
        inquiryTab: this.currentInquiryTab,
        newName: this.name
      })

      // Update tab in store
      this.$store.commit('updateTab', {
        tab: this.currentInquiryTab,
        newValues: {
          name: value.name,
          id: value.id,
          query: value.query,
          viewType: value.viewType,
          viewOptions: value.viewOptions,
          isSaved: true,
          updatedAt: value.updatedAt
        }
      })

      // Hide dialogs
      this.$modal.hide('save')
      this.$modal.hide('inquiry-conflict')
      this.errorMsg = null
      this.name = ''

      // Signal about saving
      eventBus.$emit('inquirySaved')
      events.send(eventName)
    },
    _keyListener(e) {
      if (this.$route.path === '/workspace') {
        // Run query Ctrl+R or Ctrl+Enter
        if ((e.key === 'r' || e.key === 'Enter') && (e.ctrlKey || e.metaKey)) {
          e.preventDefault()
          if (!this.runDisabled) {
            this.currentInquiryTab.execute()
          }
          return
        }

        // Save inquiry Ctrl+S
        if (e.key === 's' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
          e.preventDefault()
          if (!this.isSaved) {
            this.onSave()
          }
          return
        }
        // Save inquiry as Ctrl+Shift+S
        if (e.key === 'S' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
          e.preventDefault()
          this.onSaveAs()
          return
        }
      }
      // New (blank) inquiry Ctrl+B
      if (e.key === 'b' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        this.createNewInquiry()
      }
    }
  }
}
</script>

<style scoped>
nav {
  height: 68px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--color-bg-light);
  border-bottom: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-1);
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  padding: 0 16px 0 52px;
  z-index: 999;
}
a {
  font-size: 18px;
  color: var(--color-text-base);
  text-transform: none;
  text-decoration: none;
  margin-right: 28px;
}
a.router-link-active {
  color: var(--color-accent);
}
button {
  margin-left: 16px;
}

#save-note {
  margin-bottom: 24px;
  display: flex;
  align-items: flex-start;
}
#save-note img {
  margin: -3px 6px 0 0;
}

#nav-buttons {
  display: flex;
}

#nav-links {
  display: flex;
  align-items: center;
}
#nav-links img {
  width: 32px;
}
</style>
