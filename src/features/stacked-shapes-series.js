(function() {
  'use strict';
  var sign = function(val) {
    return (val > 0) ? 'positive' : 'negative';
  };

  var useDiscretePosition = function(dimension, d) {
    var axis = this[dimension];
    return axis(d[axis.$key]);
  };

  var useDiscreteSize = function(dimension) {
    var axis = this[dimension];
    return axis.rangeBand();
  };

  var useContinuousSize = function(dimension, d) {
    var axis = this[dimension];
    if (d4.isDefined(d.y0)) {
      return Math.abs(axis(d.y0) - axis(d.y0 + d.y));
    } else {
      return Math.abs(axis(d[axis.$key]) - axis(0));
    }
  };

  var useContinuousPosition = function(dimension, d) {
    var axis = this[dimension];
    var val;
    if (d4.isDefined(d.y0)) {
      if (dimension === 'y') {
        val = d.y0 + d.y;
        return val < 0 ? axis(d.y0) : axis(val);
      } else {
        val = (d.y0 + d.y) - Math.max(0, d.y);
        return axis(val);
      }
    } else {
      if (dimension === 'y') {
        return d[axis.$key] < 0 ? axis(0) : axis(d[axis.$key]);
      } else {
        val = d[axis.$key] - Math.max(0, d[axis.$key]);
        return axis(val);
      }
    }
  };

  var baseShapeFeature = function(name, shapeType, renderShapeAttributes) {
    return {
      accessors: {
        classes: function(d, i) {
          return 'bar fill item' + i + ' ' + sign(d[this.valueKey]) + ' ' + d[this.y.$key];
        },
        key: d4.functor(d4.defaultKey)
      },

      render: function(scope, data, selection) {
        var group = d4.appendOnce(selection, 'g.' + name);

        // create data join with the series data
        var shapeGroups = group.selectAll('g')
          .data(data, d4.functor(scope.accessors.key).bind(this));

        shapeGroups.enter().append('g')
          .attr('class', function(d, i) {
            return 'series' + i + ' ' + this.y.$key;
          }.bind(this));
        shapeGroups.exit().remove();

        var shape = shapeGroups.selectAll(shapeType)
          .data(function(d) {
            return d.values;
          });

        shape.enter().append(shapeType)
          .attr('class', d4.functor(scope.accessors.classes).bind(this));
        renderShapeAttributes.bind(this)(scope, shape);

        shape.exit().remove();
        return shape;
      }
    };
  };

  /**
   * This feature is useful for displaying charts which need stacked circles.
   * Note: Many of the d4 charts use the stacked series as the base, and simply
   * renders only one series, if there is nothing to stack.
   *
   *##### Accessors
   *
   * `classes` - classes assigned to each circle in the series
   * `cx` - placement on the chart's x axis
   * `cy` - placement on the chart's y axis
   * `r` - radius of the circle
   *
   * @name circleSeries
   */
  d4.feature('circleSeries', function(name) {
    var rectObj = {
      accessors: {
        cx: function(d) {
          var size = 0;
          if (d4.isOrdinalScale(this.x)) {
            size = useDiscreteSize.bind(this)('x');
            return useDiscretePosition.bind(this)('x', d) + size / 2;
          } else {
            size = useContinuousSize.bind(this)('x', d);
            return useContinuousPosition.bind(this)('x', d) + size / 2;
          }
        },

        cy: function(d) {
          var size = 0;
          if (d4.isOrdinalScale(this.y)) {
            size = useDiscreteSize.bind(this)('y');
            return useDiscretePosition.bind(this)('y', d) + size / 2;
          } else {
            size = useContinuousSize.bind(this)('y', d);
            return useContinuousPosition.bind(this)('y', d) + size / 2;
          }
        },

        r: function(d) {
          var x, y;
          if (d4.isOrdinalScale(this.x)) {
            x = useDiscreteSize.bind(this)('x');
          } else {
            x = useContinuousSize.bind(this)('x', d);
          }
          if (d4.isOrdinalScale(this.y)) {
            y = useDiscreteSize.bind(this)('y');
          } else {
            y = useContinuousSize.bind(this)('y', d);
          }
          return Math.min(x, y) / 2;
        }
      }
    };

    var renderShape = function(scope, selection) {
      selection
        .attr('r', d4.functor(scope.accessors.r).bind(this))
        .attr('cx', d4.functor(scope.accessors.cx).bind(this))
        .attr('cy', d4.functor(scope.accessors.cy).bind(this));
    };
    var baseObj = baseShapeFeature.bind(this)(name, 'circle', renderShape);
    return d4.merge(baseObj, rectObj);
  });

  /**
   * This feature is useful for displaying charts which need stacked ellipses.
   * Note: Many of the d4 charts use the stacked series as the base, and simply
   * renders only one series, if there is nothing to stack.
   *
   *##### Accessors
   *
   * `classes` - classes assigned to each ellipse in the series
   * `cx` - placement on the chart's x axis
   * `cy` - placement on the chart's y axis
   * `rx` - radius of the ellipse on the x axis
   * `ry` - radius of the ellipse on the y axis
   *
   * @name ellipseSeries
   */
  d4.feature('ellipseSeries', function(name) {
    var rectObj = {
      accessors: {
        cx: function(d) {
          var size = 0;
          if (d4.isOrdinalScale(this.x)) {
            size = useDiscreteSize.bind(this)('x');
            return useDiscretePosition.bind(this)('x', d) + size / 2;
          } else {
            size = useContinuousSize.bind(this)('x', d);
            return useContinuousPosition.bind(this)('x', d) + size / 2;
          }
        },

        cy: function(d) {
          var size = 0;
          if (d4.isOrdinalScale(this.y)) {
            size = useDiscreteSize.bind(this)('y');
            return useDiscretePosition.bind(this)('y', d) + size / 2;
          } else {
            size = useContinuousSize.bind(this)('y', d);
            return useContinuousPosition.bind(this)('y', d) + size / 2;
          }
        },

        rx: function(d) {
          if (d4.isOrdinalScale(this.x)) {
            return useDiscreteSize.bind(this)('x') / 2;
          } else {
            return useContinuousSize.bind(this)('x', d) / 2;
          }
        },

        ry: function(d) {
          if (d4.isOrdinalScale(this.y)) {
            return useDiscreteSize.bind(this)('y') / 2;
          } else {
            return useContinuousSize.bind(this)('y', d) / 2;
          }
        }
      }
    };

    var renderShape = function(scope, selection) {
      selection
        .attr('rx', d4.functor(scope.accessors.rx).bind(this))
        .attr('ry', d4.functor(scope.accessors.ry).bind(this))
        .attr('cx', d4.functor(scope.accessors.cx).bind(this))
        .attr('cy', d4.functor(scope.accessors.cy).bind(this));
    };
    var baseObj = baseShapeFeature.bind(this)(name, 'ellipse', renderShape);
    return d4.merge(baseObj, rectObj);
  });

  /**
   * This feature is useful for displaying charts which need stacked rects.
   * Note: Many of the d4 charts use the stacked series as the base, and simply
   * renders only one series, if there is nothing to stack.
   *
   *##### Accessors
   *
   * `classes` - classes assigned to each rect in the series
   * `height` - height of the rect
   * `rx` -  rounding of the corners against the x dimension
   * `ry` -  rounding of the corners against the y dimension
   * `width` - width of the rect
   * `x` - placement on the chart's x axis
   * `y` - placement on the chart's y axis
   *
   * @name rectSeries
   */
  d4.feature('rectSeries', function(name) {
    var rectObj = {
      accessors: {
        height: function(d) {
          if (d4.isOrdinalScale(this.y)) {
            return useDiscreteSize.bind(this)('y');
          } else {
            return useContinuousSize.bind(this)('y', d);
          }
        },

        rx: 0,

        ry: 0,

        width: function(d) {
          if (d4.isOrdinalScale(this.x)) {
            return useDiscreteSize.bind(this)('x');
          } else {
            return useContinuousSize.bind(this)('x', d);
          }
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
      }
    };
    var renderShape = function(scope, selection) {
      selection
        .attr('x', d4.functor(scope.accessors.x).bind(this))
        .attr('y', d4.functor(scope.accessors.y).bind(this))
        .attr('ry', d4.functor(scope.accessors.ry).bind(this))
        .attr('rx', d4.functor(scope.accessors.rx).bind(this))
        .attr('width', d4.functor(scope.accessors.width).bind(this))
        .attr('height', d4.functor(scope.accessors.height).bind(this));
    };
    var baseObj = baseShapeFeature.bind(this)(name, 'rect', renderShape);
    return d4.merge(baseObj, rectObj);
  });
}).call(this);
