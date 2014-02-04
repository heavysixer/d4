/* global d4: false */
(function() {
  'use strict';
  d4.features.columnSeries = function(name) {
    var isArray = function(val) {
      return (val) instanceof Array;
    };

    // A column series needs to be three arrays deep eg:
    // [
    //  [ "series 1", [1,2,3]],
    //  [ "series 2", [3,5,6]]
    // ]
    // In the cases where a single multi-dimensional array is provided we will
    // assume they are not supplying the outer series array, in which case we
    // wrap the data in an array and return it.
    var ensureSeriesArray = function(data) {
      if (isArray(data) && isArray(data[0]) && isArray(data[0][1])) {
        return data;
      } else {
        return [data];
      }
    };

    return {
      accessors: {
        x: function(d) {
          return this.x(d[0]);
        },

        y: function(d) {
          return d[1] < 0 ? this.y(0) : this.y(d[1]);
        },

        width: function() {
          return this.x.rangeBand();
        },

        height: function(d) {
          return Math.abs(this.y(d[1]) - this.y(0));
        },

        classes: function(d, i) {
          return d[1] < 0 ? 'bar negative fill series' + i : 'bar positive fill series' + i;
        }
      },
      render: function(scope, data) {
        ensureSeriesArray(data);
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
