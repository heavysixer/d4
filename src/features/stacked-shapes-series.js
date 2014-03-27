(function() {
  'use strict';
  var sign = function(val){
    return (val > 0) ? 'positive' : 'negative';
  };

  var useDiscretePosition = function(dimension, d){
    var axis = this[dimension];
    return axis(d[axis.$key]);
  };

  var useDiscreteSize = function(dimension) {
    var axis = this[dimension];
    return axis.rangeBand();
  };

  var useContinuousSize = function(dimension, d) {
    var axis = this[dimension];
    if(typeof d.y0 !== 'undefined'){
      return Math.abs(axis(d.y0) - axis(d.y0 + d.y));
    }else {
      return Math.abs(axis(d[axis.$key]) - axis(0));
    }
  };

  var useContinuousPosition = function(dimension, d) {
    var axis = this[dimension];
    var val;
    if(typeof d.y0 !== 'undefined'){
      if(dimension === 'y') {
        val = d.y0 + d.y;
        return  val < 0 ? axis(d.y0) : axis(val);
      } else {
        val = (d.y0 + d.y) - Math.max(0, d.y);
        return axis(val);
      }
    } else {
      if(dimension === 'y') {
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
        classes: function(d,i) {
          return 'bar fill item'+ i + ' ' + sign(d[this.valueKey]) + ' ' + d[this.y.$key];
        }
      },

      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);

        // create data join with the series data
        var group = this.svg.select('.' + name).selectAll('g')
          .data(data, function(d, i){
            return d.key + i;
          });

        group.enter().append('g')
          .attr('class', function(d, i) {
            return 'series'+ i + ' ' +  this.y.$key;
          }.bind(this));
        group.exit().remove();

        var shape = group.selectAll(shapeType)
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
  * This feature is useful for displaying charts which need a series of rects.
  * This feature can be used to display a sequential or stacked series of rects.
  */
  d4.feature('rectSeries', function(name) {
    var rectObj =  {
      accessors: {
        height: function(d) {
          if(this.y.$scale === 'ordinal'){
            return useDiscreteSize.bind(this)('y');
          } else {
            return useContinuousSize.bind(this)('y', d);
          }
        },

        rx: 0,

        ry: 0,

        width: function(d) {
          if(this.x.$scale === 'ordinal'){
            return useDiscreteSize.bind(this)('x');
          } else {
            return useContinuousSize.bind(this)('x', d);
          }
        },

        x: function(d) {
          if(this.x.$scale === 'ordinal'){
            return useDiscretePosition.bind(this)('x', d);
          } else {
            return  useContinuousPosition.bind(this)('x', d);
          }
        },

        y: function(d) {
          if(this.y.$scale === 'ordinal'){
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
