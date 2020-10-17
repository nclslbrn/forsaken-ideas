const path = require('path')
const fs = require('fs')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
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
        const HaveToCopyData = fs.existsSync(
            path.resolve('./sketch/', project, '/data')
        )

        const config = {
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
                        test: /\.(woff|ttf|otf|eot|woff2|svg)$/i,
                        loader: 'file-loader'
                    },
                    {
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
                                    url: false
                                }
                            },
                            {
                                loader: 'sass-loader',
                                options: {
                                    implementation: require('sass'),
                                    sassOptions: {
                                        fiber: require('fibers')
                                    }
                                }
                            },
                            'postcss-loader'
                        ],
                        include: [
                            path.resolve(__dirname, '../node_modules'),
                            path.resolve(__dirname, '../')
                        ]
                    }
                ]
            },
            resolve: {
                extensions: ['.js', '.pug', '.json']
            },

            devServer: {
                contentBase: path.resolve(__dirname, '../public'),
                port: 8080,
                open: true,
                openPage: ''
                //stats: 'errors-only'
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
                new TerserPlugin()
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
            optimization: {
                minimize: true,
                minimizer: [new TerserPlugin()]
            },
            devtool:
                mode == 'development' ? 'source-map' : 'nosources-source-map'
            //stats: 'verbose' //'errors-only'
        }
        if (HaveToCopyData) {
            config.plugins.push(
                new CopyWebpackPlugin({
                    patterns: [
                        {
                            from: path.join(
                                __dirname,
                                '../sketch',
                                project,
                                '/data/*.*'
                            ),
                            to: path.join(
                                __dirname,
                                '../public/sketch/',
                                project,
                                '/data'
                            )
                        }
                    ]
                })
            )
        }
        return config
    }
    return sketchConfig(project, entry, output, title, property, mode)
}
