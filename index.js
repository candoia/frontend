'use strict';
const app = require('app');
const BrowserWindow = require('browser-window');
const Menu = require('menu');
const MenuItem = require('menu-item');
const child_process = require('child_process');
const fs = require('fs');

let mainWindow;
let menu;

app.on('ready', function() {
  menu = new Menu();
  menu.append(new MenuItem({
    label: 'Test'
  }));
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600
  });
  console.log('calling ls');
  callJava('HelloWorld');
  //mainWindow.setMenu(menu);

  mainWindow.loadUrl(`file://${__dirname}/index.html`);
  mainWindow.on('move', function() {
    //console.log(mainWindow.getTitle());
  });

  console.log(`The current version of io.js is ${process.version}`);
});



function callJava(uri) {
  var cp = child_process.exec(`java ${uri}`, function(error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if(error != null) {
      console.log('exec error: ' + error);
    }
  });
}
