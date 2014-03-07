(function() {
  /*!
   * global d3: false
   * global d4: false
   */

  'use strict';
  d4.feature('stackedColumnLabels', function(name) {
    var sign = function(val) {
      return val > 0 ? 'positive' : 'negative';
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
      } {
        padding *= -1;
      }
      if (typeof d.y0 !== 'undefined') {
        val = d.y0 + d.y;
        return (val <= 0 ? axis(d.y0) : axis(val)) + offset;
      } else {
        return (d[axis.$key] <= 0 ? axis(0) : axis(d[axis.$key])) + padding;
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

        classes : function() {
          return 'column-label';
        }
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
          .attr('class', scope.accessors.classes.bind(this))
          .attr('y', scope.accessors.y.bind(this))
          .attr('x', scope.accessors.x.bind(this));
        return text;
      }
    };
  });
}).call(this);
