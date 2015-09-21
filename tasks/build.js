'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var jetpack = require('fs-jetpack');
var fs = require('fs');
var request = require('request');
var ProgressBar = require('progress');

var utils = require('./utils');

var projectDir = jetpack;
var srcDir = projectDir.cwd('./app');
var destDir = projectDir.cwd('./build');
var manifest = srcDir.read('package.json', 'json');

var paths = {
  jsCodeToTranspile: [
    'app/**/*.js',
    '!app/main.js',
    '!app/spec.js',
    '!app/node_modules/**',
    '!app/vendor/**',
    '!app/shared/**'
  ],
  copyFromAppDir: [
    './main.js',
    './spec.js',
    './node_modules/**',
    './vendor/**',
    './fonts/**',
    './.apps',
    './.apps/**',
    './store',
    './shared/**',
    './store/**',
    './.tmp',
    './.tmp/**',
    './**/*.html'
  ]
}

/*
 * Task: clean
 * Removes files in the destination directory (build/)
 */
gulp.task('clean', function(callback) {
  return destDir.dirAsync('.', { empty: true });
});

/*
 * Task: copy
 * Copies files from app directory to build directory
 */
var copyTask = function() {
  return projectDir.copyAsync('app', destDir.path(), {
    overwrite: true,
    matching: paths.copyFromAppDir
  });
};
gulp.task('copy', ['clean'], copyTask);

/*
 * Task: transpile
 * Creates sourcemaps, applies babel for ecma 6 support and writes out to
 * the destination directory
 */
var transpileTask = function() {
  return gulp.src(paths.jsCodeToTranspile)
    .pipe(sourcemaps.init())
    .pipe(babel({ modules: 'amd' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(destDir.path()));
};
gulp.task('transpile', ['clean'], transpileTask);

/*
 * Task: sass
 * Compiles scss to css
 */
var sassTask = function() {
  return gulp.src('app/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(destDir.path('css')));
};
gulp.task('sass', ['clean'], sassTask);

/*
 * Task: getjar
 * Download the boa jar
 */
var getjarTask = function(cb) {
  var desired = manifest.boa;
  var loc = `app/boa/candoia-core-v${desired}.jar`;

  fs.stat(loc, function(err, stat) {
    if(err == null) {
      gutil.log(`Found candoia-core-v${desired}.jar!`);
      gulp.src(loc).pipe(gulp.dest('build/boa/'));
      cb();
    } else {
      gutil.log(`Can't find candoia-core-v${desired}.jar. Downloading...`);
      let options = {
        url: `http://ddmills.com/candy/jar/candoia-core-v${desired}.jar`,
        headers: {
          'User-Agent': 'node-http/3.1.0',
          'encoding':'null'
        }
      }
      let out = fs.createWriteStream(loc);
      let req = request(options);
      req.pipe(out);
      req.on('response', function(res) {
        var len = parseInt(res.headers['content-length'], 10);
        var bar = new ProgressBar('[:bar] :percent (~:etas remaining)', {
          complete: '=',
          incomplete: ' ',
          width: 40,
          total: len
        });
        res.on('data', function(chunk) {
          bar.tick(chunk.length);
        });
        out.on('finish', function() {
          gulp.src(loc).pipe(gulp.dest('build/boa/'));
          cb();
        });
      });
      req.end();
    }
  });
}

gulp.task('getjar', ['clean', 'copy'], getjarTask);

gulp.task('finalize', ['clean'], function() {
  switch (utils.getEnvName()) {
    case 'development':
      // Add "dev" suffix to name, so Electron will write all
      // data like cookies and localStorage into separate place.
      manifest.name += '-dev';
      manifest.productName += ' Dev';
      break;
    case 'test':
      // Add "test" suffix to name, so Electron will write all
      // data like cookies and localStorage into separate place.
      manifest.name += '-test';
      manifest.productName += ' Test';
      // Change the main entry to spec runner.
      manifest.main = 'spec.js';
      break;
  }
  destDir.write('package.json', manifest);

  var configFilePath = projectDir.path('config/env_' + utils.getEnvName() + '.json');
  destDir.copy(configFilePath, 'env_config.json');
});

gulp.task('build', ['transpile', 'sass', 'copy', 'getjar', 'finalize']);
