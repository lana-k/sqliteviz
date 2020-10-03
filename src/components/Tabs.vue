<template>
   <div>
    <div id="tabs__header">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        @click="selectTab(tab.id)"
        :class='{"tab__selected": (tab.id === selectedIndex)}'
      >
        {{ tab.name }}
      </div>
    </div>
    <tab-content
      v-for="tab in tabs"
      :key="tab.id"
      :is-active="tab.isActive"
      :name="tab.name"
    />
  </div>
</template>

<script>
import TabContent from '@/components/TabContent'

export default {
  components: {
    TabContent
  },
  data () {
    return {
      selectedIndex: 0,
      tabs: [
        { id: 1, name: 'New query', isActive: true },
        { id: 2, name: 'New query 2', isActive: false }
      ]
    }
  },
  methods: {
    selectTab (id) {
      this.selectedIndex = id
      this.tabs.forEach(tab => {
        tab.isActive = (tab.id === id)
      })
    }
  }
}
</script>

<style>
#tabs__header {
  display: flex;
  margin: 0;
}
#tabs__header div {
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
}
#tabs__header div:hover {
  cursor: pointer;
}

#tabs__header .tab__selected {
  color: var(--color-text-active);
  font-weight: 600;
  border-bottom: none;
}
#tabs__header .tab__selected:hover {
    cursor: default;
}
#tabs__header .tab__selected:before {
  content: '';
  position: absolute;
  width: 100%;
  height: 5px;
  background-color: var(--color-accent);
  top: 0;
  left: 0;
}
</style>
