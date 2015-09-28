/*
 *
 *                       ~ ENVIRONMENT DEV  HELPERS ~
 *
 */
'use strict';

let ipc = require('ipc');
let im = require('./instance-manager');

module.exports = (function() {

  let showConsole = function showConsole(id) {
    let v = im.getView(id);
    v.openDevTools();
  }

  let hideConsole = function hideConsole(id) {
    let v = im.getView(id);
    v.closeDevTools();
  }

  let toggleConsole = function toggleConsole(id) {
    let v = im.getView(id);
    v.isDevToolsOpened() ? v.closeDevTools() : v.openDevTools();
  }

  ipc.on('dev-console-show', function(event) {
    let id = event.sender.getId();
    showConsole(id);
    event.returnValue = true;
  });

  ipc.on('dev-console-hide', function(event) {
    let id = event.sender.getId();
    hideConsole(id);
    event.returnValue = true;
  });

  ipc.on('dev-console-toggle', function(event) {
    let id = event.sender.getId();
    toggleConsole(id);
    event.returnValue = true;
  });

  return {
    console : {
      'show': showConsole,
      'hide': hideConsole,
      'toggle': toggleConsole
    }
  }
})();
