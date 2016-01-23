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
const jetpack = require('fs-jetpack');
let Q = require('q');

module.exports = (function() {
  let info = function info(name) {
    let deferred = Q.defer();

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
          deferred.resolve(info);
          return;
        } catch (e) {
          deferred.reject('Invalid response from github server', response);
        }
        deferred.reject('Invalid response from github server', response);
      } else {
        deferred.reject('request failed', response);
      }
    });

    return deferred.promise;
  }

  let valid = function valid(contents) {
    return ('name' in contents) &&
      ('version' in contents) &&
      ('icon' in contents) &&
      ('productName' in contents);
  }

  let find = function find(name) {
    var deferred = Q.defer();

    db.appDb.find({ 'name' : name }, function(err, docs) {
      if (err) deferred.reject(err);
      if (docs.length > 0) {
        var doc = docs[0];
        let cnts = jetpack.read(`${process.cwd()}/${doc.location}/package.json`, 'json');
        console.log('found.. ' + name);
        deferred.resolve({
          'name': doc.name,
          'dev': doc.dev,
          'package': cnts
        });
      } else {
        deferred.resolve([]);
      }
    });

    return deferred.promise;
  }

  let all = function all() {
    var deferred = Q.defer();
    db.appDb.find({}, function(err, docs) {
      if (err) deferred.reject(err);
      let response = [];
      for (let doc of docs) {
        let cnts = jetpack.read(`${process.cwd()}/${doc.location}/package.json`, 'json');
        response.push({
          'name': doc.name,
          'dev': doc.dev,
          'package': cnts
        });
      }
      console.log(response);
      deferred.resolve(response);
    });

    return deferred.promise;
  }

  let install = function install(name, version, dev) {
    let deferred = Q.defer();
    dev = dev || false;
    var self = this;
    let options = {
      url: `https://api.github.com/repos/candoia/${name}/zipball/${version}`,
      headers: {
        'User-Agent': 'node-http/3.1.0',
        'Accept-Encoding': 'gzip,deflate,sdch',
        'encoding':'null'
      }
    }

    console.log(`![HTTP REQ] ${options.url}`);

    let out = fs.createWriteStream(`${process.cwd()}/.tmp/tmp.zip`);

    let req = request(options);
    req.pipe(out);
    req.end();
    req.on('end', function() {
      out.on('finish', function() {
        let z = new zip(`${process.cwd()}/.tmp/tmp.zip`);
        var e = z.getEntries();
        let folder = e[0].entryName;
        let target = `.apps/${name}`;
        z.extractEntryTo(folder, target, false, true);
        console.log(`${process.cwd()}/${target}/package.json`);
        let cnt = jetpack.read(`${process.cwd()}/${target}/package.json`, 'json');
        console.log(cnt);
        if (valid(cnt)) {
          let item = {
            'name': cnt.name,
            'dev': false,
            'location': target
          }

          db.appDb.update({ 'name' : item.name }, item, { upsert : true }, function(err, numRep, doc) {
            self.find(item.name).then(function(i) {
              deferred.resolve(i);
            }).catch(function(e) {
              deferred.reject(e);
            });
          });
        } else {
          deferred.reject(`
            The target application has invalid package.json. This is most likely an issue
            that needs to be resolved by the application developer.
          `);
        }
      });
    });

    return deferred.promise;
  }

  let installLocal = function installLocal(location, dev) {
    let deferred = Q.defer();
    dev = dev || false;
    var self = this;
    let cnt = jetpack.read(`${location}/package.json`, 'json');

    if (valid(cnt)) {
      let item = {
        'name': cnt.name,
        'dev': false,
        'location': location
      }

      db.appDb.update({ 'name' : item.name }, item, { upsert : true }, function(err, numRep, doc) {
        deferred.resolve(this.find(item.name));
      });
    } else {
      deferred.reject('The target application has invalid package.json, this is most likely an issue that needs to be resolved by the application developer.');
    }

    return deferred.promise;
  }

  return {
    info,
    valid,
    find,
    all,
    install,
    installLocal
  }

})();
