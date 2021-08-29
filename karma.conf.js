// Karma configuration
'use strict'
const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

function resolve (dir) {
  return path.join(__dirname, dir)
}

module.exports = function (config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'sinon-chai'],

    // list of files / patterns to load in the browser
    files: [
      './karma.files.js',
      {
        pattern: 'node_modules/sql.js/dist/sql-wasm.wasm',
        watched: false,
        included: false,
        served: true,
        nocache: false
      }
    ],

    // list of files / patterns to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      './karma.files.js': ['webpack']
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['spec', 'coverage'],

    coverageReporter: {
      dir: 'coverage',
      reporters: [{ type: 'lcov', subdir: '.' }, { type: 'text-summary' }]
    },

    // !!DONOT delete this reporter, or vue-cli-addon-ui-karma doesnot work
    jsonResultReporter: {
      outputFile: 'report/karma-result.json',
      isSynchronous: true
    },

    junitReporter: {
      outputDir: 'report', // results will be saved as $outputDir/$browserName.xml
      // if included, results will be saved as $outputDir/$browserName/$outputFile
      outputFile: undefined,
      suite: '', // suite will become the package name attribute in xml testsuite element
      useBrowserName: true, // add browser name to report and classes names
      // function (browser, result) to customize the name attribute in xml testcase element
      nameFormatter: undefined,
      // function (browser, result) to customize the classname attribute in xml testcase element
      classNameFormatter: undefined,
      properties: {} // key value pairs add to the <properties> section of the report
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN ||
    // config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    customLaunchers: {
      FirefoxHeadlessTouch: {
        base: 'FirefoxHeadless',
        prefs: {
          'dom.w3c_touch_events.enabled': 1,
          'dom.events.asyncClipboard.clipboardItem': true
        }
      }
    },
    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['ChromiumHeadless', 'FirefoxHeadlessTouch'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: 2,

    client: {
      captureConsole: true,
      mocha: {
        timeout: 7000
      }
    },
    browserConsoleLogOptions: {
      terminal: true,
      level: ''
    },
    webpack: {
      mode: 'development',
      entry: './src/main.js',
      resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
          vue$: 'vue/dist/vue.esm.js',
          '@': resolve('src')
        }
      },
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            use: [
              {
                loader: 'babel-loader'
              }
            ]
          },
          {
            test: /\.js$/,
            include: /src/,
            exclude: /(node_modules|bower_components|\.spec\.js$)/,
            use: [
              {
                loader: 'istanbul-instrumenter-loader',
                options: {
                  esModules: true
                }
              }
            ]
          },
          {
            test: /worker\.js$/,
            loader: 'worker-loader'
          },
          {
            test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
            loader: 'url-loader'
          },
          {
            test: /\.vue$/,
            loader: 'vue-loader',
            options: {
              loaders: {
                js: 'babel-loader'
              },
              postLoaders: {
                js: 'istanbul-instrumenter-loader?esModules=true'
              }
            }
          },
          {
            test: /\.css$/,
            use: ['vue-style-loader', 'css-loader']
          },
          {
            test: /\.scss$/,
            use: ['vue-style-loader', 'css-loader', 'sass-loader']
          },
          {
            test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: resolve('fonts/[name].[hash:7].[ext]')
            }
          }
        ]
      },
      plugins: [new VueLoaderPlugin()],
      node: {
        fs: 'empty'
      }
    },
    webpackMiddleware: {
      watchOptions: {
        ignored: /node_modules/
      }
    },
    proxies: {
      '/_karma_webpack_/sql-wasm.wasm': '/base/node_modules/sql.js/dist/sql-wasm.wasm',
      '/base/sql-wasm.wasm': '/base/node_modules/sql.js/dist/sql-wasm.wasm'
    }
  })
  // Fix the timezone
  process.env.TZ = 'Europe/Amsterdam'
}
