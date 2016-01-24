/*
 *
 *                              ~ Store Lib ~
 *  Enables apps to store persistant data using simple unique key/value pairs.
 */
'use strict';

let ipc = require('ipc');
let jetpack = require('fs-jetpack');
let im = require('./instance-manager');
let Datastore = require('nedb');
let meta = require('./app-meta');
let path = require('path');


module.exports = (function() {

  let getStore = function (event) {
    let id = event.sender.getId();
    let instance = im.get(id);
    let metaContents = meta.contents(instance.app);
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
      event.returnValue = doc['value'];
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
