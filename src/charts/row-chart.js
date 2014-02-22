(function() {
  /*!
   * global d3: false
   * global d4: false
   */
  'use strict';

  var rowChartBuilder = function() {
    var configureX = function(chart, data) {
      if (!chart.x) {
        chart.x = d3.scale.linear()
          .domain(d3.extent(data, function(d) {
            return d[chart.xKey];
          }.bind(this)));
      }
      chart.x.range([0, chart.width - chart.margin.right - chart.margin.left])
      .clamp(true)
      .nice();
    };

    var configureY = function(chart, data) {
      if (!chart.y) {
        chart.yRoundBands = chart.yRoundBands || 0.3;
        chart.y = d3.scale.ordinal()
          .domain(data.map(function(d) {
            return d[chart.yKey];
          }.bind(this)))
          .rangeRoundBands([chart.height - chart.margin.top - chart.margin.bottom, 0], chart.yRoundBands);
      }
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
   The row chart has two axes (`x` and `y`). By default the column chart expects
   linear scale values for the `x` and ordinal scale values on the `y`. The basic column chart
   has four default features:

   * **bars** - series bars
   * **rowLabels** - data labels to the right of the bars
   * **xAxis** - the axis for the x dimension
   * **yAxis** - the axis for the y dimension

##### Example Usage

    var data = [
          { y: '2010', x:-10 },
          { y: '2011', x:20 },
          { y: '2012', x:30 },
          { y: '2013', x:40 },
          { y: '2014', x:50 },
        ];
      var chart = d4.rowChart();
      d3.select('#example')
      .datum(data)
      .call(chart);


  */
  d4.rowChart = function rowChart() {
    var chart = d4.baseChart({
      margin: {
        top: 20,
        right: 40,
        bottom: 20,
        left: 40
      }
    }, rowChartBuilder);
    [{
      'bars': d4.features.rowSeries
    }, {
      'rowLabels': d4.features.rowLabels
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