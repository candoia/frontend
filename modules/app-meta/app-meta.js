"use strict";

let Public = {
  'getPackage': function getPackage(appName) {
    return ipc.sendSync('meta-get-package-contents', appName);
  }
};

module.exports = Public;
