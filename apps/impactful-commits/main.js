"use strict";


console.log(ipc.sendSync('synchronous-message', temp));
let url = 'my-boa-script.boa';
let json = ipc.sendSync('run-boa', url);
console.log(JSON.stringify(json, null, '\t'))
