/*global describe:true*/
/*global it:true*/
/*global before:true*/
'use strict';

describe('d4.parsers.nestedGroup', function() {
  before(function(){
    this.data = [{ a: 10, b:20, c:30 }, { a: 100, b:-200, c:-30 }];
  });
  it('should expose the d4 namespace globally', function() {
    expect(d4).to.not.be.an('undefined');
  });

  it('should use default accessors if none or provided', function(){
    var parsedData = d4.parsers.nestedGroup()(this.data);

  });
  it('should allow functions or primitives to be used as accessors', function(){

  });
});
