# d4 -0.7.3

###### [base.js][0]

* [`axes`][1]
* [`builder`][2]
* [`clone`][3]
* [`features`][4]
* [`mixin`][5]
* [`mixout`][6]
* [`outerHeight`][7]
* [`outerWidth`][8]
* [`using`][9]
* [`appendOnce`][10]
* [`baseChart`][11]
* [`builder`][2]
* [`chart`][12]
* [`createAccessorProxy`][13]
* [`extend`][14]
* [`feature`][15]
* [`flatten`][16]
* [`functor`][17]
* [`isArray`][18]
* [`isDate`][19]
* [`isFunction`][20]
* [`isNotFunction`][21]
* [`isUndefined`][22]
* [`isDefined`][23]
* [`merge`][24]
* [`parser`][25]

###### [helpers.js][26]

* [``][27]

###### [scales.js][28]

* [`linearScaleForNestedData`][29]
* [`timeScaleForNestedData`][30]
* [`ordinalScaleForNestedData`][31]

###### [column.js][32]

* [`column`][33]

###### [donut.js][34]

* [`donut`][35]

###### [grouped-column.js][36]

* [`groupedColumn`][37]

###### [line.js][38]

* [`line`][39]

###### [row.js][40]

* [`row`][41]

###### [scatter.js][42]

* [`scatterPlot`][43]

###### [stacked-column.js][44]

* [`stackedColumn`][45]

###### [stacked-row.js][46]

* [`stackedRow`][47]

###### [waterfall.js][48]

* [`waterfall`][49]

###### [arc-labels.js][50]

* [``][27]

###### [arc-series.js][51]

* [``][27]

###### [arrow.js][52]

* [``][27]

###### [column-labels.js][53]

* [``][27]

###### [grid.js][54]

* [``][27]

###### [grouped-column-series.js][55]

* [``][27]

###### [line-series-labels.js][56]

* [``][27]

###### [line-series.js][57]

* [``][27]

###### [reference-line.js][58]

* [``][27]

###### [stacked-column-connectors.js][59]

* [`stackedColumnConnectors`][60]

###### [stacked-labels.js][61]

* [``][27]

###### [stacked-shapes-series.js][62]

* [`circleSeries`][63]
* [`ellipseSeries`][64]
* [`rectSeries`][65]

###### [trend-line.js][66]

* [``][27]

###### [waterfall-connectors.js][67]

* [`waterfallConnectors`][68]

###### [x-axis.js][69]

* [`xAxis`][70]

###### [y-axis.js][71]

* [`yAxis`][72]

###### [nested-group.js][73]

* [`nestedGroup`][74]

###### [nested-stack.js][75]

* [`nestedStack`][76]

###### [waterfall.js][48]

* [`waterfall`][49]

## base.js

### axes

[\#][1]
[Ⓣ][0]

This function returns the internal axes object as a parameter to the  
supplied function.

#### Arguments

1. `funct`_(Function) -- function which will perform the modifcation._

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
     => ["bars", "barLabels", "xAxis"]
    

---

### mixin

[\#][5]
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

---

### mixout

[\#][6]
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

---

### outerHeight

[\#][7]
[Ⓣ][0]

Returns or sets the outerHeight of the chart.

#### Arguments

1. `height`_(Number) -_

---

### outerWidth

[\#][8]
[Ⓣ][0]

Returns or sets the outerWidth of the chart.

#### Arguments

1. `width`_(Number) -_

---

### using

[\#][9]
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

---

### appendOnce

[\#][10]
[Ⓣ][0]

This function conditionally appends a SVG element if it doesn't already  
exist within the parent element.

##### Examples

// this will create a svg element, with the id of chart and apply two classes "d4 and chart"  
d4.appendOnce(selection, 'svg\#chart.d4.chart')

#### Arguments

1. `Selection}`_(D3) -- parent DOM element_
2. `-`_(String) -string to use as the dom selector_

---

### baseChart

[\#][11]
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

---

### builder

[\#][2]
[Ⓣ][0]

This function allows you to register a reusable chart builder with d4\.

#### Arguments

1. `name`_(String) -- accessor name for chart builder._
2. `funct`_(Function) -- function which will instantiate the chart builder._

---

### chart

[\#][12]
[Ⓣ][0]

This function allows you to register a reusable chart with d4\.

#### Arguments

1. `name`_(String) -- accessor name for chart._
2. `funct`_(Function) -- function which will instantiate the chart._

---

### createAccessorProxy

[\#][13]
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

[\#][14]
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

---

### feature

[\#][15]
[Ⓣ][0]

This function allows you to register a reusable chart feature with d4\.

#### Arguments

1. `name`_(String) -- accessor name for chart feature._
2. `funct`_(Function) -- function which will instantiate the chart feature._

---

### flatten

[\#][16]
[Ⓣ][0]

Helper method to flatten a multi-dimensional array into a single array.

#### Arguments

1. `arr`_(Array) -- array to be flattened._

---

### functor

[\#][17]
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

---

### isArray

[\#][18]
[Ⓣ][0]

Helper method to determine if a supplied argument is an array

#### Arguments

1. `obj`_(\*) -- the argument to test_

---

### isDate

[\#][19]
[Ⓣ][0]

Helper method to determine if a supplied argument is a date

#### Arguments

1. `obj`_(\*) -- the argument to test_

---

### isFunction

[\#][20]
[Ⓣ][0]

Helper method to determine if a supplied argument is a function

#### Arguments

1. `obj`_(\*) -- the argument to test_

---

### isNotFunction

[\#][21]
[Ⓣ][0]

Helper method to determine if a supplied argument is not a function

#### Arguments

1. `obj`_(\*) -- the argument to test_

---

### isUndefined

[\#][22]
[Ⓣ][0]

Helper method to determine if a supplied argument is undefined

#### Arguments

1. `value`_(\*) -- the argument to test_

---

### isDefined

[\#][23]
[Ⓣ][0]

Helper method to determine if a supplied argument is defined

#### Arguments

1. `value`_(\*) -- the argument to test_

---

### merge

[\#][24]
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

---

### parser

[\#][25]
[Ⓣ][0]

This function allows you to register a reusable data parser with d4\.

#### Arguments

1. `name`_(String) -- accessor name for data parser._
2. `funct`_(Function) -- function which will instantiate the data parser._

---

## helpers.js

### 

[\#][27]
[Ⓣ][26]

---

## scales.js

### linearScaleForNestedData

[\#][29]
[Ⓣ][28]

Creates a linear scale for a dimension of a given chart.

#### Arguments

1. `d4`_(Object) -chart object_
2. `data`_(Array) -array_
3. `string`_(string) -represnting a dimension e.g. \`x\`,\`y\`._

---

### timeScaleForNestedData

[\#][30]
[Ⓣ][28]

Creates a time scale for a dimension of a given chart.

#### Arguments

1. `d4`_(Object) -chart object_
2. `data`_(Array) -array_
3. `string`_(string) -represnting a dimension e.g. \`x\`,\`y\`._

---

### ordinalScaleForNestedData

[\#][31]
[Ⓣ][28]

Creates an ordinal scale for a dimension of a given chart.

#### Arguments

1. `d4`_(Object) -chart object_
2. `data`_(Array) -array_
3. `string`_(string) -represnting a dimension e.g. \`x\`,\`y\`._

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

## line.js

### line

[\#][39]
[Ⓣ][38]

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

[\#][41]
[Ⓣ][40]

The row chart has two axes (`x` and `y`). By default the column chart expects  
linear scale values for the `x` and ordinal scale values on the `y`. The basic column chart  
has four default features:

##### Features

`bars` - series bars  
`rowLabels` - data labels to the right of the bars  
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

[\#][43]
[Ⓣ][42]

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

[\#][45]
[Ⓣ][44]

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

[\#][47]
[Ⓣ][46]

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

[\#][49]
[Ⓣ][48]

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

## arc-labels.js

### 

[\#][27]
[Ⓣ][50]

---

## arc-series.js

### 

[\#][27]
[Ⓣ][51]

---

## arrow.js

### 

[\#][27]
[Ⓣ][52]

---

## column-labels.js

### 

[\#][27]
[Ⓣ][53]

---

## grid.js

### 

[\#][27]
[Ⓣ][54]

---

## grouped-column-series.js

### 

[\#][27]
[Ⓣ][55]

---

## line-series-labels.js

### 

[\#][27]
[Ⓣ][56]

---

## line-series.js

### 

[\#][27]
[Ⓣ][57]

---

## reference-line.js

### 

[\#][27]
[Ⓣ][58]

---

## stacked-column-connectors.js

### stackedColumnConnectors

[\#][60]
[Ⓣ][59]

Column connectors helpful when displaying a stacked column chart.  
A connector will not connect positve and negative columns. This is because  
in a stacked column a negative column may move many series below its previous  
location. This creates a messy collection of crisscrossing lines.

---

## stacked-labels.js

### 

[\#][27]
[Ⓣ][61]

---

## stacked-shapes-series.js

### circleSeries

[\#][63]
[Ⓣ][62]

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

[\#][64]
[Ⓣ][62]

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

[\#][65]
[Ⓣ][62]

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

### 

[\#][27]
[Ⓣ][66]

---

## waterfall-connectors.js

### waterfallConnectors

[\#][68]
[Ⓣ][67]

Waterfall connectors are orthogonal series connectors which visually join  
column series together by spanning the top or bottom of adjacent columns.

When using this feature in charts other than waterfall, be aware that the  
mixin expects an accessor property for `orientation`, which it uses to render  
the direction of the lines.

##### Accessors

`x` - Used in placement of the connector lines.  
`y` - Used in placement of the connector lines.  
`span` - calculates the length of the connector line  
`classes` - applies the class to the connector lines.

---

## x-axis.js

### xAxis

[\#][70]
[Ⓣ][69]

This feature creates an xAxis for use within d4\. There are a variety of  
accessors described below which modify the behavior and apperance of the axis.

##### Accessors

`axis` - The d3 axis object itself.  
`innerTickSize` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#innerTickSize][77]  
`orient` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#orient][78]  
`outerTickSize`- see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#outerTickSize][79]  
`scale` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#scale][80]  
`stagger` - (true | false) determines if the axis should stagger overlapping text (true by default)  
`tickFormat` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#tickFormat][81]  
`tickPadding` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#tickPadding][82]  
`tickSize` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#tickSize][83]  
`tickSubdivide`- see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#tickSubdivide][84]  
`tickValues` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#tickValues][85]  
`ticks` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#ticks][86]

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

[\#][72]
[Ⓣ][71]

This feature creates an xAxis for use within d4\. There are a variety of  
accessors described below which modify the behavior and apperance of the axis.

##### Accessors

`axis` - The d3 axis object itself.  
`innerTickSize` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#innerTickSize][77]  
`orient` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#orient][78]  
`outerTickSize`- see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#outerTickSize][79]  
`scale` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#scale][80]  
`stagger` - (true | false) determines if the axis should stagger overlapping text (true by default)  
`tickFormat` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#tickFormat][81]  
`tickPadding` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#tickPadding][82]  
`tickSize` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#tickSize][83]  
`tickSubdivide`- see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#tickSubdivide][84]  
`tickValues` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#tickValues][85]  
`ticks` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#ticks][86]

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

[\#][74]
[Ⓣ][73]

The nested group parser is useful for grouped column charts where multiple  
data items need to appear relative to the axis value, for example grouped  
column charts or multi-series line charts.

      _____________________
      |           _        |
      |   _ _    | |_      |
      |  | | |   | | |     |
      ----------------------
    

This module makes use of the d3's "nest" data structure layout

[https://github.com/mbostock/d3/wiki/Arrays\#-nest][87]

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

[\#][76]
[Ⓣ][75]

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

* [https://github.com/mbostock/d3/wiki/Arrays\#-nest][87]
* [https://github.com/mbostock/d3/wiki/Stack-Layout][88]

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

[\#][49]
[Ⓣ][48]

The waterfall parser is useful for waterfall charts where data items need to account  
for the position of earlier values:

     _____________________
     |   _        _______ |
     |  |_|___   | |  | | |
     |      |_|__|_|  | | |
     |                |_| |
     ----------------------
    

This module makes use of the d3's "nest" data structure, and "stack" layout  
[https://github.com/mbostock/d3/wiki/Arrays\#-nest][87]  
[https://github.com/mbostock/d3/wiki/Stack-Layout][88]

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
[5]: #mixin
[6]: #mixout
[7]: #outerheight
[8]: #outerwidth
[9]: #using
[10]: #appendonce
[11]: #basechart
[12]: #chart
[13]: #createaccessorproxy
[14]: #extend
[15]: #feature
[16]: #flatten
[17]: #functor
[18]: #isarray
[19]: #isdate
[20]: #isfunction
[21]: #isnotfunction
[22]: #isundefined
[23]: #isdefined
[24]: #merge
[25]: #parser
[26]: #helpers-js
[27]: #
[28]: #scales-js
[29]: #linearscalefornesteddata
[30]: #timescalefornesteddata
[31]: #ordinalscalefornesteddata
[32]: #column-js
[33]: #column
[34]: #donut-js
[35]: #donut
[36]: #grouped-column-js
[37]: #groupedcolumn
[38]: #line-js
[39]: #line
[40]: #row-js
[41]: #row
[42]: #scatter-js
[43]: #scatterplot
[44]: #stacked-column-js
[45]: #stackedcolumn
[46]: #stacked-row-js
[47]: #stackedrow
[48]: #waterfall-js
[49]: #waterfall
[50]: #arc-labels-js
[51]: #arc-series-js
[52]: #arrow-js
[53]: #column-labels-js
[54]: #grid-js
[55]: #grouped-column-series-js
[56]: #line-series-labels-js
[57]: #line-series-js
[58]: #reference-line-js
[59]: #stacked-column-connectors-js
[60]: #stackedcolumnconnectors
[61]: #stacked-labels-js
[62]: #stacked-shapes-series-js
[63]: #circleseries
[64]: #ellipseseries
[65]: #rectseries
[66]: #trend-line-js
[67]: #waterfall-connectors-js
[68]: #waterfallconnectors
[69]: #x-axis-js
[70]: #xaxis
[71]: #y-axis-js
[72]: #yaxis
[73]: #nested-group-js
[74]: #nestedgroup
[75]: #nested-stack-js
[76]: #nestedstack
[77]: https://github.com/mbostock/d3/wiki/SVG-Axes#innerTickSize
[78]: https://github.com/mbostock/d3/wiki/SVG-Axes#orient
[79]: https://github.com/mbostock/d3/wiki/SVG-Axes#outerTickSize
[80]: https://github.com/mbostock/d3/wiki/SVG-Axes#scale
[81]: https://github.com/mbostock/d3/wiki/SVG-Axes#tickFormat
[82]: https://github.com/mbostock/d3/wiki/SVG-Axes#tickPadding
[83]: https://github.com/mbostock/d3/wiki/SVG-Axes#tickSize
[84]: https://github.com/mbostock/d3/wiki/SVG-Axes#tickSubdivide
[85]: https://github.com/mbostock/d3/wiki/SVG-Axes#tickValues
[86]: https://github.com/mbostock/d3/wiki/SVG-Axes#ticks
[87]: https://github.com/mbostock/d3/wiki/Arrays#-nest
[88]: https://github.com/mbostock/d3/wiki/Stack-Layout