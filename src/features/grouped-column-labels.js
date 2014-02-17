/* global d4: false */
(function() {
  'use strict';
  d4.features.groupedColumnLabels = function(name) {
    return {
      accessors: {
        x: function(d, i) {
          var width = this.x.rangeBand() / this.countGroups();
          var xPos = this.x(d[this.xKey()]) + width * i;
          var gutter = width * 0.1;
          return xPos + width/2 - gutter;
        },

        y: function(d) {
          return (d[this.yKey()] < 0 ? this.y(0) : this.y(d[this.yKey()])) -5;
        },

        text: function(d) {
          return d3.format('').call(this, d[this.yKey()]);
        }
      },
      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var group = this.svg.select('.' + name).selectAll('.group')
          .data(data)
          .enter().append('g')
          .attr('class', function(d,i) {
            return 'series'+ i +  ' ' + this.xKey();
          }.bind(this));

        var text = group.selectAll('text')
          .data(function(d) {
            return d.values;
          }.bind(this));
        text.exit().remove();
        text.enter().append('text')
          .attr('class', 'column-label')
          .text(scope.accessors.text.bind(this))
          .attr('y', scope.accessors.y.bind(this))
          .attr('x', scope.accessors.x.bind(this));
      }
    };
  };
}).call(this);
