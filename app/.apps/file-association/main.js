'use strict';
$('#content').show();
  let json = api.boa.run('revisions.boa','arff');
  var result = api.weka.associationApriory(json, '-N 10 -T 0 -C 0.3 -D 0.05 -U 1.0 -M 0.01 -S -1.0 -c -1 -I -t ');
  $('#loading').hide();
  $('#content').show();
  var lines = result.split('\n');
  for(var line of lines){
    line += '<br />';
    $(document.body).append(line);
  }
$('#content').hide();
