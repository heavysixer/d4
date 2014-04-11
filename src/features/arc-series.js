(function() {
  'use strict';
  d4.feature('arcSeries', function(name) {
    var arc = d3.svg.arc();
    return {
      accessors: {
        classes: function(d, n) {
          return 'arc stroke fill series' + n;
        },
        radius: function() {
          return Math.min(this.width, this.height) / 2;
        },
        width: function(radius) {
          return radius / 3;
        },
        x: function() {
          return this.width / 2;
        },
        y: function() {
          return this.height / 2;
        }
      },
      proxies: [arc],
      render: function(scope, data, selection) {
        var r = d4.functor(scope.accessors.radius).bind(this)(),
          x = d4.functor(scope.accessors.x).bind(this)(),
          y = d4.functor(scope.accessors.y).bind(this)(),
          arcWidth = d4.functor(scope.accessors.width).bind(this)(r);

        selection.append('g').attr('class', name);
        arc
          .innerRadius(r)
          .outerRadius(r - arcWidth);
        var group = this.svg.select('.' + name)
          .attr('transform', 'translate(' + x + ',' + y + ')');

        var arcs = group.selectAll('path')
          .data(function(d) {
            return d;
          });
        arcs.exit().remove();
        arcs.enter()
          .append('path')
          .attr('class', d4.functor(scope.accessors.classes).bind(this))
          .attr('d', arc);
        return arc;
      }
    };
  });
}).call(this);
