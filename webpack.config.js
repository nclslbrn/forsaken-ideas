const webpack = require('webpack')
const path = require('path')
const fs = require('fs')

const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const UglifyJSPlugin = require("uglifyjs-webpack-plugin")

module.exports = (env, argv) => {

    const project = argv._[0]
    const entry = './' + project + '/index.js'
    const ext_libs = require('./' + project + '/ext_libs.json')
    const mode = argv.mode == 'production' ? 'production' : 'development'

    if (mode && project) {

        const config = {
            mode: mode,
            entry: entry,
            output: {
                path: path.resolve(__dirname, 'public/sketch', project),
                filename: '[name]-bundle.js'
            },
            module: {
                rules: [{ // js
                    test: /\.m?js$/,
                    //exclude: /(node_modules|bower_components)/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    }
                }, { // pug
                    test: /\.pug$/,
                    exclude: ['/node_modules/'],
                    loader: 'pug-loader',
                }, { //sasss
                    test: /\.(sa|sc|c)ss$/,
                    use: [{
                            loader: MiniCssExtractPlugin.loader
                        },
                        {
                            loader: "css-loader",
                            options: {
                                url: false,
                                sourceMap: mode == 'production' ? false : true,
                            }
                        },
                        {
                            loader: "postcss-loader",
                            options: {
                                ident: 'postcss',
                                plugins: (loader) => [
                                    require('autoprefixer'),
                                    require('cssnano')
                                ]
                            }
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                implementation: require("sass"),
                                sourceMap: mode == 'production' ? false : true,
                            },
                        }
                    ],
                    include: [
                        path.resolve(__dirname, 'node_modules'),
                        path.resolve(__dirname, './tools'),
                        path.resolve(__dirname, './')
                    ]
                }]
            },

            resolve: {
                extensions: [
                    '.js'
                ]
            },

            devServer: {
                contentBase: path.resolve(__dirname, 'public'),
                port: 8080,
                open: true,
                openPage: '',
                stats: 'errors-only',
            },

            plugins: [
                new HtmlWebpackPlugin({
                    templateParameters: {
                        'project': project,
                        'ext_libs': ext_libs,
                        'srcPath': '../../'
                    },
                    filename: './index.html',
                    template: './src/pug/project.pug',
                    inject: true
                }),
                new MiniCssExtractPlugin({
                    filename: 'css/[name].css'
                }),
                new UglifyJSPlugin({
                    sourceMap: mode == 'production' ? false : true,
                })
                /*
                new CopyWebpackPlugin([{
                    from: path.resolve(__dirname, project, 'assets'),
                    to: path.resolve(__dirname, 'dist', 'assets'),
                }])
                */
            ],
            externals: {
                p5: 'p5',
                three: 'THREE',
                Collide2D: 'p5Collide2D',
                'js-svg': 'p5jsSVG',
                paper: 'paper'
            },
            devtool: mode == "development" ? 'source-map' : ''
        }
        console.log(config.entry)
        return config
    } else {
        console.log('You must specified a project/folder name npm run watch/export -- -- project-name')
        process.exit()
    }
}