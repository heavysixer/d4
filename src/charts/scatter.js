(function() {
  /*!
   * global d3: false
   * global d4: false
   */
  'use strict';

  var scatterPlotBuilder = function() {
    var configureScales = function(chart, data) {
      if(!chart.x){
        d4.builders.linearScaleForNestedData(chart, data, 'x');
      }

      if(!chart.y){
        d4.builders.linearScaleForNestedData(chart, data, 'y');
      }

      if(!chart.z){
        d4.builders.linearScaleForNestedData(chart, data, 'z');
        var min = 5;
        var max = Math.max(min + 1, (chart.height - chart.margin.top - chart.margin.bottom)/10);
        chart.z.range([min, max]);
      }
    };

    var builder = {
      link: function(chart, data) {
        configureScales.bind(this)(chart, data);
      }
    };
    return builder;
  };

  d4.chart('scatterPlot', function() {
    var chart = d4.baseChart(scatterPlotBuilder, {
      axes : {
        z : {
          kind : 'linear'
        }
      }
    });
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
  });
}).call(this);
