<template>
   <div id="tabs-container">
    <div id="tabs__header" v-if="tabs.length > 0">
      <div
        v-for="(tab, index) in tabs"
        :key="index"
        @click="selectTab(tab.id)"
        :class="[{'tab__selected': (tab.id === selectedIndex)}, 'tab']"
      >
        <div class="tab-name">
          <span v-show="tab.isUnsaved">*</span>
          <span v-if="tab.name">{{ tab.name }}</span>
          <span v-else class="tab-untitled">{{ tab.tempName }}</span>
        </div>
        <div>
          <close-icon class="close-icon" :size="10" @click="closeTab(index)"/>
        </div>
      </div>
    </div>
    <tab
      v-for="(tab, index) in tabs"
      :key="tab.id"
      :id="tab.id"
      :init-name="tab.name"
      :init-query="tab.query"
      :init-chart="tab.chart"
      :is-predefined="tab.isPredefined"
      :tab-index="index"
    />
    <div v-if="tabs.length === 0" id="start-guide">
      <span class="link" @click="$root.$emit('createNewQuery')">Create</span>
      a new query from scratch or open the one from
      <router-link class="link" to="/my-queries">My queries</router-link>
    </div>
  </div>
</template>

<script>
import Tab from '@/components/Tab'
import CloseIcon from '@/components/svg/close'

export default {
  components: {
    Tab,
    CloseIcon
  },
  data () {
    return {
    }
  },
  computed: {
    tabs () {
      return this.$store.state.tabs
    },
    selectedIndex () {
      return this.$store.state.currentTabId
    }
  },
  methods: {
    selectTab (id) {
      this.$store.commit('setCurrentTabId', id)
    },
    closeTab (index) {
      this.$store.commit('deleteTab', index)
    }
  }
}
</script>

<style>
#tabs-container {
  position: relative;
  height: 100%;
  background-color: var(--color-bg-light);
}
#tabs__header {
  display: flex;
  margin: 0;
  max-width: 100%;
  overflow: hidden;
}
#tabs__header .tab {
  height: 36px;
  background-color: var(--color-bg-light);
  border-right: 1px solid var(--color-border-light);
  border-bottom: 1px solid var(--color-border-light);
  line-height: 36px;
  font-size: 14px;
  color: var(--color-text-base);
  padding: 0 12px;
  box-sizing: border-box;
  position: relative;
  max-width: 200px;
  display: flex;
  flex-shrink: 1;
  min-width: 0;
}
#tabs__header .tab-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
}

#tabs__header div:hover {
  cursor: pointer;
}

#tabs__header .tab__selected {
  color: var(--color-text-active);
  font-weight: 600;
  border-bottom: none;
  background-color: var(--color-white);
}
#tabs__header .tab__selected:hover {
    cursor: default;
}

.close-icon {
  margin-left: 5px;
}

#start-guide {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--color-text-base);
  font-size: 14px;
  text-align: center;
}
.link {
  color: var(--color-accent);
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
}
</style>
