const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const defaultPlugins = require('./webpack.plugins')
const getRules = require('./webpack.rules')
const externals = require('./webpack.externals')
const unescapeTitle = require('./unescapeTitle')
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
                filename: '[name]-bundle.js'
            },
            plugins: [
                ...defaultPlugins,
                new CleanWebpackPlugin(),
                new HtmlWebpackPlugin({
                    templateParameters: {
                        property: property
                    },
                    filename: './index.html',
                    template: './src/pug/project.pug'
                })
            ],
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

        if (property.getAssetsToCoppy) {
            config.plugins.push(
                new CopyWebpackPlugin({
                    patterns: [
                        {
                            from: path.join(
                                property.input.toString(),
                                '/assets/*'
                            ),
                            to: path.join('../../')
                        }
                    ]
                })
            )
        }
        if (property.mode !== 'production') {
            config.plugins.push(new webpack.HotModuleReplacementPlugin())
            config.devServer = {
                historyApiFallback: true,
                contentBase: path.resolve(__dirname, '../public/'),
                port: 8080,
                compress: true,
                hot: true
            }
            config.devtool = 'inline-source-map'
        } else {
            config.plugins.push(new CleanWebpackPlugin())
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
                config.plugins.push(
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
        return config
    }
    return sketchConfig(property)
}
