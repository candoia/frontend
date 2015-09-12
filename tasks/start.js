'use strict';

var Q = require('q');
var electron = require('electron-prebuilt');
var childProcess = require('child_process');
var pathUtil = require('path');
var utils = require('./utils');

var gulpPath = pathUtil.resolve('./node_modules/.bin/gulp');
if (process.platform === 'win32') {
  gulpPath += '.cmd';
}

var runBuild = function() {
  var deferred = Q.defer();

  var build = childProcess.spawn(gulpPath, [
    'build',
    '--env=' + utils.getEnvName(),
    '--color'
  ], {
    stdio: 'inherit'
  });

  build.on('close', function (code) {
    deferred.resolve();
  });

  return deferred.promise;
};

var runApp = function() {
  var app = childProcess.spawn(electron, ['./build'], {
    stdio: 'inherit'
  });
};

runBuild()
.then(function () {
  runApp();
});
