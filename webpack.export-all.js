const webpack = require("webpack")
const path = require("path")
const fs = require("fs")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const UglifyJSPlugin = require("uglifyjs-webpack-plugin")
const publicFolder = "./public/sketch/"

const commonsConfig = (project, entry, title, property) => {
    return {
        mode: "production",
        entry: entry,
        output: {
            path: path.resolve(__dirname, "public/sketch", project),
            filename: "[name]-bundle.js"
        },
        module: {
            rules: [
                {
                    // js
                    test: /\.m?js$/,
                    //exclude: /(node_modules|bower_components)/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-env"]
                        }
                    }
                },
                {
                    // pug
                    test: /\.pug$/,
                    exclude: ["/node_modules/"],
                    loader: "pug-loader"
                },
                {
                    //sasss
                    test: /\.(sa|sc|c)ss$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader
                        },
                        {
                            loader: "css-loader",
                            options: {
                                url: false,
                                sourceMap: false
                            }
                        },
                        {
                            loader: "postcss-loader",
                            options: {
                                ident: "postcss",
                                plugins: loader => [
                                    require("autoprefixer"),
                                    require("cssnano")
                                ]
                            }
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                implementation: require("sass"),
                                sourceMap: false
                            }
                        }
                    ],
                    include: [
                        path.resolve(__dirname, "node_modules"),
                        path.resolve(__dirname, "./tools"),
                        path.resolve(__dirname, "./")
                    ]
                }
            ]
        },

        resolve: {
            extensions: [".js", ".pug", "json"]
        },

        devServer: {
            contentBase: path.resolve(__dirname, "public"),
            port: 8080,
            open: true,
            openPage: "",
            stats: "errors-only"
        },

        plugins: [
            new HtmlWebpackPlugin({
                templateParameters: {
                    project: project,
                    title: title,
                    property: property,
                    srcPath: "../../"
                },
                filename: "./index.html",
                template: "./src/pug/project.pug",
                inject: true
            }),
            new MiniCssExtractPlugin({
                filename: "css/[name].css"
            }),
            new UglifyJSPlugin({
                sourceMap: false
            })
            /*
            new CopyWebpackPlugin([{
                from: path.resolve(__dirname, project, 'assets'),
                to: path.resolve(__dirname, 'dist', 'assets'),
            }])
            */
        ],
        externals: {
            p5: "p5",
            three: "THREE",
            "p5.Collide2D": "p5.Collide2D",
            "p5.js-svg": "p5.jsSVG",
            "p5.dom": "p5.dom",
            "p5.sound": "p5.sound",
            svg: "@svgdotjs/svg.js"
        },
        devtool: ""
    }
}

function fileList(dir) {
    return fs.readdirSync(dir).reduce(function(projects, file) {
        let name = path.join(dir, file)
        let isDir = fs.statSync(name).isDirectory()
        const excludeDir = [
            ".git",
            ".vscode",
            "node_modules",
            "public",
            "src",
            "tools"
        ]
        if (isDir && !excludeDir.includes(name)) {
            projects.push(file)
        }
        return projects
    }, [])
}
const unescapeTitle = title => {
    const addSpace = title.replace(/-/g, " ")
    const capitalize = addSpace.charAt(0).toUpperCase() + addSpace.slice(1)
    return capitalize
}

const projects = fileList("./")
const projectsConfig = []

for (let p = 0; p < projects.length; p++) {
    const entry = "./" + projects[p] + "/index.js"
    const property = require("./" + projects[p] + "/property.json")
    const title = unescapeTitle(projects[p])
    projectsConfig[p] = commonsConfig(projects[p], entry, title, property)
}
module.exports = projectsConfig
