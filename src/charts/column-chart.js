(function() {
  /* global d3: false */
  /* global d4: false */
  'use strict';

  var columnChartBuilder = function() {
    var configureX = function(data) {
      if (!this.parent.x) {
        this.parent.xRoundBands = this.parent.xRoundBands || 0.3;
        this.parent.x = d3.scale.ordinal()
          .domain(data.map(function(d) {
            return d[this.xKey];
          }.bind(this.parent)))
          .rangeRoundBands([0, this.parent.width - this.parent.margin.left - this.parent.margin.right], this.parent.xRoundBands);
      }
    };

    var configureY = function(data) {
      if (!this.parent.y) {
        this.parent.y = d3.scale.linear()
          .domain(d3.extent(data, function(d) {
            return d[this.yKey];
          }.bind(this.parent)));
      }
      this.parent.y.range([this.parent.height - this.parent.margin.top - this.parent.margin.bottom, 0])
        .clamp(true)
        .nice();
    };

    var configureScales = function(data) {
      configureX.bind(this)(data);
      configureY.bind(this)(data);
    };

    var builder = {
      configure: function(data) {
        configureScales.bind(this)(data);
      },
      render: function(data) {
        var parent = this.parent;
        parent.mixins.forEach(function(name) {
          parent.features[name].render.bind(parent)(parent.features[name], data);
        });
      }
    };

    builder.parent = this;
    return builder;
  };

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
