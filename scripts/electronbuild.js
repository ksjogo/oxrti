var replace = require('replace'),
    spawnSync = require('child_process').spawnSync;

console.log('Compiling app.')
spawnSync('npx', ['-c electron-webpack build --mode "production"'], { stdio: 'inherit' });
console.log('Fixing source-map-support.')
replace({
    regex: /require\("source-map-support\/source-map-support.js"\).install\(\),?/,
    replacement: '',
    paths: ['./dist/main/main.js', './dist/renderer/index.html'],
    silent: false,
});
console.log('Packaging electron.')
spawnSync('npx', ["-c electron-builder -c.mac.identity=null"], { stdio: 'inherit' });
console.log('Finished build.')
