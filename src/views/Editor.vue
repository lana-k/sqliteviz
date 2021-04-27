<template>
  <div>
    <splitpanes
      class="schema-tabs-splitter"
      :before="{ size: 20, max: 30 }"
      :after="{ size: 80, max: 100 }"
    >
      <template #left-pane>
        <schema v-if="$store.state.schema"/>
        <div v-else id="empty-schema-container">
          <div class="warning">
            Database is not loaded. Queries can’t be run without database.
          </div>
          <db-uploader id="db-uploader" width="100%"/>
        </div>
      </template>
      <template #right-pane>
        <tabs />
      </template>
    </splitpanes>
  </div>
</template>

<script>
import Splitpanes from '@/components/Splitpanes'
import Schema from '@/components/Schema'
import Tabs from '@/components/Tabs'
import DbUploader from '@/components/DbUploader'

export default {
  name: 'Editor',
  components: {
    Schema,
    Splitpanes,
    Tabs,
    DbUploader
  }
}
</script>

<style scoped>
.schema-tabs-splitter {
  height: 100%;
  background-color: var(--color-white);
}
#empty-schema-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 200px;
  height: 100%;
}

#db-uploader {
  flex-grow: 1;
  padding: 24px;
  width: 100%;
  box-sizing: border-box;
}

.warning {
  padding: 12px 24px;
  width: 100%;
  box-sizing: border-box;
}

>>>.drop-area {
  padding: 0 15px;
}

>>>.drop-area .text {
  max-width: 200px;
}
</style>
