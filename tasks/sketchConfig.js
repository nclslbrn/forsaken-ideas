const willMonitorTask = false

const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const defaultPlugins = require('./webpack.plugins')
const getRules = require('./webpack.rules')
const devServer = require('./webpack.devServer')
const externals = require('./webpack.externals')

if (willMonitorTask) {
    // optimize task
    const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
    const smp = new SpeedMeasurePlugin()
}
/**
 * Common webpack configuration for sketch watching & building
 *
 * @typedef {object} property object (property.json)
 */
module.exports = (property) => {
    const sketchConfig = (property) => {
        const config = {
            mode: property.mode,
            entry: [property.entry],
            output: {
                path: property.output,
                filename: '[name].sketch.[chunkhash].js'
            },

            module: {
                rules: getRules(property.mode)
            },
            optimization: {
                minimizer: [new CssMinimizerPlugin()]
            },
            resolve: {
                extensions: ['.js', '.pug', '.json'],
                fallback: {
                    fs: false,
                    assert: false
                }
            },
            externals: externals,
            stats: 'errors-only'
        }

        const plugins = [
            ...defaultPlugins,
            new CleanWebpackPlugin(),
            new HtmlWebpackPlugin({
                templateParameters: {
                    property: property
                },
                filename: './index.html',
                template: './src/pug/project.pug'
            })
        ]

        if (property.getAssetsToCopy) {
            plugins.push(
                new CopyWebpackPlugin({
                    patterns: [
                        {
                            from: path.join(
                                property.input.toString(),
                                'assets'
                            ),
                            to: path.join('./assets/')
                        }
                    ]
                })
            )
        }
        if (property.mode !== 'production') {
            plugins.push(new webpack.HotModuleReplacementPlugin())
            config.devServer = devServer
            config.devtool = 'inline-source-map'
        } else {
            plugins.push(new CleanWebpackPlugin())
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
            if (property.imageCover) {
                plugins.push(
                    new CopyWebpackPlugin({
                        patterns: [
                            {
                                from: path.join(
                                    property.input.toString(),
                                    '/capture.jpg'
                                ),
                                to: path.join('./')
                            }
                        ]
                    })
                )
            }
        }
        if (willMonitorTask) {
            return smp.wrap({ ...config, plugins: plugins })
        } else {
            return { ...config, plugins: plugins }
        }
    }
    return sketchConfig(property)
}
