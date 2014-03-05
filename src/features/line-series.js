(function() {
  /*!
   * global d3: false
   * global d4: false
   */

  'use strict';
  d4.feature('lineSeries', function(name) {
    return {
      accessors: {
        x: function(d) {
          return this.x(d[this.x.$key]);
        },
        y: function(d) {
          return this.y(d[this.y.$key]);
        },
        interpolate: function() {
          return 'basis';
        },
        classes: function(d, n) {
          return 'line stroke series' + n;
        }
      },
      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var line = d3.svg.line()
          .interpolate(scope.accessors.interpolate.bind(this)())
          .x(scope.accessors.x.bind(this))
          .y(scope.accessors.y.bind(this));

        var group = this.svg.select('.' + name).selectAll('.group')
          .data(data);
        group.exit().remove();
        group.enter().append('g')
          .attr('data-key', function(d) {
            return d.key;
          })
          .attr('class', function(d, i) {
            return 'series' + i;
          }.bind(this))
          .append('path')
          .attr('d', function(d) {
            return line(d.values);
          });
      }
    };
  });
}).call(this);
