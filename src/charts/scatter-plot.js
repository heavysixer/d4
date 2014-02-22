(function() {
  /*!
   * global d3: false
   * global d4: false
   */
  'use strict';

  var scatterPlotBuilder = function() {
    var configureX = function(chart, data) {
      if (!chart.x) {
        var ext = d3.extent(data, function(d) {
          return d[chart.xKey];
        }.bind(this));
        chart.x = d3.scale.linear()
          .domain(ext)
          .nice()
          .clamp(true);
      }
      chart.x.range([0, chart.width - chart.margin.left - chart.margin.right]);
    };

    var configureY = function(chart, data) {
      if (!chart.y) {
        var ext = d3.extent(data, function(d) {
          return d[chart.yKey];
        }.bind(this));
        chart.y = d3.scale.linear()
          .domain(ext)
          .nice()
          .clamp(true);
      }
      chart.y.range([chart.height - chart.margin.top - chart.margin.bottom, 0]);
    };

    var configureZ = function(chart, data) {
      if (!chart.z) {
        var ext = d3.extent(data, function(d) {
          return d[chart.zKey];
        }.bind(this));
        chart.z = d3.scale.linear()
          .domain(ext)
          .nice()
          .clamp(true);
      }
      var maxSize = (chart.height - chart.margin.top - chart.margin.bottom);
      chart.z.range([maxSize / data.length, maxSize / (data.length * 5)]);
    };
    var configureScales = function(chart, data) {
      configureX.bind(this)(chart, data);
      configureY.bind(this)(chart, data);
      configureZ.bind(this)(chart, data);
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

  d4.scatterPlot = function() {
    var chart = d4.baseChart({
      accessors: ['z', 'zKey'],
      zKey: 'z'
    }, scatterPlotBuilder);
    [{
      'scatterSeries': d4.features.scatterSeries
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
