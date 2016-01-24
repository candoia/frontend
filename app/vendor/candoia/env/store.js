'use strict';

(function() {
  let ipc = require('ipc');

  let Public = {
    'get': function get(key, opt) {
      return api.ipc.sendSync('store-get', key, opt);
    },
    'put': function put(key, val) {
      return api.ipc.sendSync('store-put', key, val);
    }
  };

  module.exports = Public;
})();
