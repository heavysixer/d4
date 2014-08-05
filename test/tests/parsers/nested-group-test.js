/*global describe:true*/
/*global it:true*/
/*global beforeEach:true*/
'use strict';

describe('d4.parsers.nestedGroup', function() {
  beforeEach(function(){
    this.data = [{ a: 10, b:20, c:30 }, { a: 100, b:-200, c:-30 }];
  });
  it('should expose the d4 namespace globally', function() {
    expect(d4).to.not.be.an('undefined');
  });
  it('should not throw an error when stacking an empty array', function(){
    var parsedData = d4.parsers.nestedGroup()([]);
    expect(parsedData.data.length).to.equal(0);
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

  it('should be able to weed out undefined values using a custom accessor', function(){
    var data = [
      { year: '2010', unitsSold: null, salesman : null },
      { year: '2011', unitsSold: null, salesman : null },
      { year: '2010', unitsSold: 100, salesman : 'Gina' },
      { year: '2011', unitsSold: 100, salesman : 'Gina' },
      { year: '2010', unitsSold: 400, salesman : 'Average' },
      { year: '2011', unitsSold: 100, salesman : 'Average' },
      { year: '2010', unitsSold: null, salesman : null },
      { year: '2011', unitsSold: null, salesman : null }
    ];
    var parsedData = d4.parsers.nestedGroup()
    .x('year')
    .y('salesman')
    .value('unitsSold')
    (data);
    expect(parsedData.data[0].values.length).to.equal(4);

    parsedData = d4.parsers.nestedGroup()
    .x('year')
    .y('salesman')
    .value('unitsSold')
    .defined(function(d){
      return d.salesman !== null;
    })
    (data);
    expect(parsedData.data[0].values.length).to.equal(2);
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
    expect(parsedData.data[1].key).to.equal('-30');
    expect(parsedData.value.key).to.equal('value');

    var parsedData2 = d4.parsers.nestedGroup()
    .x('a')
    .y(function(){
      return 'b';
    })
    .nestKey(function(){return 'c';})
    (this.data);
    expect(parsedData2.data.length).to.equal(2);
    expect(parsedData2.data[0].key).to.equal('30');
    expect(parsedData2.data[1].key).to.equal('-30');
    expect(parsedData2.value.key).to.equal('value');
  });
});
