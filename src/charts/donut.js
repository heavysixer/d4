(function() {
  'use strict';

  /*
   * The donut chart
   *
   * @name donut
   */
  d4.chart('donut', function donut() {
    return d4.baseChart({
      config: {
        accessors: {
          radius: function() {
            return Math.min(this.width, this.height) / 2;
          },
          arcWidth: function(radius) {
            return radius / 3;
          }
        }
      }
    })
    .mixin(
        [{ 'name': 'slices',
          'feature': d4.features.arcSeries
        }, {
        'name': 'arcLabels',
        'feature': d4.features.arcLabels
      }]);
  });
}).call(this);