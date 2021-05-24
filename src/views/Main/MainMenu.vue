<template>
  <nav>
    <div>
      <router-link to="/editor">Editor</router-link>
      <router-link to="/my-queries">My queries</router-link>
      <a href="https://github.com/lana-k/sqliteviz/wiki" target="_blank">Help</a>
    </div>
    <div id="nav-buttons">
      <button
        id="run-btn"
        v-if="currentQuery && $route.path === '/editor'"
        class="primary"
        :disabled="runDisabled"
        @click="currentQuery.execute"
      >
        Run
      </button>
      <button
        id="save-btn"
        v-show="currentQuery && $route.path === '/editor'"
        class="primary"
        :disabled="!isUnsaved"
        @click="checkQueryBeforeSave"
      >
        Save
      </button>
      <button
        id="create-btn"
        class="primary"
        @click="createNewQuery"
      >
        Create
      </button>
      <app-diagnostic-info />
    </div>

    <!--Save Query dialog  -->
    <modal name="save" classes="dialog" height="auto">
      <div class="dialog-header">
        Save query
        <close-icon @click="cancelSave"/>
      </div>
      <div class="dialog-body">
        <div v-show="isPredefined" id="save-note">
          <img :src="require('@/assets/images/info.svg')">
          Note: Predefined queries can't be edited.
          That's why your modifications will be saved as a new query. Enter the name for it.
        </div>
        <text-field
          label="Query name"
          :error-msg="errorMsg"
          v-model="name"
          width="100%"
        />
      </div>
      <div class="dialog-buttons-container">
        <button class="secondary" @click="cancelSave">Cancel</button>
        <button class="primary" @click="saveQuery">Save</button>
      </div>
    </modal>
  </nav>
</template>

<script>
import TextField from '@/components/TextField'
import CloseIcon from '@/components/svg/close'
import storedQueries from '@/lib/storedQueries'
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
    currentQuery () {
      return this.$store.state.currentTab
    },
    isUnsaved () {
      if (!this.currentQuery) {
        return false
      }
      const tabIndex = this.currentQuery.tabIndex
      const tab = this.$store.state.tabs[tabIndex]
      return tab && tab.isUnsaved
    },
    isPredefined () {
      if (this.currentQuery) {
        return this.currentQuery.isPredefined
      } else {
        return false
      }
    },
    runDisabled () {
      return this.currentQuery && (!this.$store.state.db || !this.currentQuery.query)
    }
  },
  created () {
    this.$root.$on('createNewQuery', this.createNewQuery)
    this.$root.$on('saveQuery', this.checkQueryBeforeSave)
    document.addEventListener('keydown', this._keyListener)
  },
  beforeDestroy () {
    document.removeEventListener('keydown', this._keyListener)
  },
  methods: {
    createNewQuery () {
      this.$store.dispatch('addTab').then(id => {
        this.$store.commit('setCurrentTabId', id)
        if (this.$route.path !== '/editor') {
          this.$router.push('/editor')
        }
      })
    },
    cancelSave () {
      this.$modal.hide('save')
      this.$root.$off('querySaved')
    },
    checkQueryBeforeSave () {
      this.errorMsg = null
      this.name = ''

      if (storedQueries.isTabNeedName(this.currentQuery)) {
        this.$modal.show('save')
      } else {
        this.saveQuery()
      }
    },
    saveQuery () {
      const isNeedName = storedQueries.isTabNeedName(this.currentQuery)
      if (isNeedName && !this.name) {
        this.errorMsg = 'Query name can\'t be empty'
        return
      }
      const dataSet = this.currentQuery.result
      const tabView = this.currentQuery.view

      // Save query
      const value = storedQueries.save(this.currentQuery, this.name)

      // Update tab in store
      this.$store.commit('updateTab', {
        index: this.currentQuery.tabIndex,
        name: value.name,
        id: value.id,
        query: value.query,
        chart: value.chart,
        isUnsaved: false
      })

      // Restore data:
      // e.g. if we save predefined query the tab will be created again
      // (because of new id) and
      // it will be without sql result and has default view - table.
      // That's why we need to restore data and view
      this.$nextTick(() => {
        this.currentQuery.result = dataSet
        this.currentQuery.view = tabView
      })

      // Hide dialog
      this.$modal.hide('save')

      // Signal about saving
      this.$root.$emit('querySaved')
    },
    _keyListener (e) {
      if (this.$route.path === '/editor') {
        // Run query Ctrl+R or Ctrl+Enter
        if ((e.key === 'r' || e.key === 'Enter') && (e.ctrlKey || e.metaKey)) {
          e.preventDefault()
          if (!this.runDisabled) {
            this.currentQuery.execute()
          }
          return
        }

        // Save query Ctrl+S
        if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault()
          if (this.isUnsaved) {
            this.checkQueryBeforeSave()
          }
          return
        }
      }
      // New (blank) query Ctrl+B
      if (e.key === 'b' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        this.createNewQuery()
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
