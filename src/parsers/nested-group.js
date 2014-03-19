(function() {
  /*! global d3: false */
  /*! global d4: false */
  'use strict';

  /**
  * The nested group parser is useful for grouped column charts where multiple
  * data items need to appear relative to the axis value, for example grouped
  * column charts or multi-series line charts.
  *
  *       _____________________
  *       |           _        |
  *       |   _ _    | |_      |
  *       |  | | |   | | |     |
  *       ----------------------
  *
  * This module makes use of the d3's "nest" data structure layout
  *
  * https://github.com/mbostock/d3/wiki/Arrays#-nest
  *
  *##### Approach
  *
  * Just like D3, this parser uses a chaining declaritiave style to build up
  * the necessary prerequistes to create the waterfall data. Here is a simple
  * example. Given a data item structure like this: {"category" : "Category One", "value" : 23 }
  *
  *      var parser = d4.parsers.nestedGroup()
  *          .x('category')
  *          .y('value')
  *          .value('value');
  *
  *      var groupedColumnData = parser(data);
  *
  * Keep reading for more information on these various accessor functions.
  *
  *##### Accessor Methods
  *
  * `x` - A function which returns a key to access the x values in the data array
  * `y` - A function which returns a key to access the y values in the data array
  * `value` - A function which returns a key to access the values in the data array.
  * `data` - An array of objects with their dimensions specified like this:
  *
  *       var data = [
  *       {"year" : "2010", "category" : "Category One", "value" : 23 },
  *       {"year" : "2010", "category" : "Category Two", "value" : 55 },
  *       {"year" : "2010", "category" : "Category Three", "value" : -10 },
  *       {"year" : "2010", "category" : "Category Four", "value" : 5 }]
  *
  * @name nestedGroup
  **/
  d4.parser('nestedGroup', function nestedGroup() {

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
    opts.nestKey = function(){
      return opts.x.key;
    };

    var findValues = function(dimensions, items) {
      ['x', 'y', 'value'].forEach(function(k) {
        var layers = items.map(function(d) {
          return d[dimensions[k].key];
        });
        opts[k].values = d3.set(layers).values();
      });
    };

    var nestByDimension = function(key, valueKey, items) {
      var nest = d3.nest()
        .key(function(d) {
          return d[key];
        });
      return nest.entries(items);
    };

    var setDimension = function(dim, funct) {
      opts[dim].key = d4.functor(funct)();
    };

    var parser = function(data) {
      if (data) {
        d4.extend(opts.data, data);
      }

      findValues(opts, opts.data);
      opts.data = nestByDimension(opts.nestKey(), opts.value.key, opts.data);

      return opts;
    };

    parser.nestKey = function(funct) {
      opts.nestKey = d4.functor(funct).bind(opts);
      return parser;
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
  });
}).call(this);
