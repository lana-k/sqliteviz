<template>
  <div id="tabs">
    <div v-if="tabs.length > 0" id="tabs-header">
      <div
        v-for="(tab, index) in tabs"
        :key="index"
        :class="[{ 'tab-selected': tab.id === selectedTabId }, 'tab']"
        @click="selectTab(tab.id)"
      >
        <div class="tab-name">
          <span v-show="!tab.isSaved" class="star">*</span>
          <span v-if="tab.name">{{ tab.name }}</span>
          <span v-else class="tab-untitled">{{ tab.tempName }}</span>
        </div>
        <div>
          <close-icon
            class="close-icon"
            :size="10"
            @click="beforeCloseTab(tab)"
          />
        </div>
      </div>
    </div>
    <tab v-for="tab in tabs" :key="tab.id" :tab="tab" />
    <div v-show="tabs.length === 0" id="start-guide">
      <span class="link" @click="emitCreateTabEvent">Create</span>
      new inquiry from scratch or open one from
      <router-link class="link" to="/inquiries">Inquiries</router-link>
    </div>

    <!--Close tab warning dialog  -->
    <modal modalId="close-warn" class="dialog" contentStyle="width: 560px;">
      <div class="dialog-header">
        Close tab
        {{
          closingTab !== null
            ? closingTab.name || `[${closingTab.tempName}]`
            : ''
        }}
        <close-icon @click="$modal.hide('close-warn')" />
      </div>
      <div class="dialog-body">
        You have unsaved changes. Save changes in
        {{
          closingTab !== null
            ? closingTab.name || `[${closingTab.tempName}]`
            : ''
        }}
        before closing?
      </div>
      <div class="dialog-buttons-container">
        <button class="secondary" @click="closeTab(closingTab)">
          Close without saving
        </button>
        <button class="secondary" @click="$modal.hide('close-warn')">
          Don't close
        </button>
        <button class="primary" @click="saveAndClose(closingTab)">
          Save and close
        </button>
      </div>
    </modal>
  </div>
</template>

<script>
import Tab from './Tab'
import CloseIcon from '@/components/svg/close'
import eventBus from '@/lib/eventBus'

export default {
  components: {
    Tab,
    CloseIcon
  },
  emits: [],
  data() {
    return {
      closingTab: null
    }
  },
  computed: {
    tabs() {
      return this.$store.state.tabs
    },
    selectedTabId() {
      return this.$store.state.currentTabId
    }
  },
  created() {
    window.addEventListener('beforeunload', this.leavingSqliteviz)
  },
  methods: {
    emitCreateTabEvent() {
      eventBus.$emit('createNewInquiry')
    },
    leavingSqliteviz(event) {
      if (this.tabs.some(tab => !tab.isSaved)) {
        event.preventDefault()
        event.returnValue = ''
      }
    },
    selectTab(id) {
      this.$store.commit('setCurrentTabId', id)
    },
    beforeCloseTab(tab) {
      this.closingTab = tab
      if (!tab.isSaved) {
        this.$modal.show('close-warn')
      } else {
        this.closeTab(tab)
      }
    },
    closeTab(tab) {
      this.$modal.hide('close-warn')
      this.$store.commit('deleteTab', tab)
    },
    saveAndClose(tab) {
      eventBus.$on('inquirySaved', () => {
        this.closeTab(tab)
        eventBus.$off('inquirySaved')
      })
      this.selectTab(tab.id)
      this.$modal.hide('close-warn')
      this.$nextTick(() => {
        eventBus.$emit('saveInquiry')
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
