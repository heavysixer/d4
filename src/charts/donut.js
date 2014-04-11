(function() {
  'use strict';

  /*
   * The donut chart
   *
   * @name donut
   */
  d4.chart('donut', function donut() {
    return d4.baseChart()
    .mixin(
        [{ 'name': 'slices',
          'feature': d4.features.arcSeries
        }]);
  });
}).call(this);