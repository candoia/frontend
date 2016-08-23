'use strict';

(function() {
  let Public = {
    'classify': function classify(data, testData, option) {
      return api.ipc.sendSync('weka-classify', data, testData, option);
    },
    'associationApriory': function associationApriory(data, output) {
      return api.ipc.sendSync('weka-assocApriory', data, output);
    },
    'associationFPGrowth': function associationApriory(data, output) {
      return api.ipc.sendSync('weka-assocFPGrowth', data, output);
    }
  };

  module.exports = Public;
})();
