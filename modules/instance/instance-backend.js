/*
 *
 *                          ~ INSTANCE MANAGER ~
 *
 */
'use strict';

const ipc = require('ipc');

let Public = {
  'data' : {},
  'other': 'test',
  'register': function register(id, app, repos) {
    this.data[id] = { id, app, repos };
  },
  'unregister': function unregister(id) {
    let r = this.data[id];
    delete this.data[id];
    return r;
  },
  'get': function get(id) {
    return this.data[id];
  }
}

ipc.on('instance-get', function(event, arg) {
  let id = event.sender.getId();
  event.returnValue = Public.get(id);
});

module.exports = Public;
