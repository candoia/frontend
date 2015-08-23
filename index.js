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

  let work = callJava('resources/boa/boa-runner.jar');
  work.then(function(json) {
    console.log(JSON.stringify(json, null, '\t'));
  });

  //mainWindow.setMenu(menu);

  mainWindow.loadUrl(`file://${__dirname}/index.html`);

  console.log(`~~ The current version of io.js is ${process.version}`);
});

function parseToJSON(raw) {
  let json = new Object;
  let parsed = [];
  let lines = raw.split('\n');
  let delims = /\[|\]|\t|\s+|\r/;

  for (let line of lines) {
    line = line.replace(/\ = /g, ' ');
    let matches = line.split(delims);
    // var exists = (n) => !!n; not implemented in io.js currently

    // remove empty strings/elements
    matches = matches.filter(function(n) { return !!n; });

    // coerce into strings
    matches = matches.map(function(n) { return "" + n });

    if (matches.length > 0) {
      parsed.push(matches);
    }
  }

  for (let chunk of parsed) {
    let pntr = json;
    let val = chunk.pop();
    for (let i = 0; i < chunk.length; i++) {
      let key = chunk[i];
      if (!(key in pntr)) {
        pntr[key] = i == chunk.length - 1 ? val : new Object;
      }
      pntr = pntr[key];
    }
  }

  return json;
}

function callJava(uri) {
  // todo sanitize uri so user apps cannot execute random code
  let promise = new Promise(function(resolve, reject) {
    child_process.exec(`java -jar ${uri} -new`, function(error, stdout,
            stderr) {
      let json = parseToJSON(stdout);
      resolve(json);
    });
  });
  return promise;
}
