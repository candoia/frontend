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
            console.log(`[BOA][PARSE] Found duplicate path to different value: ${JSON.stringify(pntr[key])}`);
          }
        }
        pntr = pntr[key];
      }
    }

    return json;
  }

  let run = function run(opts, fmt) {
    let desired = manifest.boa;
    let jarname = `candoia-core-v${desired}.jar`

    // todo sanitize uri so user apps cannot execute random code
    let promise = new Promise(function(resolve, reject) {
      let cmd = `java -jar "${__dirname}/../../boa/${jarname}"`;
      for (let opt in opts) {
        cmd += ` ${opt} ${opts[opt]}`;
      }
      console.log(`[BOA] ${cmd}`);
      let child = cp.exec(cmd, {cwd: `${__dirname}/../../`}, function(error, stdout, stderr) {
        if (stderr) {
          reject(stderr);
        }
      });
      child.on('exit', function(code, signal) {
        let raw = jetpack.read(`${__dirname}}/../../output.txt`);
        if (raw) {
          let res = parseToJSON(raw, fmt);
          resolve(res);
        } else {
          reject(`The boa compiler did not produce any output. Cwd: ${child.process.cwd()}, Look: ${__dirname}/../../, Code: ${code}. Signal: ${signal}`);
        }
      });
    });
    return promise;
  }

  ipc.on('boa-run', function(event, url, fmt) {
    fmt = fmt || 'json';
    let instance = im.get(event.sender.getId());
    let local = instance.repos.local;

    // let prog = `"${__dirname}/../../.apps/${instance.app.name}/${url}"`;
    let prog = path.join(instance.app.path, url);
    console.log(prog);
    let opts = {
      '-i': prog
    }

    if (local == '') {
      let remote = instance.repos.remote;
      let s = remote.split('/');
      let c = `${s[3]},${s[4]},null,null,null`;
      console.log(c);
      opts['-g'] = c;
    } else {
      opts['-p'] = `"${local}"`;
    }

    run(opts, fmt).then(function(json) {
      event.returnValue = json;
    }).catch(function(e) {
      event.returnValue = {error: e};
      console.log(`[BOA][ERROR] ${e}`);
    });
  });

  ipc.on('boa-exec', function(event, code, fmt) {
    fmt = fmt || 'json';
    let instance = im.get(event.sender.getId());
    let local = instance.repos.local;
    let file = `${__dirname}/../../.tmp/query.boa`;
    jetpack.write(file, code);

    let opts = {
      '-i': `"${file}"`
    }

    if (local == '') {
      let remote = instance.repos.remote;
      let s = remote.split('/');
      let c = `${s[3]},${s[4]},null,null,null`;
      console.log(c);
      opts['-g'] = c;
    } else {
      opts['-p'] = local;
    }

    run(opts, fmt).then(function(json) {
      event.returnValue = json;
    }).catch(function(e) {
      event.returnValue = {error: e};
      console.log(`[BOA][ERROR] ${e}`);
    });
  });

  return { run };
})();
