'use strict';

(function() {
  let Public = {
    'declat': function declat(data, testData, option) {
      return api.ipc.sendSync('spmf-declat', data, testData, option);
    },
    'eclat': function eclat(data, output) {
      console.log("reached env eclat");
      return api.ipc.sendSync('spmf-eclat', data, output);
    }
  };
  module.exports = Public;
})();
