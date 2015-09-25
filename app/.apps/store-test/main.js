'use strict';

$(window).load(function() {
  let instance = api.instance.get();
  $('#status').html('hello dad');
  console.log('hello');
  //get complex key already created by another instance off this app
  console.log(api.store.get('complexKey',{}));
  //put test key/val pair
  console.log(api.store.put('testKey', 'testValue'));
  //update test key/val pair
  console.log(api.store.put('testKey', 'testValue2'));
  //put complex object in store
  console.log(api.store.put('complexKey', {
    'name': 'dan',
    'color': 'red',
    'age': 33
  }));
  //get test key (updated version)
  console.log(api.store.get('testKey'), {});
  //get complex object from store
  console.log(api.store.get('complexKey', {}));

});
