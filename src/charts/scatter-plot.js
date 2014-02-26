(function() {
  /*!
   * global d3: false
   * global d4: false
   */
  'use strict';

  var scatterPlotBuilder = function() {
    var createLinearScale = function(key, data) {
      var ext = d3.extent(d3.merge(data.map(function(obj){
        return d3.extent(obj.values, function(d){
          return d[key];
        });
      })));
      return d3.scale.linear().domain([Math.min(0, ext[0]),ext[1]]);
    };

    var configureX = function(chart, data) {
      if (!chart.x) {
        chart.x = createLinearScale(chart.xKey, data);
      }
      chart.x.range([0, chart.width - chart.margin.left - chart.margin.right])
        .clamp(true)
        .nice();
    };

    var configureY = function(chart, data) {
      if (!chart.y) {
        chart.y = createLinearScale(chart.yKey, data);
      }
      chart.y.range([chart.height - chart.margin.top - chart.margin.bottom, 0]);
    };

    var configureZ = function(chart, data) {
      if (!chart.z) {
        chart.z = createLinearScale(chart.zKey, data);
      }
      var min = 5
      var max = Math.max(min + 1, (chart.height - chart.margin.top - chart.margin.bottom)/10);
      chart.z.range([min, max]);
    };

    var configureScales = function(chart, data) {
      configureX.bind(this)(chart, data);
      configureY.bind(this)(chart, data);
      configureZ.bind(this)(chart, data);
    };

    var builder = {
      configure: function(chart, data) {
        configureScales.bind(this)(chart, data);
      }
    };
    return builder;
  };

  d4.scatterPlot = function() {
    var chart = d4.baseChart({
      accessors: ['z', 'zKey'],
      zKey: 'z'
    }, scatterPlotBuilder);
    [{
      'circles': d4.features.dotSeries
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
