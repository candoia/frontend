'use strict';

(function() {
  let Public = {
    'run': function run(url, fmt) {
      return api.ipc.sendSync('boa-run', url, fmt);
    },
    'exec': function exec(code, fmt) {
      return api.ipc.sendSync('boa-exec', code, fmt);
    }
  };

  module.exports = Public;
})();
