var replace = require('replace'),
    spawnSync = require('child_process').spawnSync;

spawnSync('npx', ['-c electron-webpack build --mode "production"'], { stdio: 'inherit' });
replace({
    regex: 'require("source-map-support\/source-map-support.js").install(),',
    replacement: '',
    paths: ['./dist/main/main.js'],
});
spawnSync('npx', ["-c electron-builder -c.mac.identity=null"], { stdio: 'inherit' });