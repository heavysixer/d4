(function() {
  /*!
   * global d3: false
   * global d4: false
   */

  'use strict';
  d4.feature('lineSeriesLabels', function(name) {
    return {
      accessors: {
        x: function(d) {
          return this.x(d.values[d.values.length - 1][this.xKey]);
        },

        y: function(d) {
          return this.y(d.values[d.values.length - 1][this.yKey]);
        },

        text: function(d) {
          return d.key;
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
          .attr('data-key', function(d){
            return d.key;
          })
          .attr('class', scope.accessors.classes.bind(this));
        return label;
      }
    };
  });
}).call(this);