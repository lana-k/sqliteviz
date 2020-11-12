<template>
  <div>
    <div @click="colVisible = !colVisible" class="table-name">
      <svg
        :style="{transform: colVisible ? 'rotate(90deg)' : 'rotate(0)'}"
        class="chevron-icon"
        width="9"
        height="9"
        viewBox="0 0 8 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0.721924 9.93097L4.85292 5.79997L0.721924 1.66897L1.99992 0.399973L7.39992 5.79997L1.99992 11.2L0.721924 9.93097Z"
          :fill="colVisible ? '#506784' : 'rgba(80, 103, 132, 0.5)'"
        />
      </svg>
      {{ name }}
    </div>
    <div v-show="colVisible" class="columns">
      <div v-for="(col, index) in columns" :key="index" class="column">
        {{ col.name }}
        <span class="column-type">{{ col.type }}</span>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'TableDescription',
  props: ['name', 'columns'],
  data () {
    return {
      colVisible: false
    }
  }
}
</script>

<style scoped>
.table-name, .column {
  margin-top: 11px;
}

.table-name:hover {
  cursor: pointer;
}
.columns {
  margin-left: 24px;
}
.column-type {
  display: inline-block;
  background-color: var(--color-gray-light-4);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-small);
  padding: 2px 6px;
  font-size: 11px;
  text-transform: uppercase;
}
</style>
