## How to choose a chart

Before describing how to choose a chart first consider why we should use a chart
at all. Charts employ our visual and spacial reasoning skills developed over a
millennia to quickly isolate, synthesize, and then evaluate the environment
around us. Charts therefore afford the viewer a tool to quickly understand data
visually. Gary Klass describes the goal of charts this way:

>  A graphical chart provides a visual display of data that otherwise would be
>  presented in a table; a table, one that would otherwise be presented in
>  text. Ideally, a chart should convey ideas about the data that would not be
>  readily apparent if they were displayed in a table or as text.
>  -- [Gary Klass](http://lilt.ilstu.edu/gmklass/pos138/datadisplay/sections/goodcharts.htm#Badly)

As Klass points out, charts are not about displaying data, they are about
conveying ideas through data. Successful charts are succinct self-explanatory
visual systems which answers a question about the **comparison**, **composition**,
**distribution** or **interrelationship** of the data they present. What follows is a
collection of charts divided among the kinds of questions they are well-suited
to answer.

**Comparison** - When comparing and contrasting the difference in data over an
interval period or between member of a group, a comparison chart is a fine
choice. As with all charting choices restraint should be applied here too. For
example if you are comparing year to date totals of your sales force, a sortable
table can take up less visual space and be more useful than a multi-series bar
chart.

Comparison charts work best when visual scale of data values are hard to
understand textually. Revisiting our previous example, imagine one salesperson
has noticeably outperformed their peers. This difference may only add a couple
of zeros to a table column, which may be hard to appreciate by just casually
scanning the document. However when the totals are mapped visually the
comparison can be quite expressive.

Comparison charts also work well when showing the change in values over time.
This is why line charts are commonly used to show the ebb and flow of a
company's stock price. The following charts work well when the comparison of
data values is the goal:

|                 |     |                                                                        |
|-----------------|-----|------------------------------------------------------------------------|
| Column chart    |  d4 | [elsewhere](http://bl.ocks.org/llad/3766585)                           |
| Bar chart       |  d4 | [elsewhere](http://bl.ocks.org/mbostock/3885304)                       |
| Table           |  d4 | [elsewhere](http://jsfiddle.net/7WQjr/)                                |
| Radar chart     |  d4 | [elsewhere](http://graves.cl/radar-chart-d3/)                          |
| Line chart      |  d4 | [elsewhere](http://bl.ocks.org/mbostock/3884955)                       |
| Bullet chart    |  d4 | [elsewhere](http://bl.ocks.org/mbostock/4061961)                       |
| Small multiples |  d4 | [elsewhere](http://vallandingham.me/small_multiples_with_details.html) |
| Heatmap chart   |  d4 | [elsewhere](http://bl.ocks.org/tjdecke/5558084>)                       |


**Composition** - When the story behind your data includes the cumulative total
of the various series along with the series themselves a composition chart may
be the right choice. Composition charts allow you to isolate individual series
but visually link them to a larger whole. The following charts works well for
answering questions about composition:

|                    |     |                                                                                      |
|--------------------|-----|--------------------------------------------------------------------------------------|
| Stacked column     | d4  | [elsewhere](http://bl.ocks.org/mbostock/1134768)                                     |
| Stacked area chart | d4  | [elsewhere](http://bl.ocks.org/mbostock/3885211)                                     |
| Waterfall chart    | d4  | [elsewhere](http://dimplejs.org/advanced_examples_viewer.html?id=advanced_waterfall) |
| Donut chart        | d4  | [elsewhere](http://bl.ocks.org/mbostock/3887193)                                     |

**Distribution** - Distribution charts are used when the question you want to
answer relates to how data is spread out across a field of values or when you
want to show a correlation between two variables.

|                   |    |                                                  |
|-------------------|----|--------------------------------------------------|
| Column histogram  | d4 | [elsewhere](http://bl.ocks.org/mbostock/3048450) |
| Line Histogram    | d4 | elsewhere                                        |
| Scatter plot      | d4 | [elsewhere](http://bl.ocks.org/mbostock/3887118) |

**Relationship** - When answering a question about the relationship between
values, be it hierarchy, or similarity you are trying to explain the
relationship. Relationship charts are good for displaying large numbers of data
points without being constrained by a time axis. Relationship charts are good at
highlighting similarities between data values rather than difference.
Relationship charts are also often used when displaying large numbers of values
which may differ by orders of magnitude.

|                |    |                                                                         |
|----------------|----|-------------------------------------------------------------------------|
| Scatter plot   | d4 | [elsewhere](http://bl.ocks.org/mbostock/4063663)                        |
| Sunburst chart | d4 | [elsewhere](http://bl.ocks.org/mbostock/4063423)                        |
| Treemaps       | d4 | [elsewhere](http://bl.ocks.org/mbostock/4063582)                        |
| Bubble chart   | d4 | [elsewhere](http://dimplejs.org/examples_viewer.html?id=bubbles_matrix) |

If you are struggling to determine what chart to use this [pdf document](http://extremepresentation.typepad.com/files/choosing-a-good-chart-09.pdf) as a
method to kick start a thought experiment.

#### Features of a D3 chart

Part of D3's flexibility is because it aims to be a grammar for creating data
driven visuals; therefore charts are merely a subset of D3's total vocabulary.
D3

**Data symbols** - A chart is a graphical representation of data. The data is
described through the use of visual symbols. In some cases they can be geometric
shapes like circles, or rectangles, and at other times they can be lines, which
connect to points.

**Borders** - Borders visually separate the chart from the surrounding interface
and should only be used if this separation would be unclear to the viewer.

**Grid lines:** - Are used as visual connectors to link visually separated
elements together. Grid lines should be as light as possible, ideally the viewer
should only become aware of them if they are looking for them.

**Scales** - Scales define the minimum and maximum values for a given dimension
dataset. Typically scales are divided into regular increments along the axes.

**Axes** - The axes represents numerical coordinates across a plane. In charts the
axes are unique markers of the cartesian coordinate system, and allow the viewer
to correlate the position and size of data symbols within the chart field to
specific values along the axes.

**Text** - Text values in D3 charts are typically used to annotate data symbols,
or axis units. Text elements can also be used to give a fuller context to the
chart when applied to titles, or footnotes. However, text should be minimized
because charts are meant express information quickly and visually. The overuse
of text should suggest to the designer that their chart is not as expressive as
it could be. The most common uses of text in D3 charts are:

**Title** - Depending on your audience titles can either persuade the viewer
towards a particular conclusion or simply describe the data series.

**Axis titles** - Axis titles should only be used if they provide important
information what would not otherwise be ascertained by reading the title or
axis labels.

**Data Labels** - These labels annotate data symbols with information which would
otherwise be hard to visually correlate quickly. That said, data labels can add
visual noise to the interface when overused and should only be employed if they
enhance the readability of the chart.

**Legends** - Legends describe the various series in a multi-series chart.
Therefore they should only be used when displaying more than one data series.

**Annotations** - Annotations are notes, source references, or other textual
caveats that help explain an aspect of the chart that cannot be represented
visually.

**Transitions**
(TODO)

**Layouts**
(TODO)

**Data** - D3 accepts data in a variety of formats, which can frame the kind of
chart that is chosen.

An array of numbers:

    var numbers = [4, 5, 18, 23, 42];

Or an array of objects:

    var letters = [
      {name: "A", frequency: 0.08167},
      {name: "B", frequency: 0.01492},
      {name: "C", frequency: 0.02780},
      {name: "D", frequency: 0.04253},
      {name: "E", frequency: 0.12702}
    ];

Even an array of arrays:

    var matrix = [
      [ 0,  1,  2,  3],
      [ 4,  5,  6,  7],
      [ 8,  9, 10, 11],
      [12, 13, 14, 15]
    ];

**Resources**

- http://lilt.ilstu.edu/gmklass/pos138/datadisplay/sections/goodcharts.htm
- http://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf
- http://members6.boardhost.com/Charts/index.html?1383074016
- http://dimplejs.org/