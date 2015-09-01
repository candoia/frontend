/*
 *
 *                          ~ BOA WRAPPER ~
 *
 * Execute boa file from javascript and get the results in JSON format. This
 * module exposes one interface (`run`) which will run a script and return a
 * promise. The promise gets resolved with the resulting JSON.
 */
'use strict';

const cp = require('child_process');
const ipc = require('ipc');
const fs = require('fs');
const im = require('../instance/instance-backend');

function parseToJSON(raw) {
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

  for (let chunk of parsed) {
    let pntr = json;
    let val = chunk.pop();
    for (let i = 0; i < chunk.length; i++) {
      let key = chunk[i];
      if (!(key in pntr)) {
        pntr[key] = i == chunk.length - 1 ? val : new Object;
      }
      pntr = pntr[key];
    }
  }

  return json;
}

let Public = {
  'run' : function run(repo, prog) {
    // todo sanitize uri so user apps cannot execute random code
    let promise = new Promise(function(resolve, reject) {
      let cmd = `java -jar resources/boa/boa-compiler.jar -p ${repo} -i ${prog}`;
      console.log(cmd);
      let child = cp.exec(cmd, function(error, stdout, stderr) {
        console.log("[BOA COMPILER ERROR] " + stderr);
      });
      child.on('exit', function(code, signal) {
        setTimeout(function() {
          let json = parseToJSON(fs.readFileSync(`output.txt`, {encoding: 'utf8'}));
          resolve(json);
        }, 1000);
      });
    });
    return promise;
  }
}

ipc.on('boa-run', function(event, url) {
  let instance = im.get(event.sender.getId());
  let repo = instance.repos.local;
  let prog = instance.app.path + '/' + url;

  Public.run(repo, prog).then(function(json) {
    event.returnValue = json;
  });
});

module.exports = Public;
