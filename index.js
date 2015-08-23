/*
 *
 *                          ~ CANDOIA FRONTEND ~
 *
 *
 */

'use strict';
const app = require('app');
const BrowserWindow = require('browser-window');
const Menu = require('menu');
const MenuItem = require('menu-item');
const child_process = require('child_process');
const Boa = require('./boa-wrapper');

let mainWindow;
let menu;

app.on('ready', function() {
  mainWindow = new BrowserWindow({
    width: 920,
    height: 680
  });

  let work = Boa.run('my-boa-script.boa');

  work.then(function(json) {
    console.log(JSON.stringify(json, null, '\t'));
  }).catch(function(reason) {
    console.log(`boa-wrapper failed: ${reason}`);
  });

  mainWindow.loadUrl(`file://${__dirname}/index.html`);
});
