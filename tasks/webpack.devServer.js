const path = require('path')

module.exports = {
    historyApiFallback: true,
    contentBase: path.resolve(__dirname, '../public/'),
    port: 8080,
    compress: true,
    hot: true
}
