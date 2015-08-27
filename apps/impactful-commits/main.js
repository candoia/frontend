"use strict";

let url = 'my-boa-script.boa';
let json = api.boa.run(url);

console.log(JSON.stringify(json, null, '\t'))
let packageContents = api.meta.getPackage('impactful-commits');
console.log(JSON.stringify(packageContents, null, '\t'));
