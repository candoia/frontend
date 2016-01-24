'use strict';

(function() {
  let ipc = require('ipc');

  let Public = {
    'get': function get() {
      return api.ipc.sendSync('instance-get');
    }
  };

  module.exports = Public;
})();
