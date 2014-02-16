## D4

D4 is a friendly DSL charting library for D3. The goal of D4 is to allow developers
to quickly build data-driven charts with little knowledge of the internals of D3.

#### Quick Start

Either download d4 directly from the repository or install it using a package manager like bower.

    $ bower install d4

Once you have a local copy of d4 simply include it after d3 in your source file.

    <!DOCTYPE html>
    <html>
    <head>
      <!-- sensible defaults for styles -->
      <link href="d4.css" rel="stylesheet" />
    </head>
    <body>
      ...
    <script src="d3.js"></script>
    <script src="d4.js"></script>
    </body>
    </html>

#####Hello World
Here is the most basic example, which uses all the preset defaults provided by d4.

    var data = [
      { x : '2010', y : 5 },
      { x : '2011', y : 15 },
      { x : '2012', y : 20 }
    ];
    var columnChart = d4.columnChart();

    d3.select('someDomElement')
      .datum(data)
      .call(columnChart);

### Philosophy
* * *

Many charting libraries do a poor job when it comes to separations of concerns.
They attempt to be an all-in-one tool, which is at odds with how modern
applications are built. Developers do not want a monolith that owns
the data transformation, visual aesthetics, and interactivity. This leads to
enormous libraries with huge config files, where every minutia about the chart
must be decided upon beforehand. This typically means developers must first
learn a specialized API in order to control even simple aspects of the chart
which would be better delegated to other technologies. d4's attempts to do just
enough, by enforcing these rules:


##### CSS is for styling

Many charting libraries make internal decisions on visual aesthetics, which may
remove control from the designer, who may or may not understand JavaScript let
alone the charting API. Choices on visual design like series colors and font
sizes are best made in CSS. d4 exposes convenient hooks in the generated markup
to allow visual designer to get precise control over the look and feel without
needing deep knowledge of d4.


##### The chart does not own the data

Data is a stand-alone object, which can be controlled by many other items on
the page. It should not change the data object. It can make non-permanent
transformations.

### Terminology
* * *

d4 uses specific terms to describe the components of a chart.

__Chart__ - The data rendered by d3 into a graphical representation.

__Feature__ - A visual component of a chart, which helps convey meaning in the data.

__Dimension__ - A segment of the data described by the chart.

__Parser__ - A parser prepares the data for a chart.

###Base Charts

* Area Chart (Coming Soon)
* Column Chart
* Grouped Column Chart
* Line Chart
* Mekko Chart (Coming Soon)
* Pie Chart
* Row Chart (Bar Chart)
* Scatter Chart
* Waterfall Chart

#### Chart Features (Mix-ins)

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


#### Inspiration
The inspiration of D4's modular and declarative structure came from
[Mike Bostock's](http://bost.ocks.org/mike/chart/) article on writing reusable
charts in d3.

####Roadmap
* Allow mouse events
* Allow for multiple charts within the same SVG element
* Find a good way to set the range from inside a custom accessor.