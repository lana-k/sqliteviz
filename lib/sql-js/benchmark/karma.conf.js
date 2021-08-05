module.exports = function (config) {
  const timeout = 15 * 60 * 1000
  config.set({

    frameworks: ['mocha'],

    files: [
      'suite.js',
      { pattern: 'node_modules/sql.js/dist/sql-wasm.wasm', served: true, included: false },
      { pattern: 'sample.csv', served: true, included: false }
    ],

    reporters: ['progress', 'json-to-file'],

    singleRun: true,

    customLaunchers: {
      ChromiumHeadlessNoSandbox: { base: 'ChromiumHeadless', flags: ['--no-sandbox'] }
    },
    browsers: ['ChromiumHeadlessNoSandbox', 'FirefoxHeadless'],
    concurrency: 1,

    browserDisconnectTimeout: timeout,
    browserNoActivityTimeout: timeout,
    captureTimeout: timeout,
    browserSocketTimeout: timeout,
    pingTimeout: timeout,
    client: {
      captureConsole: true,
      mocha: { timeout: timeout }
    },

    logLevel: config.LOG_INFO,
    browserConsoleLogOptions: { terminal: true, level: config.LOG_INFO },

    preprocessors: { 'suite.js': [ 'webpack' ] },
    webpack: {
      mode: 'development',
      module: {
        noParse: [ __dirname + '/node_modules/benchmark/benchmark.js' ]
      },
      node: { fs: 'empty' }
    },

    proxies: {
      '/sql-wasm.wasm': '/base/node_modules/sql.js/dist/sql-wasm.wasm'
    },

    jsonToFileReporter: { outputPath: '.', fileName: 'suite-result.json' }

  })
}
