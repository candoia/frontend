'use strict';

(function() {
  global.api = {
    ipc: require('ipc'),
    boa: require('./env/boa'),
    meta: require('./env/meta'),
    instance: require('./env/instance'),
    store: require('./env/store'),
    dev: require('./env/dev')
  };
})();
