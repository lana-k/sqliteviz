module.exports = function (config) {
  config.set({
    vite: {
      config: {
        resolve: {
          alias: {
            vue: 'vue/dist/vue.esm-bundler.js'
          }
        },
        server: {
          preTransformRequests: false
        }
      },
      coverage: {
        enable: true,
        include: 'src/*',
        exclude: ['node_modules', 'src/components/svg/*'],
        extension: ['.js', '.vue'],
        requireEnv: false
      }
    },
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'sinon-chai', 'vite'],

    // list of files / patterns to load in the browser
    files: [
      {
        pattern: 'test.setup.js',
        type: 'module',
        watched: false,
        served: false
      },
      {
        pattern: 'tests/**/*.spec.js',
        type: 'module',
        watched: false,
        served: false
      },
      {
        pattern: 'src/assets/styles/*.css',
        type: 'css',
        watched: false,
        served: false
      }
    ],

    plugins: [
      'karma-vite',
      'karma-mocha',
      'karma-sinon-chai',
      'karma-firefox-launcher',
      'karma-chrome-launcher',
      'karma-spec-reporter',
      'karma-coverage'
    ],

    // list of files / patterns to exclude
    exclude: [],

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['spec', 'coverage'],

    coverageReporter: {
      dir: 'coverage',
      reporters: [{ type: 'lcov', subdir: '.' }, { type: 'text-summary' }]
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
      },
      ChromiumHeadlessWebGL: {
        base: 'ChromiumHeadless',
        flags: [
          '--headless=new',
          '--use-angle=swiftshader',
          '--use-gl=angle',
          '--enable-webgl',
          '--ignore-gpu-blocklist',
          '--disable-gpu-sandbox',
          '--no-sandbox'
        ]
      }
    },
    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['ChromiumHeadlessWebGL', 'FirefoxHeadlessTouch'],

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
    }
  })
  // Fix the timezone
  process.env.TZ = 'Europe/Amsterdam'
}
