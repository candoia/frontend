/*
 *
 *                             ~ APP-META ~
 *
 * Allows apps to gain access to their package.json in a guarded manner.
 */
'use strict';

const jetpack = require('fs-jetpack');
const fs = require('fs');
const ipc = require('ipc');
const im = require('./instance-manager');

module.exports = (function() {

  let contents = function contents(name) {

    console.log(`GETTING CONTENTS OF ${__dirname}/../../.apps/${name}/package.json`);
    // let json = jetpack.read(`$(path)/package.json`, 'json');
    let json = jetpack.read(`${__dirname}/../../.apps/${name}/package.json`, 'json');
    // let contents = JSON.parse(fs.readFileSync(`${path}/package.json`, {encoding: 'utf8'}));
    console.log(json);
    return json;
  }

  ipc.on('meta-get-package', function(event) {
    let id = event.sender.getId()
    let instance = im.get(id);
    let cnts = contents(instance.app.name);
    event.returnValue = cnts;
  });

  return { contents };
})();
