(function() {
  'use strict';

  /**
   * The waterfall parser is useful for waterfall charts where data items need to account
   * for the position of earlier values:
   *
   *      _____________________
   *      |   _        _______ |
   *      |  |_|___   | |  | | |
   *      |      |_|__|_|  | | |
   *      |                |_| |
   *      ----------------------
   *
   * This module makes use of the d3's "nest" data structure, and "stack" layout
   * https://github.com/mbostock/d3/wiki/Arrays#-nest
   * https://github.com/mbostock/d3/wiki/Stack-Layout
   *
   *
   *##### Approach:
   * Just like D3, this parser uses a chaining declaritiave style to build up
   * the necessary prerequistes to create the waterfall data. Here is a simple
   * example. Given a data item structure like this: {"category" : "Category One", "value" : 23 }
   *
   *      var parser = d4.parsers.waterfall()
   *          .x(function() {
   *            return 'category';
   *          })
   *          .y(function(){
   *            return 'value';
   *          })
   *          .value(function() {
   *            return 'value';
   *          });
   *
   *      var waterfallData = parser(data);
   *
   * Keep reading for more information on these various accessor functions.
   *
   *##### Benefits:
   * Supports horizontal or vertical waterfalls
   * Supports totaling series using a special "e" value in a data item.
   *
   *##### Limitations:
   *
   * Does not support stacked waterfalls.
   *
   *##### Accessors:
   *
   * `x` : - function which returns a key to access the x values in the data array
   * `y` : - function which returns a key to access the y values in the data array
   * `value` : - function which returns a key to access the values in the data array.
   * `data` : array - An array of objects with their dimensions specified
   *   like this:
   *
   *      var data = [
   *      {"category" : "Category One", "value" : 23 },
   *      {"category" : "Category Two", "value" : 55 },
   *      {"category" : "Category Three", "value" : -10 },
   *      {"category" : "Category Four", "value" : 5 },
   *      {"category" : "Category Five", "value" : "e" }]
   *
   *##### SPECIAL NOTE:
   *
   * Waterfalls charts typically have the ability to display subtotals at any point.
   * In order to use this feature simply set the value of your subtotal column to "e."
   *
   *##### Example Usage:
   *
   * Given the example data and dimension variables above you can use this module
   * in the following way:
   *
   *     var parser = d4.parsers.nestedStack()
   *     .dimensions(dimensions)
   *     .call(data);
   *
   *     The `parser` variable will now be an object containing the following structure:
   *     {
   *       data: Array
   *       value: {
   *         key: string,
   *         values: Array
   *       },
   *       x: {
   *         key: string,
   *         values: Array
   *       },
   *       y: {
   *         key: string,
   *         values: Array
   *       }
   *     }
   *
   * @name waterfall
   **/
  d4.parser('waterfall', function waterfall() {

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
    opts.nestKey = function() {
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

    var stackByDimension = function(key, items) {
      var lastOffset = 0;
      var noNaN = function(num) {
        return isNaN(num) ? 0 : num;
      };
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
          if (isNaN(y)) {
            if (isNaN(y0)) {
              y0 = lastOffset;
            }
            d.y0 = 0;
            d.y = y0;
            d[opts.value.key] = y0;
            lastOffset = y0;
          } else {
            if (isNaN(y0)) {
              d.y0 = lastOffset;
              lastOffset += y;
            } else {
              d.y0 = y0;
            }
            d.y = y;
            d[opts.value.key] = noNaN(d[opts.value.key]);
          }
        });
      stack(items);
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
      if (opts.data.length > 0) {
        stackByDimension(opts.x.key, opts.data);
      }
      return opts;
    };

    parser.nestKey = function(funct) {
      opts.nestKey = d4.functor(funct).bind(opts);
      return parser;
    };

    d4.each(['x', 'y', 'value'], function(k) {
      parser[k] = function(funct) {
        setDimension.bind(opts)(k, d4.functor(funct));
        return parser;
      };
    }.bind(this));

    return parser;
  });
}).call(this);
