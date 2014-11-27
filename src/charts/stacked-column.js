(function() {
  'use strict';

  /*
   * The stacked column chart has two axes (`x` and `y`). By default the stacked
   * column expects continious scale for the `y` axis and a discrete scale for
   * the `x` axis. The stacked column has the following default features:
   *
   *##### Features
   *
   * `bars` - series of rects
   * `barLabels` - individual data values inside the stacked rect
   * `connectors` - visual lines that connect the various stacked columns together
   * `columnTotals` - column labels which total the values of each stack.
   * `xAxis` - the axis for the x dimension
   * `yAxis` - the axis for the y dimension
   *
   *##### Example Usage
   *
   *      var data = [
   *          { year: '2010', unitsSold: 200, salesman : 'Bob' },
   *          { year: '2011', unitsSold: 200, salesman : 'Bob' },
   *          { year: '2012', unitsSold: 300, salesman : 'Bob' },
   *          { year: '2013', unitsSold: -400, salesman : 'Bob' },
   *          { year: '2014', unitsSold: -500, salesman : 'Bob' },
   *          { year: '2010', unitsSold: 100, salesman : 'Gina' },
   *          { year: '2011', unitsSold: 100, salesman : 'Gina' },
   *          { year: '2012', unitsSold: 200, salesman : 'Gina' },
   *          { year: '2013', unitsSold: -500, salesman : 'Gina' },
   *          { year: '2014', unitsSold: -600, salesman : 'Gina' },
   *          { year: '2010', unitsSold: 400, salesman : 'Average' },
   *          { year: '2011', unitsSold: 100, salesman : 'Average' },
   *          { year: '2012', unitsSold: 400, salesman : 'Average' },
   *          { year: '2013', unitsSold: -400, salesman : 'Average' },
   *          { year: '2014', unitsSold: -400, salesman : 'Average' }
   *        ];
   *
   *      var parsedData = d4.parsers.nestedStack()
   *        .x(function(){
   *          return 'year';
   *        })
   *        .y(function(){
   *          return 'salesman';
   *        })
   *        .value(function(){
   *          return 'unitsSold';
   *        })(data);
   *
   *      var chart = d4.charts.stackedColumn()
   *      .x(function(x){
   *        x.key('year');
   *      })
   *      .y(function(y){
   *        y.key('unitsSold');
   *      })
   *
   *      d3.select('#example')
   *      .datum(parsedData.data)
   *      .call(chart);
   *
   * @name stackedColumn
   */
  d4.chart('stackedColumn', function stackedColumn() {
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
            return d[this.x.$key];
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
          item[this.x.$key] = d.key;
          item.size = d.values.size;
          item[this.valueKey] = d.values.text;
          return item;
        }.bind(this));
      };

      return {
        accessors: {
          beforeRender: function(data) {
            return calculateStackTotals.bind(this)(data);
          },
          y: function(d) {
            var padding = 5;
            return this.y(d.size) - padding;
          }
        }
      };
    };

    return d4.baseChart()
      .mixin([{
        'name': 'bars',
        'feature': d4.features.rectSeries
      }, {
        'name': 'barLabels',
        'feature': d4.features.stackedLabels
      }, {
        'name': 'connectors',
        'feature': d4.features.stackedColumnConnectors
      }, {
        'name': 'columnTotals',
        'feature': d4.features.columnLabels,
        'overrides': columnLabelsOverrides
      }, {
        'name': 'xAxis',
        'feature': d4.features.xAxis
      }, {
        'name': 'yAxis',
        'feature': d4.features.yAxis
      }]);
  });
}).call(this);
