(function() {
  'use strict';

  d4.feature('brush', function(name) {
    var brush = d3.svg.brush();
    var setBrushScale = function(funct) {

      // User passed a d4 scale function directly into the brush's axis accessor.
      if (d4.isDefined(funct.$scale)) {
        return funct;
      } else {
        return d4.functor(funct).bind(this)();
      }
    };

    var brushDetectionFunction = function(e) {
      if (d4.isNull(brush.y())) {
        return function(d) {
          var x = d[this.x.$key];
          var selected = e[0] <= x && x <= e[1];
          return selected;
        }.bind(this);
      }

      if (d4.isNull(brush.x())) {
        return function(d) {
          var y = d[this.y.$key];
          var selected = e[0] <= y && y <= e[1];
          return selected;
        }.bind(this);
      }

      if (d4.isNotNull(brush.x()) && d4.isNotNull(brush.y())) {
        return function(d) {
          var selected = e[0][0] <= d[this.x.$key] &&
            d[this.x.$key] <= e[1][0] &&
            e[0][1] <= d[this.y.$key] &&
            d[this.y.$key] <= e[1][1];
          return selected;
        }.bind(this);
      }
    };

    var obj = {
      accessors: {
        brushable: function() {
          return d3.selectAll('.brushable');
        },
        brushend: function() {
          this.container.classed('selecting', !d3.event.target.empty());
        },
        brushmove: function() {
          var e = d3.event.target.extent();
          var brushDetected = brushDetectionFunction.bind(this)(e);
          this.features[name].accessors.brushable().classed('selected', brushDetected);
        },
        brushstart: function() {
          this.container.classed('selecting', true);
        },
        clamp: brush.clamp,
        clear: brush.clear,
        extent: brush.extent,
        empty: brush.empty,
        event: brush.event,
        selection: function(selection) {
          return selection;
        },
        x: function() {
          return null;
        },
        y: function() {
          return null;
        },
      },

      render: function(scope, data, selection) {
        var brushX = setBrushScale.bind(this)(scope.accessors.x);
        var brushY = setBrushScale.bind(this)(scope.accessors.y);
        if (typeof brushX !== null) {
          brush.x(brushX);
        }
        if (typeof brushY !== null) {
          brush.y(brushY);
        }

        brush
          .on('brushstart', d4.functor(scope.accessors.brushstart).bind(this))
          .on('brush', d4.functor(scope.accessors.brushmove).bind(this))
          .on('brushend', d4.functor(scope.accessors.brushend).bind(this));
        d4.appendOnce(selection, 'g.' + name)
          .call(brush);

        scope.accessors.selection.bind(this)(selection.select('.brush'));
        scope.accessors.brush.bind(this)(brush);
        return brush;
      }
    };
    return obj;
  });
}).call(this);
