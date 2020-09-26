<template>
  <div>
    <splitpanes
      class="schema-tabs-splitter"
      :before="{ size: 20, max: 30 }"
      :after="{ size: 80, max: 100 }"
    >
      <div slot="left-pane">
        <schema />
      </div>
      <div slot="right-pane">
        <tab-content />
      </div>
    </splitpanes>
  </div>
</template>

<script>
import Splitpanes from '@/components/splitpanes'
import Schema from '@/components/Schema'
import TabContent from '@/components/TabContent'

export default {
  name: 'Editor',
  components: {
    Schema,
    Splitpanes,
    TabContent
  }
}
</script>

<style>
.schema-tabs-splitter {
  height: 100%;
  margin-left: 6px;
}
</style>
