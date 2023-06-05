<template>
  <div class="tab-content-container" v-show="isActive">
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
        <div :id="'bottom-'+ tab.id" ref="bottomPane" class="bottomPane" />
      </template>
    </splitpanes>

    <div :id="'hidden-'+ tab.id" class="hidden-part" />

    <teleport :to="`#${tab.layout.sqlEditor}-${tab.id}`">
      <sql-editor
        ref="sqlEditor"
        v-model="tab.query"
        :is-getting-results="tab.isGettingResults"
        @switchTo="onSwitchView('sqlEditor', $event)"
        @run="tab.execute()"
      />
    </teleport>

    <teleport :to="`#${tab.layout.table}-${tab.id}`">
      <run-result
        :result="tab.result"
        :is-getting-results="tab.isGettingResults"
        :error="tab.error"
        :time="tab.time"
        @switchTo="onSwitchView('table', $event)"
      />
    </teleport>

    <teleport :to="`#${tab.layout.dataView}-${tab.id}`">
      <data-view
        :data-source="(tab.result && tab.result.values) || null"
        :init-options="tab.viewOptions"
        :init-mode="tab.viewType"
        ref="dataView"
        @switchTo="onSwitchView('dataView', $event)"
        @update="onDataViewUpdate"
      />
    </teleport>
  </div>
</template>

<script>
import Splitpanes from '@/components/Splitpanes'
import SqlEditor from './SqlEditor'
import DataView from './DataView'
import RunResult from './RunResult'

import Teleport from 'vue2-teleport'
import events from '@/lib/utils/events'

export default {
  name: 'Tab',
  props: {
    tab: Object
  },
  components: {
    SqlEditor,
    DataView,
    RunResult,
    Splitpanes,
    Teleport
  },
  data () {
    return {
      topPaneSize: this.tab.maximize
        ? this.tab.layout[this.tab.maximize] === 'above' ? 100 : 0
        : 50
    }
  },
  computed: {
    isActive () {
      return this.tab.id === this.$store.state.currentTabId
    }
  },
  watch: {
    isActive: {
      immediate: true,
      async handler () {
        if (this.isActive) {
          await this.$nextTick()
          this.$refs.sqlEditor.focus()
        }
      }
    },
    'tab.query' () {
      this.$store.commit('updateTab', {
        tab: this.tab,
        newValues: { isSaved: false }
      })
    }
  },
  mounted () {
    this.tab.dataView = this.$refs.dataView
  },
  methods: {
    onSwitchView (from, to) {
      const fromPosition = this.tab.layout[from]
      this.tab.layout[from] = this.tab.layout[to]
      this.tab.layout[to] = fromPosition

      events.send('inquiry.panel', null, { panel: to })
    },
    onDataViewUpdate () {
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
