/*
 *
 *                          ~ CANDOIA FRONTEND ~
 *
 * This file is the entrypoint for candoia frontend. It sets up the main browser
 * window and populates it with an HTML file.
 */
'use strict';

const app = require('app');
const BrowserWindow = require('browser-window');

// these need to be included in order to be "started"
// TODO fix this?
require('../modules/boa/boa-backend');
require('../modules/app-meta/app-meta-backend');

// TODO move this to it's own module
let mainWindow;

app.on('ready', function() {
  // hide window on creation so we can hide artifacts generated when
  // maximize() is called
  mainWindow = new BrowserWindow({
    width: 920,
    height: 680,
    show: false
  });
  mainWindow.loadUrl(`file://${__dirname}/index.html`);
  // mainWindow.setMenu(null);
  mainWindow.maximize();
  // show window after it's been maximized
  mainWindow.show();
});
