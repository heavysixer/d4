(function() {
  /* global d3: false */
  /* global d4: false */
  'use strict';

  var zKey = function(){
    return 'z';
  };

  var scatterPlotBuilder = function() {
    var configureX = function(data) {
      if (!this.parent.x) {
        var ext = d3.extent(data,function(d) {
            return d[this.parent.xKey()];
        }.bind(this))
        this.parent.x = d3.scale.linear()
          .domain(ext)
          .nice()
          .clamp(true);
      }
      this.parent.x.range([0, this.parent.width - this.parent.margin.left - this.parent.margin.right]);
    };

    var configureY = function(data) {
      if (!this.parent.y) {
        var ext = d3.extent(data,function(d) {
            return d[this.parent.yKey()];
        }.bind(this))
        this.parent.y = d3.scale.linear()
          .domain(ext)
          .nice()
          .clamp(true);
      }
      this.parent.y.range([this.parent.height - this.parent.margin.top - this.parent.margin.bottom, 0]);
    };

    var configureZ = function(data) {
      if (!this.parent.z) {
        var ext = d3.extent(data,function(d) {
            return d[this.parent.zKey()];
        }.bind(this))
        this.parent.z = d3.scale.linear()
          .domain(ext)
          .nice()
          .clamp(true);
      }
      var maxSize = (this.parent.height - this.parent.margin.top - this.parent.margin.bottom);
      this.parent.z.range([maxSize / data.length, maxSize / (data.length * 5)]);
    };
    var configureScales = function(data) {
      configureX.bind(this)(data);
      configureY.bind(this)(data);
      configureZ.bind(this)(data);
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

  d4.scatterPlot = function() {
    var chart = d4.baseChart({
      accessors: ['z', 'zKey'],
      zKey: zKey
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
