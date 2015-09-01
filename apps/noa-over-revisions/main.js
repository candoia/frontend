'use strict';

$(window).load(function() {
  let json = api.boa.run('noa-over-revisions.boa', 'lta');
  console.log(json);
});
