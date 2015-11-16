'use strict';

let $ = require('jquery');
let Q = require('q');

module.exports = (function() {
  function makeTab(id, icon, title) {
    return `
      <div class='tab' id='tab-${id}'>
        <i id='tab-close-${id}' class='close fa fa-fw fa-close'></i>
        <span class='tab-title'>
          <i class='fa fa-fw ${icon}'></i>
          ${title}
        </span>
      </div>
    `;
  }

  function getActivePane() {
    return $('.pane.active');
  }

  function removeTab(id) {
    var e = $(`#tab-${id}`);
    var container = e.parent();
  }

  function insertTab(pane) {
    var tabs = pane.find('.tab-container');
  }

  function createAppInstance(app, repo) {
    console.log('sweg');
    let deferred = Q.defer();

    let src = `.apps/${app.name}/${app.package.main}`;
    let wv = $(`<webview class="app-container pane-body" src="${src}" preload="vendor/candoia/preload.js"></webview>`);

    let pane = getActivePane();
    let icon = app.package.icon.name;
    let pName = app.package.productName;

    icon = icon ? 'fa-' + icon : 'fa-leaf';
    let tab = $(makeTab('1', icon, pName));
    pane.find('.tab-container').append(tab);
    let activeTab = pane.find('.tab.active');
    activeTab.removeClass('active');
    tab.addClass('active');

    // let target = pane.addPane();
    // let content = pane.find('.pane-body-container');
    // let header = pane.find('.pane-title');
    //

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
    //   deferred.resolve();
    // });

    return deferred.promise;
  }

  return {
    createAppInstance: createAppInstance
  }

})();
