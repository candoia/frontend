'use strict';

(function() {
  let Public = {
    'classify': function classify(data, testData, option) {
      return api.ipc.sendSync('weka-classify', data, testData, option); 
    }
    // 'exec': function exec(code, fmt) {
    //   return api.ipc.sendSync('boa-exec', code, fmt);
    // }
  };

  module.exports = Public;
})();
