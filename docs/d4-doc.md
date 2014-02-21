# d4 -0.1.0

## `../src/base.js`

* [`mixin`][0]

## `../src/features/stacked-column-connectors.js`

* [``][1]

## `../src/features/waterfall-connectors.js`

* [``][1]

## `../src/parsers/nested-group.js`

* [`nestedGroup`][2]

## `../src/parsers/nested-stack.js`

* [`nestedStack`][3]

## `../src/parsers/waterfall.js`

* [`waterfall`][4]

## `../src/base.js`

### `mixin`

[\#][0]
[Ⓣ][5]

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

## `../src/features/stacked-column-connectors.js`

### ``

[\#][1]
[Ⓣ][6]

Column connectors helpful when displaying a stacked column chart.  
A connector will not connect positve and negative columns. This is because  
in a stacked column a negative column may move many series below its previous  
location. This creates a messy collection of crisscrossing lines.

---

## `../src/features/waterfall-connectors.js`

### ``

[\#][1]
[Ⓣ][7]

Orthogonal Series Connectors connect column series together by using a  
line which bends only at 90 degrees. This connector type is most commonly  
seen in charts such as waterfalls.

---

## `../src/parsers/nested-group.js`

### `nestedGroup`

[\#][2]
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
    [https://github.com/mbostock/d3/wiki/Arrays#-nest][9]
    
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

## `../src/parsers/nested-stack.js`

### `nestedStack`

[\#][3]
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
    [https://github.com/mbostock/d3/wiki/Arrays#-nest][9]
    [https://github.com/mbostock/d3/wiki/Stack-Layout][11]
    
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

## `../src/parsers/waterfall.js`

### `waterfall`

[\#][4]
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
    [https://github.com/mbostock/d3/wiki/Arrays#-nest][9]
    [https://github.com/mbostock/d3/wiki/Stack-Layout][11]
    
    
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



[0]: #mixin
[1]: #
[2]: #nestedgroup
[3]: #nestedstack
[4]: #waterfall
[5]: #../src/base.js
[6]: #../src/features/stacked-column-connectors.js
[7]: #../src/features/waterfall-connectors.js
[8]: #../src/parsers/nested-group.js
[9]: https://github.com/mbostock/d3/wiki/Arrays#-nest
[10]: #../src/parsers/nested-stack.js
[11]: https://github.com/mbostock/d3/wiki/Stack-Layout
[12]: #../src/parsers/waterfall.js