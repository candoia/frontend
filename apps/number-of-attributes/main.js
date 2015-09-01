'use strict';

// get an element from the DOM
let container = document.getElementById('output');

container.innerHTML = 'LOADING';

// retreive some data from BOA
let json = api.boa.run('noa.boa');

// let sorted = _.sortBy(json, function(elem) {
//
// });

container.innerHTML = JSON.stringify(json, null, '\t');
