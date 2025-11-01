<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import storedInquiries from '@/lib/storedInquiries'

export default {
  computed: {
    inquiries() {
      return this.$store.state.inquiries
    }
  },
  watch: {
    inquiries: {
      deep: true,
      handler() {
        storedInquiries.updateStorage(this.inquiries)
      }
    }
  },
  created() {
    this.$store.commit('setInquiries', storedInquiries.getStoredInquiries())
    addEventListener('storage', event => {
      if (event.key === storedInquiries.myInquiriesKey) {
        this.$store.commit('setInquiries', storedInquiries.getStoredInquiries())
      }
    })
  }
}
</script>

<style>
#app,
.dialog,
input,
label,
button,
.plotly_editor * {
  font-family: 'Open Sans', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
}
.CodeMirror-hints {
  z-index: 999 !important;
}
</style>
