/* global d4: false */
(function() {
  'use strict';
  d4.features.rowLabels = function(name) {
    return {
      accessors: {
        x: function(d) {
          return this.x(Math.min(0, d[0])) + Math.abs(this.x(d[0]) - this.x(0)) + 5;
        },

        y: function(d) {
          return this.y(d[1]) + (this.y.rangeBand() / 2);
        },

        text: function(d) {
          return d3.format('').call(this, d[0]);
        }
      },
      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var label = this.svg.select('.'+name).selectAll('.'+name).data(data);
        label.enter().append('text');
        label.exit().remove();
        label.attr('class', 'column-label')
          .text(scope.accessors.text.bind(this))
          .attr('x', scope.accessors.x.bind(this))
          .attr('y', scope.accessors.y.bind(this));
        return label;
      }
    };
  };
}).call(this);
