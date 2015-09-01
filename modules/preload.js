"use strict";
global.ipc = require('ipc');
global.api = {
  boa: require('./boa/boa'),
  meta: require('./meta/meta'),
  instance: require('./instance/instance')
};
