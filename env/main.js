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
const db = require('./src/js/bootstrap.js');

// these need to be included in order to be "started"
// TODO fix this?
require('../modules/boa/boa-backend');
require('../modules/meta/meta-backend');
require('../modules/instance/instance-backend');

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
