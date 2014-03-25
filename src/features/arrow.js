(function() {
  /*!
   * global d3: false
   * global d4: false
   */
  'use strict';
  d4.feature('arrow', function(name) {
    return {
      accessors: {
        tipSize: function(){
          return 6;
        },
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
          return  this.y(this.height);
        },
        classes: function(){
          return 'line';
        }
      },
      render: function(scope) {
        var defs = this.svg.select('defs');

        defs.selectAll('marker').data([0,0]).enter().append('marker')
          .attr('id', name + '-end')
          .attr('viewBox', '0 0 10 10')
          .attr('refX', 10)
          .attr('refY', 5)
          .attr('markerWidth', d4.functor(scope.accessors.tipSize).bind(this))
          .attr('markerHeight', d4.functor(scope.accessors.tipSize).bind(this))
          .attr('orient', 'auto')
          .append('path')
          .attr('d', 'M 0 0 L 10 5 L 0 10 z')

          .append('marker')
          .attr('id', name + '-start')
          .attr('viewBox', '0 0 10 10')
          .attr('refX', 10)
          .attr('refY', 5)
          .attr('markerWidth', -d4.functor(scope.accessors.tipSize).bind(this)())
          .attr('markerHeight', d4.functor(scope.accessors.tipSize).bind(this))
          .attr('orient', 'auto')
          .append('path')
          .attr('d', 'M 0 0 L 10 5 L 0 10 z');

        this.featuresGroup.append('g').attr('class', name);
        var arrow = this.svg.select('.' + name)
          .append('line')
          .attr('class', d4.functor(scope.accessors.classes).bind(this))
          .attr('x1', d4.functor(scope.accessors.x1).bind(this))
          .attr('x2', d4.functor(scope.accessors.x2).bind(this))
          .attr('y1', d4.functor(scope.accessors.y1).bind(this))
          .attr('y2', d4.functor(scope.accessors.y2).bind(this))
          .attr('marker-end', 'url(#' + name + '-end)');

        return arrow;
      }
    };
  });
}).call(this);
