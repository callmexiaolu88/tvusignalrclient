const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const HtmlPlugin = require("html-webpack-plugin");

module.exports = {
    entry: path.join(__dirname, "src/main.js"),
    output: {
        filename: "app.js",
        path: path.join(__dirname,"dist")
    },
    module: {
        rules: [
            {
                test: /.vue$/,
                loader: "vue-loader"
            },
            {
                test: /.css$/,
                use: [
                    "style-loader",
                    "css-loader"
                ]
            },

        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new HtmlPlugin()
    ],
    devServer: {
        overlay: true,
        open: true,
        host: '10.12.23.66'
    }
}