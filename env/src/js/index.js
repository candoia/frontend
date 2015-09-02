'use strict';

let fs = require('fs');
// let bootstrap = require('./src/js/bootstrap');
let remote = require('remote');
let ipc = remote.require('ipc');
let Menu = remote.require('menu');
let instanceManager = remote.require('../modules/instance/instance-backend');
let appManager = require('./src/js/app-manager.js');
let db = remote.require('./src/js/bootstrap.js');
let MenuItem = remote.require('menu-item');
let appMenu = new Menu();

let repos = [];

function loadRepos() {
  let tree = $('#repo-tree');
  tree.html('');
  db.repository.find({}, function(err, docs) {
    repos = docs;
    for (let i = 0; i < docs.length; i++) {
      let item = $(`<li class="repo-shortcut" data-repo="${i}">`);
      let tmpl = `
        <i class='fa fa-fw fa-book tree-icon'></i>
        <span class='tree-text'>${docs[i].name}</span>`;
      item.html(tmpl);
      tree.append(item);
    }
    let item = $('<li id="insert-repo">');
    item.html(`
      <i class='fa fa-fw fa-plus tree-icon'></i>
      <span class='tree-text'>Add Repository</span>`);
    tree.append(item);
  });
}

loadRepos();

function loadApps() {
  console.log('loading apps');
  appMenu = new Menu();
  db.app.find({}, function(err, docs) {
    console.log(docs.length);
    for (let app of docs) {
      appMenu.append(new MenuItem({
        'type': 'normal',
        'label': app.name,
        'click': function(r) {
          createAppInstance(app);
        }
      }));
    }
    appMenu.append(new MenuItem({ type: 'separator' }));
    appMenu.append(new MenuItem({
      'type': 'normal',
      'label': 'remove repository',
      'click': function(r) {
        removeRepo();
      }
    }));
  });
}

loadApps();

let curRepo = null;

$(document).on('contextmenu', '.repo-shortcut', function(e) {
  curRepo = $(this).data('repo');
  e.preventDefault();
  appMenu.popup(remote.getCurrentWindow());
});

let scaff = fs.readFileSync('env/src/css/scaffolding.css', {encoding: 'utf8'});

function removeRepo() {
  let repo = repos[curRepo];
  let id = repo._id;
  db.repository.remove({ _id: id }, function(err) {
    loadRepos();
  });
}

function createAppInstance(app) {
  let repo = repos[curRepo];
  let src = '../' + app.path + '/' + app.entry;
  let wv = $(`<webview class="app-container pane-body" src="${src}" preload="../modules/preload.js"></webview>`);
  let content = ACTIVE_PANE.find('.pane-body-container');
  let header = ACTIVE_PANE.find('.pane-title');
  header.html(app.name);
  content.html(wv);
  let e = wv[0];
  wv.on('load-commit', function(r) {
    let id = e.getId();
    e.insertCSS(scaff);
    instanceManager.register(id, app, repo);
    if (app.dev) e.openDevTools();
  });

}
