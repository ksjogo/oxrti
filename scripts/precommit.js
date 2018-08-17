#!/usr/bin/env node
var spawnSync = require('child_process').spawnSync;
try {
    console.log("Building!");
    spawnSync('node', ["scripts/build.js"], { stdio: 'inherit' });
    console.log("Git Adding!");
    spawnSync('git', ["add", "-f", "azurestatic", "azurejs", "dist/bundle.js", "dist/oxrti.zip"], { stdio: 'inherit' });
} catch (e) {
    console.error(e);
}
console.log("finished build!");