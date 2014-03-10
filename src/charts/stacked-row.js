(function() {
  /*!
   * global d3: false
   * global d4: false
   */
  'use strict';

  d4.chart('stackedRow', function stackedRow() {
    var columnLabelsOverrides = function() {
      var extractValues = function(data) {
        var arr = [];
        data.map(function(d) {
          d.values.map(function(n) {
            arr.push(n);
          });
        });
        return arr;
      };

      var calculateTotalsAsNest = function(arr) {
        return d3.nest()
          .key(function(d) {
            return d[this.y.$key];
          }.bind(this))

          .rollup(function(leaves) {
            var text = d3.sum(leaves, function(d) {
              return d[this.valueKey];
            }.bind(this));

            var size = d3.sum(leaves, function(d) {
              return Math.max(0, d[this.valueKey]);
            }.bind(this));

            return {
              text: text,
              size: size
            };
          }.bind(this))
          .entries(arr);
      };

      var calculateStackTotals = function(data) {
        return calculateTotalsAsNest.bind(this)(extractValues(data)).map(function(d) {
          var item = {};
          item[this.y.$key] = d.key;
          item.size = d.values.size;
          item[this.valueKey] = d.values.text;
          return item;
        }.bind(this));
      };

      return {
        accessors : {
          x: function(d){
            var padding = 5;
            return this.x(d.size) + padding;
          }
        },
        prepare: function(data) {
          return calculateStackTotals.bind(this)(data);
        }
      };
    };

    var chart = d4.baseChart({
      config: {
        margin: {
          top: 20,
          right: 40,
          bottom: 20,
          left: 40
        },
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
      'connectors': d4.features.stackedColumnConnectors
    }, {
      'columnTotals': d4.features.columnLabels,
      'overrides': columnLabelsOverrides
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