'use strict';

let $ = require('jquery');
let Q = require('q');

module.exports = (function() {

  let _id = 0;
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
    let pane = tab.closest('.pane');
    let activeTab = pane.find('.tab.active');
    activeTab.removeClass('active');
    tab.addClass('active');
  }

  function createAppInstance(app, repo) {
    let deferred = Q.defer();

    let src = `.apps/${app.name}/${app.package.main}`;

    let pane = getActivePane();
    let icon = app.package.icon.name;
    let pName = app.package.productName;

    icon = icon ? 'fa-' + icon : 'fa-leaf';

    let id = genId();
    let wv = $(`
      <div class='pane-body'>
        <webview class='app-container' data-tabid='${id}' id='app-container-${id}' src='${src}' preload='vendor/candoia/preload.js'></webview>
      </div>`);

    let tab = $(makeTab(id, icon, pName));
    pane.find('.tab-container').append(tab);

    setActiveTab(id);
    let content = pane.find('.pane-body-container');

    content.append(wv);

    wv.on('load-commit', function(r) {
      let id = e.getId();
      e.insertCSS(scaff);
      deferred.resolve(id, app, repo);
    });

    // let target = pane.addPane();
    // let content = pane.find('.pane-body-container');
    // let header = pane.find('.pane-title');

    // var title = `<i class='fa fa-fw ${fa}'></i> ${pName}`;
    //
    // header.html(title);
    // content.html(wv);
    // let e = wv[0];

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
