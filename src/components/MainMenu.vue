<template>
  <nav>
    <div>
      <router-link to="/editor">Editor</router-link>
      <router-link to="/my-queries">My queries</router-link>
    </div>
    <div>
      <button
        v-if="$store.state.tabs.length > 0"
        class="primary"
        :disabled="$store.state.currentTab && !$store.state.currentTab.isUnsaved"
        @click="saveQuery"
      >
        Save
      </button>
      <button class="primary" @click="createNewQuery">Create</button>
    </div>
  </nav>
</template>

<script>
import { nanoid } from 'nanoid'

export default {
  name: 'MainMenu',
  created () {
    this.$root.$on('createNewQuery', this.createNewQuery)
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
      this.$store.commit('updateUntitledLastIndex')
    },
    saveQuery () {
      const currentQuery = this.$store.state.currentTab
      const isFromScratch = !this.$store.state.currentTab.initName
      const value = {
        id: currentQuery.id,
        query: currentQuery.query,
        plotly: currentQuery.getPlotlySatateForSave()
      }

      if (isFromScratch) {
        value.name = prompt('query name')
        // TODO: create dialog
        this.$store.commit('updateTabName', { index: currentQuery.tabIndex, newName: value.name })
        value.createdAt = new Date()
      } else {
        value.name = currentQuery.initName
      }

      let myQueries = JSON.parse(localStorage.getItem('myQueries'))
      if (!myQueries) {
        myQueries = [value]
      } else if (isFromScratch) {
        myQueries.push(value)
      } else {
        const queryIndex = myQueries.findIndex(query => query.id === currentQuery.id)
        value.createdAt = myQueries[queryIndex].createdAt
        myQueries[queryIndex] = value
      }
      localStorage.setItem('myQueries', JSON.stringify(myQueries))
      currentQuery.isUnsaved = false
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
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  padding: 0 52px;
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
</style>
