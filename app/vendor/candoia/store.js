/*
 *
 *                              ~ Store Lib ~
 *  Enables apps to store persistant data using simple unique key/value pairs.
 */
'use strict';

var process = require('process');
const ipc = require('ipc');
const jetpack = require('fs-jetpack');
const im = require('./instance-manager');
const Datastore = require('nedb');
const meta = require('./app-meta');


module.exports = (function() {

  let getStore = function (event) {
    let id = event.sender.getId();
    let instance = im.get(id);
    let metaContents = meta.contents(instance.app.name);
    let appname = metaContents.name;
    let fn = `${__dirname}/../../store/apps/${appname}.db`;

    let personalDb = new Datastore({
      filename: fn,
      autoload: true
    });

    return personalDb;
  };

  ipc.on('store-get', function(event, key, opt) {
    let db = getStore(event);
    db.findOne({'key': key}, function (err, doc) {
      //if(err != null) event.returnValue = err;
      event.returnValue = doc;
    });

  });

  ipc.on('store-put', function(event, key, val) {
    let db = getStore(event);

    db.remove({'key': key});
    db.insert({'key': key, 'value': val}, function (err, newDoc) {
      //if(err == null) event.returnValue = err;
      event.returnValue = newDoc;
    });
  });

  return {
    'getStore': getStore
  };

})();
