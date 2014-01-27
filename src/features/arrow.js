/* global d4: false */
(function() {
  'use strict';
  d4.features.arrow = function(name) {
    return {
      accessors: {
        tipSize: function(){
          return 6;
        },
        x1: function() {
          return this.x(0);
        },

        x2: function() {
          return this.x(this.width - this.margin.left - this.margin.right);
        },

        y1: function() {
          return this.y(0);
        },

        y2: function() {
          return  this.y(this.height - this.margin.top - this.margin.bottom);
        }
      },
      render: function(scope) {
        var defs = this.svg.select('defs');

        defs.append('marker')
          .attr('id', name + '-end')
          .attr('viewBox', '0 0 10 10')
          .attr('refX', 10)
          .attr('refY', 5)
          .attr('markerWidth', scope.accessors.tipSize.bind(this))
          .attr('markerHeight', scope.accessors.tipSize.bind(this))
          .attr('orient', 'auto')
          .append('path')
          .attr('d', 'M 0 0 L 10 5 L 0 10 z');

        defs.append('marker')
          .attr('id', name + '-start')
          .attr('viewBox', '0 0 10 10')
          .attr('refX', 10)
          .attr('refY', 5)
          .attr('markerWidth', -scope.accessors.tipSize.bind(this)())
          .attr('markerHeight', scope.accessors.tipSize.bind(this))
          .attr('orient', 'auto')
          .append('path')
          .attr('d', 'M 0 0 L 10 5 L 0 10 z');

        this.featuresGroup.append('g').attr('class', name);
        var arrow = this.svg.select('.' + name)
          .append('line')
          .attr('class', 'line')
          .attr('x1', scope.accessors.x1.bind(this))
          .attr('x2', scope.accessors.x2.bind(this))
          .attr('y1', scope.accessors.y1.bind(this))
          .attr('y2', scope.accessors.y2.bind(this))
          .attr('marker-end', 'url(#' + name + '-end)');

        return arrow;
      }
    };
  };
}).call(this);
