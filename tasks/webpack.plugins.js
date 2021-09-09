const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = [
    new MiniCssExtractPlugin({
        filename: 'css/[name].css'
    })
]
