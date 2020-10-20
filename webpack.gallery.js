const path = require('path')
const fs = require('fs')
const unescapeTitle = require('./webpack/unescapeTitle')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const publicFolder = './public/sketch/'

function fileList(dir) {
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
            ...require(__dirname + '/sketch/' + proj + '/property.json')
        })
    })

    console.log(mode)
    return {
        mode: mode,
        entry: __dirname + '/src/js/gallery.js',
        output: {
            path: path.resolve(__dirname, 'public/'),
            filename: 'list-bundle.js'
        },
        module: {
            rules: [
                {
                    test: /\.pug$/,
                    exclude: ['/node_modules/'],
                    loader: 'pug-loader'
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
                    projects: projectWithMeta,
                    srcPath: './',
                    unescapeTitle: unescapeTitle
                },
                filename: './index.html',
                template: './src/pug/projects-list.pug',
                inject: true
            }),
            new MiniCssExtractPlugin({
                filename: 'css/[name].css'
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: path.resolve(__dirname, 'src/img'),
                        to: path.resolve(__dirname, 'public/img')
                    },
                    {
                        from: path.resolve(__dirname, 'src/fonts'),
                        to: path.resolve(__dirname, 'public/fonts')
                    }
                ]
            }),
            new TerserPlugin()
        ],
        devtool: mode == 'production' ? 'nosources-source-map' : 'source-map'
        //stats: 'verbose' // errors-only'
    }
}
