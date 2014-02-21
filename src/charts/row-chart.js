(function() {
  /*!
   * global d3: false
   * global d4: false
   */
  'use strict';

  var rowChartBuilder = function() {
    var configureX = function(data) {
      if (!this.parent.x) {
        this.parent.x = d3.scale.linear()
          .domain(d3.extent(data, function(d) {
            return d[this.parent.xKey];
          }.bind(this)));
      }
      this.parent.x.range([0, this.parent.width - this.parent.margin.right - this.parent.margin.left])
      .clamp(true)
      .nice();
    };

    var configureY = function(data) {
      if (!this.parent.y) {
        this.parent.yRoundBands = this.parent.yRoundBands || 0.3;
        this.parent.y = d3.scale.ordinal()
          .domain(data.map(function(d) {
            return d[this.parent.yKey];
          }.bind(this)))
          .rangeRoundBands([this.parent.height - this.parent.margin.top - this.parent.margin.bottom, 0], this.parent.yRoundBands);
      }
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
   The row chart has two axes (`x` and `y`). By default the column chart expects
   linear scale values for the `x` and ordinal scale values on the `y`. The basic column chart
   has four default features:

   * **bars** - series bars
   * **rowLabels** - data labels to the right of the bars
   * **xAxis** - the axis for the x dimension
   * **yAxis** - the axis for the y dimension

##### Example Usage

    var data = [
          { y: '2010', x:-10 },
          { y: '2011', x:20 },
          { y: '2012', x:30 },
          { y: '2013', x:40 },
          { y: '2014', x:50 },
        ];
      var chart = d4.rowChart();
      d3.select('#example')
      .datum(data)
      .call(chart);


  */
  d4.rowChart = function rowChart() {
    var chart = d4.baseChart({
      margin: {
        top: 20,
        right: 40,
        bottom: 20,
        left: 40
      }
    }, rowChartBuilder);
    [{
      'bars': d4.features.rowSeries
    }, {
      'rowLabels': d4.features.rowLabels
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