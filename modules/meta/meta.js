"use strict";

let Public = {
  '_data': false,
  'get': function get(prop) {
    this._data = this._data || api.ipc.sendSync('meta-get-package');
    return this._data[prop];
  }
};

module.exports = Public;
