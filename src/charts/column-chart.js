(function() {
  /*!
   * global d3: false
   * global d4: false
   */
  'use strict';
  var columnChartBuilder = function() {
    var configureX = function(chart, data) {
      if (!chart.x) {
        chart.xRoundBands = chart.xRoundBands || 0.3;
        chart.x = d3.scale.ordinal()
          .domain(data.map(function(d) {
            return d[this.xKey];
          }.bind(chart)))
          .rangeRoundBands([0, chart.width - chart.margin.left - chart.margin.right], chart.xRoundBands);
      }
    };

    var configureY = function(chart, data) {
      if (!chart.y) {
        chart.y = d3.scale.linear()
          .domain(d3.extent(data, function(d) {
            return d[this.yKey];
          }.bind(chart)));
      }
      chart.y.range([chart.height - chart.margin.top - chart.margin.bottom, 0])
        .clamp(true)
        .nice();
    };

    var configureScales = function(chart, data) {
      configureX.bind(this)(chart, data);
      configureY.bind(this)(chart, data);
    };

    var builder = {
      configure: function(chart, data) {
        configureScales.bind(this)(chart, data);
      },
      render: function(chart, data) {
        chart.mixins.forEach(function(name) {
          chart.features[name].render.bind(chart)(chart.features[name], data);
        });
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
    var chart = d4.columnChart();
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
    var chart = d4.columnChart()
    .xKey(0)
    .yKey(1);

    d3.select('#example')
    .datum(data)
    .call(chart);

  */
  d4.columnChart = function columnChart() {
    var chart = d4.baseChart({}, columnChartBuilder);
    [{
      'bars': d4.features.columnSeries
    }, {
      'barLabels': d4.features.columnLabels
    }, {
      'xAxis': d4.features.xAxis
    }, {
      'yAxis': d4.features.yAxis
    }].forEach(function(feature) {
      chart.mixin(feature);
    });
    return chart;
  };
}).call(this);
