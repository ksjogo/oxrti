var replace = require('replace'),
    spawnSync = require('child_process').spawnSync;
console.log("Setting data");
replace({
    regex: "<title>Oxrti.*<\/title>",
    replacement: "<title>Oxrti - " + (new Date()).toString() + "<\/title>",
    paths: ['./azurestatic/index.html'],
    silent: false,
});
try {
    spawnSync('npx', ["-c webpack --mode 'production'"], { stdio: 'inherit' });
    spawnSync('npx', ["-c webpack --config webpack.functions.js"], { stdio: 'inherit' });
} catch (e) {
    console.error(e);
}
console.log("finished build!");