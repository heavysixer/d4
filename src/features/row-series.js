(function() {
  /*!
   * global d3: false
   * global d4: false
   */

  'use strict';
  d4.features.rowSeries = function(name) {
    return {
      accessors: {
        x: function(d) {
          return this.x(Math.min(0, d[this.xKey]));
        },

        y: function(d) {
          return this.y(d[this.yKey]);
        },

        height: function() {
          return this.y.rangeBand();
        },

        width: function(d) {
          return Math.abs(this.x(d[this.xKey]) - this.x(0));
        },

        classes: function(d, i) {
          return d[this.xKey] < 0 ? 'bar negative fill series' + i : 'bar positive fill series' + i;
        }
      },
      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var bar = this.svg.select('.'+name).selectAll('.'+name).data(data);
        bar.enter().append('rect');
        bar.exit().remove();
        bar.attr('class', scope.accessors.classes.bind(this))
          .attr('x', scope.accessors.x.bind(this))
          .attr('y', scope.accessors.y.bind(this))
          .attr('width', scope.accessors.width.bind(this))
          .attr('height', scope.accessors.height.bind(this));

        return bar;
      }
    };
  };
}).call(this);
