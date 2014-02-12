(function() {
  /* global d3: false */
  /* global d4: false */
  'use strict';

  /**
    The nested group parser is useful for grouped column charts where multiple
    data items need to appear on the same axis value.

    _____________________
    |           _        |
    |   _ _    | |_      |
    |  | | |   | | |     |
    ----------------------

    This module makes use of the d3's "nest" data structure, and "stack" layout
    https://github.com/mbostock/d3/wiki/Arrays#-nest
    https://github.com/mbostock/d3/wiki/Stack-Layout


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
    * x : - function which returns a key to access the x values in the data array
    * y : - function which returns a key to access the y values in the data array
    * value : - function which returns a key to access the values in the data array.
    * data : array - An array of objects with their dimensions specified
      like this:

      var data = [
      {"year" : "2010", "category" : "Category One", "value" : 23 },
      {"year" : "2010", "category" : "Category Two", "value" : 55 },
      {"year" : "2010", "category" : "Category Three", "value" : -10 },
      {"year" : "2010", "category" : "Category Four", "value" : 5 }]

  **/
  d4.parsers.nestedGroup = function nestedGroup() {

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

    var setDimension = function(dim, funct) {
      opts[dim].key = funct();
    };

    var parser = function(data) {
      if (data) {
        d4.extend(opts.data, data);
      }

      findValues(opts, opts.data);
      opts.data = nestByDimension(opts.x.key, opts.value.key, opts.data);

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
