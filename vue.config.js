const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  parallel: false,
  transpileDependencies: true,
  publicPath: '',
  // Workaround for https://github.com/vuejs/vue-cli/issues/5399 as described
  // in https://stackoverflow.com/a/63185174
  lintOnSave: process.env.NODE_ENV === 'development'
})
