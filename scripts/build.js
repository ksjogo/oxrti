var replace = require('replace'),
    spawnSync = require('child_process').spawnSync,
    replace = require('replace'),
    fs = require('fs'),
    jszip = require('jszip');


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


    let html = fs.readFileSync('./azurestatic/index.html', 'utf-8');
    let js = fs.readFileSync('./dist/bundle.js', 'utf-8');
    html = html.replace('src="azurejs"', 'src="./oxrti.js"');

    let zip = new jszip();
    let folder = zip.folder('oxrti');
    folder.file('oxrti.html', html);
    folder.file('oxrti.js', js);

    zip
    .generateNodeStream({type:'nodebuffer',streamFiles:true})
    .pipe(fs.createWriteStream('./dist/oxrti.zip'))
    .on('finish', function () {
        // JSZip generates a readable stream with a "end" event,
        // but is piped here in a writable stream which emits a "finish" event.
        console.log("out.zip written.");
    });
} catch (e) {
    console.error(e);
}
console.log("finished build!");
