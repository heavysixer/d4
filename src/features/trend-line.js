/* global d4: false */
(function() {
  'use strict';
  d4.features.trendLine = function(name) {
    return {
      accessors: {
        x1: function() {
          return this.x(0);
        },

        x2: function() {
          return this.x(this.width);
        },

        y1: function() {
          return this.y(0);
        },

        y2: function() {
          return this.y(this.height);
        },

        text: function(d) {
          return d3.format('').call(this, d[1]);
        },

        textX: function() {
          return this.x(this.width);
        },

        textY: function(){
          return this.x(this.height);
        }
      },
      render: function(scope) {
        var defs = this.svg.select('defs');

        defs.append('marker')
          .attr('id', name + '-start')
          .attr('viewBox', '0 0 10 10')
          .attr('refX', 10)
          .attr('refY', 5)
          .attr('markerWidth', -6)
          .attr('markerHeight', 6)
          .attr('orient', 'auto')
          .append('path')
          .attr('d', 'M 0 0 L 10 5 L 0 10 z');

        this.featuresGroup.append('g').attr('class', name);
        var trendLine = this.svg.select('.' + name)
          .append('line')
          .attr('class', 'line')
          .attr('x1', scope.accessors.x1.bind(this))
          .attr('x2', scope.accessors.x2.bind(this))
          .attr('y1', scope.accessors.y1.bind(this))
          .attr('y2', scope.accessors.y2.bind(this))
          .attr('marker-end', 'url(#' + name + '-start)');

        this.svg.select('.' + name)
          .append('text')
          .attr('class', 'trendLine-label')
          .text(scope.accessors.text.bind(this))
          .attr('x', scope.accessors.textX.bind(this))
          .attr('y', scope.accessors.textY.bind(this));
        return trendLine;
      }
    };
  };
}).call(this);
