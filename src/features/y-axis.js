(function() {
  /*!
   * global d3: false
   * global d4: false
   */

  'use strict';

  /* This feature creates an xAxis for use within d4. There are a variety of
   * accessors described below which modify the behavior and apperance of the axis.
   *
   *##### Accessors
   * `axis` - The d3 axis object itself.
   * `innerTickSize` - see: https://github.com/mbostock/d3/wiki/SVG-Axes#innerTickSize
   * `orient` - see: https://github.com/mbostock/d3/wiki/SVG-Axes#orient
   * `outerTickSize`- see: https://github.com/mbostock/d3/wiki/SVG-Axes#outerTickSize
   * `scale` - see: https://github.com/mbostock/d3/wiki/SVG-Axes#scale
   * `stagger` - (true | false) determines if the axis should stagger overlapping text (true by default)
   * `tickFormat` - see: https://github.com/mbostock/d3/wiki/SVG-Axes#tickFormat
   * `tickPadding` - see: https://github.com/mbostock/d3/wiki/SVG-Axes#tickPadding
   * `tickSize` - see: https://github.com/mbostock/d3/wiki/SVG-Axes#tickSize
   * `tickSubdivide`- see: https://github.com/mbostock/d3/wiki/SVG-Axes#tickSubdivide
   * `tickValues` - see: https://github.com/mbostock/d3/wiki/SVG-Axes#tickValues
   * `ticks` - see: https://github.com/mbostock/d3/wiki/SVG-Axes#ticks
   *
   *##### Examples
   *
   *     var chart = d4.charts.groupedColumn()
   *     .using('yAxis', function(axis){
   *
   *       // adjust the number of tick marks based on the height of the chart
   *       axis.ticks($('#example').height()/20);
   *
   *       // set the inner and outer tick sizes
   *       axis.tickSize(10,5);
   *
   *       // adjust the tick padding
   *       axis.tickPadding(5);
   *
   *     })
   *     .using('xAxis', function(axis){
   *
   *       // position the tickmarks on the top of the axis line
   *       axis.orient('top');
   *
   *       // move the axis to the top of the chart.
   *       axis.y(-20);
   *     })
   *
   * @name yAxis
  */
  d4.feature('yAxis', function(name) {
    var axis = d3.svg.axis()
    .orient('left')
    .tickSize(0);

    var obj = {
      accessors: {
        axis: axis,
        stagger: true,
        x: 0,
        y: 0,
      },
      render: function(scope) {
        scope.scale(this.y);
        var x = d4.functor(scope.accessors.x).bind(this)();
        var y = d4.functor(scope.accessors.y).bind(this)();
        this.featuresGroup.append('g').attr('class', 'y axis ' + name)
          .attr('transform', 'translate(' + x + ',' + y + ')')
          .call(scope.axis())
          .selectAll('.tick text')
          .call(d4.helpers.wrapText, this.margin.left);
        if (d4.functor(scope.accessors.stagger).bind(this)()) {

          // FIXME: This should be moved into a helper injected using DI.
          this.svg.selectAll('.y.axis .tick text').call(d4.helpers.staggerTextHorizontally, -1);
        }
      }
    };
    d4.createAccessorProxy(obj, axis);
    return obj;
  });
}).call(this);
