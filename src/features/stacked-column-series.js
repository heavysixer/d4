(function() {
  /*!
   * global d3: false
   * global d4: false
   */

  'use strict';
  d4.features.stackedColumnSeries = function(name) {
    var sign = function(val){
      return (val > 0) ? 'positive' : 'negative';
    };

    return {
      accessors: {
        x: function(d) {
          return this.x(d[this.xKey]);
        },

        y: function(d) {
          if(d.y0){
            var yVal = d.y0 + d.y;
            return  yVal < 0 ? this.y(d.y0) : this.y(yVal);
          } else {
            return d[this.yKey] < 0 ? this.y(0) : this.y(d[this.yKey]);
          }
        },

        width: function() {
          return this.x.rangeBand();
        },

        height: function(d) {
          if(d.y0){
            return Math.abs(this.y(d.y0) - this.y(d.y0 + d.y));
          }else {
            return Math.abs(this.y(d[this.yKey]) - this.y(0));
          }
        },

        classes: function(d,i) {
          return 'bar fill item'+ i + ' ' + sign(d.y) + ' ' + d[this.yKey];
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
  };
}).call(this);
