'use strict';

let fs = require('fs');
let bootstrap = require('./src/js/bootstrap');
let instanceManager = require('../modules/instance/instance-backend');
let remote = require('remote');
let Menu = remote.require('menu');
let MenuItem = remote.require('menu-item');
let appMenu = new Menu();



let repos = bootstrap.appData.repositories;

for(let i = 0; i < repos.length; i++) {
  let item = $(`<li class="repo-shortcut" data-repo="${i}">`);
  let tmpl = `
    <i class='fa fa-fw fa-book tree-icon'></i>
    <span class="tree-text">${repos[i].name}</span>`;
  item.html(tmpl);
  $('#repo-tree').append(item);
}

for(let app of bootstrap.appData.apps) {
  appMenu.append(new MenuItem({
    'type': 'normal',
    'label': app.name,
    'click': function(r) {
      createAppInstance(app);
    }
  }));
}

let curRepo = null;

$(document).on('contextmenu', '.repo-shortcut', function(e) {
  curRepo = $(this).data('repo');
  e.preventDefault();
  appMenu.popup(remote.getCurrentWindow());
});

let scaff = fs.readFileSync('env/src/css/scaffolding.css', {encoding: 'utf8'});


function createAppInstance(app) {
  let repo = repos[curRepo];
  let src = '../' + app.path + '/' + app.entry;
  let wv = $(`<webview class="app-container pane-body" src="${src}" preload="../modules/preload.js"></webview>`);
  let content = ACTIVE_PANE.find('.pane-body-container');
  content.html('');
  content.append(wv);
  let e = wv[0];
  wv.on('dom-ready', function(r) {
    e.insertCSS(scaff);
    let id = e.getId();
    console.log(id);
    instanceManager.register(id, app, repo);
    // webview.openDevTools();
  });

}






// webviews.forEach(function(view) {
//   view.addEventListener('dom-ready', function() {
//     view.insertCSS(scaff);
//     // webview.openDevTools();
//   });
// });
