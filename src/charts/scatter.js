(function() {
  'use strict';

  var scatterPlotBuilder = function() {
    var configureScales = function(chart, data) {
      d4.builders[chart.x.$scale + 'ScaleForNestedData'](chart, data, 'x');
      d4.builders[chart.y.$scale + 'ScaleForNestedData'](chart, data, 'y');
      d4.builders[chart.z.$scale + 'ScaleForNestedData'](chart, data, 'z');

      // FIXME: Remove this hard coding.
      var min = 5;
      var max = Math.max(min + 1, (chart.height - chart.margin.top - chart.margin.bottom) / 10);
      chart.z.range([min, max]);
    };

    var builder = {
      link: function(chart, data) {
        configureScales.bind(this)(chart, data);
      }
    };
    return builder;
  };
  var useDiscretePosition = function(dimension, d) {
    var axis = this[dimension];
    return axis(d[axis.$key]) + (axis.rangeBand() / 2);
  };

  var useContinuousPosition = function(dimension, d) {
    var axis = this[dimension];
    var offset = Math.abs(axis(d.y0) - axis(d.y0 + d.y)) / 2;

    // FIXME: Remove this hardcoding.
    var padding = 10;
    var val;
    if (dimension === 'x') {
      offset *= -1;
      padding *= -1;
    }
    if (d4.isDefined(d.y0)) {
      val = d.y0 + d.y;
      return axis(val) + offset;
    } else {
      return axis(d[axis.$key]) - padding;
    }
  };

  var stackedLabelOverrides = function() {
    return {
      accessors: {
        x: function(d) {
          if (d4.isOrdinalScale(this.x)) {
            return useDiscretePosition.bind(this)('x', d);
          } else {
            return useContinuousPosition.bind(this)('x', d);
          }
        },

        y: function(d) {
          if (d4.isOrdinalScale(this.y)) {
            return useDiscretePosition.bind(this)('y', d);
          } else {
            return useContinuousPosition.bind(this)('y', d);
          }
        }
      }
    };
  };

  var circleOverrides = function() {
    return {
      accessors: {
        cx: function(d) {
          return this.x(d[this.x.$key]);
        },

        cy: function(d) {
          return this.y(d[this.y.$key]);
        },

        r: function(d) {
          return this.z(d[this.z.$key]);
        }
      }
    };
  };

  /*
   * The scatter plot has three axes (`x`, `y` and `z`). By default the scatter
   * plot expects linear scale values for all axes. The basic scatter plot chart
   * has these default features:
   *
   *##### Features
   *
   * `circles` - series of circles
   * `xAxis` - the axis for the x dimension
   * `yAxis` - the axis for the y dimension
   *
   *##### Example Usage
   *
   *      var data = [
   *        { age: 12, unitsSold: 0,    month: 1 },
   *        { age: 22, unitsSold: 200,  month: 2 },
   *        { age: 42, unitsSold: 300,  month: 3 },
   *        { age: 32, unitsSold: 400,  month: 4 },
   *        { age: 2 , unitsSold: 400,  month: 2 }
   *      ];
   *
   *      var chart = d4.charts.scatterPlot()
   *      .x(function(x){
   *        x.min(-10)
   *        x.key('age');
   *      })
   *      .y(function(y){
   *        y.key('month');
   *      })
   *      .z(function(z){
   *        z.key('unitsSold');
   *      });
   *
   *      d3.select('#example')
   *      .datum(data)
   *      .call(chart);
   *
   * @name scatterPlot
   */
  d4.chart('scatterPlot', function scatterPlot() {
    return d4.baseChart({
        builder: scatterPlotBuilder,
        config: {
          axes: {
            x: {
              scale: 'linear'
            },
            z: {
              scale: 'linear'
            }
          }
        }
      })
      .mixin([{
        'name': 'circles',
        'feature': d4.features.circleSeries,
        'overrides': circleOverrides
      }, {
        'name': 'circleLabels',
        'feature': d4.features.stackedLabels,
        'overrides': stackedLabelOverrides
      }, {
        'name': 'xAxis',
        'feature': d4.features.xAxis
      }, {
        'name': 'yAxis',
        'feature': d4.features.yAxis
      }]);
  });
}).call(this);
