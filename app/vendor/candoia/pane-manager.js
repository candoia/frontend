'use strict';

let $ = require('jquery');
let Q = require('q');
let remote = require('remote');
let jetpack = remote.require('fs-jetpack');

module.exports = (function() {

  let _id = 0;
  let scaffoldingCSS = jetpack.read(`${__dirname}/../../css/scaffolding.css`);

  function genId() {
    return _id++;
  }

  function closeTab(tabId) {
    console.log('close ' + tabId);
  }

  function makeTab(id, icon, title) {
    return `
      <div class='tab' data-tabId='${id}' id='tab-${id}'>
        <i id='tab-close-${id}' class='close fa fa-fw fa-close'></i>
        <span class='tab-title'>
          <i class='fa fa-fw ${icon}'></i>
          ${title}
        </span>
      </div>
    `;
  }

  function addTabContent() {

  }

  function getActivePane() {
    return $('.pane.active');
  }

  function removeTab(tabId) {
    var e = $(`#tab-${tabId}`);
    var container = e.parent();
  }

  function insertTab(pane) {
    var tabs = pane.find('.tab-container');
  }

  function setActiveTab(tabId) {
    let tab = $(`#tab-${tabId}`);
    let content = $(`#pane-body-${tabId}`);
    let pane = tab.closest('.pane');

    let activeTab = pane.find('.tab.active');
    let activePaneBody = pane.find('.pane-body.active');

    activeTab.removeClass('active');
    activePaneBody.removeClass('active');
    tab.addClass('active');
    content.addClass('active');
  }

  function createAppInstance(app, repo) {
    let deferred = Q.defer();

    let src = `.apps/${app.name}/${app.package.main}`;

    let pane = getActivePane();
    let icon = app.package.icon.name;
    let pName = app.package.productName;

    icon = icon ? 'fa-' + icon : 'fa-leaf';

    let id = genId();
    let content = $(`
      <div class='pane-body' data-tabid='${id}' id='pane-body-${id}'>
        <webview class='app-container' src='${src}' preload='vendor/candoia/preload.js'></webview>
      </div>`);

    let tab = $(makeTab(id, icon, pName));
    pane.find('.tab-container').append(tab);
    pane.find('.pane-body-container').append(content);

    let wv = content.find('.app-container');
    let e = wv[0];
    wv.on('load-commit', function(r) {
      let wvId = e.getId();
      e.insertCSS(scaffoldingCSS);
      e.openDevTools();
      if (app.dev) e.openDevTools();
      deferred.resolve({
        id: wvId,
        repo: repo,
        app: app
      });
    });

    setActiveTab(id);
    return deferred.promise;
  }

  $(document).on('click', '.tab .close', function(e) {
    let tabId = $(this).closest('.tab').data('tabid');
    closeTab(tabId);
  });

  $(document).on('click', '.tab', function(e) {
    let tabId = $(this).data('tabid');
    setActiveTab(tabId);
  });

  return {
    createAppInstance: createAppInstance
  }

})();
