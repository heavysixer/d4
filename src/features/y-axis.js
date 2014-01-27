/* global d4: false */
(function() {
  'use strict';
  d4.features.yAxis = function(name) {
    return {
      accessors: {
        format: function(yAxis) {
          return yAxis.orient('left').tickSize(0);
        }
      },
      render: function(scope) {
        var yAxis = d3.svg.axis().scale(this.y);
        var formattedAxis = scope.accessors.format.bind(this)(yAxis);
        this.featuresGroup.append('g').attr('class', 'y axis ' + name)
          .attr('transform', 'translate(0,0)')
          .call(formattedAxis);
      }
    };
  };
}).call(this);