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
    let arffFormat = '';
    let lines = raw.split('\n');
    // let delims = /\[|\]|\t|\s+|\r/;
    let delims = /\,/;

    if (fmt == 'raw') {
      return raw;
    }

    if (fmt == 'arff') {
      let parsedARFF = '';
      var strMap = new Map();
      var counter = 0;
      for (let line of lines) {
        line = line.substring(line.indexOf("=")+1);
        let subString = line.split(',');

        for (let part of subString) {
          let match = false;
          part = part.replace( /\s/g, "");
          for (var value of strMap.values()) {
            if(value == part){
              match = true;
            }
          }
          if(!match){
            // console.log('map has'+counter+part);
            if(part.length > 0){
              strMap.set(counter, part);
              counter++;
            }

          }
        }
      }

      parsedARFF = ',@relation weka\n';
      var size = strMap.size;
      for (let i = 0; i < size; i++) {
        parsedARFF += ',@attribute file'+i+ ' string \n';
        // console.log(strMap.get(i));
      }
      parsedARFF += ',@data\n';
       for (let line of lines) {
         line = line.substring(line.indexOf("=")+1);
         let size = strMap.size;
         for (let i = 0; i < size; i++) {
          //  console.log(i+'and'+size);
           if(line.includes(strMap.get(i))){
               parsedARFF += ','+strMap.get(i);
           }else{
             parsedARFF += ',?';
           }
         }
         parsedARFF += '\n';
       }

       let finalARFF = '';
       let rows = parsedARFF.split('\n');

       for(let row of rows){
         finalARFF += row.substring(1,row.length);
         finalARFF += '\n';
       }


      return finalARFF; // convert boa output in arff format
    }

    for (let line of lines) {
      line = line.replace(' ', '');
      line = line.replace(/\ = /g, ',');
      line = line.replace('[', ',');
      line = line.replace(']', '');
      // console.log(line);
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
    console.log(json);
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
          // reject(`The boa compiler did not produce any output. Cwd: ${child.process.cwd()}, Look: ${__dirname}/../../, Code: ${code}. Signal: ${signal}`);
        }
      });
    });
    return promise;
  }

  ipc.on('boa-run', function(event, url, fmt) {
    fmt = fmt || 'json';
    let instance = im.get(event.sender.getId());
    let local = instance.repos.local;
    let bug = instance.repos.bug;
    let prog = path.join(instance.app.path, url);
    let opts = {
      '-i': prog
    }

    if (local == '') {
      let remote = instance.repos.remote;
      // let s = remote.split('/');
      // let c = `${s[3]},${s[4]},null,null,null`;
      // console.log(c);
      // Temporarily adding a code for username
      opts['-clone'] = 'candoiauser@'+remote;
    } else {
      opts['-repo'] = `"${local}"`;
    }
    opts['-output'] = `"./../"`;
    opts['-bug'] = bug;
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
    let file = path.join(__dirname, '../../.tmp/query.boa');
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
