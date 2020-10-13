const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
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
        return {
            mode: 'production',
            entry: entry,
            output: {
                path: output,
                filename: '[name]-bundle.js'
            },
            module: {
                rules: [
                    {
                        // js
                        test: /\.m?js$/,
                        //exclude: /(node_modules|bower_components)/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: ['@babel/preset-env']
                            }
                        }
                    },
                    {
                        // pug
                        test: /\.pug$/,
                        exclude: ['/node_modules/'],
                        loader: 'pug-loader'
                    },
                    {
                        //sasss
                        test: /\.(sa|sc|c)ss$/,
                        use: [
                            {
                                loader: MiniCssExtractPlugin.loader
                            },
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
                                    ident: 'postcss',
                                    plugins: (loader) => [
                                        require('autoprefixer'),
                                        require('cssnano')
                                    ]
                                }
                            },
                            {
                                loader: 'sass-loader',
                                options: {
                                    implementation: require('sass'),
                                    sourceMap:
                                        mode == 'production' ? false : true
                                }
                            }
                        ],
                        include: [
                            path.resolve(__dirname, '../node_modules'),
                            path.resolve(__dirname, '../tools'),
                            path.resolve(__dirname, '../')
                        ]
                    }
                ]
            },

            resolve: {
                extensions: ['.js', '.pug', 'json']
            },

            devServer: {
                contentBase: path.resolve(__dirname, '../public'),
                port: 8080,
                open: true,
                openPage: '',
                stats: 'errors-only'
            },

            plugins: [
                new HtmlWebpackPlugin({
                    templateParameters: {
                        project: project,
                        title: title,
                        property: property,
                        srcPath: '../../'
                    },
                    filename: './index.html',
                    template: './src/pug/project.pug',
                    inject: true
                }),
                new MiniCssExtractPlugin({
                    filename: 'css/[name].css'
                }),
                new TerserPlugin(),
                new CopyWebpackPlugin({
                    patterns: [
                        {
                            from: path.join(project, '/data/*'),
                            to: path.join(output, '/data')
                        }
                    ]
                })
            ],
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
            devtool: mode == 'development' ? 'source-map' : '',
            stats: 'errors-only'
        }
    }
    return sketchConfig(project, entry, output, title, property, mode)
}
