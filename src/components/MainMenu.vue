<template>
  <nav>
    <div>
      <router-link to="/editor">Editor</router-link>
      <router-link to="/my-queries">My queries</router-link>
    </div>
    <div>
      <button
        v-if="currentQuery"
        class="primary"
        :disabled="currentQuery && (!$store.state.schema || !currentQuery.query)"
        @click="currentQuery.execute"
      >
        Run
      </button>
      <button
        v-if="currentQuery"
        class="primary"
        :disabled="currentQuery && !currentQuery.isUnsaved"
        @click="checkQueryBeforeSave"
      >
        Save
      </button>
      <button class="primary" @click="createNewQuery">Create</button>
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
import { nanoid } from 'nanoid'
import TextField from '@/components/TextField'
import CloseIcon from '@/components/svg/close'

export default {
  name: 'MainMenu',
  components: {
    TextField,
    CloseIcon
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
    isPredefined () {
      if (this.currentQuery) {
        return this.currentQuery.isPredefined
      } else {
        return false
      }
    }
  },
  created () {
    this.$root.$on('createNewQuery', this.createNewQuery)
    this.$root.$on('saveQuery', this.checkQueryBeforeSave)
  },
  methods: {
    createNewQuery () {
      const tab = {
        id: nanoid(),
        name: null,
        tempName: this.$store.state.untitledLastIndex
          ? `Untitled ${this.$store.state.untitledLastIndex}`
          : 'Untitled',
        isUnsaved: true
      }
      this.$store.commit('addTab', tab)
      this.$store.commit('setCurrentTabId', tab.id)
    },
    cancelSave () {
      this.$modal.hide('save')
      this.$root.$off('querySaved')
    },
    checkQueryBeforeSave () {
      this.errorMsg = null
      const isFromScratch = !this.currentQuery.initName

      if (isFromScratch || this.isPredefined) {
        this.name = ''
        this.$modal.show('save')
      } else {
        this.saveQuery()
      }
    },
    saveQuery () {
      const isFromScratch = !this.currentQuery.initName
      if ((isFromScratch || this.isPredefined) && !this.name) {
        this.errorMsg = 'Query name can\'t be empty'
        return
      }
      const dataSet = this.currentQuery.result
      const tabView = this.currentQuery.view
      // Prepare query
      const value = {
        id: this.isPredefined ? nanoid() : this.currentQuery.id,
        query: this.currentQuery.query,
        chart: this.currentQuery.getChartSatateForSave(),
        name: (!this.isPredefined && this.currentQuery.initName) || this.name,
        createdAt: new Date()
      }

      // Save query
      let myQueries = JSON.parse(localStorage.getItem('myQueries'))
      if (!myQueries) {
        myQueries = [value]
      } else if (isFromScratch || this.isPredefined) {
        myQueries.push(value)
      } else {
        const queryIndex = myQueries.findIndex(query => query.id === this.currentQuery.id)
        value.createdAt = myQueries[queryIndex].createdAt
        myQueries[queryIndex] = value
      }
      localStorage.setItem('myQueries', JSON.stringify(myQueries))

      // Update tab
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
  padding: 0 52px;
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
</style>
