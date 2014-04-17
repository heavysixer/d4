(function() {
  'use strict';
  /*
   *
   *
   * @name lineSeriesLabels
   */
  d4.feature('lineSeriesLabels', function(name) {
    return {
      accessors: {
        x: function(d) {
          return this.x(d.values[d.values.length - 1][this.x.$key]);
        },

        y: function(d) {
          return this.y(d.values[d.values.length - 1][this.y.$key]);
        },

        text: function(d) {
          return d.key;
        },

        classes: function(d, n) {
          return 'stroke series' + n;
        }
      },
      render: function(scope, data, selection) {
        selection.append('g').attr('class', name);
        var label = this.svg.select('.' + name).selectAll('.' + name).data(data);
        label.enter().append('text');
        label.exit().remove();
        label.attr('class', 'lineSeriesLabel')
          .text(d4.functor(scope.accessors.text).bind(this))
          .attr('x', d4.functor(scope.accessors.x).bind(this))
          .attr('y', d4.functor(scope.accessors.y).bind(this))
          .attr('data-key', function(d) {
            return d.key;
          })
          .attr('class', d4.functor(scope.accessors.classes).bind(this));
        return label;
      }
    };
  });
}).call(this);
