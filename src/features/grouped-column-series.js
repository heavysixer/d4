(function() {
  'use strict';
  d4.feature('groupedColumnSeries', function(name) {
    var sign = function(val) {
      return (val > 0) ? 'positive' : 'negative';
    };

    return {
      accessors: {
        x: function(d, i) {
          var width = this.x.rangeBand() / this.groupsOf;
          var xPos = this.x(d[this.x.$key]) + width * i;
          return xPos;
        },

        y: function(d) {
          return d[this.y.$key] < 0 ? this.y(0) : this.y(d[this.y.$key]);
        },

        width: function() {
          var width = this.x.rangeBand() / this.groupsOf;
          var gutter = width * 0.1;
          return width - gutter;
        },

        height: function(d) {
          return Math.abs(this.y(d[this.y.$key]) - this.y(0));
        },

        classes: function(d, i) {
          return 'bar fill item' + i + ' ' + sign(d[this.y.$key]) + ' ' + d[this.y.$key];
        }
      },
      render: function(scope, data, selection) {
        selection.append('g').attr('class', name);
        var group = this.svg.select('.' + name).selectAll('g')
          .data(data, function(d, i) {
            return d.key + i;
          });
        group.enter().append('g');
        group.exit().remove();
        group.attr('class', function(d, i) {
          return 'series' + i + ' ' + this.x.$key;
        }.bind(this));

        var rect = group.selectAll('rect')
          .data(function(d) {
            return d.values;
          }.bind(this));
        rect.enter().append('rect')
          .attr('class', d4.functor(scope.accessors.classes).bind(this))
          .attr('x', d4.functor(scope.accessors.x).bind(this))
          .attr('y', d4.functor(scope.accessors.y).bind(this))
          .attr('width', d4.functor(scope.accessors.width).bind(this))
          .attr('height', d4.functor(scope.accessors.height).bind(this));
        return rect;
      }
    };
  });
}).call(this);
