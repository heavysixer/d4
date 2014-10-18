(function() {
  'use strict';

  /*
   * The donut chart
   *
   *##### Features
   *
   * `arcs` - The arc series
   * `arcLabels` - The data labels linked to the arcs
   * `radius` - The total radius of the chart
   * `arcWidth` - The width of the arc
   *
   *##### Example Usage
   *
   *     var generateData = function() {
   *       var data = [];
   *       var names = ['Clay Hauck', 'Diego Hickle', 'Heloise Quitzon',
   *         'Hildegard Littel', 'Janiya Legros', 'Karolann Boehm',
   *         'Lilyan Deckow IV', 'Lizeth Blick', 'Marlene O\'Kon', 'Marley Gutmann'
   *       ],
   *         pie = d3.layout.pie()
   *           .sort(null)
   *           .value(function(d) {
   *             return d.unitsSold;
   *           });
   *       d4.each(names, function(name) {
   *         data.push({
   *           unitsSold: Math.max(10, Math.random() * 100),
   *           salesman: name
   *         });
   *       });
   *       return pie(data);
   *     };
   *
   *     var chart = d4.charts.donut()
   *       .outerWidth($('#pie').width())
   *       .margin({
   *         left: 0,
   *         top: 0,
   *         right: 0,
   *         bottom: 0
   *       })
   *       .radius(function() {
   *         return this.width / 8;
   *       })
   *       .arcWidth(50)
   *       .using('arcLabels', function(labels) {
   *         labels.text(function(d) {
   *           return d.data.salesman;
   *         })
   *       })
   *       .using('arcs', function(slices) {
   *         slices.key(function(d) {
   *           return d.data.salesman;
   *         });
   *       });
   *
   *
   *     var redraw = function() {
   *       var data = generateData();
   *       d3.select('#pie')
   *         .datum(data)
   *         .call(chart);
   *     };
   *     (function loop() {
   *       redraw();
   *       setTimeout(loop, 4500);
   *     })();
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
        [{
          'name': 'arcs',
          'feature': d4.features.arcSeries
        }, {
          'name': 'arcLabels',
          'feature': d4.features.arcLabels
        }]);
  });
}).call(this);
