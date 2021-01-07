const path = require('path')
const webpack = require('webpack')
const fs = require('fs')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
/**
 * Common webpack configuration for sketch watching & building
 *
 * @param {*} project the folder of the sketch
 * @param {*} entry path to index.js of the sketch
 * @param {*} output the path of the output bundle
 * @param {*} title the name of the sketch
 * @param {*} property property object (property.json)
 * @param {*} mode production or development
 */
module.exports = (project, entry, output, title, property, mode) => {
    const sketchConfig = (project, entry, output, title, property, mode) => {
        const HaveToCopyData = fs.existsSync(
            path.join(project.toString(), 'assets')
        )

        const config = {
            mode: mode,
            entry: [entry],
            output: {
                path: output,
                filename: '[name]-bundle.js'
            },

            plugins: [
                new webpack.ProgressPlugin(),
                new ProgressBarPlugin(),
                new CleanWebpackPlugin(),
                new HtmlWebpackPlugin({
                    templateParameters: {
                        project: project,
                        title: title,
                        property: property,
                        srcPath: '../../'
                    },
                    filename: './index.html',
                    template: './src/pug/project.pug'
                }),
                new MiniCssExtractPlugin({
                    filename: 'css/[name].css'
                })
            ],

            module: {
                rules: [
                    {
                        // js
                        test: /\.m?js$/,
                        //exclude: /(node_modules|bower_components)/,
                        use: ['babel-loader']
                    },
                    {
                        // pug
                        test: /\.pug$/,
                        exclude: ['/node_modules/'],
                        loader: 'pug-loader'
                    },
                    {
                        // font
                        test: /\.(woff|ttf|otf|eot|woff2|svg)$/i,
                        loader: 'file-loader'
                    },
                    {
                        // images
                        test: /\.(png|jp(e*)g|svg)$/,
                        use: 'file-loader'
                    },
                    {
                        //sass
                        test: /\.(sa|sc|c)ss$/,
                        use: [
                            'style-loader',
                            {
                                loader: 'css-loader',
                                options: {
                                    url: false,
                                    sourceMap:
                                        mode == 'production' ? false : true
                                }
                            },
                            {
                                loader: 'postcss-loader',
                                options: {
                                    sourceMap:
                                        mode == 'production' ? false : true
                                }
                            },
                            {
                                loader: 'sass-loader',
                                options: {
                                    implementation: require('sass'),
                                    sourceMap:
                                        mode == 'production' ? false : true
                                }
                            },
                            'postcss-loader'
                        ],
                        include: [
                            path.resolve(__dirname, '../node_modules'),
                            path.resolve(__dirname, 'src/sass'),
                            path.resolve(__dirname, '../')
                        ]
                    }
                ]
            },

            resolve: {
                extensions: ['.js', '.pug', '.json']
            },

            externals: {
                p5: 'p5',
                three: 'THREE',
                'p5.Collide2D': 'p5.Collide2D',
                'p5.js-svg': 'p5.jsSVG',
                'p5.dom': 'p5.dom',
                'p5.sound': 'p5.sound',
                'p5.createLoop': 'p5.createLoop',
                gif: 'gif.js',
                svg: '@svgdotjs/svg.js'
            },

            stats: 'errors-only'
        }
        if (HaveToCopyData) {
            config.plugins.push(
                new CopyWebpackPlugin({
                    patterns: [
                        {
                            from: path.join(project.toString(), '/assets/*'),
                            to: path.join('../../')
                        }
                    ]
                })
            )
        }
        if (mode !== 'production') {
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
            config.plugins.push(new CleanWebpackPlugin())
            config.optimization = {
                minimize: true,
                minimizer: [new OptimizeCssAssetsPlugin(), new TerserPlugin()],
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
    return sketchConfig(project, entry, output, title, property, mode)
}
