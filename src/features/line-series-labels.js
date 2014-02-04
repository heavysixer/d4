/* global d4: false */
(function() {
  'use strict';
  d4.features.lineSeriesLabels = function(name) {

    // Expects a data series in the following format:
    // [{name: 'series1', values:[[dateObject, number],...]}]
    return {
      accessors: {
        x: function(d) {
          return this.x(d.values[d.values.length - 1][0]);
        },

        y: function(d) {
          return this.y(d.values[d.values.length - 1][1]);
        },

        text: function(d) {
          return d.name;
        },

        classes: function(d,n) {
          return 'stroke series' + n;
        }
      },
      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var label = this.svg.select('.'+name).selectAll('.'+name).data(data);
        label.enter().append('text');
        label.exit().remove();
        label.attr('class', 'lineSeriesLabel')
          .text(scope.accessors.text.bind(this))
          .attr('x', scope.accessors.x.bind(this))
          .attr('y', scope.accessors.y.bind(this))
          .attr('class', scope.accessors.classes.bind(this));
        return label;
      }
    };
  };
}).call(this);