(function() {
  /*!
   * global d3: false
   * global d4: false
   */
  'use strict';

  var columnChartBuilder = function() {
    var builder = {
      link: function(chart, data) {
        d4.builders.ordinalScaleForNestedData(chart, data, 'x');
        d4.builders.linearScaleForNestedData(chart, data, 'y');
      }
    };
    return builder;
  };

  /*
   The column chart has two axes (`x` and `y`). By default the column chart expects
   linear values for the `y` and ordinal values on the `x`. The basic column chart
   has four default features:

   * **bars** - series bars
   * **barLabels** - data labels above the bars
   * **xAxis** - the axis for the x dimension
   * **yAxis** - the axis for the y dimension

##### Example Usage

    var data = [
        { x: '2010', y:-10 },
        { x: '2011', y:20 },
        { x: '2012', y:30 },
        { x: '2013', y:40 },
        { x: '2014', y:50 },
      ];
    var chart = d4.charts.column();
    d3.select('#example')
    .datum(data)
    .call(chart);

By default d4 expects a series object, which uses the following format: `{ x : '2010', y : 10 }`.
The default format may not be desired and so we'll override it:

    var data = [
      ['2010', -10],
      ['2011', 20],
      ['2012', 30],
      ['2013', 40],
      ['2014', 50]
    ];
    var chart = d4.charts.column()
    .x.$key(0)
    .y.$key(1);

    d3.select('#example')
    .datum(data)
    .call(chart);

  */
  d4.chart('column', function columnChart() {
    var chart = d4.baseChart(columnChartBuilder);
    [{
      'bars': d4.features.stackedColumnSeries
    }, {
      'barLabels': d4.features.stackedColumnLabels
    }, {
      'xAxis': d4.features.xAxis
    }, {
      'yAxis': d4.features.yAxis
    }].forEach(function(feature) {
      chart.mixin(feature);
    });
    return chart;
  });
}).call(this);
