const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const WebpackBar = require('webpackbar')

module.exports = [
    new WebpackBar(),
    new MiniCssExtractPlugin({
        filename: 'css/[name].css'
    })
]
