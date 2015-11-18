'use strict';

let remote = require('remote');
let os = require('os');
let $ = require('jquery');
let db = remote.require('./vendor/candoia/datastore');
let appManager = remote.require('./vendor/candoia/app-manager');
let instManager = remote.require('./vendor/candoia/instance-manager');
let repoManager = remote.require('./vendor/candoia/repo-manager');
let paneManager = require('./vendor/candoia/pane-manager');
let pane = require('./vendor/candoia/pane');
let meta = require('./vendor/candoia/app-meta');
let Menu = remote.require('menu');
let MenuItem = remote.require('menu-item');
let request = remote.require('request');
let jetpack = remote.require('fs-jetpack');
let Q = require('q');

var manifest = jetpack.read(`${__dirname}/package.json`, 'json');

const fs = require('fs');

let repos = [];
let appMenu;

function loadRepos() {
  let tree = $('#repo-tree');
  tree.html('');
  repoManager.load().then(function(docs) {
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

function versionCompare(v1, v2) {
  if (v1 === v2) return 0;

  v1 = v1.slice(1, v1.length);
  v2 = v2.slice(1, v2.length);

  var v1Parts = v1.split('.');
  var v2Parts = v2.split('.');

  var len = Math.min(v1Parts.length, v2Parts.length);

  for (var i = 0; i < len; i++) {
    if (parseInt(v1Parts[i]) > parseInt(v2Parts[i])) return 1;
    if (parseInt(v1Parts[i]) < parseInt(v2Parts[i])) return -1;
  }

  if (v1Parts.length > v2Parts.length) return 1;
  if (v1Parts.length < v2Parts.length) return -1;

  return 0;
}

function checkVersion() {
  let options = {
    url: 'http://design.cs.iastate.edu/candoia/dist/version.json',
    headers: {
      'User-Agent': 'node-http/3.1.0'
    }
  }

  request.get(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      try {
        let info = JSON.parse(body);
        let diff = versionCompare(manifest.version, info.latest);
        if (diff >= 0) {
          $('.footer').append(`<p style='margin: 8px; float: right;'>
            Candoia is up to date
            <i class='fa fa-fw fa-smile-o'></i>
          </p>`);
        } else {
          $('.footer').append(`<a href='http://candoia.org' class='js-external-link btn-link' style='float: right;'>
            There is an update (${info.latest}) avaliable!
            <i class='fa fa-fw fa-warning'></i>
          </a>`);
        }
      } catch (e) {
        console.log(e);
      }
    }
  });
}

loadRepos();
loadApps();
checkVersion();

let curRepo = null;

$(document).on('contextmenu', '.repo-shortcut', function(e) {
  curRepo = $(this).data('repo');
  e.preventDefault();
  appMenu.popup(remote.getCurrentWindow());
});

function removeRepo() {
  let repo = repos[curRepo];
  repoManager.remove(repo._id).then(loadRepos);
}

let scaff = fs.readFileSync(`${__dirname}/css/scaffolding.css`, { encoding: 'utf8' });

function createAppInstance(app) {
  let repo = repos[curRepo];

  paneManager.createAppInstance(app, repo)
    .then(function(id, app, repo) {
      instManager.register(id, app, repo);
    });

  // let src = `.apps/${app.name}/${app.package.main}`;
  // let wv = $(`<webview class="app-container pane-body" src="${src}" preload="vendor/candoia/preload.js"></webview>`);
  //
  // let target = pane.addPane();
  // let content = target.find('.pane-body-container');
  // let header = target.find('.pane-title');
  //
  //
  // let fa = app.package.icon.name;
  // let pName = app.package.productName;
  //
  // fa = fa ? 'fa-' + fa : 'fa-leaf';
  // var title = `<i class='fa fa-fw ${fa}'></i> ${pName}`;
  //
  // header.html(title);
  // content.html(wv);
  // let e = wv[0];
  // wv.on('load-commit', function(r) {
  //   let id = e.getId();
  //   e.insertCSS(scaff);
  //   instManager.register(id, app, repo);
  //   if (app.dev) e.openDevTools();
  // });
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
  <div class='modal' style='width:800px'>
    <div class='modal-header'><i class='fa fa-fw fa-rocket'></i> Install Application</div>
    <div class='modal-content'>
      <div class='app-list'>
        Loading Apps&hellip; <i class='fa fa-fw fa-cog fa-spin'></i>
      </div>
      <div class='modal-actions form-actions'>
        <!--<button id='confirm-app-add' class='modal-confirm btn btn-sm btn-primary' type='button'>install</button>-->
        <button id='cancel-app-add' class='modal-cancel btn btn-sm' type='button'>cancel</button>
      </div>
    </div>
  </div>`
}

function makeAboutModal(options) {
  return  `
  <div class='modal'>
    <div class='modal-header'><i class='fa fa-fw fa-info-circle'></i> About Candoia</div>
    <div class='modal-content'>
      <h4>Contributors</h4>
      <p>Candoia platform is developed at Iowa State University. The development
      is led by Hridesh Rajan (@hridesh) and project contributors include Nitin
      Tiwari (@nmtiwari), Ganesha Upadhyaya (@gupadhyaya), Dalton Mills
      (@ddmills), Eric Lin (@eyhlin), and Trey Erenberger (@TErenberger).</p>

      <h4>Version Info</h4>
      <p>
        Candoia: v${options.version}<br>
        Boa Core: v${options.boa}
      </p>

      <h4>License</h4>

      <p>Copyright (c) 2015 Iowa State University of Science and Technology.</p>

      <p>Permission is hereby granted, free of charge, to any person obtaining a
      copy of this software and associated documentation files (the "Software"),
      to deal in the Software without restriction, including without limitation
      the rights to use, copy, modify, merge, publish, distribute, sublicense,
      and/or sell copies of the Software, and to permit persons to whom the
      Software is furnished to do so, subject to the following conditions:</p>

      <p>The above copyright notice and this permission notice shall be included
      in all copies or substantial portions of the Software.</p>

      <p>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
      OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
      FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
      AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
      LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
      FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
      DEALINGS IN THE SOFTWARE.</p>

      <div class='modal-actions form-actions'>
        <button id='close-about' class='modal-cancel btn btn-sm' type='button'>close</button>
      </div>
    </div>
  </div>`
}

let curtain = $('.curtain');

function getLatestApps() {
  let deferred = Q.defer();
  let options = {
    url: 'http://design.cs.iastate.edu/candoia/dist/apps.json',
    headers: {
      'User-Agent': 'node-http/3.1.0'
    }
  }

  request.get(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      try {
        let info = JSON.parse(body);
        deferred.resolve(info);
      } catch (e) {
        console.log(e);
      }
    }
  });

  return deferred.promise;
}

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

  getLatestApps().then(function(info) {
    var appList = modal.find('.app-list');

    var drawApp = function(appMeta) {
      appList.html('');
      appManager.local(appMeta.name).then(function(local) {
      var btn = `<button type='button' data-name='${appMeta.name}' class='btn btn-sm btn-install-app'>install</button>`;

      // check if the app is already installed
      if (local.length > 0) {
        let cnt = meta.contents(local[0].name);
        var compare = versionCompare(cnt.version, appMeta.version);

        if (compare < 0) {
          btn = `<button type='button' data-name='${appMeta.name}' class='btn btn-sm btn-install-app'>update</button>`;
        } else {
          btn = `<button type='button' class='btn btn-sm disabled'>installed</button>`;
        }
      }

      appList.append(`
        <div class='app-list-item'>
          <h4 class='app-list-item-name'>
            <i class='fa fa-fw fa-${appMeta.icon.name}'></i>
            ${appMeta.productName}
          </h4>

          <p class='app-list-item-desciption'>
            ${appMeta.description}
          </p>

          <span class='app-list-item-version'>
            v${appMeta.version}
          </span>

          ${btn}
          <span class='clearfix'></span>
        </div>`);

      });
    }

    for (var i = 0; i < info['apps'].length; i++) {
      var app = info['apps'][i];
      drawApp(app);
    }
  });

});

$(document).on('click', '#goto-about', function() {
  let modal = $(makeAboutModal(manifest));
  modal.hide();
  curtain.html(modal);
  curtain.fadeIn(250, function() {
    modal.slideDown();
  });
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

$(document).on('click', '.btn-install-app', function() {
  let name = $(this).data('name');
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
            paneManager.createAppInstance(app, repos[curRepo]);
          }
        }));
      }
      $('.modal-content').html(`<i class='fa fa-fw fa-rocket'></i> ${name} has been installed! <br /><div class='modal-actions form-actions'><button id='cancel-app-add' class='modal-cancel btn btn-sm' type='button'>close</button></div>`);
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

  repoManager.add(name, local, remote)
    .then(function(repo) {
      loadRepos();
      curtain.fadeOut(500);
      curtain.html('');
    })
    .fail(function(err) {
      $('.modal-content').html(`<pre>${err}</pre><br /><button type='button' id='cancel-repo-add' class='modal-cancel btn btn-sm'>cancel</button>`);
    });
});

$(document).on('click', '#confirm-repo-edit', function() {
  let id = $('#input-repo-id').val();
  let name = $('#input-repo-name').val();
  let local = $('#input-repo-location').val();
  let remote = $('#input-repo-remote').val();

  $('.modal-content').html('<i class="fa fa-fw fa-cog fa-spin fa-lg"></i>');
  $('.modal-content').css('text-align', 'center');

  repoManager.update(id, name, local, remote)
    .then(function(repo) {
      loadRepos();
      curtain.fadeOut(500);
      curtain.html('');
    })
    .catch(function(err) {
      $('.modal-content').html(`<pre>${err}</pre><br /><button type='button' id='cancel-repo-add' class='modal-cancel btn btn-sm'>cancel</button>`);
    });
});

$(document).on('click', '.modal-cancel', function() {
  curtain.fadeOut(500);
  curtain.html('');
});

var envName = window.env.name;
