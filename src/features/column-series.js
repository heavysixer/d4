/* global d4: false */
/*

  DEPRECATION WARNING: This feature is deprecated in favor of using the nested
  column series renderer. Intrinsicly this makes sense because a normal column
  chart is mearly a stacked column chart with only one series.
*/
(function() {
  'use strict';
  d4.features.columnSeries = function(name) {
    return {
      accessors: {
        x: function(d) {
          return this.x(d[this.xKey]);
        },

        y: function(d) {
          return d[this.yKey] < 0 ? this.y(0) : this.y(d[this.yKey]);
        },

        width: function() {
          return this.x.rangeBand();
        },

        height: function(d) {
          return Math.abs(this.y(d[this.yKey]) - this.y(0));
        },

        classes: function(d, i) {
          return d[this.yKey] < 0 ? 'bar negative fill series' + i : 'bar positive fill series' + i;
        }
      },
      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var series = this.svg.select('.' + name).selectAll('.' + name + 'Series').data(data);
        series.enter().append('g');
        series.exit().remove();
        series.attr('class', function(d, i) {
          return 'series' + i;
        });

        var bar = series.selectAll('rect').data(function(d) {
          return [d];
        });
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
