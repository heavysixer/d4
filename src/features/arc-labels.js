(function() {
  'use strict';
  /*
   *
   * @name arcLabels
   */
  d4.feature('arcLabels', function(name) {
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

        text: function(d) {
          return d.value;
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
        var labelAngle = function(d) {
          return (180 / Math.PI * (d.startAngle + d.endAngle) / 2 - 90);
        };

        // extracted from: http://bl.ocks.org/mbostock/1346410
        // Store the displayed angles in _current.
        // Then, interpolate from _current to the new angles.
        // During the transition, _current is updated in-place by d3.interpolate.
        var arcTween = function(d) {
          var i = d3.interpolate(this._current, d);
          this._current = i(0);
          return function(t) {
            return 'translate(' + arc.centroid(i(t)) + ') rotate(' + labelAngle(d) + ')';
          };
        };

        // FIXME: #radius() is assumed to be provided by the enclosing chart. maybe we should default back to a feature based implementation if it doesn't find it?
        var r = d4.functor(this.radius).bind(this)(),
          x = d4.functor(scope.accessors.x).bind(this)(),
          y = d4.functor(scope.accessors.y).bind(this)();
        arc
          .innerRadius(r)
          .outerRadius(r + 10);

        var group = selection.selectAll('g.' + name).data(data);
        group.enter()
          .append('g')
          .attr('class', name)
          .attr('transform', 'translate(' + x + ',' + y + ')');

        var labels = group.selectAll('text')
          .data(function(d) {
            return d.values;
          }, d4.functor(scope.accessors.key).bind(this));

        // update
        labels.transition()
          .duration(d4.functor(scope.accessors.duration).bind(this)())
          .attrTween('transform', arcTween);

        // create new elements as needed
        labels.enter()
          .append('text')
          .attr('dy', 5)
          .attr('transform', function(d) {
            return 'translate(' + arc.centroid(d) + ') rotate(' + labelAngle(d) + ')';
          })
          .style('text-anchor', 'start')
          .text(d4.functor(scope.accessors.text).bind(this))
          .attr('class', d4.functor(scope.accessors.classes).bind(this))
          .attr('data-key', d4.functor(scope.accessors.key).bind(this))
          .attr('d', arc)
          .each(function(d) {
            this._current = d;
          });

        //remove old elements as needed
        labels.exit().remove();
        group.exit().remove();
        return arc;
      }
    };
  });
}).call(this);
