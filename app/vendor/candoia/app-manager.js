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
  let install = function install(appName) {
    let promise = new Promise(function(resolve, reject) {
      let doZipRequest = function(url) {

        let path = url.substring(22, url.length);

        var options = {
          uri: url,
          headers: {
            'User-Agent': 'node-http/3.1.0',
            'Accept-Encoding': 'gzip,deflate,sdch',
            'encoding':'null'
          }
        }

        console.log(`[HTTP REQ] ${JSON.stringify(options, null, '  ')}`);

        let out = fs.createWriteStream(`${__dirname}/../../.tmp/tmp.zip`);

        let req = request(options);
        req.pipe(out);
        req.on('end', function() {
          out.on('finish', function() {
            let z = new zip(`${__dirname}/../../.tmp/tmp.zip`);
            var e = z.getEntries();
            let folder = e[0].entryName;
            console.log(folder);
            let target = `${__dirname}/../../.apps/${appName}`;
            z.extractEntryTo(folder, target, false, true);
            let cnt = meta.contents(appName);
            console.log(cnt);

            let item = {
              'name': cnt.name,
              'entry': cnt.main,
              'dev': false
            }

            db.appDb.insert(item, function(err, newdoc) {
              resolve(newdoc);
            });
          });

        });
      }

      var options = {
        hostname: 'api.github.com',
        path: `/repos/candoia/${appName}/releases/latest`,
        headers: {
          'User-Agent': 'node-http/3.1.0'
        }
      }

      console.log(`[HTTP REQ] ${JSON.stringify(options, null, '  ')}`);

      let cb = function(res) {
        let body = '';

        res.on('data', function(chunk) {
          body += chunk;
        });

        res.on('end', function() {
          let json = JSON.parse(body);
          doZipRequest(json.zipball_url);
        });
      }

      let req = http.request(options, cb);
      req.end();
      req.on('error', function(e) {
        console.log(`[HTTP ERROR] ${e.message}`);
      });

    });
    return promise;
  }

  return {
    install
  }

})();
