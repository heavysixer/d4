(function() {
  'use strict';
  /*
   * A trendline allows you to associate a line with a numerical value.
   *
   * @name trendLine
   */
  d4.feature('trendLine', function(name) {
    return {
      accessors: {
        tipSize: 6,
        text: function(d) {
          return d[this.valueKey];
        },

        textX: function() {
          return this.x(this.width);
        },

        textY: function() {
          return this.x(this.height);
        },

        x1: function() {
          return this.x(this.x.$key);
        },

        x2: function() {
          return this.x(this.width);
        },

        y1: function() {
          return this.y(this.y.$key);
        },

        y2: function() {
          return this.y(this.height);
        },

      },
      render: function(scope, data, selection) {
        var defs = this.container.select('defs');

        d4.appendOnce(defs, 'marker#' + name + '-start')
          .attr('viewBox', '0 0 10 10')
          .attr('refX', 10)
          .attr('refY', 5)
          .attr('markerWidth', d4.functor(scope.accessors.tipSize).bind(this)())
          .attr('markerHeight', d4.functor(scope.accessors.tipSize).bind(this))
          .attr('orient', 'auto')
          .append('path')
          .attr('d', 'M 0 0 L 10 5 L 0 10 z');

        d4.appendOnce(selection, 'g.' + name);
        var trendLine = d4.appendOnce(this.container.select('.' + name), 'line.line')
          .attr('x1', d4.functor(scope.accessors.x1).bind(this))
          .attr('x2', d4.functor(scope.accessors.x2).bind(this))
          .attr('y1', d4.functor(scope.accessors.y1).bind(this))
          .attr('y2', d4.functor(scope.accessors.y2).bind(this))
          .attr('marker-end', 'url(#' + name + '-start)');

        d4.appendOnce(this.container.select('.' + name), 'text.trendLine-label')
          .text(d4.functor(scope.accessors.text).bind(this))
          .attr('x', d4.functor(scope.accessors.textX).bind(this))
          .attr('y', d4.functor(scope.accessors.textY).bind(this));
        return trendLine;
      }
    };
  });
}).call(this);
