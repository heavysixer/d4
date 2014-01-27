/* global d4: false */
(function() {
  'use strict';
  d4.features.rowSeries = function(name) {
    return {
      accessors: {
        x: function(d) {
          return this.x(Math.min(0, d[0]));
        },

        y: function(d) {
          return this.y(d[1]);
        },

        height: function() {
          return this.y.rangeBand();
        },

        width: function(d) {
          return Math.abs(this.x(d[0]) - this.x(0));
        },
      },
      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var bar = this.svg.select('.'+name).selectAll('.'+name).data(data);
        bar.enter().append('rect');
        bar.exit().remove();
        bar.attr('class', function(d, i) {
          return d[0] < 0 ? 'bar negative fill series' + i : 'bar positive fill series' + i;
        })
          .attr('x', scope.accessors.x.bind(this))
          .attr('y', scope.accessors.y.bind(this))
          .attr('width', scope.accessors.width.bind(this))
          .attr('height', scope.accessors.height.bind(this));

        this.featuresGroup.append('g').attr('class', 'x zero ' + name)
        .append('line')
        .attr('class', 'line')
        .attr('x1', this.x(0))
        .attr('x2', this.x(0))
        .attr('y1', 0)
        .attr('y2', this.height)
        return bar;
      }
    };
  };
}).call(this);
