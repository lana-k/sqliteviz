<template>
  <div>
    <table-description
      v-for="(table, index) in schema"
      :key="index"
      :name="table[0]"
      :sql="table[1]"
    />
  </div>
</template>

<script>
import TableDescription from '@/components/TableDescription'

export default {
  name: 'Schema',
  components: { TableDescription },
  props: ['schema']
}
</script>
