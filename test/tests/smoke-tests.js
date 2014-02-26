/*global describe:true*/
/*global it:true*/
'use strict';

/*
  These smoke tests are here just to ensure that at the most basic level the
  included charts render as expected. Mostly these tests are here to break a
  build in the event that something snuck in which causes one of the basic charts
  not to work.
*/
describe('smoke tests', function() {
  it('should render a basic column chart', function() {
    var data = [
        { x: '2010', y:-10 },
        { x: '2011', y:20 },
        { x: '2012', y:30 },
        { x: '2013', y:40 },
        { x: '2014', y:50 },
      ];
    var chart = d4.columnChart();
    d3.select('#test')
    .datum(data)
    .call(chart);
    expect(d3.select('.series0')[0][0]).to.not.be.an('null');
  });

  it('should render a basic grouped column', function() {
    var data = [
        { year: '2010', unitsSold:-100, salesman : 'Bob' },
        { year: '2011', unitsSold:200, salesman : 'Bob' },
        { year: '2012', unitsSold:300, salesman : 'Bob' },
        { year: '2013', unitsSold:400, salesman : 'Bob' },
        { year: '2014', unitsSold:500, salesman : 'Bob' },
        { year: '2010', unitsSold:100, salesman : 'Gina' },
        { year: '2011', unitsSold:100, salesman : 'Gina' },
        { year: '2012', unitsSold:-100, salesman : 'Gina' },
        { year: '2013', unitsSold:500, salesman : 'Gina' },
        { year: '2014', unitsSold:600, salesman : 'Gina' },
        { year: '2010', unitsSold:400, salesman : 'Average' },
        { year: '2011', unitsSold:0, salesman : 'Average' },
        { year: '2012', unitsSold:400, salesman : 'Average' },
        { year: '2013', unitsSold:400, salesman : 'Average' },
        { year: '2014', unitsSold:400, salesman : 'Average' }
      ];

    var parsedData = d4.parsers.nestedGroup()
      .x('year')
      .y('unitsSold')
      .value('unitsSold')(data);

    var chart = d4.groupedColumnChart()
    .xKey('year')
    .yKey('unitsSold')
    .groupsOf(parsedData.data[0].values.length);

    d3.select('#test')
    .datum(parsedData.data)
    .call(chart);

    expect(d3.select('.series0')[0][0]).to.not.be.an('null');
  });

  it('should render a basic line chart', function() {
    var data = [
      { year: '2010', unitsSold:-100, salesman : 'Bob' },
      { year: '2011', unitsSold:200, salesman : 'Bob' },
      { year: '2012', unitsSold:300, salesman : 'Bob' },
      { year: '2013', unitsSold:400, salesman : 'Bob' },
      { year: '2014', unitsSold:500, salesman : 'Bob' },
      { year: '2010', unitsSold:100, salesman : 'Gina' },
      { year: '2011', unitsSold:100, salesman : 'Gina' },
      { year: '2012', unitsSold:-100, salesman : 'Gina' },
      { year: '2013', unitsSold:500, salesman : 'Gina' },
      { year: '2014', unitsSold:600, salesman : 'Gina' },
      { year: '2010', unitsSold:400, salesman : 'Average' },
      { year: '2011', unitsSold:0, salesman : 'Average' },
      { year: '2012', unitsSold:400, salesman : 'Average' },
      { year: '2013', unitsSold:400, salesman : 'Average' },
      { year: '2014', unitsSold:400, salesman : 'Average' }
    ];
    var parsedData = d4.parsers.nestedGroup()
      .x(function(){
        return 'year';
      })
      .nestKey(function(){
        return 'salesman';
      })
      .y(function(){
        return 'unitsSold';
      })
      .value(function(){
        return 'unitsSold';
      })(data);

    var chart = d4.lineChart()
    .xKey('year')
    .yKey('unitsSold');

    d3.select('#test')
    .datum(parsedData.data)
    .call(chart);
    expect(d3.select('.series0')[0][0]).to.not.be.an('null');
  });

  it('should render a basic row chart', function() {
    var data = [
        { x: '2010', y:-10 },
        { x: '2011', y:20 },
        { x: '2012', y:30 },
        { x: '2013', y:40 },
        { x: '2014', y:50 },
      ];
    var chart = d4.rowChart();
    d3.select('#test')
    .datum(data)
    .call(chart);
    expect(d3.select('.series0')[0][0]).to.not.be.an('null');
  });

  it('should render a basic stacked column chart', function() {
    var data = [
        { year: '2010', unitsSold: -200, salesman : 'Bob' },
        { year: '2011', unitsSold: 200, salesman : 'Bob' },
        { year: '2012', unitsSold: 300, salesman : 'Bob' },
        { year: '2013', unitsSold: 400, salesman : 'Bob' },
        { year: '2014', unitsSold: 500, salesman : 'Bob' },
        { year: '2010', unitsSold: 100, salesman : 'Gina' },
        { year: '2011', unitsSold: 100, salesman : 'Gina' },
        { year: '2012', unitsSold: -200, salesman : 'Gina' },
        { year: '2013', unitsSold: 500, salesman : 'Gina' },
        { year: '2014', unitsSold: 600, salesman : 'Gina' },
        { year: '2010', unitsSold: 400, salesman : 'Average' },
        { year: '2011', unitsSold: 0, salesman : 'Average' },
        { year: '2012', unitsSold: 400, salesman : 'Average' },
        { year: '2013', unitsSold: 400, salesman : 'Average' },
        { year: '2014', unitsSold: 400, salesman : 'Average' }
      ];

    var parsedData = d4.parsers.nestedStack()
      .x(function(){
        return 'year';
      })
      .y(function(){
        return 'salesman';
      })
      .value(function(){
        return 'unitsSold';
      })(data);

    var chart = d4.stackedColumnChart()
    .xKey('year')
    .yKey('unitsSold');

    d3.select('#test')
    .datum(parsedData.data)
    .call(chart);

    expect(d3.select('.series0')[0][0]).to.not.be.an('null');
  });

  it('should render a basic scatter plot', function() {
    var data = [
        { age: 12, unitsSold: 0,    month: 1 },
        { age: 22, unitsSold: 200,  month: 2 },
        { age: 42, unitsSold: 300,  month: 3 },
        { age: 32, unitsSold: 400,  month: 4 },
        { age: 22, unitsSold: 500,  month: 5 },
        { age: 12, unitsSold: 100,  month: 6 },
        { age: 72, unitsSold: 100,  month: 7 },
        { age: 42, unitsSold: -200, month: 8 },
        { age: 32, unitsSold: 500,  month: 9 },
        { age: 12, unitsSold: 600,  month: 10 },
        { age: 62, unitsSold: 400,  month: 11 },
        { age: 82, unitsSold: 0,    month: 12 },
        { age: 92, unitsSold: 400,  month: 1 },
        { age: 12, unitsSold: 400,  month: 2 },
        { age: 2 , unitsSold: 400,  month: 2 }
      ];

    var chart = d4.scatterPlot()
    .xKey('age')
    .yKey('month')
    .zKey('unitsSold');

    d3.select('#test')
    .datum(data)
    .call(chart);

    expect(d3.select('.series0')[0][0]).to.not.be.an('null');
  });
  it('should render a basic waterfall chart', function() {
    var data = [{
      'category': 'Job',
      'value': 27
    }, {
      'category': 'Groceries',
      'value': -3
    }, {
      'category': 'Allowance',
      'value': 22
    }, {
      'category': 'Subtotal',
      'value': 'e'
    }, {
      'category': 'Videos',
      'value': -22
    }, {
      'category': 'Coffee',
      'value': -4
    }, {
      'category': 'Total',
      'value': 'e'
    }];
    var parsedData = d4.parsers.waterfall()
      .x(function() {
        return 'category';
      })
      .y(function() {
        return 'value';
      })
      .nestKey(function() {
        return 'category';
      })(data);

    var chart = d4.waterfallChart()
      .xKey('category')
      .yKey('value');

    d3.select('#test')
      .datum(parsedData.data)
      .call(chart);

    expect(d3.select('.series0')[0][0]).to.not.be.an('null');
  });
});