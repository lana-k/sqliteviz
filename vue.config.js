const { defineConfig } = require('@vue/cli-service')
const CopyPlugin = require('copy-webpack-plugin')
const WorkboxPlugin = require('workbox-webpack-plugin')

module.exports = defineConfig({
  parallel: false,
  transpileDependencies: true,
  publicPath: '',
  // Workaround for https://github.com/vuejs/vue-cli/issues/5399 as described
  // in https://stackoverflow.com/a/63185174
  lintOnSave: process.env.NODE_ENV === 'development',
  configureWebpack: {
    plugins: [
      new CopyPlugin({
        patterns: [
          // This wasm file will be fetched dynamically when we initialize sql.js
          // It is important that we do not change its name,
          // and that it is in the same folder as the js
          { from: 'node_modules/sql.js/dist/sql-wasm.wasm', to: 'js/' },
          { from: 'LICENSE', to: './' }
        ]
      }),
      new WorkboxPlugin.GenerateSW({
        exclude: [/\.map$/, 'LICENSE', 'inquiries.json'],
        clientsClaim: true,
        skipWaiting: false,
        maximumFileSizeToCacheInBytes: 40000000
      })
    ],
    resolve: {
      fallback: {
        asset: require.resolve('assert'),
        stream: require.resolve('stream-browserify')
      }
    }
  },
  chainWebpack: config => {
    config.module
      .rule('images')
      .set('parser', {
        dataUrlCondition: {
          maxSize: 10000
        }
      })

    config.module.rule('js').exclude.add(/worker\.js$/)

    config
      .plugin('html')
      .tap(args => {
        args[0].minify = false
        return args
      })
  }
})
