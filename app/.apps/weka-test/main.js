'use strict';

$(window).load(function() { 
  var result = api.weka.classify('test', 'tarin', 'no option');
  console.log(result);
});
