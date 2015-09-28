'use strict';

(function() {
  const ipc = require('ipc');

  let Public = {
    'console': {
      'show': function showConsole() {
        return api.ipc.sendSync('dev-console-show');
      },
      'hide': function hideConsole() {
        return api.ipc.sendSync('dev-console-hide');
      },
      'toggle': function toggleConsole() {
        return api.ipc.sendSync('dev-console-toggle');
      }
    }
  };

  module.exports = Public;
})();
