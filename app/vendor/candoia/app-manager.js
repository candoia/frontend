/*
 *
 *                                ~ APP MANAGER ~
 *
 * Download and install apps
 */
'use strict';

const http = require('https');
const fs = require('fs');
const request = require('request');
const zip = require('adm-zip');
const meta = require('./app-meta');
const db = require('./datastore');

module.exports = (function() {
  let info = function info(name) {
    return new Promise(function(resolve, reject) {
      let options = {
        url: `https://api.github.com/repos/candoia/${name}/releases`,
        headers: {
          'User-Agent': 'node-http/3.1.0'
        }
      }

      console.log(`![HTTP REQ] ${options.url}`);

      request.get(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          try {
            let info = JSON.parse(body);
            resolve(info);
            return;
          } catch (e) {
            reject('Invalid response from github server', response);
          }
          reject('Invalid response from github server', response);
        } else {
          reject('request failed', response);
        }
      });
    });
  }

  let valid = function valid(contents) {
    return ('name' in contents) &&
      ('version' in contents) &&
      ('icon' in contents) &&
      ('productName' in contents);
  }

  let local = function local(name) {
    return new Promise(function(resolve, reject) {
      db.appDb.find({ 'name' : name }, function(err, docs) {
        resolve(docs);
      });
    });
  }

  let install = function install(name, version, dev) {
    dev = dev || false;
    return new Promise(function(resolve, reject) {
      let options = {
        url: `https://api.github.com/repos/candoia/${name}/zipball/${version}`,
        headers: {
          'User-Agent': 'node-http/3.1.0',
          'Accept-Encoding': 'gzip,deflate,sdch',
          'encoding':'null'
        }
      }

      console.log(`![HTTP REQ] ${options.url}`);

      let out = fs.createWriteStream(`${__dirname}/../../.tmp/tmp.zip`);

      let req = request(options);
      req.pipe(out);
      req.end();
      req.on('end', function() {
        out.on('finish', function() {
          let z = new zip(`${__dirname}/../../.tmp/tmp.zip`);
          var e = z.getEntries();
          let folder = e[0].entryName;
          let target = `${__dirname}/../../.apps/${name}`;
          z.extractEntryTo(folder, target, false, true);

          let cnt = meta.contents(name);

          if (valid(cnt)) {
            let item = {
              'name': cnt.name,
              'dev': false,
              'package': cnt
            }

            db.appDb.update({ 'name' : item.name }, item, { upsert : true }, function(err, numRep, doc) {
              resolve(doc);
            });
          } else {
            reject('The target application has invalid package.json, this is most likely an issue that needs to be resolved by the application developer.');
          }
        });
      });
    });
  }

  return {
    info,
    valid,
    local,
    install
  }

})();
