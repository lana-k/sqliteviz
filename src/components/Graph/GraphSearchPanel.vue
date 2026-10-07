<template>
  <div class="graph-search-panel">
    <IconButton
      icon="myicon myicon-open-search"
      :title="panelOpen ? 'Close search panel' : 'Open search panel'"
      variant="secondary"
      :class="{ 'close-search-panel': panelOpen }"
      @click="panelOpen = !panelOpen"
    />
    <div v-show="panelOpen" class="graph-search-panel--search-controls">
      <TextField
        width="250px"
        placeholder="Search nodes..."
        v-model.trim="searchQuery"
        :errorMsg="regExpIsValid ? '' : 'Invalid regular expression'"
        class="query-input"
        @keydown.enter.prevent="search"
        @update:modelValue="onSearchInput"
      />
      <IconButton
        icon="myicon myicon-match-case"
        title="Match case"
        :active="matchCase"
        @click="matchCase = !matchCase"
      />
      <IconButton
        icon="myicon myicon-use-reg-exp"
        title="Use regular expression"
        :active="useRegExp"
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
          >{{ currentFoundNodeIndex + 1 }} /
          {{ nodesMatchingSearchQuery.length }}
        </span>

        <span
          v-show="
            nodesMatchingSearchQuery && nodesMatchingSearchQuery.length === 0
          "
        >
          No results
        </span>
      </div>
      <IconButton
        icon="myicon myicon-arrow"
        title="Previous match"
        :disabled="arrowsDisabled"
        @click="toNextFoundNode(-1)"
      />

      <IconButton
        icon="myicon myicon-arrow"
        title="Next match"
        :disabled="arrowsDisabled"
        class="next-match-btn"
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
  props: [
    'graph',
    'renderer',
    'nodesMatchingSearchQuery',
    'focusedFoundNodeId'
  ],
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

      return `${formattedCount} nodes found`
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
    },
    nodesMatchingSearchQuery: 'refresh',
    focusedFoundNodeId: 'refresh'
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
      if (this.nodesMatchingSearchQuery.length === 0) {
        return
      }
      this.currentFoundNodeIndex =
        (this.currentFoundNodeIndex +
          direction +
          this.nodesMatchingSearchQuery.length) %
        this.nodesMatchingSearchQuery.length
      const nodeId = this.nodesMatchingSearchQuery[this.currentFoundNodeIndex]
      this.$emit('update:focusedFoundNodeId', nodeId)
      if (this.renderer) {
        this.renderer.refresh({
          skipIndexation: true
        })
      }
      this.moveCameraToNode(nodeId)
    },
    moveCameraToNode(nodeId) {
      if (!this.graph) {
        return
      }
      const nodePosition = this.renderer.getNodeDisplayData(nodeId)
      this.renderer.getCamera().animate(nodePosition, {
        duration: 500
      })
    },
    refresh() {
      if (this.renderer) {
        this.renderer.refresh({
          skipIndexation: true
        })
      }
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
.query-input :deep(input) {
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
