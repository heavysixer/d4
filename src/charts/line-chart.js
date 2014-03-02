(function() {
  /*!
   * global d3: false
   * global d4: false
   */
  'use strict';

  var lineChartBuilder = function() {
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
  The line series chart is used to compare a series of data elements grouped
  along the xAxis.

   * **lineSeries** - series lines
   * **lineSeriesLabels** - data labels beside the lines
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
      .x(function(){
        return 'year';
      })
      .nestKey(function(){
        return 'salesman';
      })
      .y(function(){
        return 'unitsSold';
      })
      .value(function(){
        return 'unitsSold';
      })(data);

    var chart = d4.lineChart()
    .width($('#example').width())
    .xKey('year')
    .yKey('unitsSold');

    d3.select('#example')
    .datum(parsedData.data)
    .call(chart);

  */
  d4.lineChart = function lineChart() {
    var chart = d4.baseChart({}, lineChartBuilder);
    [{
      'lineSeries': d4.features.lineSeries
    },{
      'lineSeriesLabels': d4.features.lineSeriesLabels
    }, {
      'xAxis': d4.features.xAxis
    }, {
      'yAxis': d4.features.yAxis
    }].forEach(function(feature) {
      chart.mixin(feature);
    });
    return chart;
  };
}).call(this);