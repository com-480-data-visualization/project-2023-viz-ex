const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: 'development',
    entry: './src/main.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: "src/data/*",
                    to({ context, absoluteFilename }) {
                        return "data/[name][ext]";
                    }
                },
                { 
                    from: "src/*.css", 
                    to({ context, absoluteFilename }) {
                        return "[name][ext]";
                    } 
                },
            ],
        })
    ],
    devServer: {
        static: {
        directory: path.join(__dirname, 'dist'),
        },
        port: 8000,
    }
};
