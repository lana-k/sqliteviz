<template>
   <div id="tabs">
    <div id="tabs-header" v-if="tabs.length > 0">
      <div
        v-for="(tab, index) in tabs"
        :key="index"
        @click="selectTab(tab.id)"
        :class="[{'tab-selected': (tab.id === selectedIndex)}, 'tab']"
      >
        <div class="tab-name">
          <span v-show="!tab.isSaved" class="star">*</span>
          <span v-if="tab.name">{{ tab.name }}</span>
          <span v-else class="tab-untitled">{{ tab.tempName }}</span>
        </div>
        <div>
          <close-icon class="close-icon" :size="10" @click="beforeCloseTab(index)"/>
        </div>
      </div>
    </div>
    <tab
      v-for="(tab, index) in tabs"
      :key="tab.id"
      :id="tab.id"
      :init-name="tab.name"
      :init-query="tab.query"
      :init-view-options="tab.viewOptions"
      :init-view-type="tab.viewType"
      :is-predefined="tab.isPredefined"
      :tab-index="index"
    />
    <div v-show="tabs.length === 0" id="start-guide">
      <span class="link" @click="$root.$emit('createNewInquiry')">Create</span>
      new inquiry from scratch or open one from
      <router-link class="link" to="/inquiries">Inquiries</router-link>
    </div>

    <!--Close tab warning dialog  -->
    <modal name="close-warn" classes="dialog" height="auto">
      <div class="dialog-header">
        Close tab {{
          closingTabIndex !== null
          ? (tabs[closingTabIndex].name || `[${tabs[closingTabIndex].tempName}]`)
          : ''
        }}
        <close-icon @click="$modal.hide('close-warn')"/>
      </div>
      <div class="dialog-body">
        You have unsaved changes. Save changes in {{
          closingTabIndex !== null
          ? (tabs[closingTabIndex].name || `[${tabs[closingTabIndex].tempName}]`)
          : ''
        }} before closing?
      </div>
      <div class="dialog-buttons-container">
        <button class="secondary" @click="closeTab(closingTabIndex)">
          Close without saving
        </button>
        <button class="secondary" @click="$modal.hide('close-warn')">Cancel</button>
        <button class="primary" @click="saveAndClose(closingTabIndex)">Save and close</button>
      </div>
    </modal>
  </div>
</template>

<script>
import Tab from './Tab'
import CloseIcon from '@/components/svg/close'

export default {
  components: {
    Tab,
    CloseIcon
  },
  data () {
    return {
      closingTabIndex: null
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
  created () {
    window.addEventListener('beforeunload', this.leavingSqliteviz)
  },
  methods: {
    leavingSqliteviz (event) {
      if (this.tabs.some(tab => !tab.isSaved)) {
        event.preventDefault()
        event.returnValue = ''
      }
    },
    selectTab (id) {
      this.$store.commit('setCurrentTabId', id)
    },
    beforeCloseTab (index) {
      this.closingTabIndex = index
      if (!this.tabs[index].isSaved) {
        this.$modal.show('close-warn')
      } else {
        this.closeTab(index)
      }
    },
    closeTab (index) {
      this.$modal.hide('close-warn')
      this.closingTabIndex = null
      this.$store.commit('deleteTab', index)
    },
    saveAndClose (index) {
      this.$root.$on('inquirySaved', () => {
        this.closeTab(index)
        this.$root.$off('inquirySaved')
      })
      this.selectTab(this.tabs[index].id)
      this.$modal.hide('close-warn')
      this.$nextTick(() => {
        this.$root.$emit('saveInquiry')
      })
    }
  }
}
</script>

<style>
#tabs {
  position: relative;
  height: 100%;
  background-color: var(--color-bg-light);
}
#tabs-header {
  display: flex;
  margin: 0;
  max-width: 100%;
  overflow: hidden;
}
#tabs-header .tab {
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
#tabs-header .tab-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
}

#tabs-header .tab:hover {
  cursor: pointer;
}

#tabs-header .tab-selected {
  color: var(--color-text-active);
  border-bottom: none;
  background-color: var(--color-white);
  position: relative;
}

#tabs-header .tab-selected:after {
  content: '';
  width: 100%;
  height: 4px;
  background-color: var(--color-accent);
  position: absolute;
  left: 0;
  bottom: 0;
}

#tabs-header .tab.tab-selected:hover {
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
