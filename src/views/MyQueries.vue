<template>
  <div>
    <div id="my-queries-content">
      <div id="my-queries-toolbar">
        <div id="toolbar-buttons">
          <button class="toolbar">Import</button>
          <button class="toolbar">Export</button>
          <button class="toolbar">Delete</button>
        </div>
        <div id="toolbar-search">
          <input type="text" placeholder="Search query by name"/>
        </div>
      </div>
      <div class="rounded-bg">
      <div class="header-container">
        <div>
          <div class="fixed-header" ref="name-th">
            Name
          </div>
          <div class="fixed-header">
            Created at
          </div>
        </div>
      </div>
      <div
        class="table-container"
        ref="table-container"
      >
        <table ref="table">
          <tbody>
            <tr v-for="(query, index) in queries" :key="query.id" @click="openQuery(index)">
              <td ref="name-td">
                  {{ query.name }}
              </td>
              <td>
                <div class="second-column">
                  <div class="date-container">{{ query.createdAt | date }}</div>
                  <div class="icons-container">
                    <rename-icon />
                    <copy-icon />
                    <export-icon />
                    <delete-icon />
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import RenameIcon from '@/components/svg/rename.vue'
import CopyIcon from '@/components/svg/copy.vue'
import ExportIcon from '@/components/svg/export.vue'
import DeleteIcon from '@/components/svg/delete.vue'

export default {
  name: 'MyQueries',
  components: {
    RenameIcon,
    CopyIcon,
    ExportIcon,
    DeleteIcon
  },
  data () {
    return {
      queries: []
    }
  },
  created () {
    this.queries = JSON.parse(localStorage.getItem('myQueries'))
  },
  mounted () {
    new ResizeObserver(this.calcNameWidth).observe(this.$refs.table)
    this.calcNameWidth()
  },
  filters: {
    date (value) {
      if (!value) {
        return ''
      }
      const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' }
      const timeOptions = {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      }
      return new Date(value).toLocaleDateString('en-GB', dateOptions) + ' ' +
             new Date(value).toLocaleTimeString('en-GB', timeOptions)
    }
  },
  methods: {
    calcNameWidth () {
      this.$refs['name-th'].style = `width: ${this.$refs['name-td'][0].offsetWidth}px`
    },
    openQuery (index) {
      const tab = this.queries[index]
      tab.isUnsaved = false
      this.$store.commit('addTab', tab)
      this.$store.commit('setCurrentTabId', tab.id)
      this.$router.push('/editor')
    }
  }
}
</script>

<style scoped>
#my-queries-content {
  padding: 52px;
}

#my-queries-toolbar {
  display: flex;
  justify-content: space-between;
}

.rounded-bg,
#my-queries-toolbar {
  margin: 0 auto;
  max-width: 1500px;
  width: 100%;
}
table {
  margin-top: 0;
}
tbody tr td {
  overflow: hidden;
  min-width: 0;
  text-overflow: ellipsis;
  padding: 0 24px;
  line-height: 40px;
}

tbody tr td:first-child {
  width: 70%;
  max-width: 0;
}
tbody tr td:last-child {
  width: 30%;
  max-width: 0;
}

tbody tr:hover td {
  cursor: pointer;
}

tbody tr:hover td {
  color: var(--color-text-active);
}

.second-column {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 100%;
}

.icons-container {
  display: none;
}
.date-container {
  flex-shrink: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
tbody tr:hover .icons-container {
  display: block;
}
</style>
