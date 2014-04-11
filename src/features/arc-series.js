(function() {
  'use strict';
  d4.feature('arcSeries', function(name) {
    var arc = d3.svg.arc();
    return {
      accessors: {
        classes: function(d, n) {
          return 'arc stroke fill series' + n;
        },

        duration: 750,

        key: function(d, i) {
          return (d.key || 0) + i;
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

        // extracted from: http://bl.ocks.org/mbostock/1346410
        // Store the displayed angles in _current.
        // Then, interpolate from _current to the new angles.
        // During the transition, _current is updated in-place by d3.interpolate.
        var arcTween = function(a) {
          var i = d3.interpolate(this._current, a);
          this._current = i(0);
          return function(t) {
            return arc(i(t));
          };
        };

        var r = d4.functor(scope.accessors.radius).bind(this)(),
          x = d4.functor(scope.accessors.x).bind(this)(),
          y = d4.functor(scope.accessors.y).bind(this)(),
          arcWidth = d4.functor(scope.accessors.width).bind(this)(r);
        arc
          .innerRadius(r)
          .outerRadius(r - arcWidth);

        var group = selection.selectAll('g.'+name).data(data);
        group.enter()
        .append('g')
        .attr('class', name)
        .attr('transform', 'translate(' + x + ',' + y + ')');

        var arcs = group.selectAll('path')
          .data(function(d) {
            return d.values;
          }, d4.functor(scope.accessors.key).bind(this));

        // update
        arcs.transition()
        .duration(d4.functor(scope.accessors.duration).bind(this)())
        .attrTween('d', arcTween);

        // create new elements as needed
        arcs.enter()
          .append('path')
          .attr('class', d4.functor(scope.accessors.classes).bind(this))
          .attr('data-key', d4.functor(scope.accessors.key).bind(this))
          .attr('d', arc)
          .each(function(d) {
            this._current = d;
          });

        //remove old elements as needed
        arcs.exit().remove();
        group.exit().remove();
        return arc;
      }
    };
  });
}).call(this);
