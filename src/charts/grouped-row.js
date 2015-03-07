(function() {
  'use strict';

  /*
   * The grouped row chart is used to compare a series of data elements grouped
   * along the xAxis. This chart is often useful in conjunction with a stacked row
   * chart because they can use the same data series, and where the stacked row highlights
   * the sum of the data series across an axis the grouped row can be used to show the
   * relative distribution.
   *
   *##### Features
   *
   * `bars` - series bars
   * `barLabels` - data labels above the bars
   * `groupsOf` - an integer representing the number of rows in each group
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
   *     var chart = d4.charts.groupedRow()
   *     .width($('#example').width())
   *     .x.$key('year')
   *     .y.$key('unitsSold')
   *     .groupsOf(parsedData.data[0].values.length);
   *
   *     d3.select('#example')
   *     .datum(parsedData.data)
   *     .call(chart);
   *
   * @name groupedRow
   */
  d4.chart('groupedRow', function groupedRow(config) {
    var _config = config || {};
    var rowLabelOverrides = function() {
      return {
        accessors: {
          y: function(d) {
            var groupY = this.y(d[this.y.$key]);
            var rectY = this.groups(d[this.groups.$key]);
            var rectHeightOffset = this.groups.rangeBand() / 3;
            return groupY + rectY + rectHeightOffset;
          }
        }
      };
    };

    return d4.baseChart(d4.extend({
      config: {
        accessors: {
          groupsOf: 1
        },
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
          },
          groups: {
            scale: 'ordinal',
            dimension: 'y',
            roundBands: 0.1
          }
        }
      }
    }, _config))
      .mixin([{
        'name': 'bars',
        'feature': d4.features.groupedColumnSeries
      }, {
        'name': 'barLabels',
        'feature': d4.features.stackedLabels,
        'overrides': rowLabelOverrides
      }, {
        'name': 'xAxis',
        'feature': d4.features.xAxis
      }, {
        'name': 'yAxis',
        'feature': d4.features.yAxis
      }]);
  });
}).call(this);
