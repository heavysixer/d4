(function() {
  'use strict';

  /* This feature creates an xAxis for use within d4. There are a variety of
   * accessors described below which modify the behavior and apperance of the axis.
   *
   *##### Accessors
   *
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
   *       axis.align('top');
   *     })
   *
   * @name xAxis
   */
  d4.feature('xAxis', function(name) {
    var axis = d3.svg.axis()
      .orient('bottom')
      .tickPadding(10)
      .tickSize(0);

    var textRect = function(text, klasses) {
      var rect = d4.helpers.textSize(text, klasses);
      rect.text = text;
      return rect;
    };

    var positionText = function(obj, aligned, klass) {
      if (obj.text) {
        var axis = this.container.selectAll('.x.axis');
        var axisBB = axis.node().getBBox();
        var textHeight = obj.height * 0.8;
        var text = axis.append('text')
          .text(obj.text)
          .attr('class', '' + klass);

        if (aligned.toLowerCase() === 'bottom') {
          text.attr('transform', 'translate(0,' + (axisBB.height + textHeight) + ')');
        } else {
          text.attr('transform', 'translate(0,' + (axisBB.y - (textHeight / 2)) + ')');
        }
      }
    };

    var alignAxis = function(align, axis) {
      switch (true) {
        case align.toLowerCase() === 'top':
          axis.attr('transform', 'translate(0,0)');
          break;
        case align.toLowerCase() === 'bottom':
          axis.attr('transform', 'translate(0,' + this.height + ')');
          break;
      }
    };

    var obj = {
      accessors: {
        align: 'bottom',

        stagger: true,

        subtitle: undefined,

        title: undefined,
      },
      proxies: [{
        target: axis
      }],

      render: function(scope) {
        scope.scale(this.x);
        var title = textRect(d4.functor(scope.accessors.title).bind(this)(), 'title');
        var subtitle = textRect(d4.functor(scope.accessors.subtitle).bind(this)(), 'subtitle');
        var aligned = d4.functor(scope.accessors.align).bind(this)();
        var group = d4.appendOnce(this.container.select('g.margins'), 'g.x.axis.' + name)
          .attr('data-scale', this.x.$scale)
          .call(axis);
        alignAxis.bind(this)(aligned, group);
        if (d4.functor(scope.accessors.stagger).bind(this)()) {

          // FIXME: This should be moved into a helper injected using DI.
          group.selectAll('.tick text').call(d4.helpers.staggerTextVertically, 1);
        }
        if (aligned === 'top') {
          positionText.bind(this)(subtitle, aligned, 'subtitle');
          positionText.bind(this)(title, aligned, 'title');
        } else {
          positionText.bind(this)(title, aligned, 'title');
          positionText.bind(this)(subtitle, aligned, 'subtitle');
        }
        return group;
      }
    };
    return obj;
  });
}).call(this);
