(function() {
  /*!
   * global d3: false
   * global d4: false
   */

  'use strict';
  d4.feature('rowLabels', function(name) {
    return {
      accessors: {
        x: function(d) {
          var width = (Math.abs(this.x(d[this.x.$key])) + this.x(d[this.x.$key]))/2;
          return Math.max(this.x(0), width) + 10;
        },

        y: function(d) {
          return this.y(d[this.y.$key]) + (this.y.rangeBand() / 2);
        },

        text: function(d) {
          return d3.format('').call(this, d[this.x.$key]);
        }
      },
      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var group = this.svg.select('.' + name).selectAll('.group')
          .data(data)
          .enter().append('g')
          .attr('class', function(d, i) {
            return 'series' + i + ' ' + this.x.$key;
          }.bind(this));

        var text = group.selectAll('text')
          .data(function(d) {
            return d.values;
          }.bind(this));
        text.exit().remove();
        text.enter().append('text')
          .text(scope.accessors.text.bind(this))
          .attr('class', 'column-label')
          .attr('y', scope.accessors.y.bind(this))
          .attr('x', scope.accessors.x.bind(this));
        return text;
      }
    };
  });
}).call(this);
