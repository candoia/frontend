'use strict';

let $ = require('jquery');
let Q = require('q');
let remote = require('remote');
let jetpack = remote.require('fs-jetpack');
let instManager = remote.require('./vendor/candoia/instance-manager');
let Menu = remote.require('menu');
let MenuItem = remote.require('menu-item');

module.exports = (function() {

  let curSelectedInst = -1;
  let tabContextMenu = initializeContextMenu();


  let _id = 0;
  let scaffoldingCSS = jetpack.read(`${__dirname}/../../css/scaffolding.css`);

  function genId() {
    return _id++;
  }

  function initializeContextMenu() {
    let menu = new Menu();

    menu.append(new MenuItem({
      'type': 'normal',
      'label': 'Split tab right',
      'click': splitCurTabRight
    }));

    menu.append(new MenuItem({
      'type': 'normal',
      'label': 'Split tab left',
      'click': splitCurTabLeft
    }));

    menu.append(new MenuItem({
      'type': 'normal',
      'label': 'Split tab down',
      'click': splitCurTabDown
    }));

    menu.append(new MenuItem({
      'type': 'normal',
      'label': 'Split tab up',
      'click': splitCurTabUp
    }));

    return menu;
  };

  function getTabAxis(tabId) {
    let tab = $(`#tab-${tabId}`);
    return tab.closest('.pane-axis');
  }

  function splitCurTabRight() {
    splitTabRight(curSelectedInst);
  }

  function splitCurTabLeft() {
    splitTabLeft(curSelectedInst);
  }

  function splitCurTabDown() {
    splitTabDown(curSelectedInst);
  }

  function splitCurTabUp() {
    splitTabUp(curSelectedInst);
  }

  function splitTabRight(tabId) {
    let axis = getTabAxis(tabId);
    addPaneRight(axis);
  }

  function splitTabLeft(tabId) {
    let axis = getTabAxis(tabId);
    addPaneLeft(axis);
  }

  function splitTabDown(tabId) {
    let axis = getTabAxis(tabId);
    addPaneDown(axis);
  }

  function splitTabUp(tabId) {
    let axis = getTabAxis(tabId);
    addPaneUp(axis);
  }

  function addPaneRight(axis) {
    let pane = makePane();
    axis.append(pane);
    return pane;
  }

  function addPaneLeft(axis) {
    let pane = makePane();
    axis.prepend(pane);
    return pane;
  }

  function addPaneDown(axis) {
    let pane = makePane();
    let newAxis = $(makeHorizontalAxis());
    newAxis.append(pane);
    axis.after(newAxis);
    return pane;
  }

  function addPaneUp(axis) {
    let pane = makePane();
    let newAxis = $(makeHorizontalAxis());
    newAxis.append(pane);
    axis.before(newAxis);
    return pane;
  }

  function closeTab(tabId) {
    let tab = $(`#tab-${tabId}`);
    let siblings = tab.siblings('.tab');
    let next = -1;
    if (tab.hasClass('active')) {
      if (siblings.length > 0) {
        next = $(siblings[siblings.length - 1]).data('tabid');
      } else {
        // this tab is the last one
        // close pane unless it's root
      }
    }
    let pane = $(`#pane-body-${tabId}`);
    tab.remove();
    pane.remove();
    if (next != -1) {
      setActiveTab(next);
    }
  }

  function makeVerticalAxis() {
    return `
      <div class='pane-axis vertical' style='flex-grow: 1'>
        <div class='pane-axis horizontal' style='flex-grow: 1'>
        </div>
      </div>
    `;
  }

  function makeHorizontalAxis() {
    return `
      <div class='pane-axis horizontal' style='flex-grow: 1'>
      </div>
    `;
  }

  function makePane() {
    return `
      <div class='pane' style='flex-grow: 1'>
        <div class='tab-container'></div>
        <div class='pane-content'></div>
      </div>
    `;
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

  function getActivePane() {
    return $('.pane.active');
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

  function showTabContextMenu(tabId) {
    console.log('context menu');
    curSelectedInst = tabId;
    tabContextMenu.popup(remote.getCurrentWindow());
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
      if (app.dev) e.openDevTools();
      instManager.register(wvId, app, repo);
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

  $(document).on('mousedown', '.tab', function(e) {
    e.preventDefault();
    let tabId = $(this).data('tabid');
    curSelectedInst = tabId;

    // switch depending on mouse button clicked
    switch (e.which) {
    // LMB
    case 1:
      setActiveTab(tabId);
      break;
    // MMB
    case 2:
      break;
    // RMB
    case 3:
      showTabContextMenu(tabId);
      break;
    // ??
    default:
      return;
    }
  });

  return {
    createAppInstance: createAppInstance,
    setActiveTab: setActiveTab,
    closeTab: closeTab
  }

})();
