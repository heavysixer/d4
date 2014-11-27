(function() {
  'use strict';

  /*
   * Waterfall connectors are orthogonal series connectors which visually join
   * column series together by spanning the top or bottom of adjacent columns.
   *
   *##### Accessors
   *
   * `x` - Used in placement of the connector lines.
   * `y` - Used in placement of the connector lines.
   * `span` - calculates the length of the connector line
   * `classes` - applies the class to the connector lines.
   *
   * @name waterfallConnectors
   */
  d4.feature('waterfallConnectors', function(name) {
    return {
      accessors: {
        beforeRender: function(data) {
          var d = data.map(function(o) {
            return o.values[0];
          });
          return d4.flatten(d);
        },

        classes: function(d, i) {
          return 'series' + i;
        },

        span: function() {
          if (d4.isOrdinalScale(this.x)) {
            return this.x.rangeBand();
          } else {
            return this.y.rangeBand();
          }
        },

        x: function(d) {
          if (d4.isOrdinalScale(this.x)) {
            return this.x(d[this.x.$key]);
          } else {
            var width = 0;
            var xVal = (d.y0 + d.y) - Math.max(0, d.y);
            if (d.y > 0) {
              width = Math.abs(this.x(d.y0) - this.x(d.y0 + d.y));
            }
            return this.x(xVal) + width;
          }
        },

        y: function(d) {
          if (d4.isOrdinalScale(this.x)) {
            return this.y(d.y0 + d.y);
          } else {
            return this.y(d[this.y.$key]);
          }
        }
      },

      render: function(scope, data, selection) {
        selection.append('g').attr('class', name);
        var lines = this.container.select('.' + name).selectAll('.' + name).data(data);
        lines.enter().append('line');
        lines.exit().remove();
        lines
          .attr('class', d4.functor(scope.accessors.classes).bind(this))
          .attr('x1', function(d, i) {
            if (i === 0) {
              return 0;
            }
            return d4.functor(scope.accessors.x).bind(this)(data[i - 1]);
          }.bind(this))

        .attr('y1', function(d, i) {
          if (i === 0) {
            return 0;
          }
          return d4.functor(scope.accessors.y).bind(this)(data[i - 1]);
        }.bind(this))

        .attr('x2', function(d, i) {
          if (i === 0) {
            return 0;
          }
          if (d4.isOrdinalScale(this.x)) {
            return d4.functor(scope.accessors.x).bind(this)(d) + d4.functor(scope.accessors.span).bind(this)();
          } else {
            return d4.functor(scope.accessors.x).bind(this)(data[i - 1]);
          }
        }.bind(this))

        .attr('y2', function(d, i) {
          if (i === 0) {
            return 0;
          }
          if (d4.isOrdinalScale(this.x)) {
            return d4.functor(scope.accessors.y).bind(this)(data[i - 1]);
          } else {
            return d4.functor(scope.accessors.y).bind(this)(d) + d4.functor(scope.accessors.span).bind(this)(d);
          }
        }.bind(this));

        return lines;
      }
    };
  });
}).call(this);
