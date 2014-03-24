(function() {
  /*!
   * global d3: false
   * global d4: false
   */

  'use strict';
  d4.feature('stackedColumnLabels', function(name) {

    // FIXME: We should not need to sniff this out.
    var dataInColumns = function(d) {
      if (typeof d.y0 !== 'undefined') {
        return true;
      }
      if (this.y.$scale !== 'ordinal') {
        return true;
      } else {
        return false;
      }
    };

    var anchorText = function(d) {
      return dataInColumns.bind(this)(d) ? 'middle' : 'start';
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
        var group = this.svg.select('.' + name).selectAll('g')
          .data(data)
          .enter().append('g')
          .attr('class', function(d, i) {
            return 'series' + i + ' ' + this.x.$key;
          }.bind(this));

        var text = group.selectAll('text')
          .data(function(d) {
            return d.values;
          }.bind(this));
        text.exit().remove();
        text.enter().append('text')
          .text(d4.functor(scope.accessors.text).bind(this))
          .attr('text-anchor', anchorText.bind(this))
          .attr('class', d4.functor(scope.accessors.classes).bind(this))
          .attr('y', d4.functor(scope.accessors.y).bind(this))
          .attr('x', d4.functor(scope.accessors.x).bind(this));

        if (d4.functor(scope.accessors.stagger).bind(this)()) {

          // FIXME: This should be moved into a helper injected using DI.
          if(this.y.$scale !== 'ordinal') {
            group.selectAll('text').call(d4.helpers.staggerTextVertically, -1);
          } else {
            group.selectAll('text').call(d4.helpers.staggerTextHorizontally, 1);
          }
        }
        return text;
      }
    };
  });
}).call(this);
