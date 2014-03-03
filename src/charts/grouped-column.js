(function() {
  /*!
   * global d3: false
   * global d4: false
   */
  'use strict';

  var groupedColumnChartBuilder = function() {
    var builder = {
      configure: function(chart, data) {
        if(!chart.x){
          d4.builders.ordinalScaleForNestedData(chart, data, 'x');
        }
        if(!chart.y){
          d4.builders.linearScaleForNestedData(chart, data, 'y');
        }
      }
    };
    return builder;
  };

  /*
The grouped column chart is used to compare a series of data elements grouped
along the xAxis. This chart is often useful in conjunction with a stacked column
chart because they can use the same data series, and where the stacked column highlights
the sum of the data series across an axis the grouped column can be used to show the
relative distribution.

   * **bars** - series bars
   * **barLabels** - data labels above the bars
   * **groupsOf** - an integer representing the number of columns in each group
   * **xAxis** - the axis for the x dimension
   * **yAxis** - the axis for the y dimension

##### Example Usage

    var data = [
      { year: '2010', unitsSold:-100, salesman : 'Bob' },
      { year: '2011', unitsSold:200, salesman : 'Bob' },
      { year: '2012', unitsSold:300, salesman : 'Bob' },
      { year: '2013', unitsSold:400, salesman : 'Bob' },
      { year: '2014', unitsSold:500, salesman : 'Bob' },
      { year: '2010', unitsSold:100, salesman : 'Gina' },
      { year: '2011', unitsSold:100, salesman : 'Gina' },
      { year: '2012', unitsSold:-100, salesman : 'Gina' },
      { year: '2013', unitsSold:500, salesman : 'Gina' },
      { year: '2014', unitsSold:600, salesman : 'Gina' },
      { year: '2010', unitsSold:400, salesman : 'Average' },
      { year: '2011', unitsSold:0, salesman : 'Average' },
      { year: '2012', unitsSold:400, salesman : 'Average' },
      { year: '2013', unitsSold:400, salesman : 'Average' },
      { year: '2014', unitsSold:400, salesman : 'Average' }
    ];

    var parsedData = d4.parsers.nestedGroup()
      .x('year')
      .y('unitsSold')
      .value('unitsSold')(data);

    var chart = d4.charts.groupedColumn()
    .width($('#example').width())
    .xKey('year')
    .yKey('unitsSold')
    .groupsOf(parsedData.data[0].values.length);

    d3.select('#example')
    .datum(parsedData.data)
    .call(chart);

  */
  d4.chart('groupedColumn', function groupedColumnChart() {
    var chart = d4.baseChart(groupedColumnChartBuilder, {
      accessors: ['groupsOf'],
      groupsOf: 1
    });
    [{
      'bars': d4.features.groupedColumnSeries
    }, {
      'columnLabels': d4.features.groupedColumnLabels
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
