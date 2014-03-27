(function() {
  'use strict';

 /*
  * The row chart has two axes (`x` and `y`). By default the column chart expects
  * linear scale values for the `x` and ordinal scale values on the `y`. The basic column chart
  * has four default features:
  *
  *##### Accessors
  *
  * `bars` - series bars
  * `rowLabels` - data labels to the right of the bars
  * `xAxis` - the axis for the x dimension
  * `yAxis` - the axis for the y dimension
  *
  *##### Example Usage
  *
  *      var data = [
  *            { y: '2010', x:-10 },
  *            { y: '2011', x:20 },
  *            { y: '2012', x:30 },
  *            { y: '2013', x:40 },
  *            { y: '2014', x:50 },
  *          ];
  *        var chart = d4.charts.row();
  *        d3.select('#example')
  *        .datum(data)
  *        .call(chart);
  *
  * @name row
  */
  d4.chart('row', function row() {
    var chart = d4.baseChart({
      config: {
        margin: {
          top: 20,
          right: 40,
          bottom: 20,
          left: 40
        },
        valueKey: 'x',
        axes: {
          x: {
            scale: 'linear'
          },
          y: {
            scale: 'ordinal'
          }
        }
      }
    });
    [{
      'bars': d4.features.stackedColumnSeries
    }, {
      'barLabels': d4.features.stackedColumnLabels
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
