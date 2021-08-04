import Vue from 'vue'
import { VuePlugin } from 'vuera'
import VModal from 'vue-js-modal'

Vue.use(VuePlugin)
Vue.use(VModal)
Vue.config.productionTip = false

// require all test files (files that ends with .spec.js)
const testsContext = require.context('./tests', true, /\.spec.js$/)

// Read more about why we need to call testContext:
// https://www.npmjs.com/package/require-context#context-api
testsContext.keys().forEach(testsContext)

// require all src files except main.js and router/index.js for coverage.
// you can also change this to match only the subset of files that
// you want coverage for.
// We don't include router/index.js to avoid installing VueRouter globally in tests
const srcContext = require.context('./src', true, /^\.\/(?!(main|(router(\/)?(index)?))(\.js)?$)/)
srcContext.keys().forEach(srcContext)
