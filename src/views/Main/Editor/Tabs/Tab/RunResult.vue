<template>
  <div class="run-result-panel">
    <div class="run-result-panel-content">
      <div
        v-show="result === null && !isGettingResults && !error"
        class="table-preview result-before"
      >
        Run your query and get results here
      </div>
      <div v-if="isGettingResults" class="table-preview result-in-progress">
        <loading-indicator :size="30"/>
        Fetching results...
      </div>
      <div
        v-show="result === undefined && !isGettingResults && !error"
        class="table-preview result-empty"
      >
        No rows retrieved according to your query
      </div>
      <logs v-if="error" :messages="[error]"/>
      <sql-table v-if="result" :data-set="result" :time="time" :height="height" />
    </div>
    <side-tool-bar @switchTo="$emit('switchTo', $event)" panel="table"/>
  </div>
</template>

<script>
import Logs from '@/components/Logs'
import SqlTable from '@/components/SqlTable'
import LoadingIndicator from '@/components/LoadingIndicator'
import SideToolBar from './SideToolBar'

export default {
  name: 'RunResult',
  props: ['result', 'isGettingResults', 'error', 'time', 'height'],
  components: {
    SqlTable,
    LoadingIndicator,
    Logs,
    SideToolBar
  }
}
</script>

<style scoped>
.run-result-panel {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.run-result-panel-content {
  position: relative;
  flex-grow: 1;
  padding: 32px;
  height: 100%;
  width: 0;
  box-sizing: border-box;
}

.table-preview {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--color-text-base);
  font-size: 13px;
}

.result-in-progress {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  will-change: opacity;
  /*
    We need to show loader in 1 sec after starting query execution. We can't do that with
    setTimeout because the main thread can be busy by getting a result set from the web worker.
    But we can use CSS animation for opacity. Opacity triggers changes only in the Composite Layer
    stage in rendering waterfall. Hence it can be processed only with Compositor Thread while
    the Main Thread processes a result set.
    https://www.viget.com/articles/animation-performance-101-browser-under-the-hood/
  */
  animation: show-loader 1s linear 0s 1;
}

@keyframes show-loader {
  0% {
    opacity: 0;
  }
  99% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
