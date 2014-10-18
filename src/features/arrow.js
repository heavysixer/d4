(function() {
  'use strict';
  /*
   * The arrow feature is a convienient way to visually draw attention to a portion
   * of a chart by pointing an arrow at it.
   *
   * @name arrow
   */
  d4.feature('arrow', function(name) {
    return {
      accessors: {
        classes: 'line',
        tipSize: 6,
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
        }
      },
      render: function(scope, data, selection) {
        var defs = this.container.select('defs');

        d4.appendOnce(defs, 'marker#' + name + '-end')
          .attr('viewBox', '0 0 10 10')
          .attr('refX', 10)
          .attr('refY', 5)
          .attr('markerWidth', d4.functor(scope.accessors.tipSize).bind(this))
          .attr('markerHeight', d4.functor(scope.accessors.tipSize).bind(this))
          .attr('orient', 'auto')
          .append('path')
          .attr('d', 'M 0 0 L 10 5 L 0 10 z');

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

        var arrow = d4.appendOnce(this.container.select('.' + name), 'line')
          .attr('class', d4.functor(scope.accessors.classes).bind(this))
          .attr('x1', d4.functor(scope.accessors.x1).bind(this))
          .attr('x2', d4.functor(scope.accessors.x2).bind(this))
          .attr('y1', d4.functor(scope.accessors.y1).bind(this))
          .attr('y2', d4.functor(scope.accessors.y2).bind(this))
          .attr('marker-end', 'url(#' + name + '-end)');

        return arrow;
      }
    };
  });
}).call(this);
