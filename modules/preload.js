"use strict";
global.ipc = require('ipc');
global.api = {
  boa: require('./boa/boa'),
  meta: require('./app-meta/app-meta')
};

global.temp = "jack";
