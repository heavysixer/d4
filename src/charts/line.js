(function() {
  'use strict';

  /*
   * The line series chart is used to compare a series of data elements grouped
   * along the xAxis.
   *
   *##### Features
   *
   * `lineSeries` - series lines
   * `lineSeriesLabels` - data labels beside the lines
   * `xAxis` - the axis for the x dimension
   * `yAxis` - the axis for the y dimension
   *
   *##### Example Usage
   *
   *      var data = [
   *        { year: '2010', unitsSold:-100, salesman : 'Bob' },
   *        { year: '2011', unitsSold:200, salesman : 'Bob' },
   *        { year: '2012', unitsSold:300, salesman : 'Bob' },
   *        { year: '2013', unitsSold:400, salesman : 'Bob' },
   *        { year: '2014', unitsSold:500, salesman : 'Bob' },
   *        { year: '2010', unitsSold:100, salesman : 'Gina' },
   *        { year: '2011', unitsSold:100, salesman : 'Gina' },
   *        { year: '2012', unitsSold:-100, salesman : 'Gina' },
   *        { year: '2013', unitsSold:500, salesman : 'Gina' },
   *        { year: '2014', unitsSold:600, salesman : 'Gina' },
   *        { year: '2010', unitsSold:400, salesman : 'Average' },
   *        { year: '2011', unitsSold:0, salesman : 'Average' },
   *        { year: '2012', unitsSold:400, salesman : 'Average' },
   *        { year: '2013', unitsSold:400, salesman : 'Average' },
   *        { year: '2014', unitsSold:400, salesman : 'Average' }
   *      ];
   *      var parsedData = d4.parsers.nestedGroup()
   *        .x(function(){
   *          return 'year';
   *        })
   *        .nestKey(function(){
   *          return 'salesman';
   *        })
   *        .y(function(){
   *          return 'unitsSold';
   *        })
   *        .value(function(){
   *          return 'unitsSold';
   *        })(data);
   *
   *      var chart = d4.charts.line()
   *      .width($('#example').width())
   *      .x.$key('year')
   *      .y.$key('unitsSold');
   *
   *      d3.select('#example')
   *      .datum(parsedData.data)
   *      .call(chart);
   *
   * @name line
   */
  d4.chart('line', function line(config) {
    var _config = config || {};
    return d4.baseChart(_config).mixin([{
      'name': 'lineSeries',
      'feature': d4.features.lineSeries
    }, {
      'name': 'xAxis',
      'feature': d4.features.xAxis
    }, {
      'name': 'yAxis',
      'feature': d4.features.yAxis
    }, {
      'name': 'lineSeriesLabels',
      'feature': d4.features.lineSeriesLabels
    }]);
  });
}).call(this);
