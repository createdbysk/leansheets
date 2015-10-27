import gulp from 'gulp';
import replace from 'gulp-replace';

import glob from 'glob';
import path from 'path';

import regExcape from '../support/regExcape';
import {paths, entryPoint, APP_NAME} from '../project.conf';

let posix = path.posix;

let replaceTask = (done) => {

    let replacements = {
            [`js/${APP_NAME}.js`]: new RegExp(`js/${entryPoint.js}`),
            [`css/${APP_NAME}.css`]: new RegExp(`sass/${entryPoint.sass}`)
        },

        webpExt = '.webp',
        spaceRegex = / /g,
        spaceRegexReplacement = "(?: |%20)";

    new Promise((resolve) => {

        glob(paths.src.img('**/*.{png,jpeg,jpg,tiff}'), {}, (er, files) => {

            files.forEach((file) => {

                var dir = posix.dirname(posix.relative(paths.src(), file)),
                    ext = posix.extname(file),
                    name = posix.basename(file, ext);

                replacements[posix.join(dir, name + webpExt)] =
                    new RegExp(regExcape(posix.join(dir, name + ext)).replace(spaceRegex, spaceRegexReplacement), 'g');

            });

            resolve(replacements);

        });

    }).then((replacements) => {

        let stream = gulp.src([
            paths.work.html('**/*.html'),
            paths.work.css('**/*.css'),
            paths.work.js('**/*.js')
        ], {
            base: paths.work()
        });

        Object.keys(replacements).forEach((replacement) => {
            let regex = replacements[replacement];
            stream = stream.pipe(replace(regex, replacement));
        });

        stream
            .pipe(gulp.dest(paths.work()))
            .on('finish', done);

    });

};

gulp.task('replace', ['assets', 'bundle'], replaceTask);
gulp.task('replace:dev', ['assets:dev', 'bundle:dev'], replaceTask);
