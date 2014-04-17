(function() {
  'use strict';
  /*
   *
   * @name grid
   */
  d4.feature('grid', function(name) {

    return {
      accessors: {
        formatXAxis: function(xAxis) {
          return xAxis.orient('bottom');
        },

        formatYAxis: function(yAxis) {
          return yAxis.orient('left');
        }
      },
      render: function(scope, data, selection) {
        var xAxis = d3.svg.axis().scale(this.x);
        var yAxis = d3.svg.axis().scale(this.y);
        var formattedXAxis = d4.functor(scope.accessors.formatXAxis).bind(this)(xAxis);
        var formattedYAxis = d4.functor(scope.accessors.formatYAxis).bind(this)(yAxis);

        selection.append('g').attr('class', 'grid border ' + name)
          .attr('transform', 'translate(0,0)')
          .append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', this.width)
          .attr('height', this.height);

        selection.append('g')
          .attr('class', 'x grid ' + name)
          .attr('transform', 'translate(0,' + this.height + ')')
          .call(formattedXAxis
            .tickSize(-this.height, 0, 0)
            .tickFormat(''));

        selection.append('g')
          .attr('class', 'y grid ' + name)
          .attr('transform', 'translate(0,0)')
          .call(formattedYAxis
            .tickSize(-this.width, 0, 0)
            .tickFormat(''));
      }
    };
  });
}).call(this);
