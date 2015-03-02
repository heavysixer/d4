(function() {
  'use strict';
  /*
   * This feature allows you to specify a grid over a portion or the entire chart area.
   *
   * @name grid
   */
  d4.feature('grid', function(name) {

    var xAxis = d3.svg.axis();
    var yAxis = d3.svg.axis();

    return {
      accessors: {
        formatXAxis: function(xAxis) {
          return xAxis.orient('bottom');
        },

        formatYAxis: function(yAxis) {
          return yAxis.orient('left');
        }
      },
      proxies: [{
        target: xAxis,
        prefix: 'x'
      }, {
        target: yAxis,
        prefix: 'y'
      }],
      render: function(scope, data, selection) {
        xAxis.scale(this.x);
        yAxis.scale(this.y);

        var formattedXAxis = d4.functor(scope.accessors.formatXAxis).bind(this)(xAxis);
        var formattedYAxis = d4.functor(scope.accessors.formatYAxis).bind(this)(yAxis);

        var grid = d4.appendOnce(selection, 'g.grid.border.' + name);
        var gridBg = d4.appendOnce(grid, 'rect');
        var gridX = d4.appendOnce(grid, 'g.x.grid.' + name);
        var gridY = d4.appendOnce(grid, 'g.y.grid.' + name);

        gridBg
          .attr('transform', 'translate(0,0)')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', this.width)
          .attr('height', this.height);

        gridX
          .attr('transform', 'translate(0,' + this.height + ')')
          .call(formattedXAxis
            .tickSize(-this.height, 0, 0)
            .tickFormat(''));

        gridY
          .attr('transform', 'translate(0,0)')
          .call(formattedYAxis
            .tickSize(-this.width, 0, 0)
            .tickFormat(''));

        return grid;
      }
    };
  });
}).call(this);
