(function() {
  /*!
   * global d3: false
   * global d4: false
   */

  'use strict';
  d4.features.columnLabels = function(name) {
    return {
      accessors: {
        x: function(d) {
          return this.x(d[this.xKey]) + (this.x.rangeBand() / 2);
        },

        y: function(d) {
          var height = Math.abs(this.y(d[this.yKey]) - this.y(0));
          return (d[this.yKey] < 0 ? this.y(d[this.yKey]) - height : this.y(d[this.yKey])) - 5;
        },

        text: function(d) {
          return d3.format('').call(this, d[this.yKey]);
        }
      },
      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var label = this.svg.select('.'+name).selectAll('.'+name).data(data);
        label.enter().append('text');
        label.exit().remove();
        label.attr('class', 'column-label')
          .text(scope.accessors.text.bind(this))
          .attr('x', scope.accessors.x.bind(this))
          .attr('y', scope.accessors.y.bind(this));
        return label;
      }
    };
  };
}).call(this);
