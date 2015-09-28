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

module.exports = (function() {

  let contents = function contents(name) {
    return jetpack.read(`${__dirname}/../../.apps/${name}/package.json`, 'json');
  }

  ipc.on('meta-get-package', function(event) {
    let id = event.sender.getId();
    let instance = im.get(id);
    let cnts = contents(instance.app.name);
    event.returnValue = cnts;
  });

  return { contents };
})();
