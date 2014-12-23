(function() {
  'use strict';

  var columnSeriesOverrides = function waterfall() {
    return {
      accessors: {
        y: function(d) {
          if (d4.isContinuousScale(this.y)) {
            var yVal = (d.y0 + d.y) - Math.min(0, d.y);
            return this.y(yVal);
          } else {
            return this.y(d[this.y.$key]);
          }
        },

        x: function(d) {
          if (d4.isOrdinalScale(this.x)) {
            return this.x(d[this.x.$key]);
          } else {
            var xVal = (d.y0 + d.y) - Math.max(0, d.y);
            return this.x(xVal);
          }
        },

        width: function(d) {
          if (d4.isOrdinalScale(this.x)) {
            return this.x.rangeBand();
          } else {
            return Math.abs(this.x(d.y0) - this.x(d.y0 + d.y));
          }
        },

        height: function(d) {
          if (d4.isContinuousScale(this.y)) {
            return Math.abs(this.y(d.y0) - this.y(d.y0 + d.y));
          } else {
            return this.y.rangeBand();
          }
        },

        classes: function(d, i, n) {
          var klass = (d.y > 0) ? 'positive' : 'negative';
          if (n > 0 && d.y0 === 0) {
            klass = 'subtotal';
          }
          return 'bar fill item' + i + ' ' + klass + ' ' + d[this.y.$key];
        }
      }
    };
  };

  var columnLabelOverrides = function() {
    return {
      accessors: {
        y: function(d) {
          if (d4.isContinuousScale(this.y)) {
            var height = Math.abs(this.y(d.y0) - this.y(d.y0 + d.y));
            var yVal = (d.y0 + d.y) - Math.max(0, d.y);
            return this.y(yVal) - 10 - height;
          } else {
            return this.y(d[this.y.$key]) + (this.y.rangeBand() / 2);
          }
        },

        x: function(d) {
          if (d4.isOrdinalScale(this.x)) {
            return this.x(d[this.x.$key]) + (this.x.rangeBand() / 2);
          } else {
            var xVal = (d.y0 + d.y) - Math.max(0, d.y);
            var width = Math.abs(this.x(d.y0) - this.x(d.y0 + d.y));
            return this.x(xVal) + 10 + width;
          }
        },

        text: function(d) {
          return d[this.valueKey];
        }
      }
    };
  };

  var waterfallChartBuilder = function() {
    var rangeBoundsFor = function(chart, dimension) {
      var rangeBounds;
      if (dimension === 'x') {
        return [0, chart.width];
      } else {
        rangeBounds = [0, chart.height];
        return (d4.isOrdinalScale(chart.x)) ? rangeBounds.reverse() : rangeBounds;
      }
    };

    var setOrdinal = function(chart, dimension, data) {
      var keys = data.map(function(d) {
        return d.key;
      }.bind(this));

      chart[dimension]
        .domain(keys)
        .rangeRoundBands(rangeBoundsFor.bind(this)(chart, dimension), chart.xRoundBands || 0.3);
    };

    var setLinear = function(chart, dimension, data) {
      var ext = d3.extent(d3.merge(data.map(function(datum) {
        return d3.extent(datum.values, function(d) {

          // This is anti-intuative but the stack only returns y and y0 even
          // when it applies to the x dimension;
          return d.y + d.y0;
        });
      })));

      ext[0] = d4.isDefined(chart[dimension].$min) ? chart[dimension].$min : Math.min(0, ext[0]);

      if(d4.isDefined(chart[dimension].$max)){
        ext[1] = chart[dimension].$max;
      }

      chart[dimension].domain(ext);
      chart[dimension].range(rangeBoundsFor.bind(this)(chart, dimension))
        .clamp(true)
        .nice();
    };

    var configureScales = function(chart, data) {
      if (d4.isOrdinalScale(chart.x)) {
        setOrdinal.bind(this)(chart, 'x', data);
        setLinear.bind(this)(chart, 'y', data);
      } else {
        setOrdinal.bind(this)(chart, 'y', data);
        setLinear.bind(this)(chart, 'x', data);
      }
    };

    var builder = {
      link: function(chart, data) {
        configureScales.bind(this)(chart, data);
      }
    };
    return builder;
  };

  /*
   * The waterfall chart visually tallies the cumulative result of negative and
   * positive values over a data series. In addition to specifying the normal
   * positive and negative values d4's also lets you designate a column as a subtotal
   * column by passing in an "e" as the value key, which may be a familiar convention
   * if you have used think-cell.
   *
   * The waterfall chart has two axes (`x` and `y`). By default the stacked
   * column expects continious scale for the `y` axis and a discrete scale for
   * the `x` axis. This will render the waterfall chart vertically. However,
   * if you swap the scale types then the waterfall will render horizontally.
   *
   *##### Features
   *
   * `bars` - series of rects
   * `connectors` - visual lines that connect the various stacked columns together
   * `columnLabels` - column labels which total the values of each rect.
   * `xAxis` - the axis for the x dimension
   * `yAxis` - the axis for the y dimension
   *
   *##### Example Usage
   *
   *      var data = [
   *          { 'category': 'Job',       'value': 27  },
   *          { 'category': 'Groceries', 'value': -3  },
   *          { 'category': 'Allowance', 'value': 22  },
   *          { 'category': 'Subtotal',  'value': 'e' },
   *          { 'category': 'Videos',    'value': -22 },
   *          { 'category': 'Coffee',    'value': -4  },
   *          { 'category': 'Total',     'value': 'e' }
   *        ];
   *        var parsedData = d4.parsers.waterfall()
   *          .x(function() {
   *            return 'category';
   *          })
   *          .y(function() {
   *            return 'value';
   *          })
   *          .nestKey(function() {
   *            return 'category';
   *          })(data);
   *
   *        var chart = d4.charts.waterfall()
   *          .width($('#example').width())
   *          .x(function(x){
   *            x.key('category');
   *          })
   *          .y(function(y){
   *            y.key('value');
   *          });
   *
   *        d3.select('#example')
   *          .datum(parsedData.data)
   *          .call(chart);
   *
   * @name waterfall
   */
  d4.chart('waterfall', function waterfallChart() {
    return d4.baseChart({
      builder: waterfallChartBuilder
    })
      .mixin([{
        'name': 'bars',
        'feature': d4.features.rectSeries,
        'overrides': columnSeriesOverrides
      }, {
        'name': 'connectors',
        'feature': d4.features.waterfallConnectors
      }, {
        'name': 'columnLabels',
        'feature': d4.features.stackedLabels,
        'overrides': columnLabelOverrides
      }, {
        'name': 'xAxis',
        'feature': d4.features.xAxis
      }, {
        'name': 'yAxis',
        'feature': d4.features.yAxis
      }]);
  });
}).call(this);
