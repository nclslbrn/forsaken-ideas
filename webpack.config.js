const webpack = require('webpack')
const path = require('path')
const fs = require('fs')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const copyWebpackPlugin = require('copy-webpack-plugin')

module.exports = (env, argv) => {
    const pPath = argv._[0]
    let pName = JSON.parse(JSON.stringify(pPath))
    pName = pName.split('/').pop()
    const entry = pPath + '/index.js'
    const property = require(pPath + '/property.json')
    const mode = argv.mode == 'production' ? 'production' : 'development'
    const unescapeTitle = (title) => {
        const addSpace = title.replace(/-/g, ' ')
        const capitalize = addSpace.charAt(0).toUpperCase() + addSpace.slice(1)
        return capitalize
    }

    console.log(pName)

    if (mode && pPath && pName && entry) {
        const config = {
            mode: mode,
            context: __dirname,
            entry: entry,
            output: {
                path: __dirname + '/public/sketch/' + pName + '/',
                filename: '[name]-bundle.js'
            },
            module: {
                rules: [
                    {
                        // js
                        test: /\.m?js$/,
                        exclude: /(node_modules|bower_components)/,
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
                            path.resolve(__dirname, './node_modules'),
                            path.resolve(__dirname, './tools'),
                            path.resolve(__dirname, './sketch'),
                            path.resolve(__dirname, './src')
                        ]
                    },
                    {
                        // fonts
                        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                        use: [
                            {
                                loader: 'file-loader',
                                options: {
                                    name: './fonts/[name].[ext]',
                                    mimetype: 'application/font-woff',
                                    publicPath: '../'
                                }
                            }
                        ]
                    }
                ]
            },
            resolve: {
                extensions: ['.js', '.pug', 'json']
            },

            devServer: {
                contentBase: path.resolve(__dirname, 'public'),
                port: 8080,
                open: true,
                openPage: '',
                stats: 'errors-only'
            },

            plugins: [
                new HtmlWebpackPlugin({
                    templateParameters: {
                        project: pName,
                        title: unescapeTitle(pName),
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
                new copyWebpackPlugin({
                    patterns: [
                        {
                            from: 'node_modules/gif.js/dist/gif.js',
                            to: '../../libs/gif.js',
                            force: true
                        },
                        {
                            from: 'node_modules/gif.js/dist/gif.worker.js',
                            to: '../../libs/gif.worker.js',
                            force: true
                        },
                        {
                            from: 'node_modules/p5/lib/p5.min.js',
                            to: '../../libs/p5.min.js',
                            force: true
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
                ccapture: 'ccapture.js',
                gif: 'gif.js',
                svg: '@svgdotjs/svg.js'
            },
            devtool: mode == 'development' ? 'source-map' : ''
        }
        console.log(
            'Bundleling from ' +
                config.entry +
                ' to ' +
                config.output.path +
                config.output.filename
        )
        return config
    } else {
        console.log(
            'You must specified a project/folder name npm run watch/export <project-name>'
        )
        process.exit()
    }
}
