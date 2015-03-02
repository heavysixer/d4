(function() {
  'use strict';
  /*
   * The stackedLabels are appropriate for use with the stacked shape series.
   *
   * @name stackedLabels
   */
  d4.feature('stackedLabels', function(name) {

    // FIXME: We should not need to sniff this out.
    var dataInColumns = function(d) {
      if (d4.isDefined(d.y0)) {
        return true;
      }
      return d4.isContinuousScale(this.y);
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

      // FIXME: Remove this hardcoding.
      var padding = 10;
      var val;
      if (dimension === 'x') {
        offset *= -1;
        padding *= -1;
      }
      if (d4.isDefined(d.y0)) {
        val = d.y0 + d.y;
        return (val <= 0 ? axis(d.y0) : axis(val)) + offset;
      } else {
        return (d[axis.$key] <= 0 ? axis(0) : axis(d[axis.$key])) - padding;
      }
    };

    return {
      accessors: {
        classes: 'column-label',

        key: d4.functor(d4.defaultKey),

        stagger: true,

        text: function(d) {
          if (d4.isDefined(d.y0)) {
            if (d4.isOrdinalScale(this.x)) {
              if (Math.abs(this.y(d.y0) - this.y(d.y0 + d.y)) > 20) {
                return d[this.valueKey];
              }
            } else {
              if (Math.abs(this.x(d.y0) - this.x(d.y0 + d.y)) > 20) {
                return d[this.valueKey];
              }
            }
          } else {
            return d[this.valueKey];
          }
        },

        textAnchor: function(d) {
          return anchorText.bind(this)(d);
        },

        x: function(d) {
          if (d4.isOrdinalScale(this.x)) {
            return useDiscretePosition.bind(this)('x', d);
          } else {
            return useContinuousPosition.bind(this)('x', d);
          }
        },

        y: function(d) {
          if (d4.isOrdinalScale(this.y)) {
            return useDiscretePosition.bind(this)('y', d);
          } else {
            return useContinuousPosition.bind(this)('y', d);
          }
        }
      },

      render: function(scope, data, selection) {
        var group = d4.appendOnce(selection, 'g.' + name);

        var labelGroups = group.selectAll('g')
          .data(data, d4.functor(scope.accessors.key).bind(this));

        labelGroups.enter().append('g')
          .attr('class', function(d, i) {
            return 'series' + i + ' ' + this.x.$key;
          }.bind(this));

        labelGroups.exit().remove();

        var text = labelGroups.selectAll('text')
          .data(function(d) {
            return d.values;
          }.bind(this));

        text.enter().append('text');

        text
          .text(d4.functor(scope.accessors.text).bind(this))
          .attr('text-anchor', d4.functor(scope.accessors.textAnchor).bind(this))
          .attr('class', d4.functor(scope.accessors.classes).bind(this))
          .attr('y', d4.functor(scope.accessors.y).bind(this))
          .attr('x', d4.functor(scope.accessors.x).bind(this));

        if (d4.functor(scope.accessors.stagger).bind(this)()) {

          // FIXME: This should be moved into a helper injected using DI.
          if (d4.isContinuousScale(this.y)) {
            group.selectAll('text').call(d4.helpers.staggerTextVertically, -1);
          } else {
            group.selectAll('text').call(d4.helpers.staggerTextHorizontally, 1);
          }
        }
        group.selectAll('text').call(function(rows) {
          var rect;
          d4.each(rows, function(cols) {
            d4.each(cols, function(text) {
              var txt = d3.select(text);
              rect = text.getBoundingClientRect();
              if (txt.attr('transform') === null) {
                txt.attr('transform', 'translate(0,' + Math.floor(rect.height / 2) + ')');
              }
            });
          });
        });
        labelGroups.exit().remove();
        text.exit().remove();
        return text;
      }
    };
  });
}).call(this);
