(function() {
  'use strict';

  d4.feature('brush', function(name) {
    var brush = d3.svg.brush();

    var obj = {
      accessors: {
        brushable: function() {
          return d3.selectAll('.brushable');
        },
        brushstart: function() {
          this.svg.classed('selecting', true);
        },
        brushmove: function() {
          var e = d3.event.target.extent();
          this.features[name].accessors.brushable().classed('selected', function(d) {
            var selected = e[0][0] <= d[this.x.$key] &&
            d[this.x.$key] <= e[1][0] &&
            e[0][1] <= d[this.y.$key] &&
            d[this.y.$key] <= e[1][1];
            return selected;
          }.bind(this));
        },
        brushend: function() {
          this.svg.classed('selecting', !d3.event.target.empty());
        }
      },
      proxies: [{
        target: brush
      }],
      render: function(scope, data, selection) {
        d4.appendOnce(selection, 'g.' + name)
          .call(brush.x(this.x).y(this.y)
            .on('brushstart', d4.functor(scope.accessors.brushstart).bind(this))
            .on('brush', d4.functor(scope.accessors.brushmove).bind(this))
            .on('brushend', d4.functor(scope.accessors.brushend).bind(this)));
      }
    };
    return obj;
  });
}).call(this);
