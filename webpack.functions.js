//This file is compiling the Azure functions which are located on top level
var webpack = require("webpack"),
    glob = require("glob");

module.exports = {
    mode: 'production',
    devtool: false,
    target: "node",
    node: {
        __dirname: true,
    },
    entry: glob.sync("*/index.ts").reduce((acc, value) => {
        console.log(value)
        acc[value.replace(/.ts$/, ".js")] = "./" + value; return acc;
    }, {}),
    output: {
        path: process.cwd(),
        filename: "[name]",
        libraryTarget: "commonjs2"
    },
    resolve: {
        extensions: [".ts", ".js", ".json"]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [{
                    loader: "ts-loader",
                    options: {
                        configFile: 'tsconfig.functions.json',
                        silent: true
                    }
                }]
            }, {
                test: /\.json$/,
                use: ['json-loader']
            }
        ]
    },
    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({ "global.GENTLY": false }),
        new webpack.SourceMapDevToolPlugin({
            filename: '[name].map'
        })
    ]
};
