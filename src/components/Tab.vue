<template>
  <div v-show="isActive" class="tab-content-container">
    <splitpanes
      class="query-results-splitter"
      horizontal
      :before="{ size: topPaneSize, max: 100 }"
      :after="{ size: 100 - topPaneSize, max: 100 }"
      :default="{ before: 50, after: 50 }"
    >
      <template #left-pane>
        <div :id="'above-' + tab.id" class="above" />
      </template>
      <template #right-pane>
        <div :id="'bottom-' + tab.id" ref="bottomPane" class="bottomPane" />
      </template>
    </splitpanes>

    <div :id="'hidden-' + tab.id" class="hidden-part" />

    <teleport
      defer
      :to="enableTeleport ? `#${tab.layout.sqlEditor}-${tab.id}` : undefined"
      :disabled="!enableTeleport"
    >
      <sql-editor
        ref="sqlEditor"
        v-model="tab.query"
        :isGettingResults="tab.isGettingResults"
        @switch-to="onSwitchView('sqlEditor', $event)"
        @run="tab.execute()"
      />
    </teleport>

    <teleport
      defer
      :to="enableTeleport ? `#${tab.layout.table}-${tab.id}` : undefined"
      :disabled="!enableTeleport"
    >
      <run-result
        :result="tab.result"
        :isGettingResults="tab.isGettingResults"
        :error="tab.error"
        :time="tab.time"
        @switch-to="onSwitchView('table', $event)"
      />
    </teleport>

    <teleport
      defer
      :to="enableTeleport ? `#${tab.layout.dataView}-${tab.id}` : undefined"
      :disabled="!enableTeleport"
    >
      <data-view
        ref="dataView"
        :data-source="(tab.result && tab.result.values) || null"
        :initOptions="tab.viewOptions"
        :initMode="tab.viewType"
        @switch-to="onSwitchView('dataView', $event)"
        @update="onDataViewUpdate"
      />
    </teleport>
  </div>
</template>

<script>
import Splitpanes from '@/components/Common/Splitpanes'
import SqlEditor from '@/components/SqlEditor'
import DataView from '@/components/DataView'
import RunResult from '@/components/RunResult'
import { nextTick, computed } from 'vue'

import events from '@/lib/utils/events'

export default {
  name: 'Tab',
  components: {
    SqlEditor,
    DataView,
    RunResult,
    Splitpanes
  },
  provide() {
    return {
      tabLayout: computed(() => this.tab.layout)
    }
  },
  props: {
    tab: Object
  },
  emits: [],
  data() {
    return {
      topPaneSize: this.tab.maximize
        ? this.tab.layout[this.tab.maximize] === 'above'
          ? 100
          : 0
        : 50,
      enableTeleport: this.$store.state.isWorkspaceVisible
    }
  },
  computed: {
    isActive() {
      return this.tab.id === this.$store.state.currentTabId
    }
  },
  watch: {
    isActive: {
      immediate: true,
      async handler() {
        if (this.isActive) {
          await nextTick()
          this.$refs.sqlEditor?.focus()
        }
      }
    },
    'tab.query'() {
      this.$store.commit('updateTab', {
        tab: this.tab,
        newValues: { isSaved: false }
      })
    }
  },
  async activated() {
    this.enableTeleport = true
    if (this.isActive) {
      await nextTick()
      this.$refs.sqlEditor.focus()
    }
  },
  deactivated() {
    this.enableTeleport = false
  },
  async mounted() {
    this.tab.dataView = this.$refs.dataView
  },
  methods: {
    onSwitchView(from, to) {
      const fromPosition = this.tab.layout[from]
      this.tab.layout[from] = this.tab.layout[to]
      this.tab.layout[to] = fromPosition

      events.send('inquiry.panel', null, { panel: to })
    },
    onDataViewUpdate() {
      this.$store.commit('updateTab', {
        tab: this.tab,
        newValues: { isSaved: false }
      })
    }
  }
}
</script>

<style scoped>
.above {
  height: 100%;
  max-height: 100%;
}

.hidden-part {
  display: none;
}

.tab-content-container {
  background-color: var(--color-white);
  border-top: 1px solid var(--color-border-light);
  margin-top: -1px;
}

.bottomPane {
  height: 100%;
  background-color: var(--color-bg-light);
}

.query-results-splitter {
  height: calc(100vh - 104px);
  background-color: var(--color-bg-light);
}
</style>
