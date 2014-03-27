(function() {
  'use strict';
  d4.feature('dotSeries', function(name) {
    return {
      accessors: {
        cx: function(d) {
          return this.x(d[this.x.$key]);
        },

        cy: function(d) {
          return this.y(d[this.y.$key]);
        },

        r: function(d) {
          return this.z(d[this.z.$key]);
        },

        classes : function(d, i) {
          return 'dot series' + i + ' fill';
        }
      },
      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var group = this.svg.select('.' + name).selectAll('g')
          .data(data)
          .enter().append('g')
          .attr('class', function(d,i) {
            return 'series'+ i + ' ' +  this.y.$key;
          }.bind(this));

        var dots = group.selectAll('circle')
          .data(function(d) {
            return d.values;
          }.bind(this));

        dots.enter().append('circle');
        dots.exit().remove();
        dots
          .attr('class', d4.functor(scope.accessors.classes).bind(this))
          .attr('r', d4.functor(scope.accessors.r).bind(this))
          .attr('cx', d4.functor(scope.accessors.cx).bind(this))
          .attr('cy', d4.functor(scope.accessors.cy).bind(this));
        return dots;
      }
    };
  });
}).call(this);
