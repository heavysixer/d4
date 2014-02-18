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
        x: function(d) {
          return this.x(d[this.xKey()]);
        },

        y: function(d) {
          return this.y(d.y0 + d.y);
        },

        span: function(){
          return this.x.rangeBand();
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
          return scope.accessors.x.bind(this)(data[i - 1].values[0]);
        }.bind(this))

        .attr('y1', function(d, i) {
          if(i === 0){
            return 0;
          }
          return scope.accessors.y.bind(this)(data[i - 1].values[0]);
        }.bind(this))

        .attr('x2', function(d, i) {
          if(i === 0){
            return 0;
          }
          return scope.accessors.x.bind(this)(d) + scope.accessors.span.bind(this)();
        }.bind(this))

        .attr('y2', function(d, i) {
          if(i === 0){
            return 0;
          }
          return scope.accessors.y.bind(this)(data[i - 1].values[0]);
        }.bind(this));

        return lines;
      }
    };
  };
}).call(this);
