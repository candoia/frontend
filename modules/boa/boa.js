"use strict";

let Public = {
  'run': function run(url) {
    return ipc.sendSync('boa-run', url);
  }
};

module.exports = Public;
