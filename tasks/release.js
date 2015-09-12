'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var utils = require('./utils');
var packager = require('electron-packager');
var Q = require('q');

gulp.task('release', ['build'], function () {
  var deferred = Q.defer();
  var manifest = utils.getAppManifest();

  var opts = {
    'name': manifest.productName,
    'platform': 'all',
    'arch': 'all',
    'version': utils.getElectronVersion(),
    'dir': 'app',
    'out': 'releases/v' + manifest.version,
    'asar': false,
    'app-version': manifest.version,
    'version-string': {
      'FileDescription': manifest.description,
      'ProductVersion': manifest.version,
      'ProductName': manifest.productName
    }
  }

  packager(opts, function done(err, appPath) {
    if (err) {
      gutil.log(err);
      deferred.reject(err);
    } else {
      deferred.resolve(appPath);
    }
  });


  return deferred.promise;
});
