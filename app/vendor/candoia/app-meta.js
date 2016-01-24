/*
 *
 *                             ~ APP-META ~
 *
 * Allows apps to gain access to their package.json in a guarded manner.
 */
'use strict';

let jetpack = require('fs-jetpack');
let fs = require('fs');
let ipc = require('ipc');
let im = require('./instance-manager');
let path = require('path');

module.exports = (function() {

  let contents = function contents(app) {
    return jetpack.read(path.join(app.path, '/package.json'), 'json');
  }

  ipc.on('meta-get-package', function(event) {
    let id = event.sender.getId();
    let instance = im.get(id);
    let cnts = contents(instance.app);
    event.returnValue = cnts;
  });

  return { contents };
})();
