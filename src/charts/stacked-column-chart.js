(function() {
  /* global d3: false */
  /* global d4: false */
  'use strict';

  var stackedColumnChartBuilder = function() {
    var extractValues = function(data, key) {
      var values = data.map(function(obj){
        return obj.values.map(function(i){
          return i[key];
        }.bind(this));
      }.bind(this));
      return d3.merge(values);
    };

    var configureX = function(data) {
      if (!this.parent.x) {
        var xData = extractValues(data, this.parent.xKey);
        this.parent.xRoundBands = this.parent.xRoundBands || 0.3;
        this.parent.x = d3.scale.ordinal()
          .domain(xData)
          .rangeRoundBands([0, this.parent.width - this.parent.margin.left - this.parent.margin.right], this.parent.xRoundBands);
      }
    };

    var configureY = function(data) {
      if (!this.parent.y) {
        var ext = d3.extent(d3.merge(data.map(function(obj){
          return d3.extent(obj.values, function(d){
            return d.y + d.y0;
          });
        })));
        this.parent.y = d3.scale.linear().domain([Math.min(0, ext[0]),ext[1]]);
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

  d4.stackedColumnChart = function stackedColumnChart() {
    var chart = d4.baseChart({}, stackedColumnChartBuilder);
    [{
      'bars': d4.features.stackedColumnSeries
    }, {
      'columnLabels': d4.features.stackedColumnLabels
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
  };
}).call(this);
