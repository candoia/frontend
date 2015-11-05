'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var utils = require('./utils');
var argv = require('yargs').argv;
var packager = require('electron-packager');
var Q = require('q');

gulp.task('release', ['build'], function () {
  var deferred = Q.defer();
  var manifest = utils.getAppManifest();

  // gather command line args
  var platform = argv.platform || 'all';
  var overwrite = argv.overwrite || false;
  var arch = argv.arch || 'all';
  var asar = !!(argv.asar) || false;
  var icon = '';

  if (['all', 'linux', 'win32', 'darwin'].indexOf(platform) < 0) {
    var err = 'Invalid value for platform argument. Must be one of: "all", "linux", "win32", or "darwin".';
    gutil.log(err);
    deferred.reject(err);
    return deferred.promise;
  }

  if (['all', 'ia32', 'x64'].indexOf(arch) < 0) {
    var err = 'Invalid value for arch argument. Must be one of: "all", "ia32", or "x64".';
    gutil.log(err);
    deferred.reject(err);
    return deferred.promise;
  }

  if(platform == 'win32') {
    icon = 'resources/windows/icon.ico';
  } else if(platform == 'darwin'){
    icon = 'resources/osx/icon.icns';
  } else if(platform == 'resources/linux'){
    //idk
  }

  var opts = {
    'name': manifest.productName,
    'platform': platform,
    'arch': arch,
    'version': utils.getElectronVersion(),
    'dir': 'build',
    'out': 'releases/v' + manifest.version,
    'asar': asar,
    'overwrite': overwrite,
    'app-version': manifest.version,
    'version-string': {
      'FileDescription': manifest.description,
      'ProductVersion': manifest.version,
      'ProductName': manifest.productName
    },
    'icon': icon
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
