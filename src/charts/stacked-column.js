(function() {
  /*!
   * global d3: false
   * global d4: false
   */
  'use strict';

  d4.chart('stackedColumn', function stackedColumnChart() {
    var chart = d4.baseChart();
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
