var path = require("path"),
    webpack = require("webpack"),
    glob = require("glob");

module.exports = {
    //devtool: "eval-source-map",
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
        /* modules:  [path.join(__dirname, "node_modules")],*/
        extensions: [".ts", ".js", ".json"]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [{
                    loader: "ts-loader",
                    options: {
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
