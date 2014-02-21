(function() {
  /*!
   * global d3: false
   * global d4: false
   */
  'use strict';

  var groupedColumnChartBuilder = function() {
    var extractValues = function(data, key) {
      var values = data.map(function(obj){
        return obj.values.map(function(i){
          return i[key];
        }.bind(this));
      }.bind(this));
      return d3.merge(values);
    };

    var configureX = function(data) {
      if (!this.parent.x) {
        var xData = extractValues(data, this.parent.xKey);
        this.parent.xRoundBands = this.parent.xRoundBands || 0.3;
        this.parent.x = d3.scale.ordinal()
          .domain(xData)
          .rangeRoundBands([0, this.parent.width - this.parent.margin.left - this.parent.margin.right], this.parent.xRoundBands);
      }
    };

    var configureY = function(data) {
      if (!this.parent.y) {
        var yData = extractValues(data, this.parent.yKey);
        var ext = d3.extent(yData);
        this.parent.y = d3.scale.linear().domain([Math.min(0, ext[0]),ext[1]]);
      }
      this.parent.y.range([this.parent.height - this.parent.margin.top - this.parent.margin.bottom, 0])
        .clamp(true)
        .nice();
    };

    var configureScales = function(data) {
      configureX.bind(this)(data);
      configureY.bind(this)(data);
    };

    var builder = {
      configure: function(data) {
        configureScales.bind(this)(data);
      },

      render: function(data) {
        var parent = this.parent;
        parent.mixins.forEach(function(name) {
          parent.features[name].render.bind(parent)(parent.features[name], data);
        });
      }
    };

    builder.parent = this;
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

    var chart = d4.groupedColumnChart()
    .width($('#example').width())
    .xKey('year')
    .yKey('unitsSold')
    .groupsOf(parsedData.data[0].values.length);

    d3.select('#example')
    .datum(parsedData.data)
    .call(chart);

  */
  d4.groupedColumnChart = function groupedColumnChart() {
    var chart = d4.baseChart({
      accessors: ['groupsOf'],
      groupsOf: 1
    }, groupedColumnChartBuilder);
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
  };
}).call(this);
