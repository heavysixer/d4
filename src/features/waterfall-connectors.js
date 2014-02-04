/* global d4: false */
(function() {

  /*
    Orthogonal Series Connectors connect column series together by using a
    line which bends only at 90 degrees. This connector type is most commonly
    seen in charts such as waterfalls.
  */
  'use strict';
  d4.features.waterfallConnectors = function(name) {

    return {
      accessors: {
        x1: function(d) {
          var width = 0;
          var xVal = (d.y0 + d.y) - Math.max(0, d.y);
          if(d.y > 0){
            width = Math.abs(this.x(d.y0) - this.x(d.y0 + d.y));
          }
          return this.x(xVal) + width;

        },

        y1: function(d) {
          return this.y(d[this.yKey()]);
        },

        span: function(){
          return this.y.rangeBand();
        },

        classes : function(d, i){
          return 'series' +i;
        }
      },

      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var lines = this.svg.select('.' + name).selectAll('.' + name).data(function(d) {
          return d.map(function(o) {
            return o.values[0];
          });
        }.bind(this));
        lines.enter().append('line');
        lines.exit().remove();
        lines
        .attr('class', scope.accessors.classes.bind(this))
        .attr('x1', function(d, i) {
          if(i === 0){
            return 0;
          }
          return scope.accessors.x1.bind(this)(data[i - 1].values[0]);
        }.bind(this))

        .attr('y1', function(d, i) {
          if(i === 0){
            return 0;
          }
          return scope.accessors.y1.bind(this)(data[i - 1].values[0]);
        }.bind(this))

        .attr('x2', function(d, i) {
          if(i === 0){
            return 0;
          }
          return scope.accessors.x1.bind(this)(data[i - 1].values[0]);
        }.bind(this))

        .attr('y2', function(d, i) {
          if(i === 0){
            return 0;
          }
          return scope.accessors.y1.bind(this)(d) + scope.accessors.span.bind(this)(d);
        }.bind(this));

        return lines;
      }
    };
  };
}).call(this);
