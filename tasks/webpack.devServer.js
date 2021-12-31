const path = require('path')

module.exports = {
    static: {
        directory: path.resolve(__dirname, '../public/')
    },
    port: 8080,
    compress: true

    // historyApiFallback: true,
    // contentBase: path.resolve(__dirname, '../public/'),
}
