(function() {
  /*!
   * global d3: false
   * global d4: false
   */

  /*!
    Column connectors helpful when displaying a stacked column chart.
    A connector will not connect positve and negative columns. This is because
    in a stacked column a negative column may move many series below its previous
    location. This creates a messy collection of crisscrossing lines.
  */
  'use strict';
  d4.feature('stackedColumnConnectors', function(name) {

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
          return this.y(d[this.yKey]);
        },

        span: function(){
          return this.y.rangeBand();
        },

        classes : function(d, i){
          return 'series' +i;
        }
      },

      render: function(scope) {
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
        .attr('x1', function() {
          // if(i === 0){
          //   return 0;
          // }
          // return scope.accessors.x1.bind(this)(data[i - 1].values[0]);
        }.bind(this))

        .attr('y1', function() {
          // if(i === 0){
          //   return 0;
          // }
          // return scope.accessors.y1.bind(this)(data[i - 1].values[0]);
        }.bind(this))

        .attr('x2', function() {
          // if(i === 0){
          //   return 0;
          // }
          // return scope.accessors.x1.bind(this)(data[i - 1].values[0]);
        }.bind(this))

        .attr('y2', function() {
          // if(i === 0){
          //   return 0;
          // }
          // return scope.accessors.y1.bind(this)(d) + scope.accessors.span.bind(this)(d);
        }.bind(this));

        return lines;
      }
    };
  });
}).call(this);
