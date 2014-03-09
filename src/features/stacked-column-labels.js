(function() {
  /*!
   * global d3: false
   * global d4: false
   */

  'use strict';
  d4.feature('stackedColumnLabels', function(name) {

    // FIXME: Provide this using DI.
    var staggerText = function(text, direction) {
      var maxAttempts = 5,
        attempts = 0,
        move = function(rect, direction) {
          var text = d3.select(this);
          var lastOffset = text.attr('data-last-offset') || 1;
          var offset = (rect.height + lastOffset) * direction;
          text.attr('transform', 'translate(0,' + offset + ')');
          text.attr('data-last-offset', Math.abs(offset));
        },

        intersects = function(rect1, rect2) {
          return !(rect1.right < rect2.left ||
            rect1.left > rect2.right ||
            rect1.bottom < rect2.top ||
            rect1.top > rect2.bottom);
        },

        loop = function(text, direction) {
          var intersecting = false,
            bb,
            pbb,
            last;

          text.each(function(d, i, n) {
            if (n > 1) {
              bb = this.getBoundingClientRect();
              pbb = last.getBoundingClientRect();
              if (intersects(bb, pbb)) {
                move.bind(this)(bb, direction);
                intersecting = true;
              }
            }
            last = this;
          });

          if (intersecting && attempts < maxAttempts) {
            attempts++;
            loop.bind(this)(text, direction);
          }
        };
      loop.bind(this)(text, direction);
    };

    var sign = function(val) {
      return val > 0 ? 'positive' : 'negative';
    };

    var anchorText = function(d) {
      if (typeof d.y0 !== 'undefined') {
        if (this.x.$scale === 'ordinal') {
          return 'middle';
        } else {
          return 'left';
        }
      }
      if (this.y.$scale !== 'ordinal' || this.x.$scale === 'ordinal') {
        return 'middle';
      } else {
        return 'left';
      }
    };

    var useDiscretePosition = function(dimension, d) {
      var axis = this[dimension];
      return axis(d[axis.$key]) + (axis.rangeBand() / 2);
    };

    var useContinuousPosition = function(dimension, d) {
      var axis = this[dimension];
      var offset = Math.abs(axis(d.y0) - axis(d.y0 + d.y)) / 2;
      var padding = 5;
      var val;
      if (dimension === 'x') {
        offset *= -1;
        padding *= -1;
      }
      if (typeof d.y0 !== 'undefined') {
        val = d.y0 + d.y;
        return (val <= 0 ? axis(d.y0) : axis(val)) + offset;
      } else {
        return (d[axis.$key] <= 0 ? axis(0) : axis(d[axis.$key])) - padding;
      }
    };

    return {
      accessors: {
        x: function(d) {
          if (this.x.$scale === 'ordinal') {
            return useDiscretePosition.bind(this)('x', d);
          } else {
            return useContinuousPosition.bind(this)('x', d);
          }
        },

        y: function(d) {
          if (this.y.$scale === 'ordinal') {
            return useDiscretePosition.bind(this)('y', d);
          } else {
            return useContinuousPosition.bind(this)('y', d);
          }
        },

        text: function(d) {
          if (typeof d.y0 !== 'undefined') {
            if (this.x.$scale === 'ordinal') {
              if (Math.abs(this.y(d.y0) - this.y(d.y0 + d.y)) > 20) {
                return d3.format('').call(this, d[this.valueKey]);
              }
            } else {
              if (Math.abs(this.x(d.y0) - this.x(d.y0 + d.y)) > 20) {
                return d3.format('').call(this, d[this.valueKey]);
              }
            }
          } else {
            return d3.format('').call(this, d[this.valueKey]);
          }
        },
        stagger: true,
        classes: 'column-label'
      },

      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var group = this.svg.select('.' + name).selectAll('.group')
          .data(data)
          .enter().append('g')
          .attr('class', function(d, i) {
            return 'series' + i + ' ' + sign(d.y) + ' ' + this.x.$key;
          }.bind(this));

        var text = group.selectAll('text')
          .data(function(d) {
            return d.values;
          }.bind(this));
        text.exit().remove();
        text.enter().append('text')
          .text(scope.accessors.text.bind(this))
          .attr('text-anchor', anchorText.bind(this))
          .attr('class', d4.functor(scope.accessors.classes).bind(this))
          .attr('y', scope.accessors.y.bind(this))
          .attr('x', scope.accessors.x.bind(this));

        if (d4.functor(scope.accessors.stagger).bind(this)()) {
          // FIXME: This should be moved into a helper injected using DI.
          group.selectAll('text').call(staggerText, -1);
        }
        return text;
      }
    };
  });
}).call(this);
