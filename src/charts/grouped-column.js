(function() {
  'use strict';

  /*
   * The grouped column chart is used to compare a series of data elements grouped
   * along the xAxis. This chart is often useful in conjunction with a stacked column
   * chart because they can use the same data series, and where the stacked column highlights
   * the sum of the data series across an axis the grouped column can be used to show the
   * relative distribution.
   *
   *##### Features
   *
   * `bars` - series bars
   * `barLabels` - data labels above the bars
   * `groupsOf` - an integer representing the number of columns in each group
   * `xAxis` - the axis for the x dimension
   * `yAxis` - the axis for the y dimension
   *
   *##### Example Usage
   *
   *     var data = [
   *       { year: '2010', unitsSold:-100, salesman : 'Bob' },
   *       { year: '2011', unitsSold:200, salesman : 'Bob' },
   *       { year: '2012', unitsSold:300, salesman : 'Bob' },
   *       { year: '2013', unitsSold:400, salesman : 'Bob' },
   *       { year: '2014', unitsSold:500, salesman : 'Bob' },
   *       { year: '2010', unitsSold:100, salesman : 'Gina' },
   *       { year: '2011', unitsSold:100, salesman : 'Gina' },
   *       { year: '2012', unitsSold:-100, salesman : 'Gina' },
   *       { year: '2013', unitsSold:500, salesman : 'Gina' },
   *       { year: '2014', unitsSold:600, salesman : 'Gina' },
   *       { year: '2010', unitsSold:400, salesman : 'Average' },
   *       { year: '2011', unitsSold:0, salesman : 'Average' },
   *       { year: '2012', unitsSold:400, salesman : 'Average' },
   *       { year: '2013', unitsSold:400, salesman : 'Average' },
   *       { year: '2014', unitsSold:400, salesman : 'Average' }
   *     ];
   *
   *     var parsedData = d4.parsers.nestedGroup()
   *       .x('year')
   *       .y('unitsSold')
   *       .value('unitsSold')(data);
   *
   *     var chart = d4.charts.groupedColumn()
   *     .width($('#example').width())
   *     .x.$key('year')
   *     .y.$key('unitsSold')
   *     .groupsOf(parsedData.data[0].values.length);
   *
   *     d3.select('#example')
   *     .datum(parsedData.data)
   *     .call(chart);
   *
   * @name groupedColumn
   */
  d4.chart('groupedColumn', function groupedColumn() {
    var columnLabelOverrides = function() {
      return {
        accessors: {
          x: function(d, i) {
            var width = this.x.rangeBand() / this.groupsOf;
            var xPos = this.x(d[this.x.$key]) + width * i;
            var gutter = width * 0.1;
            return xPos + width / 2 - gutter;
          }
        }
      };
    };

    return d4.baseChart({
        config: {
          accessors: {
            groupsOf: 1
          }
        }
      })
      .mixin([{
        'name': 'bars',
        'feature': d4.features.groupedColumnSeries
      }, {
        'name': 'barLabels',
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
