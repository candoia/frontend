/*
 *
 *                          ~ CANDOIA FRONTEND ~
 *
 *
 */

'use strict';
const app = require('app');
const BrowserWindow = require('browser-window');
const Boa = require('../modules/boa/boa-backend');
const ipc = require('ipc');

let mainWindow;
let menu;

ipc.on('synchronous-message', function(event, arg) {
  console.log(arg);
  event.returnValue = arg + ' main process addition';
});

app.on('ready', function() {
  mainWindow = new BrowserWindow({
    width: 920,
    height: 680
  });
  mainWindow.loadUrl(`file://${__dirname}/index.html`);
});
