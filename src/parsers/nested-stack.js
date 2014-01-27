(function() {
  /* global d3: false */
  /* global d4: false */
  'use strict';

  /**
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
    https://github.com/mbostock/d3/wiki/Arrays#-nest
    https://github.com/mbostock/d3/wiki/Stack-Layout

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
    * Supports negative and positive stacked data series.

    Limitations:
    * The parser expects the stack will occur on the yAxis, which means it is only
      suitable for column charts presently.

    Accessor Methods:
    * x : - function which returns a key to access the x values in the data array
    * y : - function which returns a key to access the y values in the data array
    * value : - function which returns a key to access the values in the data array.
    * data : array - An array of objects with their dimensions specified
      like this:

      var data = [{ "title": "3 Years", "group" : "one", "value": 30 },
                  { "title": "3 Years", "group" : "two", "value": 20 },
                  { "title": "3 Years", "group" : "three", "value": 10 },
                  { "title": "5 Years", "group" : "one",  "value": 3 },
                  { "title": "5 Years", "group" : "two", "value": 2 },
                  { "title": "5 Years", "group" : "three", "value": 1 }]

    * dimensions : object - An object that specifies the chart dimensions (x,y,value...)
      and a key values which corresponds to a property name in the data objects
      array. For example if you wanted to make a stacked column where the groups
      were stacked vertically one on top of another and seperated by title your
      dimensions object would look like this:

      var dimensions = { x: 'title', y: 'group', value: 'value' }

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
    * data - is an array of items stacked by D3
    * (dimension)Keys -

  **/
  d4.parsers.nestedStack = function nestedStack() {

    var opts = {
      x: {
        key: 'x',
        values: []
      },
      y: {
        key: 'y',
        values: []
      },
      value: {
        key: 'value',
        values: []
      },
      data: []
    };

    var findValues = function(dimensions, items) {
      ['x', 'y', 'value'].forEach(function(k) {
        var layers = items.map(function(d) {
          return d[dimensions[k].key];
        });
        opts[k].values = d3.set(layers).values();
      });
    };

    var nestByDimension = function(stackKey, valueKey, items) {
      var nest = d3.nest()
        .key(function(d) {
          return d[stackKey];
        });
      return nest.entries(items);
    };

    // By default D3 doesn't handle stacks with negative values very well, we
    // need to calulate or our y and y0 values for each group.
    var stackByDimension = function(key, items) {
      var offsets = {};

      var stack = d3.layout.stack()
        .values(function(d) {
          return d.values;
        })
        .x(function(d) {
          return d[key];
        })
        .y(function(d) {
          return +d[opts.value.key];
        })
        .out(function(d, y0, y) {
          d.y = y;
          if (d.y >= 0) {
            d.y0 = offsets[d[key] + 'Pos'] = offsets[d[key] + 'Pos'] || 0;
            offsets[d[key] + 'Pos'] += y;
          } else {
            d.y0 = offsets[d[key] + 'Neg'] = offsets[d[key] + 'Neg'] || 0;
            offsets[d[key] + 'Neg'] -= Math.abs(y);
          }
        });
      stack(items.reverse());
    };

    var setDimension = function(dim, funct) {
      opts[dim].key = funct();
    };

    var parser = function(data) {
      if (data) {
        d4.extend(opts.data, data);
      }

      findValues(opts, opts.data);
      opts.data = nestByDimension(opts.y.key, opts.value.key, opts.data);

      stackByDimension(opts.x.key, opts.data);
      return opts;
    };

    parser.x = function(funct) {
      setDimension.bind(opts)('x', funct);
      return parser;
    };

    parser.y = function(funct) {
      setDimension.bind(opts)('y', funct);
      return parser;
    };

    parser.value = function(funct) {
      setDimension.bind(opts)('value', funct);
      return parser;
    };

    return parser;
  };
}).call(this);
