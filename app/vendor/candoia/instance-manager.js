/*
 *
 *                          ~ INSTANCE MANAGER ~
 *
 */
'use strict';

const ipc = require('ipc');

module.exports = (function() {
  let data = {};

  let register = function register(id, app, repos) {
    data[id] = { id, app, repos };
  }

  let unregister = function unregister(id) {
    let r = data[id];
    delete data[id];
    return r;
  }

  let get = function get(id) {
    return data[id];
  }

  ipc.on('instance-get', function(event, arg) {
    let id = event.sender.getId();
    event.returnValue = get(id);
  });

  return {
    get : get,
    unregister : unregister,
    register: register
  }
})();
