'use strict';

let $ = require('jquery');
let Q = require('q');

function makeTab(options) {
  return `
    <div class='tab' id='tab-${options.appId}'>
      <i id='tab-close-${options.appId}' class='close fa fa-fw fa-close'></i>
      <span class='tab-title'>
        <i class='fa fa-fw fa-${options.icon}'></i>
        ${options.title}
      </span>
    </div>
  `;
}

function removeTab(id) {
  var e = $(`#tab-${id}`);
  var container = e.parent();
}

function showApp() {
}

function insertTab(pane) {
  var tabs = pane.find('.tab-container');
}

function createAppInstance(app) {
  let deferred = Q.defer();

  let repo = repos[curRepo];
  let src = `.apps/${app.name}/${app.package.main}`;
  let wv = $(`<webview class="app-container pane-body" src="${src}" preload="vendor/candoia/preload.js"></webview>`);

  let target = pane.addPane();
  let content = target.find('.pane-body-container');
  let header = target.find('.pane-title');


  let fa = app.package.icon.name;
  let pName = app.package.productName;

  fa = fa ? 'fa-' + fa : 'fa-leaf';
  var title = `<i class='fa fa-fw ${fa}'></i> ${pName}`;

  header.html(title);
  content.html(wv);
  let e = wv[0];
  wv.on('load-commit', function(r) {
    let id = e.getId();
    e.insertCSS(scaff);
    instManager.register(id, app, repo);
    if (app.dev) e.openDevTools();
    deferred.resolve();
  });

  return deferred.promise;
}
