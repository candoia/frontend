'use strict';

var gulp = require('gulp');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var jetpack = require('fs-jetpack');

var utils = require('./utils');

var projectDir = jetpack;
var srcDir = projectDir.cwd('./app');
var destDir = projectDir.cwd('./build');

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
    './boa/**',
    './.tmp',
    './.tmp/**',
    './**/*.html'
  ],
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
var copyTask = function () {
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
var transpileTask = function () {
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
var sassTask = function () {
  return gulp.src('app/sass/**/*.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(gulp.dest(destDir.path('css')));
};
gulp.task('sass', ['clean'], sassTask);

gulp.task('finalize', ['clean'], function () {
  var manifest = srcDir.read('package.json', 'json');
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

gulp.task('build', ['transpile', 'sass', 'copy', 'finalize']);
