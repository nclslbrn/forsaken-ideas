const willMonitorTask = false

// Node modules
const path = require('path')
const webpack = require('webpack')
const fs = require('fs')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

if (willMonitorTask) {
    // optimize task
    const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
    const smp = new SpeedMeasurePlugin()
}

// Custom modules
const defaultPlugins = require('./webpack.plugins')
const getRules = require('./webpack.rules')
const devServer = require('./webpack.devServer')
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
        entry: path.resolve('/src/js/gallery.js'),
        output: {
            path: path.resolve('public/'),
            filename: '[name].gallery.js'
        },
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
    const plugins = [
        ...defaultPlugins,
        new HtmlWebpackPlugin({
            templateParameters: {
                projects: projectWithMeta,
                property: property
            },
            filename: './index.html',
            template: './src/pug/grid-gallery.pug'
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
    ]
    if (property.mode !== 'production') {
        plugins.push(new webpack.HotModuleReplacementPlugin())
        config.devServer = devServer
        config.devtool = 'inline-source-map'
    } else {
        config.optimization = {
            minimize: true,
            minimizer: [new CssMinimizerPlugin(), new TerserPlugin()],
            runtimeChunk: {
                name: 'runtime'
            }
        }
        /*   config.performance = {
            hints: false,
            maxEntrypointSize: 512000,
            maxAssetSize: 512000
        } */
    }
    if (willMonitorTask) {
        return smp.wrap({ ...config, plugins: plugins })
    } else {
        return { ...config, plugins: plugins }
    }
}
