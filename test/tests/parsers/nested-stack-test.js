/*global describe:true*/
/*global it:true*/
/*global beforeEach:true*/
'use strict';

describe('d4.parsers.nestedStack', function() {
  beforeEach(function(){
    this.data = [{
      unit: 'Non-Alcoholic Beverages',
      year: '2009',
      value: 100
    }, {
      unit: 'Non-Alcoholic Beverages',
      year: '2010',
      value: 90
    }, {
      unit: 'Non-Alcoholic Beverages',
      year: '2011',
      value: 80
    }, {
      unit: 'Non-Alcoholic Beverages',
      year: '2012',
      value: 70
    }, {
      unit: 'Non-Alcoholic Beverages',
      year: '2013',
      value: 60
    }];
  });

  it('should not throw an error when stacking an empty array', function(){
    var parsedData = d4.parsers.nestedStack()([]);
    expect(parsedData.data.length).to.equal(0);
  });

  it('should use default accessors if none or provided', function(){
    var parsedData = d4.parsers.nestedStack()(this.data);
    expect(parsedData.x.key).to.equal('x');
    expect(parsedData.y.key).to.equal('y');
    expect(parsedData.value.key).to.equal('value');

    // a single object will be returned because the default keys do not match
    // the data keys.
    expect(parsedData.data.length).to.equal(1);
    expect(parsedData.data[0].values.length).to.equal(5);
  });

  it('should allow you to choose dimensions of the data as stacking keys', function(){
    var parsedData = d4.parsers.nestedStack()
    .x('unit')
    .y('year')
    .value('value')
    (this.data);

    expect(parsedData.x.key).to.equal('unit');
    expect(parsedData.y.key).to.equal('year');
    expect(parsedData.value.key).to.equal('value');
    expect(parsedData.x.key).to.equal('unit');
    expect(parsedData.x.values.length).to.equal(1);

    // should calculate the stack offsets using y0 variables
    var total = 0;
    d4.each(parsedData.data, function(d){
      var item = d.values[0];
      expect(item.y0).to.equal(total);
      total += item.y;
    }.bind(this));
  });

  it('should not allow the letter `y` to be used as a key on the `y` or `value` dimension', function(){
    var data = [{ x: 100, y : '2001' }, { x: 200, y : '2001' }];
    var parsedData = d4.parsers.nestedStack()
    .x('x')
    .y('y')
    .value('y')
    (data);
    var total = 0;
    d4.each(parsedData.data, function(d){
      var item = d.values[0];
      expect(item.y0).to.equal(total);
      total += item.y;
    }.bind(this));
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
    var parsedData = d4.parsers.nestedStack()
    .x('year')
    .y('salesman')
    .value('unitsSold')
    (data);
    expect(parsedData.data.length).to.equal(3);

    parsedData = d4.parsers.nestedStack()
    .x('year')
    .y('salesman')
    .value('unitsSold')
    .defined(function(d){
      return d.salesman !== null;
    })
    (data);

    expect(parsedData.data.length).to.equal(2);
  });

  it('should allow the letter `y` to be used as a key on the `x` dimension', function(){
    var data = [{ x: 100, y : '2001' }, { x: 200, y : '2001' }];
    expect(function() {
      d4.parsers.nestedStack()
      .x('y')
      .y('x')
      .value('x')
      (data);
    }).to.throw(Error, '[d4] You cannot use `y` as the key for an `x` dimension because it creates an ambiguous `y` property in the nested stack.');
  });
});
