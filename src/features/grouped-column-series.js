/* global d4: false */
(function() {
  'use strict';
  d4.features.groupedColumnSeries = function(name) {
    var sign = function(val){
      return (val > 0) ? 'positive' : 'negative';
    };

    return {
      accessors: {
        x: function(d,i) {
          var width = this.x.rangeBand() / this.groupsOf;
          var xPos = this.x(d[this.xKey]) + width * i;
          return xPos;
        },

        y: function(d) {
          return d[this.yKey] < 0 ? this.y(0) : this.y(d[this.yKey]);
        },

        width: function() {
          var width = this.x.rangeBand() / this.groupsOf;
          var gutter = width * 0.1;
          return width - gutter;
        },

        height: function(d) {
          return Math.abs(this.y(d[this.yKey]) - this.y(0));
        },

        classes: function(d,i) {
          return 'bar fill item'+ i + ' ' + sign(d[this.yKey]) + ' ' + d[this.yKey];
        }
      },
      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var group = this.svg.select('.' + name).selectAll('.group')
          .data(data);
          group.enter().append('g');
          group.exit().remove();
          group.attr('class', function(d,i) {
            return 'series'+ i + ' ' + this.xKey;
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
