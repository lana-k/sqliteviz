const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    configureWebpack: {
        plugins: [
            new CopyPlugin([
                // This wasm file will be fetched dynamically when we initialize sql.js
                // It is important that we do not change its name, and that it is in the same folder as the js
                { from: 'node_modules/sql.js/dist/sql-wasm.wasm', to: 'js/' },
                { from: 'node_modules/sql.js/dist/worker.sql-wasm.js', to: 'js/' },
            ])
        ]
      }
}
