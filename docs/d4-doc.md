# d4 -0.5.9

###### [base.js][0]

* [`baseChart`][1]
* [`axes`][2]
* [`builder`][3]
* [`features`][4]
* [`mixin`][5]
* [`mixout`][6]
* [`outerHeight`][7]
* [`outerWidth`][8]
* [`using`][9]
* [`aliasMethodChain`][10]
* [`builder`][3]
* [`chart`][11]
* [`createAccessorProxy`][12]
* [`feature`][13]
* [`functor`][14]
* [`parser`][15]

###### [scales.js][16]

* [`linearScaleForNestedData`][17]
* [`ordinalScaleForNestedData`][18]

###### [column.js][19]

* [`column`][20]

###### [grouped-column.js][21]

* [`groupedColumn`][22]

###### [line.js][23]

* [`line`][24]

###### [row.js][25]

* [`row`][26]

###### [scatter.js][27]

* [`scatterPlot`][28]

###### [stacked-column.js][29]

* [`stackedColumn`][30]

###### [stacked-row.js][31]

* [`stackedRow`][32]

###### [waterfall.js][33]

* [`waterfall`][34]

###### [waterfall-connectors.js][35]

* [`waterfallConnectors`][36]

###### [x-axis.js][37]

* [`xAxis`][38]

###### [y-axis.js][39]

* [`yAxis`][40]

###### [nested-group.js][41]

* [`nestedGroup`][42]

###### [nested-stack.js][43]

* [`nestedStack`][44]

###### [waterfall.js][33]

* [`waterfall`][34]

## base.js

### baseChart

[\#][1]
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

### axes

[\#][2]
[Ⓣ][0]

This function returns the internal axes object as a parameter to the  
supplied function.

#### Arguments

1. `funct`_(Function) -- function which will perform the modifcation._

---

### builder

[\#][3]
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

     // Mix in a feature at a specific depth
     chart.mixin({ 'grid': d4.features.grid }, 0)
    
     chart.mixin({ 'zeroLine': d4.features.referenceLine })
    

#### Arguments

1. `feature`_(Object) -- an object describing the feature to mix in._
2. `index`_(Integer) -- an optional number to specify the insertion layer._

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

### aliasMethodChain

[\#][10]
[Ⓣ][0]

This function allows you chain together a undetermined number of function  
calls in a specific order of execution. This is helpful if you want to  
allow an existing function to be modified before or after it is called,  
while appearing to remain a single call.

##### Examples

#### Arguments

1. `funct`_(Function) -- the function which is to be placed in the chain_
2. `extension`_(Object) -- an object with one or both keys named:_
3. `thisObj`_(Object) -- an optional this reference to use as the apply scope._

---

### builder

[\#][3]
[Ⓣ][0]

This function allows you to register a reusable chart builder with d4\.

#### Arguments

1. `name`_(String) -- accessor name for chart builder._
2. `funct`_(Function) -- function which will instantiate the chart builder._

---

### chart

[\#][11]
[Ⓣ][0]

This function allows you to register a reusable chart with d4\.

#### Arguments

1. `name`_(String) -- accessor name for chart._
2. `funct`_(Function) -- function which will instantiate the chart._

---

### createAccessorProxy

[\#][12]
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

### feature

[\#][13]
[Ⓣ][0]

This function allows you to register a reusable chart feature with d4\.

#### Arguments

1. `name`_(String) -- accessor name for chart feature._
2. `funct`_(Function) -- function which will instantiate the chart feature._

---

### functor

[\#][14]
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

1. `funct`_(Varies) -- An function or other variable to be wrapped in a function_

---

### parser

[\#][15]
[Ⓣ][0]

This function allows you to register a reusable data parser with d4\.

#### Arguments

1. `name`_(String) -- accessor name for data parser._
2. `funct`_(Function) -- function which will instantiate the data parser._

---

## scales.js

### linearScaleForNestedData

[\#][17]
[Ⓣ][16]

Creates a linear scale for a dimension of a given chart.

#### Arguments

1. `d4`_(Object) -chart object_
2. `data`_(Array) -array_
3. `string`_(string) -represnting a dimension e.g. \`x\`,\`y\`._

---

### ordinalScaleForNestedData

[\#][18]
[Ⓣ][16]

Creates an ordinal scale for a dimension of a given chart.

#### Arguments

1. `d4`_(Object) -chart object_
2. `data`_(Array) -array_
3. `string`_(string) -represnting a dimension e.g. \`x\`,\`y\`._

---

## column.js

### column

[\#][20]
[Ⓣ][19]

The column chart has two axes (`x` and `y`). By default the column chart expects  
linear values for the `y` and ordinal values on the `x`. The basic column chart  
has four default features:

##### Accessors

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

## grouped-column.js

### groupedColumn

[\#][22]
[Ⓣ][21]

The grouped column chart is used to compare a series of data elements grouped  
along the xAxis. This chart is often useful in conjunction with a stacked column  
chart because they can use the same data series, and where the stacked column highlights  
the sum of the data series across an axis the grouped column can be used to show the  
relative distribution.

##### Accessors

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

[\#][24]
[Ⓣ][23]

The line series chart is used to compare a series of data elements grouped  
along the xAxis.

##### Accessors

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

[\#][26]
[Ⓣ][25]

The row chart has two axes (`x` and `y`). By default the column chart expects  
linear scale values for the `x` and ordinal scale values on the `y`. The basic column chart  
has four default features:

##### Accessors

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

[\#][28]
[Ⓣ][27]

The scatter plot has three axes (`x`, `y` and `z`). By default the scatter  
plot expects linear scale values for all axes. The basic scatter plot chart  
has these default features:

##### Accessors

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

[\#][30]
[Ⓣ][29]

The stacked column chart has two axes (`x` and `y`). By default the stacked  
column expects continious scale for the `y` axis and a discrete scale for  
the `x` axis. The stacked column has the following default features:

##### Accessors

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

[\#][32]
[Ⓣ][31]

The stacked row chart has two axes (`x` and `y`). By default the stacked  
row expects continious scale for the `x` axis and a discrete scale for  
the `y` axis. The stacked row has the following default features:

##### Accessors

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

[\#][34]
[Ⓣ][33]

The waterfall chart visually tallies the cumulative result of negative and  
positive values over a data series. In addition to specifying the normal  
positive and negative values d4's also lets you designate a column as a subtotal  
column by passing in an "e" as the value key, which may be a familiar convention  
if you have used think-cell.

The waterfall chart has two axes (`x` and `y`). By default the stacked  
column expects continious scale for the `y` axis and a discrete scale for  
the `x` axis. This will render the waterfall chart vertically. However,  
if you swap the scale types then the waterfall will render horizontally.

##### Accessors

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

## waterfall-connectors.js

### waterfallConnectors

[\#][36]
[Ⓣ][35]

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

[\#][38]
[Ⓣ][37]

This feature creates an xAxis for use within d4\. There are a variety of  
accessors described below which modify the behavior and apperance of the axis.

##### Accessors

`axis` - The d3 axis object itself.  
`innerTickSize` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#innerTickSize][45]  
`orient` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#orient][46]  
`outerTickSize`- see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#outerTickSize][47]  
`scale` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#scale][48]  
`stagger` - (true | false) determines if the axis should stagger overlapping text (true by default)  
`tickFormat` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#tickFormat][49]  
`tickPadding` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#tickPadding][50]  
`tickSize` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#tickSize][51]  
`tickSubdivide`- see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#tickSubdivide][52]  
`tickValues` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#tickValues][53]  
`ticks` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#ticks][54]

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

[\#][40]
[Ⓣ][39]

This feature creates an xAxis for use within d4\. There are a variety of  
accessors described below which modify the behavior and apperance of the axis.

##### Accessors

`axis` - The d3 axis object itself.  
`innerTickSize` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#innerTickSize][45]  
`orient` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#orient][46]  
`outerTickSize`- see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#outerTickSize][47]  
`scale` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#scale][48]  
`stagger` - (true | false) determines if the axis should stagger overlapping text (true by default)  
`tickFormat` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#tickFormat][49]  
`tickPadding` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#tickPadding][50]  
`tickSize` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#tickSize][51]  
`tickSubdivide`- see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#tickSubdivide][52]  
`tickValues` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#tickValues][53]  
`ticks` - see: [https://github.com/mbostock/d3/wiki/SVG-Axes\#ticks][54]

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

[\#][42]
[Ⓣ][41]

The nested group parser is useful for grouped column charts where multiple  
data items need to appear relative to the axis value, for example grouped  
column charts or multi-series line charts.

      _____________________
      |           _        |
      |   _ _    | |_      |
      |  | | |   | | |     |
      ----------------------
    

This module makes use of the d3's "nest" data structure layout

[https://github.com/mbostock/d3/wiki/Arrays\#-nest][55]

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

[\#][44]
[Ⓣ][43]

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

* [https://github.com/mbostock/d3/wiki/Arrays\#-nest][55]
* [https://github.com/mbostock/d3/wiki/Stack-Layout][56]

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

[\#][34]
[Ⓣ][33]

The waterfall parser is useful for waterfall charts where data items need to account  
for the position of earlier values:

     _____________________
     |   _        _______ |
     |  |_|___   | |  | | |
     |      |_|__|_|  | | |
     |                |_| |
     ----------------------
    

This module makes use of the d3's "nest" data structure, and "stack" layout  
[https://github.com/mbostock/d3/wiki/Arrays\#-nest][55]  
[https://github.com/mbostock/d3/wiki/Stack-Layout][56]

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
[1]: #basechart
[2]: #axes
[3]: #builder
[4]: #features
[5]: #mixin
[6]: #mixout
[7]: #outerheight
[8]: #outerwidth
[9]: #using
[10]: #aliasmethodchain
[11]: #chart
[12]: #createaccessorproxy
[13]: #feature
[14]: #functor
[15]: #parser
[16]: #scales-js
[17]: #linearscalefornesteddata
[18]: #ordinalscalefornesteddata
[19]: #column-js
[20]: #column
[21]: #grouped-column-js
[22]: #groupedcolumn
[23]: #line-js
[24]: #line
[25]: #row-js
[26]: #row
[27]: #scatter-js
[28]: #scatterplot
[29]: #stacked-column-js
[30]: #stackedcolumn
[31]: #stacked-row-js
[32]: #stackedrow
[33]: #waterfall-js
[34]: #waterfall
[35]: #waterfall-connectors-js
[36]: #waterfallconnectors
[37]: #x-axis-js
[38]: #xaxis
[39]: #y-axis-js
[40]: #yaxis
[41]: #nested-group-js
[42]: #nestedgroup
[43]: #nested-stack-js
[44]: #nestedstack
[45]: https://github.com/mbostock/d3/wiki/SVG-Axes#innerTickSize
[46]: https://github.com/mbostock/d3/wiki/SVG-Axes#orient
[47]: https://github.com/mbostock/d3/wiki/SVG-Axes#outerTickSize
[48]: https://github.com/mbostock/d3/wiki/SVG-Axes#scale
[49]: https://github.com/mbostock/d3/wiki/SVG-Axes#tickFormat
[50]: https://github.com/mbostock/d3/wiki/SVG-Axes#tickPadding
[51]: https://github.com/mbostock/d3/wiki/SVG-Axes#tickSize
[52]: https://github.com/mbostock/d3/wiki/SVG-Axes#tickSubdivide
[53]: https://github.com/mbostock/d3/wiki/SVG-Axes#tickValues
[54]: https://github.com/mbostock/d3/wiki/SVG-Axes#ticks
[55]: https://github.com/mbostock/d3/wiki/Arrays#-nest
[56]: https://github.com/mbostock/d3/wiki/Stack-Layout