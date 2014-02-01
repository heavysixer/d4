D4
---

D4 is a friendly DSL charting library for D3. The goal of D4 is to allow developers
to quickly build data-driven charts with little knowledge of the internals of D3.

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

Base Charts
***********

* Area Chart (Coming Soon)
* Column Chart
* Line Chart
* Mekko Chart (Coming Soon)
* Pie Chart
* Row Chart (Bar Chart)
* Scatter Chart
* Waterfall Chart

Chart Feature Mix-ins
*********************

* Arrows
* Column Labels
* Column Series Connectors (Coming Soon)
* Grid
* Legend (Coming Soon)
* Line Series
* Reference Lines
* Row Labels
* Trend Line
* X Axis
* Y Axis

Examples
********

::

  // Simple example
  var columnChart = window.d4.columnChart()

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
    .mixin({
      'grid': d4.features.grid
    }, 0)
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

TODO
****

* Come up with a consistent way to specify dimensions for the chart.
* Find a good way to set the range from inside a custom accessor.