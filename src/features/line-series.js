/* global d4: false */
(function() {
  'use strict';
  d4.features.lineSeries = function(name) {
    return {
      accessors: {
        x: function(d) {
          return this.x(d[this.xKey()]);
        },

        y: function(d) {
          return this.y(d[this.yKey()]);
        },

        classes: function(d, n) {
          return 'line stroke series' + n;
        }
      },
      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var line = d3.svg.line()
          .x(scope.accessors.x.bind(this))
          .y(scope.accessors.y.bind(this));

        var lineSeries = this.svg.select('.'+name).selectAll('.'+name).data(data)
        .enter().append('path')
        .attr('d', function(d) {
          return line(d[this.xKey()]);
        }.bind(this))
        .attr('class', scope.accessors.classes.bind(this));
        return lineSeries;
      }
    };
  };
}).call(this);
