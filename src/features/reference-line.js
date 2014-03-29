(function() {
  'use strict';
  d4.feature('referenceLine', function(name) {
    return {
      accessors: {
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
        classes: function() {
          return 'line';
        }
      },
      render: function(scope, data, selection) {
        selection.append('g').attr('class', name);
        var referenceLine = this.svg.select('.' + name)
          .selectAll('line').data([0])
          .enter()
          .append('line')
          .attr('class', d4.functor(scope.accessors.classes).bind(this))
          .attr('x1', d4.functor(scope.accessors.x1).bind(this))
          .attr('x2', d4.functor(scope.accessors.x2).bind(this))
          .attr('y1', d4.functor(scope.accessors.y1).bind(this))
          .attr('y2', d4.functor(scope.accessors.y2).bind(this));
        return referenceLine;
      }
    };
  });
}).call(this);
