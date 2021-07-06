const path = require('path')

module.exports = (mode) => {
    return [
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
}
