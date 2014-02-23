(function() {
  /*!
   * global d3: false
   * global d4: false
   */

  'use strict';
  d4.features.scatterSeries = function(name) {
    return {
      accessors: {
        cx: function(d) {
          return this.x(d[this.xKey]);
        },

        cy: function(d) {
          return this.y(d[this.yKey]);
        },

        r: function(d) {
          return this.z(d[this.zKey]);
        },

        classes : function(d, i) {
          return 'dot series' + i + ' fill';
        }
      },
      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var dots = this.svg.select('.'+name).selectAll('.'+name).data(data);
        dots.enter().append('circle');
        dots.attr('class', scope.accessors.classes.bind(this))
        .attr('r', scope.accessors.r.bind(this))
        .attr('cx', scope.accessors.cx.bind(this))
        .attr('cy', scope.accessors.cy.bind(this));

        // returning a selection allows d4 to bind d3 events to it.
        return dots;
      }
    };
  };
}).call(this);
