<template>
  <div class="graph-search-panel">
    <IconButton
      icon="myicon myicon-open-search"
      :title="panelOpen ? 'Close search panel' : 'Open search panel'"
      variant="secondary"
      :class="{ 'close-search-panel': panelOpen }"
      data-test="toggle-search-panel-visibility-btn"
      @click="panelOpen = !panelOpen"
    />
    <div v-show="panelOpen" class="graph-search-panel--search-controls">
      <TextField
        v-model.trim="searchQuery"
        width="250px"
        placeholder="Search nodes..."
        :errorMsg="regExpIsValid ? '' : 'Invalid regular expression'"
        showClearButton
        class="query-input"
        @keydown.enter.prevent="search"
        @update:model-value="onSearchInput"
      />
      <IconButton
        icon="myicon myicon-match-case"
        title="Match case"
        :active="matchCase"
        data-test="match-case-btn"
        @click="matchCase = !matchCase"
      />
      <IconButton
        icon="myicon myicon-use-reg-exp"
        title="Use regular expression"
        :active="useRegExp"
        data-test="use-reg-exp-btn"
        @click="useRegExp = !useRegExp"
      />

      <div class="counter">
        <span
          v-if="
            nodesMatchingSearchQuery?.length > 0 && currentFoundNodeIndex === -1
          "
        >
          {{ shortResultCountString }}
        </span>
        <span
          v-if="
            nodesMatchingSearchQuery?.length > 0 && currentFoundNodeIndex !== -1
          "
          >{{ currentFoundNodeIndex + 1 }} of
          {{ nodesMatchingSearchQuery.length }}
        </span>

        <span
          v-show="
            nodesMatchingSearchQuery && nodesMatchingSearchQuery.length === 0
          "
          data-test="no-results-text"
        >
          No results
        </span>
      </div>
      <IconButton
        icon="myicon myicon-arrow"
        title="Previous match"
        :disabled="arrowsDisabled"
        data-test="previous-match-btn"
        @click="toNextFoundNode(-1)"
      />

      <IconButton
        icon="myicon myicon-arrow"
        title="Next match"
        :disabled="arrowsDisabled"
        class="next-match-btn"
        data-test="next-match-btn"
        @click="toNextFoundNode(1)"
      />
    </div>
  </div>
</template>

<script>
import TextField from '@/components/Common/TextField.vue'
import IconButton from '@/components/Common/IconButton.vue'
import time from '@/lib/utils/time'

function getRegExp(query, matchCase) {
  try {
    const regExp = new RegExp(query, !matchCase ? 'i' : '')
    return regExp
  } catch (e) {
    console.error('Invalid regular expression:', e)
    return null
  }
}

export default {
  components: {
    TextField,
    IconButton
  },
  props: ['graph', 'nodesMatchingSearchQuery', 'focusedFoundNodeId'],
  data() {
    return {
      searchQuery: '',
      currentFoundNodeIndex: -1,
      useRegExp: false,
      matchCase: false,
      panelOpen: false
    }
  },
  computed: {
    regExp() {
      return this.useRegExp
        ? getRegExp(this.searchQuery, this.matchCase)
        : new RegExp(
            this.searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
            !this.matchCase ? 'i' : ''
          )
    },
    regExpIsValid() {
      return !this.searchQuery || this.regExp
    },
    arrowsDisabled() {
      return (
        !this.nodesMatchingSearchQuery ||
        this.nodesMatchingSearchQuery.length === 0
      )
    },
    shortResultCountString() {
      const count = this.nodesMatchingSearchQuery?.length ?? 0
      const formattedCount =
        count > 1000
          ? new Intl.NumberFormat('en', {
              notation: 'compact',
              compactDisplay: 'short',
              maximumSignificantDigits: 3
            }).format(count)
          : count

      return `${formattedCount} ${count === 1 ? 'node' : 'nodes'} found`
    }
  },
  watch: {
    focusedFoundNodeId() {
      if (!this.focusedFoundNodeId) {
        this.currentFoundNodeIndex = -1
      }
    },
    useRegExp() {
      this.search()
    },
    matchCase() {
      this.search()
    }
  },
  methods: {
    onSearchInput: time.debounce(function () {
      this.search()
    }, 500),
    search() {
      this.currentFoundNodeIndex = -1
      if (this.regExpIsValid) {
        const foundNodes = this.searchQuery ? this.getFoundNodes() : null
        this.$emit('update:nodesMatchingSearchQuery', foundNodes)
      } else {
        this.$emit('update:nodesMatchingSearchQuery', null)
      }

      this.$emit('update:focusedFoundNodeId', null)
    },
    getFoundNodes() {
      if (!this.graph) {
        return null
      }

      return this.graph.filterNodes((nodeId, nodeData) => {
        return this.regExp.test(nodeData.label)
      })
    },
    toNextFoundNode(direction = 1) {
      this.currentFoundNodeIndex =
        (this.currentFoundNodeIndex +
          direction +
          this.nodesMatchingSearchQuery.length) %
        this.nodesMatchingSearchQuery.length
      const nodeId = this.nodesMatchingSearchQuery[this.currentFoundNodeIndex]
      this.$emit('update:focusedFoundNodeId', nodeId)
    }
  }
}
</script>

<style scoped>
.graph-search-panel {
  position: absolute;
  background-color: var(--color-bg-light);
  padding: 4px;
  border-width: 0px 0px 1px 1px;
  border-style: solid;
  border-color: var(--color-border-light);
  border-radius: 0 0 0 4px;
  display: flex;
}

.graph-search-panel--search-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.next-match-btn :deep(i) {
  transform: rotate(180deg);
}
.close-search-panel :deep(i) {
  transform: scaleX(-1);
}
.query-input :deep(.text-field-container) {
  height: 26px;
}

.counter {
  min-width: 60px;
  font-size: 12px;
  color: var(--color-text-base);
}

.query-input :deep(input.error) {
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}

.query-input :deep(.text-field-error) {
  width: 250px;
  border-width: 0px 1px 1px;
  border-style: solid;
  border-color: var(--color-text-error);
  box-sizing: border-box;
  background-color: var(--color-bg-danger);
  margin-top: 0;
  border-radius: 0 0 4px 4px;
  color: var(--color-danger);
}
</style>
