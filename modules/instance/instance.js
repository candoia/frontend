'use strict';

const ipc = require('ipc');

let Public = {
  'get': function get() {
    return api.ipc.sendSync('instance-get');
  }
};

module.exports = Public;
