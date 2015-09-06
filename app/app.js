'use strict';

import { greet } from './hello_world/hello_world';

let remote = require('remote');
let os = require('os');
let $ = require('jquery');
let db = remote.require('./vendor/candoia/datastore');
let appManager = remote.require('./vendor/candoia/app-manager');
let instManager = remote.require('./vendor/candoia/instance-manager');
let meta = require('./vendor/candoia/app-meta');
let Menu = remote.require('menu');
let MenuItem = remote.require('menu-item');
const fs = require('fs');

let repos = [];
let appMenu;

function loadRepos() {
  let tree = $('#repo-tree');
  tree.html('');
  db.repoDb.find({}, function(err, docs) {
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

function loadApps() {
  appMenu = new Menu();
  db.appDb.find({}, function(err, docs) {
    for (let app of docs) {
      appMenu.append(new MenuItem({
        'type': 'normal',
        'label': app.package.productName,
        'click': function() { createAppInstance(app) }
      }));
    }
    appMenu.append(new MenuItem({ type: 'separator' }));
    appMenu.append(new MenuItem({
      'type': 'normal',
      'label': 'remove repository',
      'click': removeRepo
    }));
  });
}

loadRepos();
loadApps();

let curRepo = null;
let ACTIVE_PANE = $('.pane.active');

$(document).on('contextmenu', '.repo-shortcut', function(e) {
  curRepo = $(this).data('repo');
  e.preventDefault();
  appMenu.popup(remote.getCurrentWindow());
});


function removeRepo() {
  let repo = repos[curRepo];
  let id = repo._id;
  db.repository.remove({ _id: id }, function(err) {
    loadRepos();
  });
}

let scaff = fs.readFileSync(`${__dirname}/css/scaffolding.css`, { encoding: 'utf8' });

function createAppInstance(app) {
  let repo = repos[curRepo];
  let src = `.apps/${app.name}/${app.package.main}`;
  let wv = $(`<webview class="app-container pane-body" src="${src}" preload="vendor/candoia/preload.js"></webview>`);

  let content = ACTIVE_PANE.find('.pane-body-container');
  let header = ACTIVE_PANE.find('.pane-title');

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
  });

}
let toggle = $('#side-panel-toggle');
let panel = $('#side-panel');
let open = true;
let w = '200px';

$('#side-panel-toggle').on('click', function() {
  open = !open;
  panel.css('width',open ? w : 0);
  let dir = open ? 'left' : 'right';
  toggle.html(`<i class="fa fa-fw fa-angle-double-${dir}"></i>`);
});

$(document).on('click', '.pane', function() {
  ACTIVE_PANE.removeClass('active');
  ACTIVE_PANE = $(this);
  ACTIVE_PANE.addClass('active');
});


function makeRepoModal(options) {
  return  `
  <div class='modal'>
    <div class='modal-header'><i class='fa fa-fw fa-book'></i> Add Repository</div>
    <div class='modal-content'>
      <label class='modal-label' for='input-repo-name'>
        Name
      </label>
      <div class='modal-input'>
        <input id='input-repo-name' type='text'>
      </div>
      <label class='modal-label' for='input-repo-location'>
        Local Path
      </label>
      <div class='modal-input'>
        <input id='input-repo-location' type='text'>
      </div>
      <label class='modal-label' for='input-repo-remote'>
        Remote github URL
      </label>
      <div class='modal-input'>
        <input id='input-repo-remote' type='text'>
      </div>
      <div class='modal-actions'>
        <button id='confirm-repo-add' class='modal-confirm' type='button'>confirm</button>
        <button id='cancel-repo-add' class='modal-cancel' type='button'>cancel</button>
      </div>
    </div>
  </div>`
}

function makeAppModal(options) {
  return  `
  <div class='modal'>
    <div class='modal-header'><i class='fa fa-fw fa-rocket'></i> Install Application</div>
    <div class='modal-content'>
      <label class='modal-label' for='input-app-name'>
        Registered Application Name
      </label>
      <div class='modal-input'>
        <input id='input-app-name' type='text'>
      </div>
      <div class='modal-actions'>
        <button id='confirm-app-add' class='modal-confirm' type='button'>install</button>
        <button id='cancel-app-add' class='modal-cancel' type='button'>cancel</button>
      </div>
    </div>
  </div>`
}

let curtain = $('.curtain');

$(document).on('click', '#insert-repo', function() {
  let modal = $(makeRepoModal());
  modal.hide();
  curtain.html(modal);
  curtain.fadeIn(250, function() {
    modal.slideDown();
  });
});

$(document).on('click', '#install-app', function() {
  let modal = $(makeAppModal());
  modal.hide();
  curtain.html(modal);
  curtain.fadeIn(250, function() {
    modal.slideDown();
  });
});

$(document).on('click', '#confirm-app-add', function() {
  let name = $('#input-app-name').val();
  $('.modal-content').html('<i class="fa fa-fw fa-cog fa-spin fa-lg"></i>');
  $('.modal-content').css('text-align', 'center');
  appManager.install(name).then(function(app) {

    appMenu.insert(0, new MenuItem({
      'type': 'normal',
      'label': app.name,
      'click': function(r) {
        createAppInstance(app);
      }
    }));

    curtain.fadeOut(500);
    curtain.html('');
  });
});

$(document).on('click', '#confirm-repo-add', function() {
  let name = $('#input-repo-name').val();
  let local = $('#input-repo-location').val();
  let remote = $('#input-repo-remote').val();

  $('.modal-content').html('<i class="fa fa-fw fa-cog fa-spin fa-lg"></i>');
  $('.modal-content').css('text-align', 'center');

  db.repoDb.insert({
    name, local, remote
  }, function(err, newDoc) {
    if (err) {
      $('.modal-content').html(`<pre>${err}</pre><br /><button type='button' id='cancel-repo-add' class='modal-cancel'>cancel</button>`);
    } else {
      loadRepos();
      curtain.fadeOut(500);
      curtain.html('');
    }
  });
});

$(document).on('click', '.modal-cancel', function() {
  curtain.fadeOut(500);
  curtain.html('');
});


// window.env contains data from config/env_XXX.json file.
var envName = window.env.name;
//
// document.getElementById('greet').innerHTML = greet();
// document.getElementById('platform-info').innerHTML = os.platform();
// document.getElementById('env-name').innerHTML = envName;
