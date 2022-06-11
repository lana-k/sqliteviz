const CopyPlugin = require('copy-webpack-plugin')
const WorkboxPlugin = require('workbox-webpack-plugin')

module.exports = {
  publicPath: '',
  // Workaround for https://github.com/vuejs/vue-cli/issues/5399 as described
  // in https://stackoverflow.com/a/63185174
  lintOnSave: process.env.NODE_ENV === 'development',
  configureWebpack: {
    plugins: [
      new CopyPlugin([
        // This wasm file will be fetched dynamically when we initialize sql.js
        // It is important that we do not change its name,
        // and that it is in the same folder as the js
        { from: 'node_modules/sql.js/dist/sql-wasm.wasm', to: 'js/' },
        { from: 'LICENSE', to: './' }
      ]),
      new WorkboxPlugin.GenerateSW({
        exclude: [/\.map$/, 'LICENSE', 'inquiries.json'],
        clientsClaim: true,
        skipWaiting: false,
        maximumFileSizeToCacheInBytes: 40000000
      })
    ]
  },
  chainWebpack: config => {
    const svgRule = config.module.rule('svg')
    svgRule.uses.clear()
    svgRule
      .use('url-loader')
      .loader('url-loader')
      .options({
        limit: 10000
      })

    config.module
      .rule('worker')
      .test(/worker\.js$/)
      .use('worker-loader')
      .loader('worker-loader')
      .end()

    config.module.rule('js').exclude.add(/worker\.js$/)

    config
      .plugin('html')
      .tap(args => {
        args[0].minify = false
        return args
      })
  }
}
