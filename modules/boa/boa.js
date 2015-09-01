'use strict';

let Public = {
  'run': function run(url) {
    return api.ipc.sendSync('boa-run', url);
  }
};

module.exports = Public;
