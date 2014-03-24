(function() {
  /*!
   * global d3: false
   * global d4: false
   */

  'use strict';
  d4.feature('lineSeries', function(name) {
    var line = d3.svg.line();
    line.interpolate('basis');
    return {
      accessors: {
        x: function(d) {
          return this.x(d[this.x.$key]);
        },

        y: function(d) {
          return this.y(d[this.y.$key]);
        },

        classes: function(d, n) {
          return 'line stroke series' + n;
        }
      },
      proxies: [line],
      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        line
          .x(d4.functor(scope.accessors.x).bind(this))
          .y(d4.functor(scope.accessors.y).bind(this));

        var group = this.svg.select('.' + name).selectAll('.group')
          .data(data);
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
      }
    };
  });
}).call(this);
