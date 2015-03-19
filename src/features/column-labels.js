(function() {
  'use strict';
  /*
   * The columnLabels feature is used to affix data labels to column series.
   *
   * @name columnLabels
   */
  d4.feature('columnLabels', function(name) {

    // FIXME: Remove this hardcoded variable or expose it as a setting.
    var padding = 5;
    var anchorText = function() {
      if (d4.isContinuousScale(this.y)) {
        return 'middle';
      } else {
        return 'start';
      }
    };
    return {
      accessors: {
        key: d4.functor(d4.defaultKey),

        x: function(xScaleId, d) {
          var axis = this[xScaleId];
          if (d4.isOrdinalScale(axis)) {
            return axis(d[axis.$key]) + (axis.rangeBand() / 2);
          } else {
            var width = Math.abs(axis(d[axis.$key]) - axis(0));
            return axis(d[axis.$key]) - width / 2;
          }
        },

        y: function(yScaleId, d) {
          var axis = this[yScaleId];
          if (d4.isOrdinalScale(axis)) {
            return axis(d[axis.$key]) + (axis.rangeBand() / 2) + padding;
          } else {
            var height = Math.abs(axis(d[axis.$key]) - axis(0));
            return (d[axis.$key] < 0 ? axis(d[axis.$key]) - height : axis(d[axis.$key])) - padding;
          }
        },

        text: function(d) {
          return d[this.valueKey];
        },

        xScaleId: function() {
          return 'x';
        },

        yScaleId: function() {
          return 'y';
        }
      },
      render: function(scope, data, selection) {
        var xScaleId = d4.functor(scope.accessors.xScaleId)();
        var yScaleId = d4.functor(scope.accessors.yScaleId)();
        var group = d4.appendOnce(selection, 'g.' + name);
        var label = group.selectAll('text')
          .data(data, d4.functor(scope.accessors.key).bind(this));
        label.enter().append('text');
        label.exit().remove();
        label.attr('class', 'column-label ' + name)
          .text(d4.functor(scope.accessors.text).bind(this))
          .attr('text-anchor', anchorText.bind(this))
          .attr('x', d4.functor(scope.accessors.x).bind(this, xScaleId))
          .attr('y', d4.functor(scope.accessors.y).bind(this, yScaleId));
        return label;
      }
    };
  });
}).call(this);
