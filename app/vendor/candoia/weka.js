/*
 *
 *                              ~ BOA WRAPPER ~
 *
 * Execute boa file from javascript and get the results in JSON format. This
 * module exposes one interface (`run`) which will run a script and return a
 * promise. The promise gets resolved with the resulting JSON.
 */
'use strict';

let cp = require('child_process');
let ipc = require('ipc');
let jetpack = require('fs-jetpack');
let im = require('./instance-manager');
let manifest = jetpack.read(`${__dirname}/../../package.json`, 'json');
let path = require('path');

module.exports = (function() {

  let run = function run(opts, fmt) {
  let jarname = `weka.jar`;
  let filename = `weka.arff`;
  // todo sanitize uri so user apps cannot execute random code
  let promise = new Promise(function(resolve, reject) {
  let cmd = `java -cp ${__dirname}/../../../libs/${jarname}`;
  let arffFile = `${__dirname}/../../../libs/${filename}`;

  cmd += ' ' + opts;
  cmd += ' ' + arffFile;
  console.log(`[BOA] ${cmd}`);
  let child = cp.exec(cmd, {cwd: `${__dirname}/../../`}, function(error, stdout, stderr) {
    if (stderr) {
      reject(stderr);
    }
  });
      child.on('exit', function(code, signal) {
        let raw = jetpack.read(`${__dirname}}/../../output.txt`);
        console.log("Child has exited");
        if (raw) {
          let res = parseToJSON(raw, fmt);
          resolve(res);
        } else {
          // reject(`The boa compiler did not produce any output. Cwd: ${child.process.cwd()}, Look: ${__dirname}/../../, Code: ${code}. Signal: ${signal}`);
        }
      });
    });
    return promise;
  }

  ipc.on('weka-classify', function(event, url, fmt) {

  });

  ipc.on('weka-assocApriory', function(event, code, fmt) {
    let jarname = `weka.jar`;
    let cmd = `java -cp /../../libs/${jarname}`;
    let opts = 'weka.associations.Apriori -N 10 -T 0 -C 0.9 -D 0.05 -U 1.0 -M 0.1 -S -1.0 -c -1 -I -t';
    // cmd += opt;
    run(opts, fmt).then(function(json) {
      event.returnValue = json;
    }).catch(function(e) {
      event.returnValue = {error: e};
      console.log(`[BOA][ERROR] ${e}`);
    });
    // event.returnValue = cmd;
  });

  return { run };
})();
