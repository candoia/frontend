/*
 *
 *                          ~ APP-META ~
 *
 * Allows apps to gain access to their package.json in a guarded manner.
 */
'use strict';
const fs = require('fs');
const ipc = require('ipc');
const appRoot = './apps/';


let Public = {
  'getPackageContents': function getPackageContents(appName) {
    let contents = JSON.parse(fs.readFileSync(`${appRoot}/${appName}/package.json`, {encoding: 'utf8'}));
    return contents;
  }
}

ipc.on('meta-get-package-contents', function(event, appName) {
  event.returnValue = Public.getPackageContents(appName);
});

module.exports = Public;
