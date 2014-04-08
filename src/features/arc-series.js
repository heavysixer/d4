(function() {
  'use strict';
  d4.feature('arcSeries', function(name) {
    var arc = d3.svg.arc();
    return {
      accessors: {
        radius : function() {
          return Math.min(this.width, this.height) / 2;
        },
        classes: function(d, n) {
          return 'arc stroke series' + n;
        }
      },
      proxies: [arc],
      render: function(scope, data, selection) {
        selection.append('g').attr('class', name);
        // work in progress.
      }
    };
  });
}).call(this);
