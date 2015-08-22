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

  callJava('resources/boa/boa-runner.jar');
  //mainWindow.setMenu(menu);

  mainWindow.loadUrl(`file://${__dirname}/index.html`);
  mainWindow.on('move', function() {
    //console.log(mainWindow.getTitle());
  });

  console.log(`The current version of io.js is ${process.version}`);
});

function parseToJSON(boa) {
  let lines = boa.split('\n');
  for (let line of lines) {
    console.log(line);
    let matches = line.match(/\[(.*?)\]/g);
    if (matches) {
      for (let match of matches) {
        console.log(match);
      }
    }
  }
}


function callJava(uri) {
  var cp = child_process.exec(`java -jar ${uri}`, function(error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    let json = parseToJSON(stdout);
  });
}
