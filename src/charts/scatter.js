(function() {
  'use strict';

  var scatterPlotBuilder = function() {
    var configureScales = function(chart, data) {
      d4.builders[chart.x.$scale + 'ScaleForNestedData'](chart, data, 'x');
      d4.builders[chart.y.$scale + 'ScaleForNestedData'](chart, data, 'y');
      d4.builders[chart.z.$scale + 'ScaleForNestedData'](chart, data, 'z');
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

  /*
   * The scatter plot has three axes (`x`, `y` and `z`). By default the scatter
   * plot expects linear scale values for all axes. The basic scatter plot chart
   * has these default features:
   *
   *##### Accessors
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
    var chart = d4.baseChart({
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
    });
    [{
      'circles': d4.features.dotSeries
    },{
      'circleLabels': d4.features.stackedColumnLabels
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
