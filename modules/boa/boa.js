'use strict';

let Public = {
  'run': function run(url, fmt) {
    return api.ipc.sendSync('boa-run', url, fmt);
  }
};

module.exports = Public;
