/* global d4: false */
(function() {
  'use strict';
  d4.features.xAxis = function(name) {
    return {
      accessors: {
        format: function(xAxis) {
          return xAxis.orient('bottom').tickSize(0);
        }
      },
      render: function(scope) {
        var xAxis = d3.svg.axis().scale(this.x);
        var formattedAxis = scope.accessors.format.bind(this)(xAxis);
        this.featuresGroup.append('g').attr('class', 'x axis '+ name)
          .attr('transform', 'translate(0,' + (this.height - this.margin.top - this.margin.bottom) + ')')
          .call(formattedAxis);
      }
    };
  };
}).call(this);
