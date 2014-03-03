# d4 -0.4.0

###### [base.js][0]

* [`chart`][1]
* [`feature`][2]
* [`builder`][3]
* [`parser`][4]
* [`baseChart`][5]
* [`builder`][3]
* [`features`][6]
* [`mixin`][7]
* [`mixout`][8]
* [`scales`][9]
* [`using`][10]
* [`functor`][11]

###### [scales.js][12]

* [``][13]
* [``][13]

###### [column.js][14]

* [``][13]

###### [grouped-column.js][15]

* [``][13]

###### [line.js][16]

* [``][13]

###### [row.js][17]

* [``][13]

###### [nested-group.js][18]

* [``][13]

###### [nested-stack.js][19]

* [``][13]

###### [waterfall.js][20]

* [``][13]

###### [waterfall-connectors.js][21]

* [``][13]

## base.js

### chart

[\#][1]
[Ⓣ][0]

This function allows you to register a reusable chart with d4\.

#### Arguments

1. `name`_(String) -- accessor name for chart._
2. `funct`_(Function) -- function which will instantiate the chart._

---

### feature

[\#][2]
[Ⓣ][0]

This function allows you to register a reusable chart feature with d4\.

#### Arguments

1. `name`_(String) -- accessor name for chart feature._
2. `funct`_(Function) -- function which will instantiate the chart feature._

---

### builder

[\#][3]
[Ⓣ][0]

This function allows you to register a reusable chart builder with d4\.

#### Arguments

1. `name`_(String) -- accessor name for chart builder._
2. `funct`_(Function) -- function which will instantiate the chart builder._

---

### parser

[\#][4]
[Ⓣ][0]

This function allows you to register a reusable data parser with d4\.

#### Arguments

1. `name`_(String) -- accessor name for data parser._
2. `funct`_(Function) -- function which will instantiate the data parser._

---

### baseChart

[\#][5]
[Ⓣ][0]

This function creates a d4 chart object. It is only used when creating a  
new chart factory.

##### Examples

    d4.chart('column', function columnChart() {
        var chart = d4.baseChart({
          scales: [{
            key: 'x',
            kind: 'ordinal'
          }, {
            key: 'y',
            kind: 'linear'
          }]
        }, columnChartBuilder);
        return chart;
    });
    

#### Arguments

1. `defaultBuilder`_(Function) -- function which will return a valid builder object when invoked._
2. `config`_(Object) -- an object representing chart configuration settings_

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
           configure: function(chart, data) {
               configureScales.bind(this)(chart, data);
           }
        };
    };
    

#### Arguments

1. `funct`_(Function) -- function which returns a builder object._

---

### features

[\#][6]
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

[\#][7]
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

[\#][8]
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

### scales

[\#][9]
[Ⓣ][0]

This function returns the internal scales object as a parameter to the  
supplied function.

#### Arguments

1. `funct`_(Function) -- function which will perform the modifcation._

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

---

### functor

[\#][11]
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

## scales.js

### 

[\#][13]
[Ⓣ][12]

Creates a linear scale for a dimension of a given chart.

#### Arguments

1. `d4`_(Object) -chart object_
2. `data`_(Array) -array_
3. `string`_(string) -represnting a dimension e.g. \`x\`,\`y\`._

---

### 

[\#][13]
[Ⓣ][12]

Creates an ordinal scale for a dimension of a given chart.

#### Arguments

1. `d4`_(Object) -chart object_
2. `data`_(Array) -array_
3. `string`_(string) -represnting a dimension e.g. \`x\`,\`y\`._

---

## column.js

### 

[\#][13]
[Ⓣ][14]

The column chart has two axes (`x` and `y`). By default the column chart expects  
linear values for the `y` and ordinal values on the `x`. The basic column chart  
has four default features:

**bars** - series bars  
**barLabels** - data labels above the bars  
**xAxis** - the axis for the x dimension  
**yAxis** - the axis for the y dimension

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
    .xKey(0)
    .yKey(1);
    
    d3.select('#example')
    .datum(data)
    .call(chart);
    

---

## grouped-column.js

### 

[\#][13]
[Ⓣ][15]

The grouped column chart is used to compare a series of data elements grouped  
along the xAxis. This chart is often useful in conjunction with a stacked column  
chart because they can use the same data series, and where the stacked column highlights  
the sum of the data series across an axis the grouped column can be used to show the  
relative distribution.

**bars** - series bars  
**barLabels** - data labels above the bars  
**groupsOf** - an integer representing the number of columns in each group  
**xAxis** - the axis for the x dimension  
**yAxis** - the axis for the y dimension

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
    .xKey('year')
    .yKey('unitsSold')
    .groupsOf(parsedData.data[0].values.length);
    
    d3.select('#example')
    .datum(parsedData.data)
    .call(chart);
    

---

## line.js

### 

[\#][13]
[Ⓣ][16]

The line series chart is used to compare a series of data elements grouped  
along the xAxis.

**lineSeries** - series lines  
**lineSeriesLabels** - data labels beside the lines  
**xAxis** - the axis for the x dimension  
**yAxis** - the axis for the y dimension

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
    .xKey('year')
    .yKey('unitsSold');
    
    d3.select('#example')
    .datum(parsedData.data)
    .call(chart);
    

---

## row.js

### 

[\#][13]
[Ⓣ][17]

The row chart has two axes (`x` and `y`). By default the column chart expects  
linear scale values for the `x` and ordinal scale values on the `y`. The basic column chart  
has four default features:

**bars** - series bars  
**rowLabels** - data labels to the right of the bars  
**xAxis** - the axis for the x dimension  
**yAxis** - the axis for the y dimension

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

## nested-group.js

### 

[\#][13]
[Ⓣ][18]

The nested group parser is useful for grouped column charts where multiple  
data items need to appear relative to the axis value, for example grouped  
column charts or multi-series line charts.

    _____________________
    |           _        |
    |   _ _    | |_      |
    |  | | |   | | |     |
    ----------------------
    

This module makes use of the d3's "nest" data structure layout

[https://github.com/mbostock/d3/wiki/Arrays\#-nest][22]

#### Approach

Just like D3, this parser uses a chaining declaritiave style to build up  
the necessary prerequistes to create the waterfall data. Here is a simple  
example. Given a data item structure like this: {"category" : "Category One", "value" : 23 }

    var parser = d4.parsers.nestedGroup()
        .x('category')
        .y('value')
        .value('value');
    
    var groupedColumnData = parser(data);
    

Keep reading for more information on these various accessor functions.

#### Accessor Methods

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

### 

[\#][13]
[Ⓣ][19]

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

[https://github.com/mbostock/d3/wiki/Arrays\#-nest][22]  
[https://github.com/mbostock/d3/wiki/Stack-Layout][23]

#### Approach

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

### 

[\#][13]
[Ⓣ][20]

The waterfall parser is useful for waterfall charts where data items need to account  
for the position of earlier values:

    _____________________
    |   _        _______ |
    |  |_|___   | |  | | |
    |      |_|__|_|  | | |
    |                |_| |
    ----------------------
    
    This module makes use of the d3's "nest" data structure, and "stack" layout
    [https://github.com/mbostock/d3/wiki/Arrays#-nest][22]
    [https://github.com/mbostock/d3/wiki/Stack-Layout][23]
    
    
    Approach:
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
    
    Benefits:
    

Supports horizontal or vertical waterfalls  
Supports totaling series using a special "e" value in a data item.

    Limitations:
    

Does not support stacked waterfalls.

    Accessor Methods:
    

x : - function which returns a key to access the x values in the data array  
y : - function which returns a key to access the y values in the data array  
value : - function which returns a key to access the values in the data array.  
data : array - An array of objects with their dimensions specified  
like this:

      var data = [
      {"category" : "Category One", "value" : 23 },
      {"category" : "Category Two", "value" : 55 },
      {"category" : "Category Three", "value" : -10 },
      {"category" : "Category Four", "value" : 5 },
      {"category" : "Category Five", "value" : "e" }]
    
    SPECIAL NOTE:
    Waterfalls charts typically have the ability to display subtotals at any point.
    In order to use this feature simply set the value of your subtotal column to "e."
    
    Example Usage:
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
    
    Taking these attributes one-by-one:
    

data - is an array of items stacked by D3  
value - an object with a key representing the value accessor and an array of values  
x - an object with a key representing the x accessor and an array of values  
y - an object with a key representing the y accessor and an array of values

---

## waterfall-connectors.js

### 

[\#][13]
[Ⓣ][21]

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



[0]: #base-js
[1]: #chart
[2]: #feature
[3]: #builder
[4]: #parser
[5]: #basechart
[6]: #features
[7]: #mixin
[8]: #mixout
[9]: #scales
[10]: #using
[11]: #functor
[12]: #scales-js
[13]: #
[14]: #column-js
[15]: #grouped-column-js
[16]: #line-js
[17]: #row-js
[18]: #nested-group-js
[19]: #nested-stack-js
[20]: #waterfall-js
[21]: #waterfall-connectors-js
[22]: https://github.com/mbostock/d3/wiki/Arrays#-nest
[23]: https://github.com/mbostock/d3/wiki/Stack-Layout