/*
 *
 *                              ~ Weka Lib ~
 *  Enables apps to use weka library functions.
 */
'use strict';

let ipc = require('ipc');
let weka = require('../../node_modules/node-weka/lib/weka-lib');

module.exports = (function() {
  ipc.on('weka-classify', function(event, data, testData, options) {
    weka.classify(data, testData, options, function (err, result) {
      console.log(result); //{ predicted: 'yes', prediction: '1' }
      event.returnValue = {
        'err': err, 
        'result': result
      };
    });
      
  });
})();
