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
  */
  d4.feature('xAxis', function(name) {
    var axis = d3.svg.axis()
    .orient('bottom')
    .tickSize(0);
    var obj = {
      accessors: {
        axis : axis,
        stagger: true,
        x: 0,
        y: function(){
          return this.height - this.margin.top - this.margin.bottom;
        },
      },

      render: function(scope) {
        scope.scale(this.x);
        var x = d4.functor(scope.accessors.x).bind(this)();
        var y = d4.functor(scope.accessors.y).bind(this)();
        var group = this.featuresGroup.append('g').attr('class', 'x axis '+ name)
          .attr('transform', 'translate(' + x + ',' + y + ')')
          .call(scope.axis());
        if (d4.functor(scope.accessors.stagger).bind(this)()) {

          // FIXME: This should be moved into a helper injected using DI.
          group.selectAll('.tick text').call(d4.helpers.staggerTextVertically, 1);
        }
      }
    };

    d4.createAccessorProxy(obj, axis);
    return obj;
  });
}).call(this);
