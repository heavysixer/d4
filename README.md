## D4

D4 is a friendly DSL charting library for D3. The goal of D4 is to allow developers
to quickly build data-driven charts with little knowledge of the internals of D3.

### Quick Start
* * *

Either download d4 directly from the [github](https://github.com/heavysixer/d4) repository or install it using a package manager like bower.

    $ bower install d4

Once you have a local copy of d4 simply include it **after** d3 in your source file.

```html
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
```

#####Hello World
Here is the most basic example, which uses many of the preset defaults provided by d4.

```javascript
var data = [
  { x : '2010', y : 5 },
  { x : '2011', y : 15 },
  { x : '2012', y : 20 }
];
var columnChart = d4.charts.column();

d3.select('someDomElement')
  .datum(data)
  .call(columnChart);
```
#####Getting Fancy
d4 allows you to quickly build up sophisticated charts using a declaritive and highly contextual API that allows you to mixin
or mixout features from your chart.

```javascript
var data = [
  { x : '2010', y : 5 },
  { x : '2011', y : 15 },
  { x : '2012', y : 20 }
];

// Create a column chart without a yAxis, but with a grid in the background.
var columnChart = d4.charts.column()
.mixout('yAxis')
.mixin('grid', d4.features.grid, 0)

d3.select('someDomElement')
  .datum(data)
  .call(columnChart);
```

#####Additional Examples
There are **many** more examples of d4 in the examples site inside the source code repository. Simply clone the repo and
open the `examples/` folder in your favorite web browser.

You can find a hosted version of the example site here: http://visible.io/

### Philosophy
* * *

Many charting libraries do a poor job when it comes to separations of concerns.
They attempt to be an all-in-one tool, which is at odds with how modern
applications are built. Developers do not want a monolith that owns
the data transformation, visual aesthetics, and interactivity. This leads to
enormous libraries with huge config files, where every minutia about the chart
must be decided upon beforehand. This typically means developers must first
learn a specialized API in order to control even the most basic aspects of the chart.
d4 believes many of these responsibilities would be better delegated to other technologies.
If developers were woodworkers then d4 would be a jig, which allows complex cuts to be made
in fraction of the time it would normally take.

#### CSS is for styling

Many charting libraries make internal decisions on visual aesthetics, which may
remove control from the graphic designer, who may or may not understand JavaScript let
alone a specialized charting API. Choices on visual design like the colors for data series and font
sizes are best made in CSS. d4 exposes convenient hooks in the generated markup
to allow visual designer to get precise control over the look and feel without
needing deep knowledge of d4.

#### The chart does not own the data

Data is a stand-alone object, which can be relied upon by many other scripts on
the page. Therefore, a charting library should not change the data object. It can make non-permanent
transformations.

#### Context over configuration

There is a software design concept called "convention over configuration," which states that software should specify a collection of opinionated defaults for the developer. The goal of this approach is to lessen the number of obvious choices a developer must make before they are able to use the software. Instead, configuration should be saved for instances where the defaults do not apply. d4 extends this concept a bit and suggests that configuration should also be highly contextual to the object the developer needs changed. Instead of making choices in some abstract config file, developers instead use a highly declarative API to make changes directly to the object they want augment.

#### Terminology
* * *

d4 uses specific terms to describe the components of a chart.

__Chart__ - The data rendered by d3 into a graphical representation.

__Feature__ - A visual component of a chart, which helps convey meaning in the data.

__Dimension__ - A segment of the data described by the chart.

__Parser__ - A parser prepares the data for a chart.

####Base Charts

* Area Chart (Coming Soon)
* Column Chart
* Grouped Column Chart
* Line Chart
* Mekko Chart (Coming Soon)
* Pie Chart
* Row Chart
* Scatter Chart
* Stacked Column Chart
* Stacked Row Chart
* Waterfall Chart

#### Chart Features (Mix-ins)

* Arrows
* Column Labels
* Dot Series
* Grid
* Grouped Column Series
* Line Series
* Line Series Labels
* Reference Lines
* Stacked Column Labels
* Stacked Column Series
* Trend Line
* Waterfall Column Connectors
* X Axis
* Y Axis


#### Inspiration
The inspiration of D4's modular and declarative structure came from
[Mike Bostock's](http://bost.ocks.org/mike/chart/) article on writing reusable
charts in d3.

#### Other Projects using d4
[d4-rails](https://github.com/gouravtiwari/d4-rails)
