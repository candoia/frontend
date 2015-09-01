'use strict';

let ver = api.meta.get('version');
alert(ver);

let instance_data = api.instance.get();

// retreive some data from BOA
let json = api.boa.run('my-boa-script.boa');

// manipulate the output
json = json['NOA'];

let content = document.getElementById('content');

let projectIds = Object.keys(json);
for (let i in projectIds) {
  let key = projectIds[i];

  // create a header tag
  let h3 = document.createElement('h3');
  h3.innerHTML = `Project ${key}`;
  content.appendChild(h3);


  // convert the data to a format that chart.js uses
  let labels = [];
  let dataset = [];

  for (let j in json[key]) {
    labels.push(j);
    dataset.push(json[key][j]);
  }

  let chartData = {
    labels: labels,
    datasets: [{
      fillColor: '#ff8080',
      strokeColor: '#bf6060',
      data: dataset
    }]
  }

  // create a canvas and add it to the DOM for chart.js
  let canvas = document.createElement('canvas');
  canvas.setAttribute('width', '400px');
  canvas.setAttribute('height', '300px');
  canvas.id = `dataset-${i}`;
  content.appendChild(canvas);

  let ctx = canvas.getContext('2d');
  new Chart(ctx).Bar(chartData);
}
