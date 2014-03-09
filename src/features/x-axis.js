(function() {
  /*!
   * global d3: false
   * global d4: false
   */

  'use strict';
  d4.feature('xAxis', function(name) {
    return {
      accessors: {
        format: function(xAxis) {
          return xAxis.orient('bottom').tickSize(0);
        },
        stagger: true
      },
      render: function(scope) {
        var xAxis = d3.svg.axis().scale(this.x);
        var formattedAxis = scope.accessors.format.bind(this)(xAxis);
        var group = this.featuresGroup.append('g').attr('class', 'x axis '+ name)
          .attr('transform', 'translate(0,' + (this.height - this.margin.top - this.margin.bottom) + ')')
          .call(formattedAxis);
        if (d4.functor(scope.accessors.stagger).bind(this)()) {

          // FIXME: This should be moved into a helper injected using DI.
          group.selectAll('.tick text').call(d4.helpers.staggerText, 1);
        }
      }
    };
  });
}).call(this);
