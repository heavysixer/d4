D4
---

D4 is a friendly DSL charting library for D3. The goal of D4 is to allow developers
to quickly build data-driven charts with little knowledge of the internals of D3.

Philosophy
**********
Many charting libraries do a poor job when it comes to separations of concerns.
They attempt to be an all-in-one tool, which is at odds with how modern
applications are built. Developers do not want a monolith that owns
the data transformation, visual aesthetics, and interactivity. This leads to
enormous libraries with huge config files, where every minutia about the chart
must be decided upon beforehand. This typically means developers must first
learn a specialized API in order to control even simple aspects of the chart
which would be better delegated to other technologies. d4's attempts to do just
enough, by enforcing these rules:

*CSS is for styling*

Many charting libraries make internal decisions on visual aesthetics, which may
remove control from the designer, who may or may not understand JavaScript let
alone the charting API. Choices on visual design like series colors and font
sizes are best made in CSS. d4 exposes convenient hooks in the generated markup
to allow visual designer to get precise control over the look and feel without
needing deep knowledge of d4.

*The chart does not own the data*
Data is a stand-alone object, which can be controlled by many other items on
the page. It should not change the data object. It can make non-permanent
transformations.

Terminology
***********

* Chart - The data rendered by d3 into a graphical representation.
* Feature - A visual component of a chart, which helps convey meaning in the data
* Dimension - A segment of the data described by the chart.

Base Charts
***********

* Area Chart (Coming Soon)
* Column Chart
* Grouped Column Chart
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

  // Mixing feature in or out of a chart
  var columnChart = window.d4.columnChart()
    .mixout('yAxis')
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

Roadmap
*******
* Allow mouse events
* Allow for multiple charts within the same SVG element
* Find a good way to set the range from inside a custom accessor.