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

  function parseToJSON(raw, fmt) {

    if (fmt == 'raw') {
      return raw;
    }

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

    if (fmt == 'node-arff') {
      return parsed; // convert boa output in arff format
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
            console.log(`[BOA][PARSE] Found duplicate path to different value: ${JSON.stringify(pntr[key])}`);
          }
        }
        pntr = pntr[key];
      }
    }

    return json;
  }

  let run = function run(code, options, name) {
  let jarname = `spmf.jar`;

  // todo sanitize uri so user apps cannot execute random code
  let promise = new Promise(function(resolve, reject) {
  let cmd = `java -jar ${__dirname}/../../../libs/${jarname}`;
  let outputFile = `${__dirname}/../../spmfResults.txt`;
  let filterFile = `${__dirname}/../../wekaFilter.arff`;
  let filterCmd = cmd;
  filterCmd += ' run ' + name;
  filterCmd += ' ' + filterFile;
  filterCmd += ' ' + outputFile;
  filterCmd += ' ' + options;

  let details = code.split('\n');

  //console.log(`[BOA] ${cmd}`);
  jetpack.write(filterFile, code);
  let childFilter = cp.execSync(filterCmd, {cwd: `${__dirname}/../../`}, function(error, stdout, stderr) {
    if (stderr) {
      reject(stderr);
    }
  });

  let child = cp.exec(cmd, {cwd: `${__dirname}/../../`}, function(error, stdout, stderr) {
    if (stderr) {
      reject(stderr);
    }
  });
      child.on('exit', function(code, signal) {
        let raw = jetpack.read(`${__dirname}/../../spmfResults.txt`);
        if (raw) {
          let res = parseToJSON(raw, 'raw');
          // console.log(res);
          resolve(res);
        } else {
          // reject(`The boa compiler did not produce any output. Cwd: ${child.process.cwd()}, Look: ${__dirname}/../../, Code: ${code}. Signal: ${signal}`);
          resolve('Error occured in the program');
        }
      });
    });
    return promise;
  }

  ipc.on('spmf-eclat', function(event, code, options) {
    // console.log(code);
    run(code, options, 'Eclat').then(function(json) {
      event.returnValue = json;
    }).catch(function(e) {
      event.returnValue = {error: e};
      console.log(`[BOA][ERROR] ${e}`);
    });
    // event.returnValue = cmd;
  });

  return { run };
})();
