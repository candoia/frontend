var boa = require('./vendor/candoia/boa');

describe("Boa.js", function() {

  beforeEach(function() {
    spyOn(boa, 'run');
    boa.run();
  });

  it("contains spec with an expectation", function() {
    expect(true).toBe(true);
  });

  it("expects that run was called", function() {
    expect(boa.run).toHaveBeenCalled();
  });
});
