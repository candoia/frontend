'use strict';

let fs = require('fs');
let bootstrap = require('./src/js/bootstrap');

let dom = {
  byId: document.getElementById.bind(document),
  query: document.querySelectorAll.bind(document),
  create: document.createElement.bind(document)
}
NodeList.prototype.forEach = Array.prototype.forEach;

for(let app of bootstrap.appData.apps) {
  dom.byId('shortcut-container').innerHTML = `<a href="#">${app.name}</a>`;
}

for(let repo of bootstrap.appData.repositories) {
  let item = dom.create('li');
  item.innerHTML = `<i class='fa fa-lg fa-fw fa-book'></i> ${repo.name}`
  dom.byId('repo-tree').appendChild(item);
}



let scaff = fs.readFileSync('env/src/css/scaffolding.css', {encoding: 'utf8'});
var webviews = dom.query('.app-container');
console.log(webviews);
// webview.addEventListener('console-message', function(e) {
//   console.log(e.message);
// });

var pieA = new Chart(dom.byId('pane-a').getContext('2d')).Pie([
    {
        value: 300,
        color:"#F7464A",
        highlight: "#FF5A5E",
        label: "Dalton Mills"
    },
    {
        value: 50,
        color: "#46BFBD",
        highlight: "#5AD3D1",
        label: "Trey Erenberger"
    },
    {
        value: 100,
        color: "#FDB45C",
        highlight: "#FFC870",
        label: "David Johnston"
    }
], {
  responsive: false
});
var pieB = new Chart(dom.byId('pane-npm').getContext('2d')).Pie([
    {
        value: 300,
        color:"#F7464A",
        highlight: "#FF5A5E",
        label: "Dalton Mills"
    },
    {
        value: 50,
        color: "#46BFBD",
        highlight: "#5AD3D1",
        label: "Trey Erenberger"
    },
    {
        value: 100,
        color: "#FDB45C",
        highlight: "#FFC870",
        label: "David Johnston"
    }
], {
  responsive: false
});
webviews.forEach(function(view) {
  view.addEventListener('dom-ready', function() {
    view.insertCSS(scaff);
    // webview.openDevTools();
  });
});
