(function() {
  'use strict';
  /*
   * Arc series is a collection of arcs suitable for those needed by pie and donut charts.
   * Many of the accessors of this feature proxy directly to D3's arc object:
   * https://github.com/mbostock/d3/wiki/SVG-Shapes#arc
   *
   *##### Accessors
   *
   * `centroid` - proxied accessor to the navtive d3 function
   * `classes` - classes assigned to the arc label.
   * `duration` - time in milliseconds for the transition to occur.
   * `endAngle` - proxied accessor to the navtive d3 function
   * `innerRadius` - proxied accessor to the navtive d3 function
   * `key` - unique identifier used for linking the element during d3's transition process
   * `outerRadius` - proxied accessor to the navtive d3 function
   * `startAngle` - proxied accessor to the navtive d3 function
   * `x` - position across the x axis
   * `y` - position across the y axis
   *
   * @name arcSeries
   */
  d4.feature('arcSeries', function(name) {
    var arc = d3.svg.arc();
    return {
      accessors: {
        classes: function(d, n) {
          return 'arc stroke fill series' + n;
        },

        duration: 750,

        key: d4.functor(d4.defaultKey),

        x: function() {
          return this.width / 2;
        },

        y: function() {
          return this.height / 2;
        }
      },
      proxies: [{
        target: arc
      }],
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

        // FIXME: radius and arcWidth are assumed to be provided by the enclosing chart. maybe we should default back to a feature based implementation if it doesn't find it?
        var r = d4.functor(this.radius).bind(this)(),
          x = d4.functor(scope.accessors.x).bind(this)(),
          y = d4.functor(scope.accessors.y).bind(this)(),
          aw = d4.functor(this.arcWidth).bind(this)(r);
        arc
          .innerRadius(r)
          .outerRadius(r - aw);

        var group = d4.appendOnce(selection, 'g.' + name);
        var arcGroups = group.selectAll('g')
          .data(data);

        arcGroups.enter()
          .append('g')
          .attr('class', name)
          .attr('transform', 'translate(' + x + ',' + y + ')');

        var arcs = arcGroups.selectAll('path')
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
        arcGroups.exit().remove();
        return arc;
      }
    };
  });
}).call(this);
