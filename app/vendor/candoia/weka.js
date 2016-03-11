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

  let run = function run(code, options) {
  let jarname = `weka.jar`;
  let filename = `weka.arff`;
  // todo sanitize uri so user apps cannot execute random code
  let promise = new Promise(function(resolve, reject) {
  let cmd = `java -cp ${__dirname}/../../../libs/${jarname}`;
  let arffFile = `${__dirname}/../../wekaInput.arff`;
  let filterFile = `${__dirname}/../../wekaFilter.arff`;

  let filterCmd = cmd;
  options = 'weka.associations.Apriori ' + options;
  cmd += ' ' + options;
  cmd += ' ' + arffFile;
  cmd += ' ' + '> wekaResults.txt 2>&1';    // redirecting output

  /*
    Get the number of attributes in the arff file
  */
  let attribute = 0;
  let details = code.split('\n');
  for (let part of details) {
      if(part.includes('@attribute ')){
        attribute++;
      }
  }

  let filterOption = ' weka.filters.unsupervised.attribute.StringToNominal -R 1-'+attribute+' -i';
  filterCmd += filterOption;
  filterCmd += ' ' + filterFile + ' -o ';
  filterCmd += arffFile;
  console.log(`[BOA] ${cmd}`);
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
        let raw = jetpack.read(`${__dirname}/../../wekaResults.txt`);
        console.log("Child has exited");
        if (raw) {
          let res = parseToJSON(raw, 'raw');
          console.log(res);
          resolve(res);
        } else {
          // reject(`The boa compiler did not produce any output. Cwd: ${child.process.cwd()}, Look: ${__dirname}/../../, Code: ${code}. Signal: ${signal}`);
          resolve('Error occured in the program');
        }
      });
    });
    return promise;
  }

  ipc.on('weka-classify', function(event, url, fmt) {

  });

  ipc.on('weka-assocApriory', function(event, code, options) {
    console.log(code);
    let jarname = `weka.jar`;
    run(code, options).then(function(json) {
      event.returnValue = json;
    }).catch(function(e) {
      event.returnValue = {error: e};
      console.log(`[BOA][ERROR] ${e}`);
    });
    // event.returnValue = cmd;
  });

  return { run };
})();
