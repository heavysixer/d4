(function() {
  'use strict';
  d4.feature('trendLine', function(name) {
    return {
      accessors: {
        text: function(d) {
          return d3.format('').call(this, d[1]);
        },

        textX: function() {
          return this.x(this.width);
        },

        textY: function() {
          return this.x(this.height);
        },

        x1: function() {
          return this.x(0);
        },

        x2: function() {
          return this.x(this.width);
        },

        y1: function() {
          return this.y(0);
        },

        y2: function() {
          return this.y(this.height);
        },

      },
      render: function(scope, data, selection) {
        var defs = this.svg.select('defs');

        d4.appendOnce(defs, 'marker#' + name + '-start')
          .attr('viewBox', '0 0 10 10')
          .attr('refX', 10)
          .attr('refY', 5)
          .attr('markerWidth', -6)
          .attr('markerHeight', 6)
          .attr('orient', 'auto')
          .append('path')
          .attr('d', 'M 0 0 L 10 5 L 0 10 z');

        d4.appendOnce(selection, 'g.' + name);
        var trendLine = d4.appendOnce(this.svg.select('.' + name), 'line.line')
          .attr('x1', d4.functor(scope.accessors.x1).bind(this))
          .attr('x2', d4.functor(scope.accessors.x2).bind(this))
          .attr('y1', d4.functor(scope.accessors.y1).bind(this))
          .attr('y2', d4.functor(scope.accessors.y2).bind(this))
          .attr('marker-end', 'url(#' + name + '-start)');

        d4.appendOnce(this.svg.select('.' + name), 'text.trendLine-label')
          .text(d4.functor(scope.accessors.text).bind(this))
          .attr('x', d4.functor(scope.accessors.textX).bind(this))
          .attr('y', d4.functor(scope.accessors.textY).bind(this));
        return trendLine;
      }
    };
  });
}).call(this);
