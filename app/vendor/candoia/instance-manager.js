/*
 *
 *                          ~ INSTANCE MANAGER ~
 *
 */
'use strict';

let ipc = require('ipc');
let BrowserWindow;
if (typeof window !== 'object') {
  BrowserWindow = require('browser-window');
}

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

  let getView = function getView(id) {
    console.log(BrowserWindow.getAllWindows()[0].id);
    return BrowserWindow.fromId(id).webContents;
  }

  ipc.on('instance-get', function(event, arg) {
    let id = event.sender.getId();
    event.returnValue = get(id);
  });

  return {
    get : get,
    getView: getView,
    unregister : unregister,
    register: register
  }
})();
