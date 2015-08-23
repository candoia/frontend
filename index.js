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
    width: 920,
    height: 680
  });

  callJava('resources/boa/boa-runner.jar');
  //mainWindow.setMenu(menu);

  mainWindow.loadUrl(`file://${__dirname}/index.html`);

  console.log(`The current version of io.js is ${process.version}`);
});

function parseToJSON(raw) {
  let json = {};

  let lines = raw.split('\n');
  let delims = /\[|=|\]/;
  let parsed = [];

  for (let line of lines) {
    line = line.replace(/\s+/g, '');
    let matches = line.split(delims);
    // var exists = (n) => !!n; not implemented in io.js currently
    matches = matches.filter(function(n) { return !!n; });
    if (matches.length > 0) {
      parsed.push(matches);
    }
  }

  for (let chunk of parsed) {
    let pntr = json;
    for (let i = 0; i < chunk.length; i++) {
      let key = chunk[i];
      if (key in pntr) {
        pntr = pntr[key];
      } else {
        if (i == chunk.length - 2) {
          pntr[key] = chunk[chunk.length -1];
          pntr = pntr[key];
          break;
        } else {
          pntr[key] = {};
          pntr = pntr[key];
        }
      }
    }
  }

  console.log(json);

  return json;
}

function callJava(uri) {
  // todo sanitize uri so user apps cannot execute random code
  var cp = child_process.exec(`java -jar ${uri}`, function(error, stdout,
          stderr) {
    console.log('stdout: ' + stdout);
    let json = parseToJSON(stdout);
  });
}
