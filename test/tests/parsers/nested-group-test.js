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
    expect(parsedData.x.key).to.equal('x');
    expect(parsedData.y.key).to.equal('y');
    expect(parsedData.value.key).to.equal('value');
    expect(parsedData.data[0].values.length).to.equal(2);
  });

  it('should allow functions or primitives to be used as accessors', function(){
    var parsedData = d4.parsers.nestedGroup()
    .x('a')
    .y(function(){
      return 'b';
    })
    (this.data);
    expect(parsedData.x.key).to.equal('a');
    expect(parsedData.data[0].key).to.equal('10');
    expect(parsedData.y.key).to.equal('b');
    expect(parsedData.value.key).to.equal('value');
  });

  it('should allow you to specify a nestKey which can be used to sort on a dimension', function(){
    var parsedData = d4.parsers.nestedGroup()
    .x('a')
    .y(function(){
      return 'b';
    })
    .nestKey('c')
    (this.data);
    expect(parsedData.data.length).to.equal(2);
    expect(parsedData.data[0].key).to.equal('30');
    expect(parsedData.value.key).to.equal('value');
  });
});
