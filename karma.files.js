import Vue from 'vue'

Vue.config.productionTip = false

// require all test files (files that ends with .spec.js)
const testsContext = require.context('./tests/unit', true, /\.spec.js$/)

// Read more about why we need to call testContext:
// https://www.npmjs.com/package/require-context#context-api
testsContext.keys().forEach(testsContext)

// require all src files except main.js for coverage.
// you can also change this to match only the subset of files that
// you want coverage for.
const srcContext = require.context('./src', true, /^\.\/(?!main(\.js)?$)/)
srcContext.keys().forEach(srcContext)
