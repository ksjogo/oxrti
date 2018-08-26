var rimrif = require('rimraf'),
    replace = require('replace'),
    fs = require('fs'),
    jsdiff = require('diff');

console.log("Fixing Webpack HMR");
replace({
    regex: /if \(!options.ignoreUnaccepted\)/,
    replacement: "if (false)",
    paths: ['./node_modules/webpack/lib/HotModuleReplacement.runtime.js'],
    silent: false,
});

console.log("Fixing Webpack WS");
replace({
    regex: /  WebSocket = require\('ws'\);/,
    replacement: " throw new Error('we cannot use ws, it will annoy webpack');",
    paths: ['./node_modules/socketcluster-client/lib/sctransport.js'],
    silent: false,
});

console.log("Fixing MaterialUI Slider");
rimrif.sync("node_modules/@material-ui/lab/Slider/*.d.ts");


console.log("Fixing MaterialUI Tooltips")
replace({
    regex: /enterDelay: 0,/,
    replacement: "enterDelay: 200,",
    paths: ['./node_modules/@material-ui/core/Tooltip/Tooltip.js'],
    silent: false,
});

console.log("Fixing gl-react temporary frame buffers")
replace({
    regex: /var silent = false;/,
    replacement: 'var silent = e.message.startsWith("Node#getGLOutput: framebuffer is not defined.");',
    paths: ['./node_modules/gl-react/lib/createSurface.js'],
    silent: false,
});

console.log("Fixing jimp types")


console.log("Fixing webpack cli");
//electron webpack needs thats
fs.copyFileSync("./node_modules/webpack-cli/bin/cli.js", "./node_modules/webpack-cli/bin/webpack.js");

console.log('Fixing classy-mst names')
let classy = fs.readFileSync('./node_modules/classy-mst/dist/classy-mst.js', 'utf-8')
let patch = fs.readFileSync('./scripts/classy-mst.patch', 'utf-8')
let patched = jsdiff.applyPatch(classy, patch)
if (patched)
    fs.writeFileSync('./node_modules/classy-mst/dist/classy-mst.js', patched)

console.log("Fixing jimp types")
let jimp = fs.readFileSync('./node_modules/jimp/jimp.d.ts', 'utf-8')
patch = fs.readFileSync('./scripts/jimp.d.ts.patch', 'utf-8')
patched = jsdiff.applyPatch(jimp, patch)
if (patched)
    fs.writeFileSync('./node_modules/jimp/jimp.d.ts', patched)
