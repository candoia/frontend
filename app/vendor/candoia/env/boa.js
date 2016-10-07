'use strict';

(function() {
  let Public = {
    'run': function run(url, fmt) {
      return api.ipc.sendSync('boa-run', url, fmt);
    },
    'exec': function exec(code, fmt) {
      return api.ipc.sendSync('boa-exec', code, fmt);
    },
    'fars': function fars(code, fmt) {
      return api.ipc.sendSync('fars-run', code, fmt);
    }
  };

  module.exports = Public;
})();
