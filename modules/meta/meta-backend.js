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
const appRoot = './apps/';


let Public = {
  'getPackageContents': function getPackageContents(appName) {
    let contents = JSON.parse(fs.readFileSync(`${appRoot}/${appName}/package.json`, {encoding: 'utf8'}));
    return contents;
  }
}

ipc.on('meta-get-package', function(event) {
  console.log('GET PACKAGE CNTS OF ' + event.sender.getId());
  let id = event.sender.getId()
  let instance = im.get(id);
  let cnts = Public.getPackageContents(instance.app.name);
  console.log(JSON.stringify(cnts, null, '\t'));
  event.returnValue = cnts;
});

module.exports = Public;
