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
    this.other = 'if you see this, it workz!!!!!';
    this.data[id] = { id, app, repos };
    console.log("STORED " + id);
  },
  'unregister': function unregister(id) {
    let r = this.data[id];
    delete this.data[id];
    return r;
  },
  'get': function get(id) {
    console.log("RETRIEVE " + id);
    return data[id];
  }
}

ipc.on('instance-get', function(event, arg) {
  console.log('DO SOMETHING');
  let id = event.sender.getId();
  console.log("RECIEVED GET FROM: " + id);
  console.log(JSON.stringify(Public.other));
  event.returnValue = 6;//Public.get(id);
});

module.exports = Public;
