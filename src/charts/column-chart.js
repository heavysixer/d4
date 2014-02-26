(function() {
  /*!
   * global d3: false
   * global d4: false
   */
  'use strict';
  var columnChartBuilder = function() {
    var extractValues = function(data, key) {
      var values = data.map(function(obj){
        return obj.values.map(function(i){
          return i[key];
        }.bind(this));
      }.bind(this));
      return d3.merge(values);
    };

    var configureX = function(chart, data) {
      if (!chart.x) {
        var xData = extractValues(data, chart.xKey);
        chart.xRoundBands = chart.xRoundBands || 0.3;
        chart.x = d3.scale.ordinal()
          .domain(xData)
          .rangeRoundBands([0, chart.width - chart.margin.left - chart.margin.right], chart.xRoundBands);
      }
    };

    var configureY = function(chart, data) {
      if (!chart.y) {
        var ext = d3.extent(d3.merge(data.map(function(obj){
          return d3.extent(obj.values, function(d){
            return d[chart.yKey] + (d.y0 || 0);
          });
        })));
        chart.y = d3.scale.linear().domain([Math.min(0, ext[0]),ext[1]]);
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
  };
}).call(this);
