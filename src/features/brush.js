(function() {
  'use strict';

  d4.feature('brush', function(name) {
    var brush = d3.svg.brush();

    var obj = {
      accessors: {
        brushstart : function(){},
        brush: function(){},
        brushend: function(){}
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
