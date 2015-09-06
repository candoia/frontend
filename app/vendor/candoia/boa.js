/*
 *
 *                              ~ BOA WRAPPER ~
 *
 * Execute boa file from javascript and get the results in JSON format. This
 * module exposes one interface (`run`) which will run a script and return a
 * promise. The promise gets resolved with the resulting JSON.
 */
'use strict';

const cp = require('child_process');
const ipc = require('ipc');
const jetpack = require('fs-jetpack');
const im = require('./instance-manager');

module.exports = (function() {

  function parseToJSON(raw, fmt) {
    let json = new Object;
    let parsed = [];
    let lines = raw.split('\n');
    // let delims = /\[|\]|\t|\s+|\r/;
    let delims = /\,/;

    for (let line of lines) {
      line = line.replace(/\ = /g, ',');
      let matches = line.split(delims);
      // var exists = (n) => !!n; not implemented in io.js currently

      // remove empty strings/elements
      matches = matches.filter(function(n) { return !!n; });

      // coerce into strings
      matches = matches.map(function(n) { return "" + n });

      if (matches.length > 0) {
        parsed.push(matches);
      }
    }

    if (fmt == 'lta') {
      return parsed;
    }

    for (let chunk of parsed) {
      let pntr = json;
      let val = chunk.pop();
      for (let i = 0; i < chunk.length; i++) {
        let key = chunk[i];
        if (!(key in pntr)) {
          pntr[key] = i == chunk.length - 1 ? [val] : new Object;
        } else {
          if (i == chunk.length - 1) {
            pntr[key].push(val);
            console.log(`[BOA RESULT] Found duplicate path to different value: ${JSON.stringify(pntr[key])}`);
          }
        }
        pntr = pntr[key];
      }
    }

    return json;
  }

  let run = function run(repo, prog, fmt) {
    // todo sanitize uri so user apps cannot execute random code
    let promise = new Promise(function(resolve, reject) {
      let cmd = `java -jar ${__dirname}/../../boa/boa-compiler.jar -p ${repo} -i ${prog}`;
      console.log(cmd);
      let child = cp.exec(cmd, function(error, stdout, stderr) {
        if (stderr) console.log("[BOA COMPILER ERROR] " + stderr);
      });
      child.on('exit', function(code, signal) {
        let res = parseToJSON(jetpack.read(`${__dirname}/../../../output.txt`), fmt);
        resolve(res);
      });
    });
    return promise;
  }

  ipc.on('boa-run', function(event, url, fmt) {
    fmt = fmt || 'json';
    let instance = im.get(event.sender.getId());
    let repo = instance.repos.local;
    let prog = `${__dirname}/../../.apps/${instance.app.name}/${url}`;//instance.app.path + '/' + url;
    run(repo, prog, fmt).then(function(json) {
      event.returnValue = json;
    });
  });

  return { run };
})();
