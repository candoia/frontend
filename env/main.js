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
const meta = require('../modules/app-meta/app-meta-backend');
const ipc = require('ipc');

let mainWindow;
let menu;

app.on('ready', function() {
  mainWindow = new BrowserWindow({
    width: 920,
    height: 680
  });
  mainWindow.loadUrl(`file://${__dirname}/index.html`);
});
