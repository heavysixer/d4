/* global d4: false */
(function() {
  'use strict';
  d4.features.scatterSeries = function(name) {
    return {
      accessors: {
        cx: function(d) {
          return this.x(d.values[this.xKey()]);
        },

        cy: function(d) {
          return this.y(d.values[this.yKey()]);
        },

        r: function(d) {
          return this.z(d.values[this.zKey()]);
        },

        classes : function(d, i) {
          return 'dot series' + i + ' fill';
        }
      },
      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var dot = this.svg.select('.'+name).selectAll('.'+name).data(data);
        dot.enter().append('circle');
        dot.attr('class', scope.accessors.classes.bind(this))
        .attr('r', scope.accessors.r.bind(this))
        .attr('cx', scope.accessors.cx.bind(this))
        .attr('cy', scope.accessors.cy.bind(this));

        return dot;
      }
    };
  };
}).call(this);
