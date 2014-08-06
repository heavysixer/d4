(function() {
  'use strict';
  /*
   *
   * @name lineSeries
   */
  d4.feature('lineSeries', function(name) {
    var line = d3.svg.line();
    line.interpolate('linear');
    return {
      accessors: {
        classes: function(d, n) {
          return 'line stroke series' + n;
        },

        key: d4.functor(d4.defaultKey),

        x: function(d) {
          return this.x(d[this.x.$key]);
        },

        y: function(d) {
          return this.y(d[this.y.$key]);
        }
      },
      proxies: [{
        target: line
      }],
      render: function(scope, data, selection) {
        selection.append('g').attr('class', name);
        line
          .x(d4.functor(scope.accessors.x).bind(this))
          .y(d4.functor(scope.accessors.y).bind(this));

        var group = selection.select('.' + name).selectAll('g')
          .data(data, d4.functor(scope.accessors.key).bind(this));
        group.exit().remove();
        group.enter().append('g')
          .attr('data-key', function(d) {
            return d.key;
          })
          .attr('class', d4.functor(scope.accessors.classes).bind(this))
          .append('path')
          .attr('d', function(d) {
            return line(d.values);
          });
        return group;
      }
    };
  });
}).call(this);
