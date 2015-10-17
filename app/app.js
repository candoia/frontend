'use strict';

let remote = require('remote');
let os = require('os');
let $ = require('jquery');
let db = remote.require('./vendor/candoia/datastore');
let appManager = remote.require('./vendor/candoia/app-manager');
let instManager = remote.require('./vendor/candoia/instance-manager');
let paneManager = require('./vendor/candoia/pane-manager');
let pane = require('./vendor/candoia/pane');
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
      let item = $(`<a class="menu-item repo-shortcut" data-repo="${i}"></a>`);
      let tmpl = `
        <i class='fa fa-fw fa-book tree-icon'></i>
        <span class='tree-text'>${docs[i].name}</span>`;
      item.html(tmpl);
      tree.append(item);
    }
    let item = $(`<a class='menu-item' id="insert-repo"></a>`);
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
      'label': 'configuration',
      'click': configRepo
    }));
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

function makeConfigModal(options) {
  var name = options.name || '';
  var local = options.local || '';
  var remote = options.remote || '';

  return  `
  <div class='modal'>
    <div class='modal-header'><i class='fa fa-fw fa-book'></i> Configure Repository</div>
    <div class='modal-content'>
      <label class='modal-label' for='input-repo-name'>
        Name
      </label>
      <p>The name will be displayed on the sidebar to the left</p>
      <div class='modal-input'>
        <input id='input-repo-name' type='text' value='${name}'>
      </div>
      <label class='modal-label' for='input-repo-location'>
        Local Path
      </label>
      <p>If you have a .git repository already downloaded, add the absolute path to the repository</p>
      <div class='modal-input'>
        <input id='input-repo-location' type='text' value='${local}'>
      </div>
      <label class='modal-label' for='input-repo-remote'>
        Remote github URL
      </label>
      <p>If you do not have a .git repository downloaded, then add a remote github URL. For example : "https://github.com/junit-team/junit"</p>
      <div class='modal-input'>
        <input id='input-repo-remote' type='text' value='${remote}'>
      </div>
      <div class='modal-actions form-actions'>
        <input class='modal-footer-mute' id='input-repo-id' type='text' value='${options._id}' disabled>
        <button id='confirm-repo-edit' class='modal-confirm btn btn-sm btn-primary' type='button'>confirm</button>
        <button id='cancel-repo-add' class='modal-cancel btn btn-sm' type='button'>cancel</button>
      </div>
    </div>
  </div>`
}

function makeRepoModal(options) {
  return  `
  <div class='modal'>
    <div class='modal-header'><i class='fa fa-fw fa-book'></i> Add Repository</div>
    <div class='modal-content'>
      <label class='modal-label' for='input-repo-name'>
        Name
      </label>
      <p>The name will be displayed on the sidebar to the left</p>
      <div class='modal-input'>
        <input id='input-repo-name' type='text'>
      </div>
      <label class='modal-label' for='input-repo-location'>
        Local Path
      </label>
      <p>If you have a .git repository already downloaded, add the absolute path to the repository</p>
      <div class='modal-input'>
        <input id='input-repo-location' type='text'>
      </div>
      <label class='modal-label' for='input-repo-remote'>
        Remote github URL
      </label>
      <p>If you do not have a .git repository downloaded, then add a remote github URL. For example : "https://github.com/junit-team/junit"</p>
      <div class='modal-input'>
        <input id='input-repo-remote' type='text'>
      </div>
      <div class='modal-actions form-actions'>
        <button id='confirm-repo-add' class='modal-confirm btn btn-sm btn-primary' type='button'>confirm</button>
        <button id='cancel-repo-add' class='modal-cancel btn btn-sm' type='button'>cancel</button>
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
      <div class='modal-actions form-actions'>
        <button id='confirm-app-add' class='modal-confirm btn btn-sm btn-primary' type='button'>install</button>
        <button id='cancel-app-add' class='modal-cancel btn btn-sm' type='button'>cancel</button>
      </div>
    </div>
  </div>`
}


console.log(pane);

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

$(document).on('click', '#new-pane', function() {
});

function configRepo() {
  let repo = repos[curRepo];
  let modal = $(makeConfigModal(repo));
  modal.hide();
  curtain.html(modal);
  curtain.fadeIn(250, function() {
    modal.slideDown();
  });
}

$(document).on('click', '#confirm-app-add', function() {
  let name = $('#input-app-name').val();
  $('.modal-content').html('<i class="fa fa-fw fa-cog fa-spin fa-lg"></i> Retrieving app meta data');
  $('.modal-content').css('text-align', 'center');
  appManager.info(name).then(function(info) {
    let v = info[0].tag_name;
    $('.modal-content').html(`<i class="fa fa-fw fa-cog fa-spin fa-lg"></i> Meta data retrieved. Downloading latest version: ${v}`);
    appManager.install(name, v).then(function(app) {
      if (app) {
        appMenu.insert(0, new MenuItem({
          'type': 'normal',
          'label': app.package.productName,
          'click': function(r) {
            createAppInstance(app);
          }
        }));
      }
      curtain.fadeOut(500);
      curtain.html('');
    }).catch(function(error) {
      $('.modal-content').html(`<i class='fa fa-fw fa-warning'></i> Encountered error while trying to download latest app version: ${error} <br /><div class='modal-actions form-actions'><button id='cancel-app-add' class='modal-cancel btn btn-sm' type='button'>cancel</button></div>`);
    });
  }).catch(function(error, o) {
    $('.modal-content').html(`<i class='fa fa-fw fa-warning'></i> Invalid application name. <br /> <div class='modal-actions form-actions'><button id='cancel-app-add' class='modal-cancel btn btn-sm' type='button'>cancel</button></div>`);
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
      $('.modal-content').html(`<pre>${err}</pre><br /><button type='button' id='cancel-repo-add' class='modal-cancel btn btn-sm'>cancel</button>`);
    } else {
      loadRepos();
      curtain.fadeOut(500);
      curtain.html('');
    }
  });
});

$(document).on('click', '#confirm-repo-edit', function() {
  let name = $('#input-repo-name').val();
  let local = $('#input-repo-location').val();
  let remote = $('#input-repo-remote').val();
  let id = $('#input-repo-id').val();

  $('.modal-content').html('<i class="fa fa-fw fa-cog fa-spin fa-lg"></i>');
  $('.modal-content').css('text-align', 'center');

  db.repoDb.update({ _id: id }, { name, local, remote }, function(err, newDoc) {
    if (err) {
      $('.modal-content').html(`<pre>${err}</pre><br /><button type='button' id='cancel-repo-add' class='modal-cancel btn btn-sm'>cancel</button>`);
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

$(document).on('click', '#goto-help', function() {
  let wv = $(`<webview class="pane-body" src="http://candoia.org"></webview>`);
  ACTIVE_PANE.find('.pane-body-container').html(wv);
});

// window.env contains data from config/env_XXX.json file.
var envName = window.env.name;
//
// document.getElementById('greet').innerHTML = greet();
// document.getElementById('platform-info').innerHTML = os.platform();
// document.getElementById('env-name').innerHTML = envName;
