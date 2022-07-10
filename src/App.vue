<template>
  <div id="app">
    <div v-if="showBanner" id="banner" class="warning">
    <close-icon @click="showBanner = false"/>
      Sqliteviz has got own space on the web,
      <a href="https://sqliteviz.com/" target="_blank">sqliteviz.com</a>!
        New builds will be published there, so we recommend you to switch to the
        <a href="https://sqliteviz.com/app/#" target="_blank">
        new link</a> to not miss new features.
        This
        <a
          href="https://sqliteviz.com/docs/how-to-migrate-to-sqliteviz-dot-com/"
          target="_blank"
        >migration guide</a> will help if you're not sure how to migrate.
    </div>
    <router-view/>
  </div>
</template>

<script>
import CloseIcon from '@/components/svg/close'

export default {
  components: { CloseIcon },
  data () {
    return {
      showBanner: true
    }
  }
}
</script>

<style>
@font-face {
  font-family: "Open Sans";
  src: url("~@/assets/fonts/OpenSans-Regular.woff2");
  font-weight: 400;
  font-style: normal;
}

@font-face {
  font-family: "Open Sans";
  src: url("~@/assets/fonts/OpenSans-SemiBold.woff2");
  font-weight: 600;
  font-style: normal;
}

@font-face {
  font-family: "Open Sans";
  src: url("~@/assets/fonts/OpenSans-Bold.woff2");
  font-weight: 700;
  font-style: normal;
}

@font-face {
  font-family: "Open Sans";
  src: url("~@/assets/fonts/OpenSans-Italic.woff2");
  font-weight: 400;
  font-style: italic;
}

@font-face {
  font-family: "Open Sans";
  src: url("~@/assets/fonts/OpenSans-SemiBoldItalic.woff2");
  font-weight: 600;
  font-style: italic;
}

@font-face {
  font-family: "Open Sans";
  src: url("~@/assets/fonts/OpenSans-BoldItalic.woff2");
  font-weight: 700;
  font-style: italic;
}

#app,
input,
label,
button,
.plotly_editor * {
  font-family: "Open Sans", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
}
.CodeMirror-hints {
  z-index: 999 !important;
}
#banner {
  position: fixed;
  max-width: 500px;
  box-sizing: border-box;
  z-index: 1000;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  padding: 32px;
  border-radius: var(--border-radius-big);
  box-shadow: 0px 2px 9px rgba(80, 103, 132, 0.4);
}
#banner svg {
  padding: 4px;
  position: absolute;
  top: 12px;
  right: 12px;
}
#banner a {
  color: var(--color-text-active);
}
</style>
