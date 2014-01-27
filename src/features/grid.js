/* global d4: false */
(function() {
  'use strict';
  d4.features.grid = function(name) {

    return {
      accessors: {
        formatXAxis: function(xAxis) {
          return xAxis.orient('bottom');
        },

        formatYAxis: function(yAxis) {
          return yAxis.orient('left');
        },

        klass: function(d,n) {
          return 'stroke series' + n;
        }
      },
      render: function(scope) {
        var xAxis = d3.svg.axis().scale(this.x);
        var yAxis = d3.svg.axis().scale(this.y);
        var formattedXAxis = scope.accessors.formatXAxis.bind(this)(xAxis);
        var formattedYAxis = scope.accessors.formatYAxis.bind(this)(yAxis);

        this.featuresGroup.append('g').attr('class', 'grid border '+ name)
          .attr('transform', 'translate(0,0)')
          .append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', this.width - this.margin.left - this.margin.right)
          .attr('height', this.height - this.margin.top - this.margin.bottom);

        this.featuresGroup.append('g').attr('class', 'x grid '+ name)
          .attr('transform', 'translate(0,' + (this.height - this.margin.top - this.margin.bottom) + ')')
          .call(formattedXAxis
          .tickSize(-(this.height - this.margin.top - this.margin.bottom), 0, 0)
          .tickFormat(''));

        this.featuresGroup.append('g').attr('class', 'y grid '+ name)
          .attr('transform', 'translate(0,0)')
          .call(formattedYAxis
          .tickSize(-(this.width - this.margin.left - this.margin.right), 0, 0)
          .tickFormat(''));
      }
    };
  };
}).call(this);