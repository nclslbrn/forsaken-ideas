// Node modules
const path = require('path')
const webpack = require('webpack')
const fs = require('fs')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

// Custom modules
const defaultPlugins = require('./webpack.plugins')
const getRules = require('./webpack.rules')
const unescapeTitle = require('./unescapeTitle')
const stripTags = require('./stripTags')
const fileList = require('./fileList')
const publicFolder = path.resolve('public/sketch/')
const property = require('../src/json/site-property.json')
const siteUrl = require('./siteUrl')
const author = require('./author')

module.exports = (env, process) => {
    property.mode = process.mode == 'production' ? 'production' : 'development'
    property.url = siteUrl
    property.imageCover = siteUrl + '/sketch/polar-curve/capture.jpg'
    property.author = author
    property.escapedInfo = property.info ? stripTags(property.info) : undefined
    property.srcPath = './'

    const projects = fileList(publicFolder)
    let projectWithMeta = []

    projects.forEach((proj) => {
        projectWithMeta.push({
            name: proj,
            title: unescapeTitle(proj),
            ...require(path.resolve('sketch/' + proj + '/property.json'))
        })
    })

    const config = {
        mode: property.mode,
        entry: [path.resolve('/src/js/gallery.js')],
        output: {
            path: path.resolve('public/'),
            filename: '[name]-bundle.js'
        },
        plugins: [
            ...defaultPlugins,
            new HtmlWebpackPlugin({
                templateParameters: {
                    projects: projectWithMeta,
                    property: property
                },
                filename: './index.html',
                template: './src/pug/gallery.pug'
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: path.resolve('src/img'),
                        to: path.resolve('public/img')
                    },
                    {
                        from: path.resolve('src/fonts'),
                        to: path.resolve('public/fonts')
                    }
                ]
            })
        ],
        module: {
            rules: getRules(property.mode)
        },
        optimization: {
            minimizer: [new CssMinimizerPlugin()]
        },
        resolve: {
            extensions: ['.js', '.pug', '.json']
        }
        //stats: 'verbose' // errors-only'
    }
    if (property.mode !== 'production') {
        config.plugins.push(new webpack.HotModuleReplacementPlugin())
        config.devServer = {
            historyApiFallback: true,
            contentBase: path.resolve(__dirname, '../public/'),
            port: 8080,
            open: true,
            compress: true,
            hot: true
        }
        config.devtool = 'inline-source-map'
    } else {
        config.optimization = {
            minimize: true,
            minimizer: [new CssMinimizerPlugin(), new TerserPlugin()],
            runtimeChunk: {
                name: 'runtime'
            }
        }
        config.performance = {
            hints: false,
            maxEntrypointSize: 512000,
            maxAssetSize: 512000
        }
    }
    return config
}
