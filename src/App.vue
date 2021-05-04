<template>
  <div id="app">
    <router-view/>
  </div>
</template>

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
</style>
