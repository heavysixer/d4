(function() {
  /*!
   * global d3: false
   * global d4: false
   */

  'use strict';
  d4.feature('rowSeries', function(name) {
    var sign = function(val){
      return (val > 0) ? 'positive' : 'negative';
    };

    return {
      accessors: {
        x: function(d) {
          var xVal = d[this.xKey] - Math.max(0, d[this.xKey]);
          return this.x(xVal);
        },

        y: function(d) {
          return this.y(d[this.yKey]);
        },

        width: function(d) {
          return Math.abs(this.x(d[this.xKey]) - this.x(0));
        },

        height: function() {
          return this.y.rangeBand();
        },

        classes: function(d,i) {
          return 'bar fill item'+ i + ' ' + sign(d.y) + ' ' + d[this.xKey];
        }
      },
      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var group = this.svg.select('.' + name).selectAll('.group')
          .data(data)
          .enter().append('g')
          .attr('class', function(d,i) {
            return 'series'+ i + ' ' +  this.yKey;
          }.bind(this));

        var rect = group.selectAll('rect')
          .data(function(d) {
            return d.values;
          }.bind(this));

        rect.enter().append('rect')
          .attr('class', scope.accessors.classes.bind(this))
          .attr('x', scope.accessors.x.bind(this))
          .attr('y', scope.accessors.y.bind(this))
          .attr('width', scope.accessors.width.bind(this))
          .attr('height', scope.accessors.height.bind(this));
        return rect;
      }
    };
  });
}).call(this);
