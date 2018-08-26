#!/usr/bin/env node
var jimp = require('jimp'),
    _ = require('lodash'),
    fs = require('fs');
var mkdirp = require('mkdirp');
mkdirp.sync('./tmp')
var args = process.argv.slice(2);
var file1 = args[0]
var file2 = args[1]

jimp.read(file2, function (e, image) {
    jimp.read(file1, function (e, reference) {
        var image_blur = image.clone().blur(2);
        var reference_blur = reference.clone().blur(2);
        image_blur.write("./tmp/image_blur.png");
        reference_blur.write("./tmp/reference_blur.png");

        var rmses = [{
            base: reference,
            changed: image,
            diff: "./tmp/diff.png"
        }, {
            base: reference_blur,
            changed: image_blur,
            diff: "./tmp/diff_blur.png"
        }].map(function (pair) {
            var { base, changed } = pair;
            var diff = base.clone();
            var mse = [0, 0, 0];
            base.scan(0, 0, base.bitmap.width, base.bitmap.height, function (x, y, idx) {
                // x, y is the position of this pixel on the image
                // idx is the position start position of this rgba tuple in the bitmap
                // bitmap offsets R=0,G=1,B=2
                // rgba values run from 0 - 255
                for (var color = 0; color <= 2; ++color) {
                    var difference = base.bitmap.data[idx + color] - changed.bitmap.data[idx + color];
                    mse[color] += difference ** 2;
                    diff.bitmap.data[idx + color] = Math.abs(difference);
                }
            });
            diff.write(pair.diff);
            return mse.map(x => Math.sqrt(x / base.bitmap.width / base.bitmap.height));
        });
        console.log(`
        \\begin{table}[H]
        \\centering
        \\caption{RMSE}
        \\label{rmse}
        \\begin{tabular}{lll} & Unblurred & Blurred \\\\ \\cline{2-3}
\\multicolumn{1}{l|}{RMSE(R)} & ${rmses[0][0]} & ${rmses[1][0]} \\\\
\\multicolumn{1}{l|}{RMSE(G)} & ${rmses[0][1]} & ${rmses[1][1]} \\\\
\\multicolumn{1}{l|}{RMSE(B)} & ${rmses[0][2]} & ${rmses[1][2]} \\\\ \\hline
\\multicolumn{1}{l|}{SUM}         & ${rmses[0][0] + rmses[0][1] + rmses[0][2]} & ${rmses[1][0] + rmses[1][1] + rmses[1][2]}
\\end{tabular}
\\end{table}
        `);
    });
});
