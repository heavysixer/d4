(function() {
  /*!
   * global d3: false
   * global d4: false
   */

  'use strict';
  d4.feature('referenceLine', function(name) {
    return {
      accessors: {
        x1: function() {
          return this.x(0);
        },

        x2: function() {
          return this.x(this.width - this.margin.left - this.margin.right);
        },

        y1: function() {
          return this.y(0);
        },

        y2: function() {
          return this.y(this.height);
        }
      },
      render: function(scope) {
        this.featuresGroup.append('g').attr('class', name);
        var referenceLine = this.svg.select('.' + name)
          .append('line')
          .attr('class', 'line')
          .attr('x1', scope.accessors.x1.bind(this))
          .attr('x2', scope.accessors.x2.bind(this))
          .attr('y1', scope.accessors.y1.bind(this))
          .attr('y2', scope.accessors.y2.bind(this));
        return referenceLine;
      }
    };
  });
}).call(this);
