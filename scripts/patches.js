var rimrif = require('rimraf'),
    replace = require('replace'),
    fs = require('fs');

console.log("Fixing Webpack HMR");
replace({
    regex: "if (!options.ignoreUnaccepted)",
    replacement: "if (false)",
    paths: ['./node_modules/webpack/lib/HotModuleReplacement.runtime.js'],
});
console.log("Fixing Webpack WS");
replace({
    regex: "  WebSocket = require('ws');",
    replacement: " throw new Error('we cannot use ws, it will annoy webpack');",
    paths: ['./node_modules/socketcluster-client/lib/sctransport.js'],
});
console.log("Fixing MaterialUI Slider");
rimrif.sync("node_modules/@material-ui/lab/Slider/*.d.ts");
console.log("Fixing webpack cli");
//electron webpack needs thats
fs.copyFileSync("./node_modules/webpack-cli/bin/cli.js", "./node_modules/webpack-cli/bin/webpack.js");