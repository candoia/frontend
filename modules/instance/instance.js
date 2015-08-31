'use strict';

const ipc = require('ipc');

let Public = {
  'get': function get() {
    return ipc.sendSync('instance-get');
  }
};

module.exports = Public;
