'use strict';

let editor = $('.editor');
let results = $('.results');
let loader = $('.load');
let btnrun = $('.btn-run');

let btnresults = $('.btn-results');
let btneditor = $('.btn-editor');

api.dev.console.hide();

function showEditor() {
  btnrun.show();
  results.hide();
  editor.show();
}

function showResults() {
  btnrun.hide();
  editor.hide();
  results.show();
}

function execute(src, callback) {
  btnrun.hide();
  editor.prop('disabled', true);
  results.prop('disabled', true);
  btneditor.prop('disabled', true);
  btnresults.prop('disabled', true);
  loader.show(500, function() {
    let json = api.boa.exec(src, 'json');

    console.log(json);
    results.val(JSON.stringify(json, null, '  '));

    editor.prop('disabled', false);
    results.prop('disabled', false);
    btneditor.prop('disabled', false);
    btnresults.prop('disabled', false);

    loader.hide();
    btnrun.show();

    callback(json);
  });
}

btnrun.on('click', function() {
  let src = editor.val();
  execute(src, showResults);
});

btneditor.on('click', showEditor);
btnresults.on('click', showResults);

showEditor();
