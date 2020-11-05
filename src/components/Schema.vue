<template>
  <div id="schema-container">
    <div id="schema-filter">
      <text-field placeholder="Search table" width="100%"/>
    </div>
    <div id="db">
      <div @click="schemaVisible = !schemaVisible" class="db-name">
        <svg
          :style="{transform: schemaVisible ? 'rotate(90deg)' : 'rotate(0)'}"
          class="chevron-icon"
          width="9"
          height="9"
          viewBox="0 0 8 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0.721924 9.93097L4.85292 5.79997L0.721924 1.66897L1.99992 0.399973L7.39992 5.79997L1.99992 11.2L0.721924 9.93097Z"
            :fill="schemaVisible ? '#506784' : 'rgba(80, 103, 132, 0.5)'"
          />
        </svg>
        {{ dbName }}
      </div>
      <div class="db-edit">
        <input type="file" id="actual-btn"  ref="dbfile" hidden @change="changeDb"/>
        <label for="actual-btn">
          <svg
            class="db-edit-icon"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M3 10.5V12.75C3 14.25 5.2875 15.54 8.25 15.75V13.5825L8.3475 13.5C5.34 13.32 3 12.045 3 10.5ZM9 9.75C5.685 9.75 3 8.4075 3 6.75V9C3 10.6575 5.685 12 9 12C9.2925 12 9.5775 12 9.87 12L12.75 9.09C11.55 9.54 10.2825 9.75 9 9.75ZM9 2.25C5.685 2.25 3 3.5925 3 5.25C3 6.9075 5.685 8.25 9 8.25C12.315 8.25 15 6.9075 15 5.25C15 3.5925 12.315 2.25 9 2.25ZM15.75 8.3475C15.6375 8.3475 15.5325 8.3925 15.4575 8.475L14.7075 9.225L16.245 10.725L16.995 9.975C17.1525 9.825 17.16 9.57 16.995 9.3975L16.065 8.475C15.99 8.3925 15.885 8.3475 15.78 8.3475H15.75ZM14.28 9.66L9.75 14.205V15.75H11.295L15.84 11.1975L14.28 9.66Z"
            fill="#A2B1C6"/>
          </svg>
        </label>
        <span class="db-edit-tooltip">Change database</span>
      </div>
    </div>
    <div v-show="schemaVisible" class="schema">
      <table-description
        v-for="(table, index) in schema"
        :key="index"
        :name="table[0]"
        :sql="table[1]"
      />
    </div>
  </div>
</template>

<script>
import TableDescription from '@/components/TableDescription'
import TextField from '@/components/TextField'

export default {
  name: 'Schema',
  components: { TableDescription, TextField },
  data () {
    return {
      schemaVisible: true
    }
  },
  computed: {
    schema () {
      return this.$store.state.schema
    },
    dbName () {
      return this.$store.state.dbName
    }
  },
  methods: {
    changeDb () {
      this.$db.loadDb(this.$refs.dbfile.files[0])
    }
  }
}
</script>

<style scoped>
#schema-container {
  position: relative;
  padding-bottom: 24px;
}

.schema {
  margin-left: 12px;
  padding: 0 12px;
}
#schema-filter {
  padding: 32px 12px;
  position: sticky;
  position: -webkit-sticky;
  top: 0;
  width: 100%;
  height: 100px;
  box-sizing: border-box;
  background-image: linear-gradient(white 73%, transparent);;
  z-index: 2;
}
.schema, .db-name {
  color: var(--color-text-base);
  font-size: 13px;
  white-space: nowrap;
}
#db {
  display: flex;
  align-items: center;
  margin-top: -5px;
  padding: 0 12px;
}

.db-name {
  cursor: pointer;
}
>>> .chevron-icon {
  -webkit-transition: transform .15s ease-in-out;
  transition: transform .15s ease-in-out;
}
.db-name:hover .chevron-icon path,
>>> .table-name:hover .chevron-icon path {
  fill: #506784;
}

.db-edit {
  position: relative;
}
.db-edit-icon {
  display: block;
}
.db-edit-icon:hover path{
  fill: var(--color-accent);
  cursor: pointer;
}

.db-edit-tooltip {
  visibility: hidden;
  background-color: rgba(80, 103, 132, 0.75);
  color: #fff;
  text-align: center;
  font-size: 11px;
  padding: 0 6px;
  line-height: 19px;;
  position: absolute;
  z-index: 5;
  height: 19px;
  left: 24px;
  top: -12px;
  border-radius: var(--border-radius-medium);
  white-space: nowrap;
}

.db-edit:hover .db-edit-tooltip {
  visibility: visible;
}
</style>
