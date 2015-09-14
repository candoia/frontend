'use strict';

let editor = $('.editor');
let loader = $('.load');

$(document).on('click', '.btn-run', function() {
  let src = editor.val();
  loader.html("<i class='fa fa-cog fa-spin'></i> executing query.");
  let json = api.boa.exec(src, 'json');
  loader.html(``);
  console.log(json);
  editor.val(JSON.stringify(json, null, '\t'));
});
