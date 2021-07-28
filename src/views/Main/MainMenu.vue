<template>
  <nav>
    <div>
      <router-link to="/editor">Editor</router-link>
      <router-link to="/inquiries">Inquiries</router-link>
      <a href="https://github.com/lana-k/sqliteviz/wiki" target="_blank">Help</a>
    </div>
    <div id="nav-buttons">
      <button
        id="save-btn"
        v-show="currentInquiry && $route.path === '/editor'"
        class="primary"
        :disabled="isSaved"
        @click="checkInquiryBeforeSave"
      >
        Save
      </button>
      <button
        id="create-btn"
        class="primary"
        @click="createNewInquiry"
      >
        Create
      </button>
      <app-diagnostic-info />
    </div>

    <!--Save Inquiry dialog  -->
    <modal name="save" classes="dialog" height="auto">
      <div class="dialog-header">
        Save inquiry
        <close-icon @click="cancelSave"/>
      </div>
      <div class="dialog-body">
        <div v-show="isPredefined" id="save-note">
          <img :src="require('@/assets/images/info.svg')">
          Note: Predefined inquiries can't be edited.
          That's why your modifications will be saved as a new inquiry. Enter the name for it.
        </div>
        <text-field
          label="Inquiry name"
          :error-msg="errorMsg"
          v-model="name"
          width="100%"
        />
      </div>
      <div class="dialog-buttons-container">
        <button class="secondary" @click="cancelSave">Cancel</button>
        <button class="primary" @click="saveInquiry">Save</button>
      </div>
    </modal>
  </nav>
</template>

<script>
import TextField from '@/components/TextField'
import CloseIcon from '@/components/svg/close'
import storedInquiries from '@/lib/storedInquiries'
import AppDiagnosticInfo from './AppDiagnosticInfo'

export default {
  name: 'MainMenu',
  components: {
    TextField,
    CloseIcon,
    AppDiagnosticInfo
  },
  data () {
    return {
      name: '',
      errorMsg: null
    }
  },
  computed: {
    currentInquiry () {
      return this.$store.state.currentTab
    },
    isSaved () {
      if (!this.currentInquiry) {
        return false
      }
      const tabIndex = this.currentInquiry.tabIndex
      const tab = this.$store.state.tabs[tabIndex]
      return tab && tab.isSaved
    },
    isPredefined () {
      if (this.currentInquiry) {
        return this.currentInquiry.isPredefined
      } else {
        return false
      }
    },
    runDisabled () {
      return this.currentInquiry && (!this.$store.state.db || !this.currentInquiry.query)
    }
  },
  created () {
    this.$root.$on('createNewInquiry', this.createNewInquiry)
    this.$root.$on('saveInquiry', this.checkInquiryBeforeSave)
    document.addEventListener('keydown', this._keyListener)
  },
  beforeDestroy () {
    document.removeEventListener('keydown', this._keyListener)
  },
  methods: {
    createNewInquiry () {
      this.$store.dispatch('addTab').then(id => {
        this.$store.commit('setCurrentTabId', id)
        if (this.$route.path !== '/editor') {
          this.$router.push('/editor')
        }
      })
    },
    cancelSave () {
      this.$modal.hide('save')
      this.$root.$off('inquirySaved')
    },
    checkInquiryBeforeSave () {
      this.errorMsg = null
      this.name = ''

      if (storedInquiries.isTabNeedName(this.currentInquiry)) {
        this.$modal.show('save')
      } else {
        this.saveInquiry()
      }
    },
    saveInquiry () {
      const isNeedName = storedInquiries.isTabNeedName(this.currentInquiry)
      if (isNeedName && !this.name) {
        this.errorMsg = 'Inquiry name can\'t be empty'
        return
      }
      const dataSet = this.currentInquiry.result
      const tabView = this.currentInquiry.view

      // Save inquiry
      const value = storedInquiries.save(this.currentInquiry, this.name)

      // Update tab in store
      this.$store.commit('updateTab', {
        index: this.currentInquiry.tabIndex,
        name: value.name,
        id: value.id,
        query: value.query,
        viewType: value.viewType,
        viewOptions: value.viewOptions,
        isSaved: true
      })

      // Restore data:
      // e.g. if we save predefined inquiry the tab will be created again
      // (because of new id) and
      // it will be without sql result and has default view - table.
      // That's why we need to restore data and view
      this.$nextTick(() => {
        this.currentInquiry.result = dataSet
        this.currentInquiry.view = tabView
      })

      // Hide dialog
      this.$modal.hide('save')

      // Signal about saving
      this.$root.$emit('inquirySaved')
    },
    _keyListener (e) {
      if (this.$route.path === '/editor') {
        // Run query Ctrl+R or Ctrl+Enter
        if ((e.key === 'r' || e.key === 'Enter') && (e.ctrlKey || e.metaKey)) {
          e.preventDefault()
          if (!this.runDisabled) {
            this.currentInquiry.execute()
          }
          return
        }

        // Save inquiry Ctrl+S
        if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault()
          if (!this.isSaved) {
            this.checkInquiryBeforeSave()
          }
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
</style>
