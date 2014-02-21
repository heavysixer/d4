# d4 -0.1.0

###### [base.js][0]

* [`functor`][1]
* [`using`][2]
* [`mixin`][3]
* [`mixout`][4]
* [`features`][5]

###### [waterfall-connectors.js][6]

* [`waterfallConnectors`][7]

###### [nested-group.js][8]

* [`nestedGroup`][9]

###### [nested-stack.js][10]

* [`nestedStack`][11]

###### [waterfall.js][12]

* [`waterfall`][13]

###### [column-chart.js][14]

* [`columnChart`][15]

###### [grouped-column-chart.js][16]

* [`groupedColumnChart`][17]

###### [line-chart.js][18]

* [`lineChart`][19]

###### [row-chart.js][20]

* [`rowChart`][21]

## base.js

### functor

[\#][1]
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

### using

[\#][2]
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

### mixin

[\#][3]
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

[\#][4]
[Ⓣ][0]

Specifies an existing feature of a chart to be removed (mixed out).

##### Examples

     // Mixout the yAxis which is provided as a default
     var chart = d4.columnChart()
     .mixout('yAxis');
    
     // Now test that the feature has been removed.
     console.log(chart.features());
     => ["bars", "barLabels", "xAxis"]
    

#### Arguments

1. `name`_(String) -- accessor name for chart feature._

---

### features

[\#][5]
[Ⓣ][0]

To see what features are currently mixed into your chart you can use  
this method.

##### Examples

     // Mixout the yAxis which is provided as a default
     var chart = d4.columnChart()
     .mixout('yAxis');
    
     // Now test that the feature has been removed.
     console.log(chart.features());
     => ["bars", "barLabels", "xAxis"]
    

---

## waterfall-connectors.js

### waterfallConnectors

[\#][7]
[Ⓣ][6]

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

## nested-group.js

### nestedGroup

[\#][9]
[Ⓣ][8]

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

### nestedStack

[\#][11]
[Ⓣ][10]

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

### waterfall

[\#][13]
[Ⓣ][12]

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

## column-chart.js

### columnChart

[\#][15]
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
    var chart = d4.columnChart();
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
    var chart = d4.columnChart()
    .xKey(0)
    .yKey(1);
    
    d3.select('#example')
    .datum(data)
    .call(chart);
    

---

## grouped-column-chart.js

### groupedColumnChart

[\#][17]
[Ⓣ][16]

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
    
    var chart = d4.groupedColumnChart()
    .width($('#example').width())
    .xKey('year')
    .yKey('unitsSold')
    .groupsOf(parsedData.data[0].values.length);
    
    d3.select('#example')
    .datum(parsedData.data)
    .call(chart);
    

---

## line-chart.js

### lineChart

[\#][19]
[Ⓣ][18]

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
    
    var chart = d4.lineChart()
    .width($('#example').width())
    .xKey('year')
    .yKey('unitsSold');
    
    d3.select('#example')
    .datum(parsedData.data)
    .call(chart);
    

---

## row-chart.js

### rowChart

[\#][21]
[Ⓣ][20]

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
      var chart = d4.rowChart();
      d3.select('#example')
      .datum(data)
      .call(chart);
    

---



[0]: #base-js
[1]: #functor
[2]: #using
[3]: #mixin
[4]: #mixout
[5]: #features
[6]: #waterfall-connectors-js
[7]: #waterfallconnectors
[8]: #nested-group-js
[9]: #nestedgroup
[10]: #nested-stack-js
[11]: #nestedstack
[12]: #waterfall-js
[13]: #waterfall
[14]: #column-chart-js
[15]: #columnchart
[16]: #grouped-column-chart-js
[17]: #groupedcolumnchart
[18]: #line-chart-js
[19]: #linechart
[20]: #row-chart-js
[21]: #rowchart
[22]: https://github.com/mbostock/d3/wiki/Arrays#-nest
[23]: https://github.com/mbostock/d3/wiki/Stack-Layout