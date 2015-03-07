(function() {
  'use strict';

  /*
   * The column chart has two axes (`x` and `y`). By default the column chart expects
   * linear values for the `y` and ordinal values on the `x`. The basic column chart
   * has four default features:
   *
   *##### Features
   *
   * `bars` - series bars
   * `barLabels` - data labels above the bars
   * `xAxis` - the axis for the x dimension
   * `yAxis` - the axis for the y dimension
   *
   *##### Example Usage
   *
   *     var data = [
   *         { x: '2010', y:-10 },
   *         { x: '2011', y:20 },
   *         { x: '2012', y:30 },
   *         { x: '2013', y:40 },
   *         { x: '2014', y:50 },
   *       ];
   *     var chart = d4.charts.column();
   *     d3.select('#example')
   *     .datum(data)
   *     .call(chart);
   *
   * By default d4 expects a series object, which uses the following format: `{ x : '2010', y : 10 }`.
   * The default format may not be desired and so we'll override it:
   *
   *     var data = [
   *       ['2010', -10],
   *       ['2011', 20],
   *       ['2012', 30],
   *       ['2013', 40],
   *       ['2014', 50]
   *     ];
   *     var chart = d4.charts.column()
   *     .x(function(x) {
   *          x.key(0)
   *     })
   *     .y(function(y){
   *          y.key(1);
   *     });
   *
   *     d3.select('#example')
   *     .datum(data)
   *     .call(chart);
   *
   * @name column
   */
  d4.chart('column', function column(config) {
    var _config = config || {};
    return d4.baseChart(_config)
      .mixin([{
        'name': 'bars',
        'feature': d4.features.rectSeries
      }, {
        'name': 'barLabels',
        'feature': d4.features.stackedLabels
      }, {
        'name': 'xAxis',
        'feature': d4.features.xAxis
      }, {
        'name': 'yAxis',
        'feature': d4.features.yAxis
      }]);
  });
}).call(this);
