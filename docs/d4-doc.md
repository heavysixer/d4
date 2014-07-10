# d4 -0.8.4

###### [base.js][0]

* [`axes`][1]
* [`builder`][2]
* [`clone`][3]
* [`features`][4]
* [`margin`][5]
* [`mixin`][6]
* [`mixout`][7]
* [`outerHeight`][8]
* [`outerWidth`][9]
* [`using`][10]
* [`appendOnce`][11]
* [`baseChart`][12]
* [`builder`][2]
* [`chart`][13]
* [`createAccessorProxy`][14]
* [`extend`][15]
* [`feature`][16]
* [`flatten`][17]
* [`functor`][18]
* [`isArray`][19]
* [`isContinuousScale`][20]
* [`isDate`][21]
* [`isDefined`][22]
* [`isFunction`][23]
* [`isObject`][24]
* [`isOrdinalScale`][25]
* [`isNotFunction`][26]
* [`isUndefined`][27]
* [`merge`][28]
* [`parser`][29]

###### [helpers.js][30]

* [``][31]

###### [column.js][32]

* [`column`][33]

###### [donut.js][34]

* [`donut`][35]

###### [grouped-column.js][36]

* [`groupedColumn`][37]

###### [grouped-row.js][38]

* [`groupedRow`][39]

###### [line.js][40]

* [`line`][41]

###### [row.js][42]

* [`row`][43]

###### [scatter.js][44]

* [`scatterPlot`][45]

###### [stacked-column.js][46]

* [`stackedColumn`][47]

###### [stacked-row.js][48]

* [`stackedRow`][49]

###### [waterfall.js][50]

* [`waterfall`][51]

###### [scales.js][52]

* [`linearScaleForNestedData`][53]
* [`timeScaleForNestedData`][54]
* [`ordinalScaleForNestedData`][55]

###### [arc-labels.js][56]

* [`arcLabels`][57]

###### [arc-series.js][58]

* [`arcSeries`][59]

###### [arrow.js][60]

* [`arrow`][61]

###### [column-labels.js][62]

* [`columnLabels`][63]

###### [grid.js][64]

* [`grid`][65]

###### [grouped-column-series.js][66]

* [`groupedColumnSeries`][67]

###### [line-series-labels.js][68]

* [``][31]

###### [line-series.js][69]

* [``][31]

###### [reference-line.js][70]

* [`referenceLine`][71]

###### [stacked-column-connectors.js][72]

* [`stackedColumnConnectors`][73]

###### [stacked-labels.js][74]

* [`stackedLabels`][75]

###### [stacked-shapes-series.js][76]

* [`circleSeries`][77]
* [`ellipseSeries`][78]
* [`rectSeries`][79]

###### [trend-line.js][80]

* [`trendLine`][81]

###### [waterfall-connectors.js][82]

* [`waterfallConnectors`][83]

###### [x-axis.js][84]

* [`xAxis`][85]

###### [y-axis.js][86]

* [`yAxis`][87]

###### [nested-group.js][88]

* [`nestedGroup`][89]

###### [nested-stack.js][90]

* [`nestedStack`][91]

###### [waterfall.js][50]

* [`waterfall`][51]

## base.js

### axes

[\#][1]
[Ⓣ][0]

This function returns the internal axes object as a parameter to the  
supplied function.

#### Arguments

1. `funct`_(Function) -- function which will perform the modifcation._

#### Returns  
  
_(Function)_ -chart instance

---

### builder

[\#][2]
[Ⓣ][0]

Specifies an object, which d4 uses to initialize the chart with. By default  
d4 expects charts to return a builder object, which will be used to  
configure defaults for the chart. Typically this means determining the  
the default value for the various axes. This accessor allows you to  
override the existing builder provided by a chart and use your own.

##### Examples

    myChart.builder = function(chart, data){
        return {
           link: function(chart, data) {
               configureScales.bind(this)(chart, data);
           }
        };
    };
    

#### Arguments

1. `funct`_(Function) -- function which returns a builder object._

#### Returns  
  
_(Function)_ -chart instance

---

### clone

[\#][3]
[Ⓣ][0]

This function creates a deep copy of the current chart and returns it.  
This is useful if you have to create several charts which have a variety  
of shared features but deviate from each other in a small number of ways.

##### Examples

     var chart = d4.charts.column();
     var clone = chart.clone();
    

#### Returns  
  
_(Function)_ -a copy of the current chart

---

### features

[\#][4]
[Ⓣ][0]

To see what features are currently mixed into your chart you can use  
this method. This function cannot be chained.

##### Examples

     // Mixout the yAxis which is provided as a default
     var chart = d4.charts.column()
     .mixout('yAxis');
    
     // Now test that the feature has been removed.
     console.log(chart.features());
     // => ["bars", "barLabels", "xAxis"]
    

#### Returns  
  
_(Array)_ -An array of features.

---

### margin

[\#][5]
[Ⓣ][0]

To adjust the chart's margins supply either an object or a function that returns  
an object to this method.

##### Examples

     // set the margin this using an object:
     chart.margin({ top: 10, right: 10, bottom: 10, left: 10 });
    
     // set using a function:
     chart.margin(function(){
         return { top: 10, right: 10, bottom: 10, left: 10 };
     });
    
     // since JavaScript is a pass by reference language you can also
     // set portions of the margin this way:
     chart.margin().left = 20;
    
     // there are also accessor method for each property of the margin
     // object:
     chart.marginLeft(20);
     chart.marginLeft() // => 20;
    

#### Arguments

1. `funct`_(\*) -- an object or a function that returns an object._

#### Returns  
  
_(Function)_ -chart instance

---

### mixin

[\#][6]
[Ⓣ][0]

Specifies a feature to be mixed into a given chart.  
The feature is an object where the key represents the feature name, and a  
value which is a function that when invoked returns a d4 feature object.

##### Examples

     // Mix in a single feature at a specific depth
     chart.mixin({ name : 'grid', feature : d4.features.grid, index: 0 })
    
     // Mix in multiple features at once.
     chart.mixin([
                  { name : 'zeroLine', feature : d4.features.referenceLine },
                  { name : 'grid', feature : d4.features.grid, index: 0 }
                 ])
    

#### Arguments

1. `features`_(\*) -- an object or array of objects describing the feature to mix in._

#### Returns  
  
_(Function)_ -chart instance

---

### mixout

[\#][7]
[Ⓣ][0]

Specifies an existing feature of a chart to be removed (mixed out).

##### Examples

     // Mixout the yAxis which is provided as a default
     var chart = d4.charts.column()
     .mixout('yAxis');
    
     // Now test that the feature has been removed.
     console.log(chart.features());
     => ["bars", "barLabels", "xAxis"]
    

#### Arguments

1. `name`_(String) -- accessor name for chart feature._

#### Returns  
  
_(Function)_ -chart instance

---

### outerHeight

[\#][8]
[Ⓣ][0]

Returns or sets the outerHeight of the chart.

#### Arguments

1. `height`_(Number) -_

#### Returns  
  
_(Function)_ -chart instance

---

### outerWidth

[\#][9]
[Ⓣ][0]

Returns or sets the outerWidth of the chart.

#### Arguments

1. `width`_(Number) -_

#### Returns  
  
_(Function)_ -chart instance

---

### using

[\#][10]
[Ⓣ][0]

The heart of the d4 API is the `using` function, which allows you to  
contextually modify attributes of the chart or one of its features.

##### Examples

     chart.mixin({ 'zeroLine': d4.features.referenceLine })
     .using('zeroLine', function(zero) {
       zero
         .x1(function() {
           return this.x(0);
         })
     });
    

#### Arguments

1. `name`_(String) -- accessor name for chart feature._
2. `funct`_(Function) -- function which will perform the modifcation._

#### Returns  
  
_(Function)_ -chart instance

---

### appendOnce

[\#][11]
[Ⓣ][0]

This function conditionally appends a SVG element if it doesn't already  
exist within the parent element.

##### Examples

// this will create a svg element, with the id of chart and apply two classes "d4 and chart"  
d4.appendOnce(selection, 'svg\#chart.d4.chart')

#### Arguments

1. `Selection}`_(D3) -- parent DOM element_
2. `-`_(String) -string to use as the dom selector_

#### Returns  
  
_(D3)_ -Selection} selection

---

### baseChart

[\#][12]
[Ⓣ][0]

This function creates a d4 chart object. It is only used when creating a  
new chart factory.

##### Examples

     var chart = d4.baseChart({
       builder: myBuilder,
       config: {
         axes: {
           x: {
             scale: 'linear'
           },
           y: {
             scale: 'ordinal'
           }
         }
       }
     });
    

#### Arguments

1. `options`_(Object) -- object which contains an optional config and /or_

#### Returns  
  
_(Function)_ -chart instance

---

### builder

[\#][2]
[Ⓣ][0]

This function allows you to register a reusable chart builder with d4\.

#### Arguments

1. `name`_(String) -- accessor name for chart builder._
2. `funct`_(Function) -- function which will instantiate the chart builder._

#### Returns  
  
_(Function)_ -a reference to the chart builder

---

### chart

[\#][13]
[Ⓣ][0]

This function allows you to register a reusable chart with d4\.

#### Arguments

1. `name`_(String) -- accessor name for chart._
2. `funct`_(Function) -- function which will instantiate the chart._

#### Returns  
  
_(Function)_ -a reference to the chart function

---

### createAccessorProxy

[\#][14]
[Ⓣ][0]

This function allows create proxy accessor to other objects. This is most  
useful when you need a feature to transparently control a component of a  
d3 object. Consider the example of the yAxis feature. It allows you to control  
a d3 axis object. To the user the d4 axis feature and the d3 axis object are  
one in the same, and they will expect that they can interact with an d4 axis  
feature in the same way they could with a d3 axis object. Therefore before  
the feature is created we first use this function to create a transparent  
proxy that links the two.

##### Examples

       d4.feature('yAxis', function(name) {
           var axis = d3.svg.axis();
           var obj = { accessors : {} };
           d4.createAccessorProxy(obj, axis);
           return obj;
      });
    
      // Then when using the feature you can transparently access the axis properties
      chart.using('yAxis', function(axis){
          // => 0
          axis.ticks();
      });
    

#### Arguments

1. `proxy`_(Object) -- The proxy object, which masks the target._
2. `target`_(Object) -- The target objet, which is masked by the proxy_
3. `prefix`_(String) -- Optional prefix to add to the method names, which helps avoid naming collisions on the proxy._

---

### extend

[\#][15]
[Ⓣ][0]

Helper method to extend one object with the attributes of another.

##### Examples:

       var opts = d4.extend({
         margin: {
           top: 20,
           right: 20,
           bottom: 40,
           left: 40
         },
         width: 400
       }, config);
    

#### Arguments

1. `obj`_(Object) -- the object to extend_
2. `overrides`_(Object) -- the second object who will extend the first._

#### Returns  
  
_(Object)_ -the first object which has now been extended;

---

### feature

[\#][16]
[Ⓣ][0]

This function allows you to register a reusable chart feature with d4\.

#### Arguments

1. `name`_(String) -- accessor name for chart feature._
2. `funct`_(Function) -- function which will instantiate the chart feature._

#### Returns  
  
_(Function)_ -a reference to the chart feature

---

### flatten

[\#][17]
[Ⓣ][0]

Helper method to flatten a multi-dimensional array into a single array.

#### Arguments

1. `arr`_(Array) -- array to be flattened._

#### Returns  
  
_(Array)_ -flattened array.

---

### functor

[\#][18]
[Ⓣ][0]

Based on D3's own functor function.

> If the specified value is a function, returns the specified value. Otherwise,  
> returns a function that returns the specified value. This method is used  
> internally as a lazy way of upcasting constant values to functions, in  
> cases where a property may be specified either as a function or a constant.  
> For example, many D3 layouts allow properties to be specified this way,  
> and it simplifies the implementation if we automatically convert constant  
> values to functions.
> 

#### Arguments

1. `funct`_(\*) -- An function or other variable to be wrapped in a function_

#### Returns  
  
_(Function)_ -

---

### isArray

[\#][19]
[Ⓣ][0]

Helper method to determine if a supplied argument is an array

#### Arguments

1. `obj`_(\*) -- the argument to test_

#### Returns  
  
_(Boolean)_ -

---

### isContinuousScale

[\#][20]
[Ⓣ][0]

Helper method to determine if the supplied scale wants continuous as  
opposed to ordinal values.

---

### isDate

[\#][21]
[Ⓣ][0]

Helper method to determine if a supplied argument is a date

#### Arguments

1. `obj`_(\*) -- the argument to test_

#### Returns  
  
_(Boolean)_ -

---

### isDefined

[\#][22]
[Ⓣ][0]

Helper method to determine if a supplied argument is defined

#### Arguments

1. `value`_(\*) -- the argument to test_

#### Returns  
  
_(Boolean)_ -

---

### isFunction

[\#][23]
[Ⓣ][0]

Helper method to determine if a supplied argument is a function

#### Arguments

1. `obj`_(\*) -- the argument to test_

#### Returns  
  
_(Boolean)_ -

---

### isObject

[\#][24]
[Ⓣ][0]

Helper method to determine if a supplied argument is not an object

#### Arguments

1. `obj`_(\*) -- the argument to test_

#### Returns  
  
_(Boolean)_ -

---

### isOrdinalScale

[\#][25]
[Ⓣ][0]

Helper method to determine if the supplied scale wants ordinal as  
opposed to continuous values.

---

### isNotFunction

[\#][26]
[Ⓣ][0]

Helper method to determine if a supplied argument is not a function

#### Arguments

1. `obj`_(\*) -- the argument to test_

#### Returns  
  
_(Boolean)_ -

---

### isUndefined

[\#][27]
[Ⓣ][0]

Helper method to determine if a supplied argument is undefined

#### Arguments

1. `value`_(\*) -- the argument to test_

#### Returns  
  
_(Boolean)_ -

---

### merge

[\#][28]
[Ⓣ][0]

Helper method to merge two objects together into a new object. This will leave  
the two orignal objects untouched. The overrides object will replace any  
values which also occur in the options object.

##### Examples:

       var opts = d4.merge({
         margin: {
           top: 20,
           right: 20,
           bottom: 40,
           left: 40
         },
         width: 400
       }, config);
    

#### Arguments

1. `options`_(Object) -- the first object_
2. `overrides`_(Object) -- the second object to merge onto the top._

#### Returns  
  
_(Object)_ -newly merged object;

---

### parser

[\#][29]
[Ⓣ][0]

This function allows you to register a reusable data parser with d4\.

#### Arguments

1. `name`_(String) -- accessor name for data parser._
2. `funct`_(Function) -- function which will instantiate the data parser._

#### Returns  
  
_(\*)_ -a reference to the data parser

---

## helpers.js

### 

[\#][31]
[Ⓣ][30]

---

## column.js

### column

[\#][33]
[Ⓣ][32]

The column chart has two axes (`x` and `y`). By default the column chart expects  
linear values for the `y` and ordinal values on the `x`. The basic column chart  
has four default features:

##### Features

`bars` - series bars  
`barLabels` - data labels above the bars  
`xAxis` - the axis for the x dimension  
`yAxis` - the axis for the y dimension

##### Example Usage

    var data = [
        { x: '2010', y:-10 },
        { x: '2011', y:20 },
        { x: '2012', y:30 },
        { x: '2013', y:40 },
        { x: '2014', y:50 },
      ];
    var chart = d4.charts.column();
    d3.select('#example')
    .datum(data)
    .call(chart);
    

By default d4 expects a series object, which uses the following format: `{ x : '2010', y : 10 }`.  
The default format may not be desired and so we'll override it:

    var data = [
      ['2010', -10],
      ['2011', 20],
      ['2012', 30],
      ['2013', 40],
      ['2014', 50]
    ];
    var chart = d4.charts.column()
    .x(function(x) {
         x.key(0)
    })
    .y(function(y){
         y.key(1);
    });
    
    d3.select('#example')
    .datum(data)
    .call(chart);
    

---

## donut.js

### donut

[\#][35]
[Ⓣ][34]

The donut chart

##### Features

`arcs` - The arc series  
`arcLabels` - The data labels linked to the arcs  
`radius` - The total radius of the chart  
`arcWidth` - The width of the arc

##### Example Usage

    var generateData = function() {
      var data = [];
      var names = ['Clay Hauck', 'Diego Hickle', 'Heloise Quitzon',
        'Hildegard Littel', 'Janiya Legros', 'Karolann Boehm',
        'Lilyan Deckow IV', 'Lizeth Blick', 'Marlene O\'Kon', 'Marley Gutmann'
      ],
        pie = d3.layout.pie()
          .sort(null)
          .value(function(d) {
            return d.unitsSold;
          });
      d4.each(names, function(name) {
        data.push({
          unitsSold: Math.max(10, Math.random() * 100),
          salesman: name
        });
      });
      return pie(data);
    };
    
    var chart = d4.charts.donut()
      .outerWidth($('#pie').width())
      .margin({
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      })
      .radius(function() {
        return this.width / 8;
      })
      .arcWidth(50)
      .using('arcLabels', function(labels) {
        labels.text(function(d) {
          return d.data.salesman;
        })
      })
      .using('arcs', function(slices) {
        slices.key(function(d) {
          return d.data.salesman;
        });
      });
    
    
    var redraw = function() {
      var data = generateData();
      d3.select('#pie')
        .datum(data)
        .call(chart);
    };
    (function loop() {
      redraw();
      setTimeout(loop, 4500);
    })();
    

---

## grouped-column.js

### groupedColumn

[\#][37]
[Ⓣ][36]

The grouped column chart is used to compare a series of data elements grouped  
along the xAxis. This chart is often useful in conjunction with a stacked column  
chart because they can use the same data series, and where the stacked column highlights  
the sum of the data series across an axis the grouped column can be used to show the  
relative distribution.

##### Features

`bars` - series bars  
`barLabels` - data labels above the bars  
`groupsOf` - an integer representing the number of columns in each group  
`xAxis` - the axis for the x dimension  
`yAxis` - the axis for the y dimension

##### Example Usage

    var data = [
      { year: '2010', unitsSold:-100, salesman : 'Bob' },
      { year: '2011', unitsSold:200, salesman : 'Bob' },
      { year: '2012', unitsSold:300, salesman : 'Bob' },
      { year: '2013', unitsSold:400, salesman : 'Bob' },
      { year: '2014', unitsSold:500, salesman : 'Bob' },
      { year: '2010', unitsSold:100, salesman : 'Gina' },
      { year: '2011', unitsSold:100, salesman : 'Gina' },
      { year: '2012', unitsSold:-100, salesman : 'Gina' },
      { year: '2013', unitsSold:500, salesman : 'Gina' },
      { year: '2014', unitsSold:600, salesman : 'Gina' },
      { year: '2010', unitsSold:400, salesman : 'Average' },
      { year: '2011', unitsSold:0, salesman : 'Average' },
      { year: '2012', unitsSold:400, salesman : 'Average' },
      { year: '2013', unitsSold:400, salesman : 'Average' },
      { year: '2014', unitsSold:400, salesman : 'Average' }
    ];
    
    var parsedData = d4.parsers.nestedGroup()
      .x('year')
      .y('unitsSold')
      .value('unitsSold')(data);
    
    var chart = d4.charts.groupedColumn()
    .width($('#example').width())
    .x.$key('year')
    .y.$key('unitsSold')
    .groupsOf(parsedData.data[0].values.length);
    
    d3.select('#example')
    .datum(parsedData.data)
    .call(chart);
    

---

## grouped-row.js

### groupedRow

[\#][39]
[Ⓣ][38]

The grouped row chart is used to compare a series of data elements grouped  
along the xAxis. This chart is often useful in conjunction with a stacked row  
chart because they can use the same data series, and where the stacked row highlights  
the sum of the data series across an axis the grouped row can be used to show the  
relative distribution.

##### Features

`bars` - series bars  
`barLabels` - data labels above the bars  
`groupsOf` - an integer representing the number of rows in each group  
`xAxis` - the axis for the x dimension  
`yAxis` - the axis for the y dimension

##### Example Usage

    var data = [
      { year: '2010', unitsSold:-100, salesman : 'Bob' },
      { year: '2011', unitsSold:200, salesman : 'Bob' },
      { year: '2012', unitsSold:300, salesman : 'Bob' },
      { year: '2013', unitsSold:400, salesman : 'Bob' },
      { year: '2014', unitsSold:500, salesman : 'Bob' },
      { year: '2010', unitsSold:100, salesman : 'Gina' },
      { year: '2011', unitsSold:100, salesman : 'Gina' },
      { year: '2012', unitsSold:-100, salesman : 'Gina' },
      { year: '2013', unitsSold:500, salesman : 'Gina' },
      { year: '2014', unitsSold:600, salesman : 'Gina' },
      { year: '2010', unitsSold:400, salesman : 'Average' },
      { year: '2011', unitsSold:0, salesman : 'Average' },
      { year: '2012', unitsSold:400, salesman : 'Average' },
      { year: '2013', unitsSold:400, salesman : 'Average' },
      { year: '2014', unitsSold:400, salesman : 'Average' }
    ];
    
    var parsedData = d4.parsers.nestedGroup()
      .x('year')
      .y('unitsSold')
      .value('unitsSold')(data);
    
    var chart = d4.charts.groupedRow()
    .width($('#example').width())
    .x.$key('year')
    .y.$key('unitsSold')
    .groupsOf(parsedData.data[0].values.length);
    
    d3.select('#example')
    .datum(parsedData.data)
    .call(chart);
    

---

## line.js

### line

[\#][41]
[Ⓣ][40]

The line series chart is used to compare a series of data elements grouped  
along the xAxis.

##### Features

`lineSeries` - series lines  
`lineSeriesLabels` - data labels beside the lines  
`xAxis` - the axis for the x dimension  
`yAxis` - the axis for the y dimension

##### Example Usage

     var data = [
       { year: '2010', unitsSold:-100, salesman : 'Bob' },
       { year: '2011', unitsSold:200, salesman : 'Bob' },
       { year: '2012', unitsSold:300, salesman : 'Bob' },
       { year: '2013', unitsSold:400, salesman : 'Bob' },
       { year: '2014', unitsSold:500, salesman : 'Bob' },
       { year: '2010', unitsSold:100, salesman : 'Gina' },
       { year: '2011', unitsSold:100, salesman : 'Gina' },
       { year: '2012', unitsSold:-100, salesman : 'Gina' },
       { year: '2013', unitsSold:500, salesman : 'Gina' },
       { year: '2014', unitsSold:600, salesman : 'Gina' },
       { year: '2010', unitsSold:400, salesman : 'Average' },
       { year: '2011', unitsSold:0, salesman : 'Average' },
       { year: '2012', unitsSold:400, salesman : 'Average' },
       { year: '2013', unitsSold:400, salesman : 'Average' },
       { year: '2014', unitsSold:400, salesman : 'Average' }
     ];
     var parsedData = d4.parsers.nestedGroup()
       .x(function(){
         return 'year';
       })
       .nestKey(function(){
         return 'salesman';
       })
       .y(function(){
         return 'unitsSold';
       })
       .value(function(){
         return 'unitsSold';
       })(data);
    
     var chart = d4.charts.line()
     .width($('#example').width())
     .x.$key('year')
     .y.$key('unitsSold');
    
     d3.select('#example')
     .datum(parsedData.data)
     .call(chart);
    

---

## row.js

### row

[\#][43]
[Ⓣ][42]

The row chart has two axes (`x` and `y`). By default the column chart expects  
linear scale values for the `x` and ordinal scale values on the `y`. The basic column chart  
has four default features:

##### Features

`bars` - series bars  
`barLabels` - data labels to the right of the bars  
`xAxis` - the axis for the x dimension  
`yAxis` - the axis for the y dimension

##### Example Usage

     var data = [
           { y: '2010', x:-10 },
           { y: '2011', x:20 },
           { y: '2012', x:30 },
           { y: '2013', x:40 },
           { y: '2014', x:50 },
         ];
       var chart = d4.charts.row();
       d3.select('#example')
       .datum(data)
       .call(chart);
    

---

## scatter.js

### scatterPlot

[\#][45]
[Ⓣ][44]

The scatter plot has three axes (`x`, `y` and `z`). By default the scatter  
plot expects linear scale values for all axes. The basic scatter plot chart  
has these default features:

##### Features

`circles` - series of circles  
`xAxis` - the axis for the x dimension  
`yAxis` - the axis for the y dimension

##### Example Usage

     var data = [
       { age: 12, unitsSold: 0,    month: 1 },
       { age: 22, unitsSold: 200,  month: 2 },
       { age: 42, unitsSold: 300,  month: 3 },
       { age: 32, unitsSold: 400,  month: 4 },
       { age: 2 , unitsSold: 400,  month: 2 }
     ];
    
     var chart = d4.charts.scatterPlot()
     .x(function(x){
       x.min(-10)
       x.key('age');
     })
     .y(function(y){
       y.key('month');
     })
     .z(function(z){
       z.key('unitsSold');
     });
    
     d3.select('#example')
     .datum(data)
     .call(chart);
    

---

## stacked-column.js

### stackedColumn

[\#][47]
[Ⓣ][46]

The stacked column chart has two axes (`x` and `y`). By default the stacked  
column expects continious scale for the `y` axis and a discrete scale for  
the `x` axis. The stacked column has the following default features:

##### Features

`bars` - series of rects  
`barLabels` - individual data values inside the stacked rect  
`connectors` - visual lines that connect the various stacked columns together  
`columnTotals` - column labels which total the values of each stack.  
`xAxis` - the axis for the x dimension  
`yAxis` - the axis for the y dimension

##### Example Usage

     var data = [
         { year: '2010', unitsSold: 200, salesman : 'Bob' },
         { year: '2011', unitsSold: 200, salesman : 'Bob' },
         { year: '2012', unitsSold: 300, salesman : 'Bob' },
         { year: '2013', unitsSold: -400, salesman : 'Bob' },
         { year: '2014', unitsSold: -500, salesman : 'Bob' },
         { year: '2010', unitsSold: 100, salesman : 'Gina' },
         { year: '2011', unitsSold: 100, salesman : 'Gina' },
         { year: '2012', unitsSold: 200, salesman : 'Gina' },
         { year: '2013', unitsSold: -500, salesman : 'Gina' },
         { year: '2014', unitsSold: -600, salesman : 'Gina' },
         { year: '2010', unitsSold: 400, salesman : 'Average' },
         { year: '2011', unitsSold: 100, salesman : 'Average' },
         { year: '2012', unitsSold: 400, salesman : 'Average' },
         { year: '2013', unitsSold: -400, salesman : 'Average' },
         { year: '2014', unitsSold: -400, salesman : 'Average' }
       ];
    
     var parsedData = d4.parsers.nestedStack()
       .x(function(){
         return 'year';
       })
       .y(function(){
         return 'salesman';
       })
       .value(function(){
         return 'unitsSold';
       })(data);
    
     var chart = d4.charts.stackedColumn()
     .x(function(x){
       x.key('year');
     })
     .y(function(y){
       y.key('unitsSold');
     })
    
     d3.select('#example')
     .datum(parsedData.data)
     .call(chart);
    

---

## stacked-row.js

### stackedRow

[\#][49]
[Ⓣ][48]

The stacked row chart has two axes (`x` and `y`). By default the stacked  
row expects continious scale for the `x` axis and a discrete scale for  
the `y` axis. The stacked row has the following default features:

##### Features

`bars` - series of rects  
`barLabels` - individual data values inside the stacked rect  
`connectors` - visual lines that connect the various stacked columns together  
`columnTotals` - column labels which total the values of each stack.  
`xAxis` - the axis for the x dimension  
`yAxis` - the axis for the y dimension

##### Example Usage

     var data = [
           { year: '2010', unitsSold: 200, salesman : 'Bob' },
           { year: '2011', unitsSold: 200, salesman : 'Bob' },
           { year: '2012', unitsSold: 300, salesman : 'Bob' },
           { year: '2013', unitsSold: -400, salesman : 'Bob' },
           { year: '2014', unitsSold: -500, salesman : 'Bob' },
           { year: '2010', unitsSold: 100, salesman : 'Gina' },
           { year: '2011', unitsSold: 100, salesman : 'Gina' },
           { year: '2012', unitsSold: 200, salesman : 'Gina' },
           { year: '2013', unitsSold: -500, salesman : 'Gina' },
           { year: '2014', unitsSold: -600, salesman : 'Gina' },
           { year: '2010', unitsSold: 400, salesman : 'Average' },
           { year: '2011', unitsSold: 200, salesman : 'Average' },
           { year: '2012', unitsSold: 400, salesman : 'Average' },
           { year: '2013', unitsSold: -400, salesman : 'Average' },
           { year: '2014', unitsSold: -400, salesman : 'Average' }
         ];
    
       var parsedData = d4.parsers.nestedStack()
         .x(function(){
           return 'year';
         })
         .y(function(){
           return 'salesman';
         })
         .value(function(){
           return 'unitsSold';
         })(data);
    
       var chart = d4.charts.stackedRow()
       .x(function(x){
         x.key('unitsSold');
       })
       .valueKey('unitsSold')
       .y(function(y){
         y.key('year');
       });
    
      d3.select('#example')
      .datum(parsedData.data)
      .call(chart);
    

---

## waterfall.js

### waterfall

[\#][51]
[Ⓣ][50]

The waterfall chart visually tallies the cumulative result of negative and  
positive values over a data series. In addition to specifying the normal  
positive and negative values d4's also lets you designate a column as a subtotal  
column by passing in an "e" as the value key, which may be a familiar convention  
if you have used think-cell.

The waterfall chart has two axes (`x` and `y`). By default the stacked  
column expects continious scale for the `y` axis and a discrete scale for  
the `x` axis. This will render the waterfall chart vertically. However,  
if you swap the scale types then the waterfall will render horizontally.

##### Features

`bars` - series of rects  
`connectors` - visual lines that connect the various stacked columns together  
`columnLabels` - column labels which total the values of each rect.  
`xAxis` - the axis for the x dimension  
`yAxis` - the axis for the y dimension

##### Example Usage

     var data = [
         { 'category': 'Job',       'value': 27  },
         { 'category': 'Groceries', 'value': -3  },
         { 'category': 'Allowance', 'value': 22  },
         { 'category': 'Subtotal',  'value': 'e' },
         { 'category': 'Videos',    'value': -22 },
         { 'category': 'Coffee',    'value': -4  },
         { 'category': 'Total',     'value': 'e' }
       ];
       var parsedData = d4.parsers.waterfall()
         .x(function() {
           return 'category';
         })
         .y(function() {
           return 'value';
         })
         .nestKey(function() {
           return 'category';
         })(data);
    
       var chart = d4.charts.waterfall()
         .width($('#example').width())
         .x(function(x){
           x.key('category');
         })
         .y(function(y){
           y.key('value');
         });
    
       d3.select('#example')
         .datum(parsedData.data)
         .call(chart);
    

---

## scales.js

### linearScaleForNestedData

[\#][53]
[Ⓣ][52]

Creates a linear scale for a dimension of a given chart.

#### Arguments

1. `d4`_(Object) -chart object_
2. `data`_(Array) -array_
3. `string`_(string) -represnting a dimension e.g. \`x\`,\`y\`._

#### Returns  
  
_(Object)_ -Chart scale object

---

### timeScaleForNestedData

[\#][54]
[Ⓣ][52]

Creates a time scale for a dimension of a given chart.

#### Arguments

1. `d4`_(Object) -chart object_
2. `data`_(Array) -array_
3. `string`_(string) -represnting a dimension e.g. \`x\`,\`y\`._

#### Returns  
  
_(Object)_ -Chart scale object

---

### ordinalScaleForNestedData

[\#][55]
[Ⓣ][52]

Creates an ordinal scale for a dimension of a given chart.

#### Arguments

1. `d4`_(Object) -chart object_
2. `data`_(Array) -array_
3. `string`_(string) -represnting a dimension e.g. \`x\`,\`y\`._

#### Returns  
  
_(Object)_ -Chart scale object

---

## arc-labels.js

### arcLabels

[\#][57]
[Ⓣ][56]

Arc labels are used to annotate arc series, for example those created by pie and donut charts.  
Many of the accessors of this feature proxy directly to D3's arc object:  
[https://github.com/mbostock/d3/wiki/SVG-Shapes\#arc][92]

##### Accessors

`centroid` - proxied accessor to the navtive d3 function  
`classes` - classes assigned to the arc label.  
`duration` - time in milliseconds for the transition to occur.  
`endAngle` - proxied accessor to the navtive d3 function  
`innerRadius` - proxied accessor to the navtive d3 function  
`key` - unique identifier used for linking the element during d3's transition process  
`outerRadius` - proxied accessor to the navtive d3 function  
`startAngle` - proxied accessor to the navtive d3 function  
`text` - value to display in the label.  
`x` - position across the x axis  
`y` - position across the y axis

---

## arc-series.js

### arcSeries

[\#][59]
[Ⓣ][58]

Arc series is a collection of arcs suitable for those needed by pie and donut charts.  
Many of the accessors of this feature proxy directly to D3's arc object:  
[https://github.com/mbostock/d3/wiki/SVG-Shapes\#arc][92]

##### Accessors

`centroid` - proxied accessor to the navtive d3 function  
`classes` - classes assigned to the arc label.  
`duration` - time in milliseconds for the transition to occur.  
`endAngle` - proxied accessor to the navtive d3 function  
`innerRadius` - proxied accessor to the navtive d3 function  
`key` - unique identifier used for linking the element during d3's transition process  
`outerRadius` - proxied accessor to the navtive d3 function  
`startAngle` - proxied accessor to the navtive d3 function  
`x` - position across the x axis  
`y` - position across the y axis

---

## arrow.js

### arrow

[\#][61]
[Ⓣ][60]

The arrow feature is a convienient way to visually draw attention to a portion  
of a chart by pointing an arrow at it.

---

## column-labels.js

### columnLabels

[\#][63]
[Ⓣ][62]

The columnLabels feature is used to affix data labels to column series.

---

## grid.js

### grid

[\#][65]
[Ⓣ][64]

This feature allows you to specify a grid over a portion or the entire chart area.

---

## grouped-column-series.js

### groupedColumnSeries

[\#][67]
[Ⓣ][66]

This feature is specifically designed to use with the groupedColumn and groupedRow charts.

---

## line-series-labels.js

### 

[\#][31]
[Ⓣ][68]

@name lineSeriesLabels

---

## line-series.js

### 

[\#][31]
[Ⓣ][69]

@name lineSeries

---

## reference-line.js

### referenceLine

[\#][71]
[Ⓣ][70]

The reference line feature is helpful when you want to apply a line to a chart  
which demarcates a value within the data. For example a common use of this  
feature is to specify the zero value across an axis.

---

## stacked-column-connectors.js

### stackedColumnConnectors

[\#][73]
[Ⓣ][72]

Column connectors helpful when displaying a stacked column chart.  
A connector will not connect positve and negative columns. This is because  
in a stacked column a negative column may move many series below its previous  
location. This creates a messy collection of crisscrossing lines.

---

## stacked-labels.js

### stackedLabels

[\#][75]
[Ⓣ][74]

The stackedLabels are appropriate for use with the stacked shape series.

---

## stacked-shapes-series.js

### circleSeries

[\#][77]
[Ⓣ][76]

This feature is useful for displaying charts which need stacked circles.  
Note: Many of the d4 charts use the stacked series as the base, and simply  
renders only one series, if there is nothing to stack.

##### Accessors

`classes` - classes assigned to each circle in the series  
`cx` - placement on the chart's x axis  
`cy` - placement on the chart's y axis  
`r` - radius of the circle

---

### ellipseSeries

[\#][78]
[Ⓣ][76]

This feature is useful for displaying charts which need stacked ellipses.  
Note: Many of the d4 charts use the stacked series as the base, and simply  
renders only one series, if there is nothing to stack.

##### Accessors

`classes` - classes assigned to each ellipse in the series  
`cx` - placement on the chart's x axis  
`cy` - placement on the chart's y axis  
`rx` - radius of the ellipse on the x axis  
`ry` - radius of the ellipse on the y axis

---

### rectSeries

[\#][79]
[Ⓣ][76]

This feature is useful for displaying charts which need stacked rects.  
Note: Many of the d4 charts use the stacked series as the base, and simply  
renders only one series, if there is nothing to stack.

##### Accessors

`classes` - classes assigned to each rect in the series  
`height` - height of the rect  
`rx` - rounding of the corners against the x dimension  
`ry` - rounding of the corners against the y dimension  
`width` - width of the rect  
`x` - placement on the chart's x axis  
`y` - placement on the chart's y axis

---

## trend-line.js

### trendLine

[\#][81]
[Ⓣ][80]

A trendline allows you to associate a line with a numerical value.

---

## waterfall-connectors.js

### waterfallConnectors

[\#][83]
[Ⓣ][82]

Waterfall connectors are orthogonal series connectors which visually join  
column series together by spanning the top or bottom of adjacent columns.

##### Accessors

`x` - Used in placement of the connector lines.  
`y` - Used in placement of the connector lines.  
`span` - calculates the length of the connector line  
`classes` - applies the class to the connector lines.

---

## x-axis.js

### xAxis

[\#][85]
[Ⓣ][84]

This feature creates an xAxis for use within d4\. There are a variety of  
accessors described below which modify the behavior and apperance of the axis.

##### Accessors

`axis` - The d3 axis object itself.  
`innerTickSize` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#innerTickSize][93]  
`orient` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#orient][94]  
`outerTickSize`- see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#outerTickSize][95]  
`scale` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#scale][96]  
`stagger` - (true | false) determines if the axis should stagger overlapping text (true by default)  
`tickFormat` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#tickFormat][97]  
`tickPadding` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#tickPadding][98]  
`tickSize` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#tickSize][99]  
`tickSubdivide`- see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#tickSubdivide][100]  
`tickValues` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#tickValues][101]  
`ticks` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#ticks][102]

    var chart = d4.charts.groupedColumn()
    .using('yAxis', function(axis){
    
      // adjust the number of tick marks based on the height of the chart
      axis.ticks($('#example').height()/20);
    
      // set the inner and outer tick sizes
      axis.tickSize(10,5);
    
      // adjust the tick padding
      axis.tickPadding(5);
    
    })
    .using('xAxis', function(axis){
    
      // position the tickmarks on the top of the axis line
      axis.orient('top');
    
      // move the axis to the top of the chart.
      axis.align('top');
    })
    

---

## y-axis.js

### yAxis

[\#][87]
[Ⓣ][86]

This feature creates an xAxis for use within d4\. There are a variety of  
accessors described below which modify the behavior and apperance of the axis.

##### Accessors

`axis` - The d3 axis object itself.  
`innerTickSize` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#innerTickSize][93]  
`orient` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#orient][94]  
`outerTickSize`- see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#outerTickSize][95]  
`scale` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#scale][96]  
`stagger` - (true | false) determines if the axis should stagger overlapping text (true by default)  
`tickFormat` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#tickFormat][97]  
`tickPadding` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#tickPadding][98]  
`tickSize` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#tickSize][99]  
`tickSubdivide`- see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#tickSubdivide][100]  
`tickValues` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#tickValues][101]  
`ticks` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#ticks][102]

##### Examples

    var chart = d4.charts.groupedColumn()
    .using('yAxis', function(axis){
    
      // adjust the number of tick marks based on the height of the chart
      axis.ticks($('#example').height()/20);
    
      // set the inner and outer tick sizes
      axis.tickSize(10,5);
    
      // adjust the tick padding
      axis.tickPadding(5);
    
    })
    .using('xAxis', function(axis){
    
      // position the tickmarks on the top of the axis line
      axis.orient('top');
    
      // move the axis to the top of the chart.
      axis.y(-20);
    })
    

---

## nested-group.js

### nestedGroup

[\#][89]
[Ⓣ][88]

The nested group parser is useful for grouped column charts where multiple  
data items need to appear relative to the axis value, for example grouped  
column charts or multi-series line charts.

      _____________________
      |           _        |
      |   _ _    | |_      |
      |  | | |   | | |     |
      ----------------------
    

This module makes use of the d3's "nest" data structure layout

[https://github.com/mbostock/d3/wiki/Arrays\#-nest][103]

##### Approach

Just like D3, this parser uses a chaining declaritiave style to build up  
the necessary prerequistes to create the waterfall data. Here is a simple  
example. Given a data item structure like this: {"category" : "Category One", "value" : 23 }

     var parser = d4.parsers.nestedGroup()
         .x('category')
         .y('value')
         .value('value');
    
     var groupedColumnData = parser(data);
    

Keep reading for more information on these various accessor functions.

##### Accessor Methods

`x` - A function which returns a key to access the x values in the data array  
`y` - A function which returns a key to access the y values in the data array  
`value` - A function which returns a key to access the values in the data array.  
`data` - An array of objects with their dimensions specified like this:

      var data = [
      {"year" : "2010", "category" : "Category One", "value" : 23 },
      {"year" : "2010", "category" : "Category Two", "value" : 55 },
      {"year" : "2010", "category" : "Category Three", "value" : -10 },
      {"year" : "2010", "category" : "Category Four", "value" : 5 }]
    

---

## nested-stack.js

### nestedStack

[\#][91]
[Ⓣ][90]

The nested stack parser is useful for charts which take a data series  
and wants to sort them across a dimension and then display the results.  
The most common usecase would be a stacked column chart like this:

      _____________________
      |    _               |
      |   | |   _          |
      |   |-|  | |   _     |
      |   |-|  |-|  |-|    |
      |   | |  |-|  |-|    |
      ----------------------
    

This module makes use of the d3's "nest" data structure, and "stack" layout

* [https://github.com/mbostock/d3/wiki/Arrays\#-nest][103]
* [https://github.com/mbostock/d3/wiki/Stack-Layout][104]

##### Approach

Just like D3, this parser uses a chaining declaritiave style to build up  
the necessary prerequistes to create the stacked data. Here is a simple  
example:

     var parser = d4.parsers.nestedStack()
         .x(function() {
           return 'title';
         })
         .y(function(){
           return 'group';
         })
         .value(function() {
           return 'values';
         });
    
     var stackedData = parser(data);
    

Keep reading for more information on these various accessor functions.

##### Benefits

* Supports negative and positive stacked data series.

##### Limitations

* The parser expects the stack will occur on the yAxis, which means it is only suitable for column charts presently.

##### Accessor Methods

`x` : - function which returns a key to access the x values in the data array  
`y` : - function which returns a key to access the y values in the data array  
`value` : - function which returns a key to access the values in the data array.  
`data` : array - An array of objects with their dimensions specified like this:

     var data = [{ "title": "3 Years", "group" : "one", "value": 30 },
                 { "title": "3 Years", "group" : "two", "value": 20 },
                 { "title": "3 Years", "group" : "three", "value": 10 },
                 { "title": "5 Years", "group" : "one",  "value": 3 },
                 { "title": "5 Years", "group" : "two", "value": 2 },
                 { "title": "5 Years", "group" : "three", "value": 1 }]
    

##### Example Usage

Given the example data and dimension variables above you can use this module  
in the following way:

     var parser = d4.parsers.nestedStack()
     .x(function() {
       return 'title';
     })
     .y(function(){
       return 'group';
     })
     .value(function() {
       return 'value';
     })
     .call(data);
    

The `parser` variable will now be an object containing the following structure:

     {
       data: Array
       value: {
         key: string,
         values: Array
       },
       x: {
         key: string,
         values: Array
       },
       y: {
         key: string,
         values: Array
       }
     }
    

---

## waterfall.js

### waterfall

[\#][51]
[Ⓣ][50]

The waterfall parser is useful for waterfall charts where data items need to account  
for the position of earlier values:

     _____________________
     |   _        _______ |
     |  |_|___   | |  | | |
     |      |_|__|_|  | | |
     |                |_| |
     ----------------------
    

This module makes use of the d3's "nest" data structure, and "stack" layout  
[https://github.com/mbostock/d3/wiki/Arrays\#-nest][103]  
[https://github.com/mbostock/d3/wiki/Stack-Layout][104]

##### Approach:

Just like D3, this parser uses a chaining declaritiave style to build up  
the necessary prerequistes to create the waterfall data. Here is a simple  
example. Given a data item structure like this: {"category" : "Category One", "value" : 23 }

     var parser = d4.parsers.waterfall()
         .x(function() {
           return 'category';
         })
         .y(function(){
           return 'value';
         })
         .value(function() {
           return 'value';
         });
    
     var waterfallData = parser(data);
    

Keep reading for more information on these various accessor functions.

##### Benefits:

Supports horizontal or vertical waterfalls  
Supports totaling series using a special "e" value in a data item.

##### Limitations:

Does not support stacked waterfalls.

##### Accessors:

`x` : - function which returns a key to access the x values in the data array  
`y` : - function which returns a key to access the y values in the data array  
`value` : - function which returns a key to access the values in the data array.  
`data` : array - An array of objects with their dimensions specified  
like this:

     var data = [
     {"category" : "Category One", "value" : 23 },
     {"category" : "Category Two", "value" : 55 },
     {"category" : "Category Three", "value" : -10 },
     {"category" : "Category Four", "value" : 5 },
     {"category" : "Category Five", "value" : "e" }]
    

##### SPECIAL NOTE:

Waterfalls charts typically have the ability to display subtotals at any point.  
In order to use this feature simply set the value of your subtotal column to "e."

##### Example Usage:

Given the example data and dimension variables above you can use this module  
in the following way:

    var parser = d4.parsers.nestedStack()
    .dimensions(dimensions)
    .call(data);
    
    The `parser` variable will now be an object containing the following structure:
    {
      data: Array
      value: {
        key: string,
        values: Array
      },
      x: {
        key: string,
        values: Array
      },
      y: {
        key: string,
        values: Array
      }
    }
    

---



[0]: #base-js
[1]: #axes
[2]: #builder
[3]: #clone
[4]: #features
[5]: #margin
[6]: #mixin
[7]: #mixout
[8]: #outerheight
[9]: #outerwidth
[10]: #using
[11]: #appendonce
[12]: #basechart
[13]: #chart
[14]: #createaccessorproxy
[15]: #extend
[16]: #feature
[17]: #flatten
[18]: #functor
[19]: #isarray
[20]: #iscontinuousscale
[21]: #isdate
[22]: #isdefined
[23]: #isfunction
[24]: #isobject
[25]: #isordinalscale
[26]: #isnotfunction
[27]: #isundefined
[28]: #merge
[29]: #parser
[30]: #helpers-js
[31]: #
[32]: #column-js
[33]: #column
[34]: #donut-js
[35]: #donut
[36]: #grouped-column-js
[37]: #groupedcolumn
[38]: #grouped-row-js
[39]: #groupedrow
[40]: #line-js
[41]: #line
[42]: #row-js
[43]: #row
[44]: #scatter-js
[45]: #scatterplot
[46]: #stacked-column-js
[47]: #stackedcolumn
[48]: #stacked-row-js
[49]: #stackedrow
[50]: #waterfall-js
[51]: #waterfall
[52]: #scales-js
[53]: #linearscalefornesteddata
[54]: #timescalefornesteddata
[55]: #ordinalscalefornesteddata
[56]: #arc-labels-js
[57]: #arclabels
[58]: #arc-series-js
[59]: #arcseries
[60]: #arrow-js
[61]: #arrow
[62]: #column-labels-js
[63]: #columnlabels
[64]: #grid-js
[65]: #grid
[66]: #grouped-column-series-js
[67]: #groupedcolumnseries
[68]: #line-series-labels-js
[69]: #line-series-js
[70]: #reference-line-js
[71]: #referenceline
[72]: #stacked-column-connectors-js
[73]: #stackedcolumnconnectors
[74]: #stacked-labels-js
[75]: #stackedlabels
[76]: #stacked-shapes-series-js
[77]: #circleseries
[78]: #ellipseseries
[79]: #rectseries
[80]: #trend-line-js
[81]: #trendline
[82]: #waterfall-connectors-js
[83]: #waterfallconnectors
[84]: #x-axis-js
[85]: #xaxis
[86]: #y-axis-js
[87]: #yaxis
[88]: #nested-group-js
[89]: #nestedgroup
[90]: #nested-stack-js
[91]: #nestedstack
[92]: https://github.com/mbostock/d3/wiki/SVG-Shapes#arc
[93]: https://github.com/mbostock/d3/wiki/SVG-Axes#innerTickSize
[94]: https://github.com/mbostock/d3/wiki/SVG-Axes#orient
[95]: https://github.com/mbostock/d3/wiki/SVG-Axes#outerTickSize
[96]: https://github.com/mbostock/d3/wiki/SVG-Axes#scale
[97]: https://github.com/mbostock/d3/wiki/SVG-Axes#tickFormat
[98]: https://github.com/mbostock/d3/wiki/SVG-Axes#tickPadding
[99]: https://github.com/mbostock/d3/wiki/SVG-Axes#tickSize
[100]: https://github.com/mbostock/d3/wiki/SVG-Axes#tickSubdivide
[101]: https://github.com/mbostock/d3/wiki/SVG-Axes#tickValues
[102]: https://github.com/mbostock/d3/wiki/SVG-Axes#ticks
[103]: https://github.com/mbostock/d3/wiki/Arrays#-nest
[104]: https://github.com/mbostock/d3/wiki/Stack-Layout