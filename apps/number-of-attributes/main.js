'use strict';
// get an element from the DOM
let container = document.getElementById('output');

container.innerHTML = 'LOADING';

// retreive some data from BOA
let json = api.boa.run('noa.boa');


container.innerHTML = JSON.stringify(json, null, '\t');
