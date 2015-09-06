/*
 *
 *                           ~ CANDOIA ENVIRONMENT ~
 *
 * This file is the entrypoint for candoia frontend. It sets up the main browser
 * window and populates it with an HTML file.
 */
'use strict';

let app = require('app');
let BrowserWindow = require('browser-window');
let env = require('./vendor/candoia/env-config');
let devHelper = require('./vendor/candoia/dev-helper');
let windowStateKeeper = require('./vendor/candoia/window-state');

let boa = require('./vendor/candoia/boa');
let meta = require('./vendor/candoia/app-meta');
let im = require('./vendor/candoia/instance-manager');

let mainWindow;

// Preserver of the window size and position between app launches.
var mainWindowState = windowStateKeeper('main', {
  width: 1000,
  height: 600
});

app.on('ready', function () {

  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height
  });

  if (mainWindowState.isMaximized) {
    mainWindow.maximize();
  }

  mainWindow.loadUrl('file://' + __dirname + '/app.html');

  if (env.name === 'development') {
    devHelper.setDevMenu();
    mainWindow.openDevTools();
  }

  mainWindow.on('close', function () {
    mainWindowState.saveState(mainWindow);
  });
});

app.on('window-all-closed', function () {
  app.quit();
});
