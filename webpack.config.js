const webpack = require('webpack')
const path = require('path')
const fs = require('fs')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const UglifyJSPlugin = require("uglifyjs-webpack-plugin")

module.exports = (env, argv) => {

    const project = argv._[0]
    const mode = argv.mode == 'production' ? 'production' : 'development'

    if (mode && project) {

        return {

            mode: mode,
            entry: path.resolve(__dirname, './', project, 'index.js'),
            output: {
                path: path.resolve(__dirname, 'public/', project),
                filename: 'export.js'
            },
            module: {
                rules: [{
                    test: /\.m?js$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    }
                }, {
                    test: require.resolve('p5'),
                    use: {
                        loader: 'expose-loader',
                        options: 'p5'
                    }
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
                    /*template: path.resolve(__dirname, 'client/src', 'index.html'),
                    inject: 'body',*/
                    template: './src/index.html'
                }),
                /*
                new CopyWebpackPlugin([{
                    from: path.resolve(__dirname, project, 'assets'),
                    to: path.resolve(__dirname, 'dist', 'assets'),
                }])
                */
            ],

            optimization: {
                runtimeChunk: "single", // enable "runtime" chunk
                splitChunks: {
                    cacheGroups: {
                        common: {
                            test: /[\\/]node_modules[\\/]/,
                            name: "vendor",
                            chunks: "all"
                        }
                    }
                },
                minimizer: [
                    new UglifyJSPlugin({
                        sourceMap: true // slow down the compilation part but allows us to see the location of errors in modules
                    })
                ]
            },
            devtool: mode == "development" ? 'source-map' : ''
        }
    } else {
        console.log('You must specified a project/folder name npm run watch/export -- -- project-name')
        process.exit()
    }
}