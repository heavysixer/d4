d4 (D3 DSL)
-----------

Philosophy
**********
  * CSS is for styling
    - The charts add hooks for styling but do not apply style themselves. For example,
    a chart will assign a unique class name to a series but will rely on the designer to assign
    the colors in CSS.
    - The chart expects a basic data format, but does not do any of the parsing itself. The data
    must be prepared before sending it into the chart.

  * The chart does not own the data
    - Data is a stand alone object which can be controlled by many other components
    - The chart should not get a copy of the data, it should reference the main object
    - It should not change the data object. It can make non-permanent transformations.

  * Declarative


Terminology
***********
  * Chart - The data rendered by d3 into a graphical representation.
  * Feature - A visual component of a chart, which helps convey meaning in the data
  * Dimension - A segment of the data described by the chart.

Examples
********

  ::

    // Simple example
    var columnChart = window.d4.columnChart()
      .margin({
        top: 15,
        right: 10,
        bottom: 30,
        left: 0
      })

    d3.select(domElement)
      .datum(data)
      .call(columnChart);

  ::

    // Overriding the default accessors of a chart feature
    var columnChart = window.d4.columnChart()
      .margin({
        top: 15,
        right: 10,
        bottom: 30,
        left: 0
      })

    d3.select(domElement)
      .datum(data)
      .call(columnChart);
      .using('bars', function(bars){
        bars
        .x(function(d){
          cumulativeX += d[0];
          return this.x(cumulativeX - d[0]);
        })
        .width(function(d){
          return this.x(d[0]);
        })
      })

    d3.select(domElement)
      .datum(data)
      .call(columnChart);

  ::

    // Mixing in a new feature for a chart
    var columnChart = window.d4.columnChart()
      .margin({
        top: 15,
        right: 10,
        bottom: 30,
        left: 0
      })

    d3.select(domElement)
      .datum(data)
      .call(columnChart);
      .using('bars', function(bars){
        bars
        .x(function(d){
          cumulativeX += d[0];
          return this.x(cumulativeX - d[0]);
        })
        .width(function(d){
          return this.x(d[0]);
        })
      })

      .mixin({
          'barAxisLabels': d4.features.columnLabels
        })

      .using('barAxisLabels', function(label) {
          label
            .x(function(d) {
              cumulativeAxisLabelX += d[0];
              return this.x(cumulativeAxisLabelX - d[0] / 2);
            })
            .y(function() {
              return this.height - this.margin.bottom;
            })
            .text(function(d, i) {
              return data.x.labels[i];
            });
        })

    d3.select(domElement)
      .datum(data)
      .call(columnChart);

Examples
********

 * Come up with a consistent way to specify dimensions for the chart.
 * Find a good way to set the range from inside a custom accessor.