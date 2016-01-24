'use strict';

(function() {
  let Public = {
    '_data': false,
    'get': function get(prop) {
      this._data = this._data || api.ipc.sendSync('meta-get-package');
      return prop == undefined ? this._data : this._data[prop];
    }
  };

  module.exports = Public;
})();
