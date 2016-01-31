'use strict';

var app = require('app');
var Menu = require('menu');
var BrowserWindow = require('browser-window');

module.exports.setDevMenu = function() {
  var devMenu = Menu.buildFromTemplate([{
    label: 'Development',
    submenu: [{
      label: 'Reload',
      accelerator: 'CmdOrCtrl+R',
      click: function () {
        BrowserWindow.getFocusedWindow().reloadIgnoringCache();
      }
    },{
      label: 'Toggle DevTools',
      accelerator: 'Alt+CmdOrCtrl+I',
      click: function () {
        BrowserWindow.getFocusedWindow().toggleDevTools();
      }
    },{
      label: 'Quit',
      accelerator: 'CmdOrCtrl+Q',
      click: function () {
        app.quit();
      }
    }]
  }, {
    label: "Edit",
    submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
    ]}]);
  Menu.setApplicationMenu(devMenu);
};
