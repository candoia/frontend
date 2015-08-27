"use strict";


console.log(ipc.sendSync('synchronous-message', temp));
let url = 'my-boa-script.boa';
let json = api.boa.run(url);

alert(api);
console.log(JSON.stringify(json, null, '\t'))
