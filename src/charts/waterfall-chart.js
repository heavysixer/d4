(function() {
  /* global d3: false */
  /* global d4: false */
  'use strict';

  // This accessor can be overridden
  var orientation = function(){
    return 'vertical';
  };


  var waterfallChartBuilder = function() {
    var configureX = function(data) {
      if (!this.parent.x) {
        var keys = data.map(function(d){
          return d.key;
        }.bind(this));

        this.parent.x = d3.scale.ordinal()
        .domain(keys)
        .rangeRoundBands([0, this.parent.width - this.parent.margin.left - this.parent.margin.right], this.parent.xRoundBands || 0.3);
      }
    };

    var configureY = function(data) {
      if (!this.parent.y) {
        var ext = d3.extent(d3.merge(data.map(function(datum) {
            return d3.extent(datum.values, function(d) {

              // This is anti-intuative but the stack only returns y and y0 even
              // when it applies to the x dimension;
              return d.y + d.y0;
            });
          })));
        ext[0] = Math.min(0, ext[0]);
        this.parent.y =  d3.scale.linear()
          .domain(ext);
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

  d4.waterfallChart = function waterfallChart() {
    var chart = d4.baseChart({
      accessors: ['orientation'],
      orientation: orientation
    }, waterfallChartBuilder);
    [{
      'bars': d4.features.waterfallColumnSeries
    },
    { 'connectors': d4.features.waterfallConnectors
    },
    {
      'columnLabels': d4.features.stackedColumnLabels
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
