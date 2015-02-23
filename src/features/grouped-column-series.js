(function() {
  'use strict';
  /*
   * This feature is specifically designed to use with the groupedColumn and groupedRow charts.
   *
   * @name groupedColumnSeries
   */
  d4.feature('groupedColumnSeries', function(name) {
    var sign = function(val) {
      return (val > 0) ? 'positive' : 'negative';
    };

    var useDiscretePosition = function(dimension, d, i) {
      var axis = this[dimension];
      var size = axis.rangeBand() / this.groupsOf;
      var pos = axis(d[axis.$key]) + size * i;
      return pos;
    };

    var useDiscreteSize = function(dimension) {
      var axis = this[dimension];
      var size = axis.rangeBand() / this.groupsOf;
      var gutter = size * 0.1;
      return size - gutter;
    };

    var useContinuousSize = function(dimension, d) {
      var axis = this[dimension];
      return Math.abs(axis(d[axis.$key]) - axis(0));
    };

    var useContinuousPosition = function(dimension, d) {
      var axis = this[dimension],
        val;
      if (dimension === 'y') {
        return d[axis.$key] < 0 ? axis(0) : axis(d[axis.$key]);
      } else {
        val = d[axis.$key] - Math.max(0, d[axis.$key]);
        return axis(val);
      }
    };

    return {
      accessors: {
        classes: function(d, i) {
          return 'bar fill item' + i + ' ' + sign(d[this.valueKey]) + ' ' + d[this.valueKey];
        },

        height: function(d) {
          if (d4.isOrdinalScale(this.y)) {
            return useDiscreteSize.bind(this)('y');
          } else {
            return useContinuousSize.bind(this)('y', d);
          }
        },

        key: d4.functor(d4.defaultKey),

        rx: 0,

        ry: 0,

        width: function(d) {
          if (d4.isOrdinalScale(this.x)) {
            return useDiscreteSize.bind(this)('x');
          } else {
            return useContinuousSize.bind(this)('x', d);
          }
        },

        x: function(d, i) {
          if (d4.isOrdinalScale(this.x)) {
            return useDiscretePosition.bind(this)('x', d, i);
          } else {
            return useContinuousPosition.bind(this)('x', d, i);
          }
        },

        y: function(d, i) {
          if (d4.isOrdinalScale(this.y)) {
            return useDiscretePosition.bind(this)('y', d, i);
          } else {
            return useContinuousPosition.bind(this)('y', d, i);
          }
        }
      },
      render: function(scope, data, selection) {
        if (data.length > 0) {
          this.groupsOf = this.groupsOf || data[0].values.length;
        }

        var group = d4.appendOnce(selection, 'g.' + name);

        var columnGroups = group.selectAll('g')
          .data(data, d4.functor(scope.accessors.key).bind(this));

        columnGroups.enter().append('g');
        columnGroups.exit().remove();
        columnGroups.attr('class', function(d, i) {
          return 'series' + i + ' ' + this.x.$key;
        }.bind(this));

        var rect = columnGroups.selectAll('rect')
          .data(function(d) {
            return d.values;
          }.bind(this))
          .enter().append('rect');

        columnGroups.selectAll('rect')
          .attr('class', d4.functor(scope.accessors.classes).bind(this))
          .attr('x', d4.functor(scope.accessors.x).bind(this))
          .attr('y', d4.functor(scope.accessors.y).bind(this))
          .attr('ry', d4.functor(scope.accessors.ry).bind(this))
          .attr('rx', d4.functor(scope.accessors.rx).bind(this))
          .attr('width', d4.functor(scope.accessors.width).bind(this))
          .attr('height', d4.functor(scope.accessors.height).bind(this));
        return rect;
      }
    };
  });
}).call(this);
