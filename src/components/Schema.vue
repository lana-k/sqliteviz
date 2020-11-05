<template>
  <div id="schema-container">
    <div id="schema-filter">
      <text-field placeholder="Search table" width="100%" v-model="filter"/>
    </div>
    <div id="db">
      <div @click="schemaVisible = !schemaVisible" class="db-name">
        <svg
          :style="{ transform: schemaVisible ? 'rotate(90deg)' : 'rotate(0)' }"
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
          <change-db-icon />
        </label>
      </div>
    </div>
    <div v-if="schemaVisible" class="schema">
      <table-description
        v-for="table in schema"
        :key="table[0]"
        :name="table[0]"
        :sql="table[1]"
      />
    </div>
  </div>
</template>

<script>
import TableDescription from '@/components/TableDescription'
import TextField from '@/components/TextField'
import ChangeDbIcon from '@/components/svg/changeDb'

export default {
  name: 'Schema',
  components: {
    TableDescription,
    TextField,
    ChangeDbIcon
  },
  data () {
    return {
      schemaVisible: true,
      filter: null
    }
  },
  computed: {
    schema () {
      if (!this.$store.state.schema) {
        return []
      }

      return !this.filter
        ? this.$store.state.schema
        : this.$store.state.schema.filter(
          table => table[0].toUpperCase().indexOf(this.filter.toUpperCase()) !== -1
        )
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
</style>
