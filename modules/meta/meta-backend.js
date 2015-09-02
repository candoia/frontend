/*
 *
 *                          ~ APP-META ~
 *
 * Allows apps to gain access to their package.json in a guarded manner.
 */
'use strict';
const fs = require('fs');
const ipc = require('ipc');
const im = require('../instance/instance-backend');

let Public = {
  'getPackageContents': function getPackageContents(path) {
    return JSON.parse(fs.readFileSync(`${path}/package.json`, {encoding: 'utf8'}));
  }
}

ipc.on('meta-get-package', function(event) {
  let id = event.sender.getId()
  let instance = im.get(id);
  let cnts = Public.getPackageContents(instance.app.path);
  event.returnValue = cnts;
});

module.exports = Public;
