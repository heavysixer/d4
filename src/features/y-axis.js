(function() {
  /*!
   * global d3: false
   * global d4: false
   */

  'use strict';
  d4.feature('yAxis', function(name) {

    return {
      accessors: {
        format: function(yAxis) {
          return yAxis.orient('left').tickSize(0);
        },
        stagger: true
      },
      render: function(scope) {
        var yAxis = d3.svg.axis().scale(this.y);
        var formattedAxis = scope.accessors.format.bind(this)(yAxis);
        var group = this.featuresGroup.append('g').attr('class', 'y axis ' + name)
          .attr('transform', 'translate(0,0)')
          .call(formattedAxis)
          .selectAll('.tick text')
          .call(d4.helpers.wrapText, this.margin.left);
        if (d4.functor(scope.accessors.stagger).bind(this)()) {

          // FIXME: This should be moved into a helper injected using DI.
          this.svg.selectAll('.y.axis .tick text').call(d4.helpers.staggerTextHorizontally, -1);
        }
      }
    };
  });
}).call(this);
