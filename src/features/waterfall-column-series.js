/* global d4: false */
(function() {
  'use strict';
  d4.features.waterfallColumnSeries = function(name) {
    var sign = function(val){
      return (val > 0) ? 'positive' : 'negative';
    };

    return {
      accessors: {
        x: function(d) {
          return this.x(d[this.xKey()]);
        },

        y: function(d) {
          var yVal = (d.y0 + d.y) - Math.min(0, d.y);
          return this.y(yVal);
        },

        width: function() {
          return this.x.rangeBand();
        },

        height: function(d) {
          return Math.abs(this.y(d.y0) - this.y(d.y0 + d.y));
        },

        classes: function(d,i,n) {
          var klass = sign(d.y);

          // special cases for waterfalls, where we want to display
          // the subtotal differently.
          if(n > 0 && d.y0 === 0){
            klass = 'subtotal';
          }
          return 'bar fill item'+ i + ' ' + klass + ' ' + d[this.yKey()];
        }
      },
      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var group = this.svg.select('.' + name).selectAll('.group')
          .data(data)
          .enter().append('g')
          .attr('class', function(d,i) {
            return 'series'+ i + ' ' +  this.yKey();
          }.bind(this));

        group.selectAll('rect')
          .data(function(d) {
            return d.values;
          }.bind(this))
          .enter().append('rect')
          .attr('class', scope.accessors.classes.bind(this))
          .attr('x', scope.accessors.x.bind(this))
          .attr('y', scope.accessors.y.bind(this))
          .attr('width', scope.accessors.width.bind(this))
          .attr('height', scope.accessors.height.bind(this));
      }
    };
  };
}).call(this);
