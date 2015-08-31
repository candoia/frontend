'use strict';

let fs = require('fs');
let bootstrap = require('./src/js/bootstrap');
let remote = require('remote');
let Menu = remote.require('menu');
let MenuItem = remote.require('menu-item');
let appMenu = new Menu();

for(let app of bootstrap.appData.apps) {
  appMenu.append(new MenuItem({
    'type': 'normal',
    'label': app.name,
    'click': function() { console.log('clicked'); }
  }));
}


for(let repo of bootstrap.appData.repositories) {
  let item = $('<li class="repo-shortcut">');
  let tmpl = `
    <i class='fa fa-fw fa-book tree-icon'></i>
    <span class="tree-text">${repo.name}</span>`;
  item.html(tmpl);
  $('#repo-tree').append(item);
}


$(document).on('contextmenu', '.repo-shortcut', function(e) {
    e.preventDefault();
    appMenu.popup(remote.getCurrentWindow());
});




//let scaff = fs.readFileSync('env/src/css/scaffolding.css', {encoding: 'utf8'});


// webviews.forEach(function(view) {
//   view.addEventListener('dom-ready', function() {
//     view.insertCSS(scaff);
//     // webview.openDevTools();
//   });
// });
