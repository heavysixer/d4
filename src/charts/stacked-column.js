(function() {
  /*!
   * global d3: false
   * global d4: false
   */
  'use strict';

  var stackedColumnChartBuilder = function() {
    var builder = {
      configure: function(chart, data) {
        if(!chart.x){
          d4.builders.ordinalScaleForNestedData(chart, data, 'x');
        }
        if(!chart.y){
          d4.builders.linearScaleForNestedData(chart, data, 'y');
        }
      }
    };
    return builder;
  };

  d4.chart('stackedColumn', function stackedColumnChart() {
    var chart = d4.baseChart(stackedColumnChartBuilder);
    [{
      'bars': d4.features.stackedColumnSeries
    }, {
      'barLabels': d4.features.stackedColumnLabels
    }, {
      'connectors': d4.features.stackedColumnConnectors
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
