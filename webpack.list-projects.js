const webpack = require('webpack')
const path = require('path')
const fs = require('fs')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const HtmlWebpackPlugin = require('html-webpack-plugin')
const publicFolder = './public/sketch/'

function fileList(dir) {
    return fs.readdirSync(dir).reduce(function(list, file) {
        var name = path.join(dir, file);
        var isDir = fs.statSync(name).isDirectory();
        return list.concat(isDir ? [file] : null);
    }, []);
}

module.exports = (env, argv) => {

    const mode = argv.mode == 'production' ? 'production' : 'development'
    const projects = fileList(publicFolder);

    return {
        mode: mode,
        entry: __dirname + '/src/js/index-list.js',
        output: {
            path: path.resolve(__dirname, 'public/'),
            filename: 'list-bundle.js'
        },
        module: {
            rules: [{
                test: /\.pug$/,
                exclude: ['/node_modules/'],
                loader: 'pug-loader',
            }, {
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
                    path.resolve(__dirname, 'src/sass')
                ]
            }]
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
                    'projects': projects,
                    'srcPath': './'
                },
                filename: './index.html',
                template: './src/pug/projects-list.pug',
                inject: true
            }),
            new MiniCssExtractPlugin({
                filename: 'css/[name].css'
            })
        ],
        devtool: mode == 'production' ? 'nosources-source-map' : 'source-map'
    }
}