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

require('../modules/boa/boa-backend');
require('../modules/app-meta/app-meta-backend');

// TODO move this to it's own module
let mainWindow;

app.on('ready', function() {
  mainWindow = new BrowserWindow({
    width: 920,
    height: 680
  });
  mainWindow.loadUrl(`file://${__dirname}/index.html`);
});
