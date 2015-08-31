/*
 *
 *                          ~ INSTANCE MANAGER ~
 *
 */
'use strict';

const ipc = require('ipc');

let data = {};

let Public = {
  'register': function register(id, app, repos) {
    data[id] = { id, app, repos };
  },
  'unregister': function unregister(id) {
    let r = data[id];
    delete data[id];
    return r;
  },
  'get': function get(id) {
    return data[id];
  }
}

ipc.on('instance-get', function(event, arg) {
  let id = event.sender.getId();
  return Public.get(id);
});

module.exports = Public;
