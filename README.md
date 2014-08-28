## D4

D4 is a friendly charting DSL for D3. The goal of D4 is to allow developers
to quickly build data-driven charts with little knowledge of the internals of D3.

### Quick Start
* * *

For the bleeding edge version of d4 download it directly from the [github](https://github.com/heavysixer/d4) repository. If you prefer a more stable release you can install the latest released tag using a package manager like bower.

    $ bower install d4
    or
    $ npm install d4

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
d4 allows you to quickly build up sophisticated charts using a declarative and highly contextual API that allows you to mixin
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
.mixin({ 'name' : 'grid', 'feature' : d4.features.grid, 'index' : 0 })

d3.select('someDomElement')
  .datum(data)
  .call(columnChart);
```

#####Additional Examples

There are **many** more examples of d4 in the examples site inside the source code repository. Simply clone the repo and
open the `examples/` folder in your favorite web browser.

You can find a hosted version of the example site here: http://visible.io/

You can find a quickstart presentation on d4 [here](http://www.slideshare.net/heavysixer/d4-and-friendly-charting-dsl-for-d3).

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
* [Column Chart](http://visible.io/charts/column/basic.html)
* [Donut Chart](http://visible.io/charts/donut/basic.html)
* [Grouped Column Chart](http://visible.io/charts/grouped-column/basic.html)
* [Grouped Row Chart](http://visible.io/charts/grouped-column/grouped-row.html)
* [Line Chart](http://visible.io/charts/line/basic.html)
* [Row Chart](http://visible.io/charts/row/basic.html)
* [Scatter Chart](http://visible.io/charts/scatter/basic.html)
* [Stacked Column Chart](http://visible.io/charts/stacked-column/basic.html)
* [Stacked Row Chart](http://visible.io/charts/stacked-column/stacked-row.html)
* Waterfall Chart (both [horizontal](http://visible.io/charts/waterfall/horizontal.html) and [vertical](http://visible.io/charts/waterfall/basic.html))

#### Chart Features (Mixins)

* [Arc Labels](https://github.com/heavysixer/d4/blob/master/src/features/arc-labels.js)
* [Arc Series](https://github.com/heavysixer/d4/blob/master/src/features/arc-series.js)
* [Arrows](https://github.com/heavysixer/d4/blob/master/src/features/arrow.js)
* [Brush](https://github.com/heavysixer/d4/blob/master/src/features/brush.js)
* [Column Labels](https://github.com/heavysixer/d4/blob/master/src/features/column-labels.js)
* [Grid](https://github.com/heavysixer/d4/blob/master/src/features/grid.js)
* [Grouped Column Series](https://github.com/heavysixer/d4/blob/master/src/features/grouped-column-series.js)
* [Line Series Labels](https://github.com/heavysixer/d4/blob/master/src/features/line-series-labels.js)
* [Line Series](https://github.com/heavysixer/d4/blob/master/src/features/line-series.js)
* [Reference Lines](https://github.com/heavysixer/d4/blob/master/src/features/reference-line.js)
* [Stacked Column Connectors](https://github.com/heavysixer/d4/blob/master/src/features/stacked-column-connectors.js)
* [Stacked Labels](https://github.com/heavysixer/d4/blob/master/src/features/stacked-labels.js)
* [Stacked Circle Series](https://github.com/heavysixer/d4/blob/master/src/features/stacked-shapes-series.js#L100)
* [Stacked Ellipse Series](https://github.com/heavysixer/d4/blob/master/src/features/stacked-shapes-series.js#L167)
* [Stacked Rect Series](https://github.com/heavysixer/d4/blob/master/src/features/stacked-shapes-series.js#L238)
* [Trend Line](https://github.com/heavysixer/d4/blob/master/src/features/trend-line.js)
* [Waterfall Column Connectors](https://github.com/heavysixer/d4/blob/master/src/features/waterfall-connectors.js)
* [X Axis](https://github.com/heavysixer/d4/blob/master/src/features/x-axis.js)
* [Y Axis](https://github.com/heavysixer/d4/blob/master/src/features/y-axis.js)

#### Contributing

If you make improvements to d4, please share with others.

Fork the project on GitHub.

Make your feature addition or bug fix.

Commit with Git.

Send @heavysixer a pull request.

#### Inspiration
Where possible d4 follows existing d3 community best-practices. The inspiration of D4's modular and declarative structure came from
[Mike Bostock's](http://bost.ocks.org/mike/chart/) article on writing reusable
charts in d3. d4 also follows the [general update pattern](http://bl.ocks.org/mbostock/3808234) too. (mostly)

#### Other Projects using d4
[d4-rails](https://github.com/gouravtiwari/d4-rails)
