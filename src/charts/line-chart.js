(function() {
  /* global d3: false */
  /* global d4: false */
  'use strict';

  var lineChartBuilder = function() {
    var mapDomain = function(data, key) {
      return d3.extent(data.map(function(d) {
        return d[key];
      }));
    };

    var configureX = function(data) {
      if (!this.parent.x) {

        this.parent.x = d3.time.scale(this.parent.x)
          .domain(mapDomain(data, this.parent.xKey()))
          .nice()
          .clamp(true);
      }
      this.parent.x.range([0, this.parent.width - this.parent.margin.left - this.parent.margin.right]);
    };

    var configureY = function(data) {
      if (!this.parent.y) {
        this.parent.y = d3.scale.linear()
          .domain(mapDomain(data, this.parent.yKey()));
      }
      this.parent.y.range([this.parent.height - this.parent.margin.top - this.parent.margin.bottom, 0]);
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

  d4.lineChart = function lineChart() {
    var chart = d4.baseChart({}, lineChartBuilder);
    [{
      'linesSeries': d4.features.lineSeries
    },{
      'linesSeriesLabels': d4.features.lineSeriesLabels
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