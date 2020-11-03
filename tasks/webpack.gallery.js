const path = require('path')
const webpack = require('webpack')
const fs = require('fs')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const unescapeTitle = require('./unescapeTitle')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')

const publicFolder = path.resolve('public/sketch/')

function fileList(dir) {
    console.log(dir)
    return fs.readdirSync(dir).reduce(function (list, file) {
        var name = path.join(dir, file)
        var isDir = fs.statSync(name).isDirectory()
        return list.concat(isDir ? [file] : null)
    }, [])
}

module.exports = (env, process) => {
    const mode = process.mode == 'production' ? 'production' : 'development'
    const projects = fileList(publicFolder)
    let projectWithMeta = []

    projects.forEach((proj) => {
        projectWithMeta.push({
            name: proj,
            ...require(path.resolve('sketch/' + proj + '/property.json'))
        })
    })

    const config = {
        mode: mode,
        entry: [path.resolve('/src/js/gallery.js')],
        output: {
            path: path.resolve('public/'),
            filename: '[name]-bundle.js'
        },
        plugins: [
            new webpack.ProgressPlugin(),
            new ProgressBarPlugin(),
            // this one delete all exported sketch
            // new CleanWebpackPlugin(),
            new HtmlWebpackPlugin({
                templateParameters: {
                    projects: projectWithMeta,
                    srcPath: './',
                    unescapeTitle: unescapeTitle
                },
                filename: './index.html',
                template: './src/pug/projects-list.pug'
            }),
            new MiniCssExtractPlugin({
                filename: 'css/[name].css'
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
            rules: [
                {
                    // js
                    test: /\.m?js$/,
                    exclude: /(node_modules|bower_components)/,
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
                                sourceMap: mode == 'production' ? false : true
                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                sourceMap: mode == 'production' ? false : true
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                implementation: require('sass'),
                                sassOptions: {
                                    fiber: require('fibers')
                                },
                                sourceMap: mode == 'production' ? false : true
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

        devtool:
            mode == 'production' ? 'nosources-source-map' : 'inline-source-map'
        //stats: 'verbose' // errors-only'
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
    } else {
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
