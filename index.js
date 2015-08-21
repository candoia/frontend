'use strict';
const app = require('app');
const BrowserWindow = require('browser-window');

let mainWindow;

app.on('ready', function() {

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600
  });

  mainWindow.loadUrl(`file://${__dirname}/index.html`);
  console.log(`The current version of io.js is ${process.version}`);
});
