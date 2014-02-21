# d4 -0.1.0

###### [base.js][0]

* [`mixin`][1]

###### [column-chart.js][2]

* [``][3]

###### [nested-group.js][4]

* [`nestedGroup`][5]

###### [nested-stack.js][6]

* [`nestedStack`][7]

###### [waterfall.js][8]

* [`waterfall`][9]

###### [stacked-column-connectors.js][10]

* [``][3]

###### [waterfall-connectors.js][11]

* [``][3]

## base.js

### mixin

[\#][1]
[Ⓣ][12]

Specifies a feature to be mixed into a given chart.  
The feature is an object where the key represents the feature name, and a  
value which is a function that when invoked returns a d4 feature object.

Examples:

     chart.mixin({ 'grid': d4.features.grid }, 0)
     chart.mixin({ 'zeroLine': d4.features.referenceLine })
    

#### Arguments

1. `feature`_(Object) -_
2. `index`_(Number) -- an optional number to specify the insertion layer._

---

## column-chart.js

### 

[\#][3]
[Ⓣ][13]

Column Chart  
@constructor

The column chart has two axes (`x` and `y`). By default the column chart expects  
linear values for the `y` and ordinal values on the `x`

---

## nested-group.js

### nestedGroup

[\#][5]
[Ⓣ][14]

The nested group parser is useful for grouped column charts where multiple  
data items need to appear relative to the axis value, for example grouped  
column charts or multi-series line charts.

    _____________________
    |           _        |
    |   _ _    | |_      |
    |  | | |   | | |     |
    ----------------------
    
    This module makes use of the d3's "nest" data structure layout
    [https://github.com/mbostock/d3/wiki/Arrays#-nest][15]
    
    Approach:
    Just like D3, this parser uses a chaining declaritiave style to build up
    the necessary prerequistes to create the waterfall data. Here is a simple
    example. Given a data item structure like this: {"category" : "Category One", "value" : 23 }
    
    var parser = d4.parsers.nestedGroup()
        .x(function() {
          return 'category';
        })
        .y(function(){
          return 'value';
        })
        .value(function() {
          return 'value';
        });
    
    var groupedColumnData = parser(data);
    
    Keep reading for more information on these various accessor functions.
    
    Accessor Methods:
    

x : - function which returns a key to access the x values in the data array  
y : - function which returns a key to access the y values in the data array  
value : - function which returns a key to access the values in the data array.  
data : array - An array of objects with their dimensions specified  
like this:

      var data = [
      {"year" : "2010", "category" : "Category One", "value" : 23 },
      {"year" : "2010", "category" : "Category Two", "value" : 55 },
      {"year" : "2010", "category" : "Category Three", "value" : -10 },
      {"year" : "2010", "category" : "Category Four", "value" : 5 }]
    

---

## nested-stack.js

### nestedStack

[\#][7]
[Ⓣ][16]

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
    [https://github.com/mbostock/d3/wiki/Arrays#-nest][15]
    [https://github.com/mbostock/d3/wiki/Stack-Layout][17]
    
    Approach:
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
    
    Benefits:
    

Supports negative and positive stacked data series.

    Limitations:
    

The parser expects the stack will occur on the yAxis, which means it is only  
suitable for column charts presently.

    Accessor Methods:
    

x : - function which returns a key to access the x values in the data array  
y : - function which returns a key to access the y values in the data array  
value : - function which returns a key to access the values in the data array.  
data : array - An array of objects with their dimensions specified  
like this:

      var data = [{ "title": "3 Years", "group" : "one", "value": 30 },
                  { "title": "3 Years", "group" : "two", "value": 20 },
                  { "title": "3 Years", "group" : "three", "value": 10 },
                  { "title": "5 Years", "group" : "one",  "value": 3 },
                  { "title": "5 Years", "group" : "two", "value": 2 },
                  { "title": "5 Years", "group" : "three", "value": 1 }]
    
    Example Usage:
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
    
    Taking these attributes one-by-one:
    

data - is an array of items stacked by D3

---

## waterfall.js

### waterfall

[\#][9]
[Ⓣ][18]

The waterfall parser is useful for waterfall charts where data items need to account  
for the position of earlier values:

    _____________________
    |   _        _______ |
    |  |_|___   | |  | | |
    |      |_|__|_|  | | |
    |                |_| |
    ----------------------
    
    This module makes use of the d3's "nest" data structure, and "stack" layout
    [https://github.com/mbostock/d3/wiki/Arrays#-nest][15]
    [https://github.com/mbostock/d3/wiki/Stack-Layout][17]
    
    
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

## stacked-column-connectors.js

### 

[\#][3]
[Ⓣ][19]

Column connectors helpful when displaying a stacked column chart.  
A connector will not connect positve and negative columns. This is because  
in a stacked column a negative column may move many series below its previous  
location. This creates a messy collection of crisscrossing lines.

---

## waterfall-connectors.js

### 

[\#][3]
[Ⓣ][20]

Orthogonal Series Connectors connect column series together by using a  
line which bends only at 90 degrees. This connector type is most commonly  
seen in charts such as waterfalls.

---



[0]: #base-js
[1]: #mixin
[2]: #column-chart-js
[3]: #
[4]: #nested-group-js
[5]: #nestedgroup
[6]: #nested-stack-js
[7]: #nestedstack
[8]: #waterfall-js
[9]: #waterfall
[10]: #stacked-column-connectors-js
[11]: #waterfall-connectors-js
[12]: #base.js
[13]: #column-chart.js
[14]: #nested-group.js
[15]: https://github.com/mbostock/d3/wiki/Arrays#-nest
[16]: #nested-stack.js
[17]: https://github.com/mbostock/d3/wiki/Stack-Layout
[18]: #waterfall.js
[19]: #stacked-column-connectors.js
[20]: #waterfall-connectors.js