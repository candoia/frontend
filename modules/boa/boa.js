"use strict";

let Public = {
  'run': function(url) {
    return ipc.sendSync('boa-run', url);
  }
}

module.exports = Public;
