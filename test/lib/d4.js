/*! d4 - v0.8.16
 *  License: MIT Expat
 *  Date: 2014-12-23
 *  Copyright: Mark Daggett, D4 Team
 */
/*!
  Functions "each", "extend", and "isFunction" based on Underscore.js 1.5.2
  http://underscorejs.org
  (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
  Underscore may be freely distributed under the MIT license.
*/
(function() {
  'use strict';

  var root = this;
  var breaker = {};

  // Create a safe reference to the d4 object.
  var d4 = function(obj) {
    if (obj instanceof d4) {
      return obj;
    }
    if (!(this instanceof d4)) {
      return new d4(obj);
    }
    this.d4Wrapped = obj;
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = d4;
    }
    exports.d4 = d4;
  } else {
    root.d4 = d4;
  }

  d4.charts = {};
  d4.features = {};
  d4.parsers = {};
  d4.builders = {};

  var each = d4.each = d4.forEach = function(obj, iterator, context) {
    var nativeForEach = Array.prototype.forEach,
      i, len;
    if (obj === null) {
      return;
    }

    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (i = 0, len = obj.length; i < len; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) {
          return;
        }
      }
    } else {
      var keys = d3.keys(obj);
      for (i = 0, len = keys.length; i < len; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) {
          return;
        }
      }
    }
  };

  var capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  var readOnlyProp = function(obj, prop, functName, value) {
    Object.defineProperty(obj, prop, {
      configurable: true,
      get: function() {
        return d4.functor(value)();
      },
      set: function() {
        err(' You cannot directly assign values to the {0} property. Instead use the {1}() function.', prop, functName);
      }
    });
  };

  var err = d4.err = function() {
    var parts = Array.prototype.slice.call(arguments);
    var message = parts.shift();
    var regexp;
    each(parts, function(str, i) {
      regexp = new RegExp('\\{' + i + '\\}', 'gi');
      message = message.replace(regexp, str);
    });
    throw new Error('[d4] ' + message);
  };

  var validateBuilder = function(builder) {
    each(['link'], function(funct) {
      if (!builder[funct] || d4.isNotFunction(builder[funct])) {
        err('The supplied builder does not have a {0} function', funct);
      }
    });
    return builder;
  };

  var assignDefaultBuilder = function(defaultBuilder) {
    if (!this.builder) {
      this.builder = validateBuilder(defaultBuilder.bind(this)());
    }
    return this;
  };

  // In an effort to make the API more succient we store the last known
  // proplerty of an accessor with the same name but prepended with a $
  // character. This allows the developer to do something like this:
  //     chart.width(500)
  //     chart.$width //500

  var storeLastValue = function(obj, functName, attr) {
    if (d4.isNotFunction(attr)) {
      var prop = '$' + functName;
      readOnlyProp(obj, prop, functName, attr);
    }
  };

  var accessorForObject = function(wrapperObj, innerObj, functName, prefix) {
    var wrapperFunct = functName;
    if (d4.isDefined(prefix)) {
      wrapperFunct = prefix + capitalize(functName);
    }
    wrapperObj[wrapperFunct] = function(attr) {
      if (!arguments.length) {
        return innerObj[functName];
      }
      storeLastValue(wrapperObj, functName, attr);
      innerObj[functName] = attr;
      return wrapperObj;
    };
    storeLastValue(wrapperObj, functName, innerObj[functName]);
  };

  var createAccessorsFromArray = function(wrapperObj, innerObj, accessors, prefix) {
    each(accessors, function(functName) {
      accessorForObject(wrapperObj, innerObj, functName, prefix);
    });
  };

  // In order to have a uniform API, objects with accessors, need to have
  // wrapper functions created for them so that users may access them in the
  // declarative nature we promote. This function will take an object, which
  // contains an accessors key and create the wrapper function for each
  // accessor item. This function is used internally by the feature mixin and
  // axes objects.
  var createAccessorsFromObject = function(obj) {
    var accessors = obj.accessors;
    if (accessors) {
      createAccessorsFromArray(obj, obj.accessors, d3.keys(accessors));
    }
  };

  var createAccessorsFromAxes = function(chart, opts) {
    each(d3.keys(opts.axes), function(key) {
      chart[key] = function(funct) {
        usingAxis.bind(opts)(key, funct);
        return chart;
      };
      each(d3.keys(opts.axes[key].accessors), function(prop) {
        chart[key][prop] = opts.axes[key][prop];
      });
    });
  };

  var validateScale = function(kind) {
    var supportedScales = d3.keys(d3.scale);

    // manually add time scales to the supports scale types
    supportedScales.push('time');
    supportedScales.push('time.utc');
    if (supportedScales.indexOf(kind) < 0) {
      err('The scale type: "{0}" is unrecognized. D4 only supports these scale types: {1}', kind, supportedScales.sort().join(', '));
    }
  };

  /*!
   * Unlike the other axis accessors the `scale()` is special because each d3 scale
   * will have its own collection of functions, which may differ from one another
   * Therefore, when setting the scale to something say from linear to ordinal
   * we need to actually tell d4 to recreate the scale again otherwise the user
   * may try to use scale specific methods that no longer apply, and will create
   * an error down the road.
   *
   * Special Note: Because builders may define defaults for a given axis during
   * the link function, it will also need to know if the property in question was
   * set by the developer through the API. It is not enough to just check if the
   * property has a value because some d3 properties will have default values.
   * Therefore d4 applies a special $dirty flag to the function itself if the
   * developer has changed its values.
   *
   *#### Example:
   *
   *       var chart = d4.charts.column();
   *       var chartData = [{x:1,y:2}];
   *       chart.builder(function() {
   *           return {
   *               link: function(chart, data) {
   *                   console.log(chart.x.domain.$dirty) // false;
   *               }
   *           }
   *       });
   */
  var createAxisScaleAccessor = function(scale, dimension, resetFunct) {

    // Create a transparent proxy for functions needed by the d3 scale.
    d4.createAccessorProxy(dimension, scale);

    dimension.scale = function(val) {
      if (!arguments.length) {
        return dimension.accessors.scale;
      }
      dimension.accessors.scale = val;
      resetFunct();
      return dimension;
    };
  };

  var createAxisScale = function(dimension, opts, axis) {
    var scale;
    validateScale(axis.accessors.scale);
    switch (true) {
      case axis.accessors.scale === 'time':
        scale = d3.time.scale();
        break;
      case axis.accessors.scale === 'time.utc':
        scale = d3.time.scale.utc();
        break;
      default:
        scale = d3.scale[axis.accessors.scale]();
    }
    createAccessorsFromObject(axis);
    opts[dimension] = scale;

    createAxisScaleAccessor(scale, opts.axes[dimension], function() {
      createAxisScale(dimension, opts, axis);
    });

    // Danger Zone (TM): This is setting read-only function properties on a d3 scale instance. This may not be totally wise.
    each(d3.keys(opts.axes[dimension].accessors), function(key) {
      readOnlyProp(opts[dimension], '$' + key, opts.axes[dimension][key], opts.axes[dimension][key]);
    });
  };

  var addAxis = function(dimension, opts, axis) {
    opts.axes[dimension] = {
      accessors: d4.extend({
        key: dimension,
        min: undefined,
        max: undefined
      }, axis)
    };
    createAxisScale(dimension, opts, opts.axes[dimension]);
  };

  var linkAxes = function(opts) {
    each(d3.keys(opts.axes), function(dimension) {
      addAxis(dimension, opts, opts.axes[dimension]);
    });

    if (d4.isUndefined(opts.axes.x)) {
      addAxis('x', opts, {
        scale: 'ordinal'
      });
    }

    if (d4.isUndefined(opts.axes.y)) {
      addAxis('y', opts, {
        scale: 'linear'
      });
    }
  };

  var assignDefaults = function(config, defaultBuilder) {
    var builder = d4.functor({
      link: function(chart, data) {
        d4.builders[chart.x.$scale + 'ScaleForNestedData'](chart, data, 'x');
        d4.builders[chart.y.$scale + 'ScaleForNestedData'](chart, data, 'y');
      }
    });
    var chartAccessors = d4.merge({}, config.accessors);
    delete config.accessors;
    var opts = d4.merge({
      axes: {},
      features: {},
      height: 400,
      margin: {
        top: 20,
        right: 20,
        bottom: 40,
        left: 40
      },
      mixins: [],
      outerHeight: 460,
      outerWidth: 460,
      width: 400
    }, config);
    opts = d4.merge(opts, chartAccessors);

    linkAxes(opts);
    assignDefaultBuilder.bind(opts)(defaultBuilder || builder);
    opts.accessors = ['width', 'height', 'valueKey'].concat(d3.keys(chartAccessors) || []);

    return opts;
  };

  // d3 allows events to be bound to selections using the `#on()` function. We
  // want to allow the developer to bind to these events transparently. However,
  // we are not actually dealing with the d3 selection itself and so we need to
  // create this proxy which passes any custom events on to the correct
  // selection. For more information see the #selection.on documentation for d3:
  // https://github.com/mbostock/d3/wiki/Selections#wiki-animation--interaction
  var addEventsProxy = function(feature, selection) {
    if (selection) {
      each(d3.keys(feature._proxiedFunctions), function(key) {
        each(feature._proxiedFunctions[key], function(proxiedArgs) {
          selection[key].apply(selection, proxiedArgs);
        });
      });
    }
  };

  var prepareDataForFeature = function(opts, name, data) {
    var result = opts.features[name].accessors.beforeRender.bind(opts)(data);
    if (d4.isDefined(result)) {
      data = result;
    }
    return data;
  };

  var linkFeatures = function(opts, data) {
    var parsedData, selection;

    opts.mixins.forEach(function(name) {
      parsedData = prepareDataForFeature(opts, name, data);
      selection = opts.features[name].render.bind(opts)(opts.features[name], parsedData, opts.chartArea);
      opts.features[name].accessors.afterRender.bind(opts)(opts.features[name], parsedData, opts.chartArea, selection);
      addEventsProxy(opts.features[name], selection);
    });
  };

  var build = function(opts, data) {
    if (opts.builder) {
      opts.builder.link(opts, data);
      linkFeatures(opts, data);
    } else {
      err('No builder defined');
    }
  };

  var scaffoldChart = function(selection) {
    if (selection.tagName === 'svg') {
      this.container = d3.select(selection)
        .classed('d4', true)
        .classed('chart', true)
        .attr('width', Math.max(0, this.width + this.margin.left + this.margin.right))
        .attr('height', Math.max(0, this.height + this.margin.top + this.margin.bottom));
    } else if (selection.tagName === 'g') {
      this.container = d3.select(selection)
        .classed('d4', true)
        .classed('chart', true);

    } else {
      this.container = d4.appendOnce(d3.select(selection), 'svg.d4.chart')
        .attr('width', Math.max(0, this.width + this.margin.left + this.margin.right))
        .attr('height', Math.max(0, this.height + this.margin.top + this.margin.bottom));
    }


    d4.appendOnce(this.container, 'defs');
    d4.appendOnce(this.container, 'g.margins')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    this.chartArea = d4.appendOnce(this.container.select('g.margins'), 'g.chartArea');
  };

  // Normally d4 series elements inside the data array to be in a specific
  // format, which is designed to support charts which require multiple data
  // series. However, some charts can easily be used to display only a single
  // data series in which case the default structure is overly verbose. In
  // these cases d4 accepts the simplified objects in the array payload and
  // silently parses them using the d4.nestedGroup parser. It will configure
  // the parser's dimensions based on the configuration applied to the chart
  // object itself.
  var applyDefaultParser = function(opts, data) {
    var parsed = d4.parsers.nestedGroup()
      .x(opts.x.$key)
      .y(opts.y.$key)
      .nestKey(opts.x.$key)
      .value(opts.valueKey)(data);
    return parsed.data;
  };

  var prepareData = function(opts, data) {
    var needsParsing = false,
      keys, item;

    if (d4.isUndefined(opts.valueKey)) {
      opts.valueKey = opts.y.$key;
    }
    if (data.length > 0) {
      item = data[0];
      if (d4.isArray(item)) {
        needsParsing = true;
      } else {
        keys = d3.keys(item);
        if (keys.indexOf('key') + keys.indexOf('values') <= 0) {
          needsParsing = true;
        }
      }
    }
    return needsParsing ? applyDefaultParser(opts, data) : data;
  };

  var applyScaffold = function(opts) {
    return function(selection) {
      selection.each(function(data) {
        data = prepareData(opts, data);
        scaffoldChart.bind(opts, this)();
        build(opts, data);
      });
    };
  };

  var extractOverrides = function(feature, name) {
    if (feature.overrides) {
      return feature.overrides(name);
    } else {
      return {};
    }
  };

  var addToMixins = function(mixins, name, index) {
    if (d4.isDefined(index)) {
      index = Math.max(Math.min(index, mixins.length), 0);
      mixins.splice(index, 0, name);
    } else {
      mixins.push(name);
    }
  };

  var assignD3SelectionProxy = function(feature) {
    feature._proxiedFunctions = {
      on: []
    };
    feature.on = function() {
      feature._proxiedFunctions.on.push(Array.prototype.slice.call(arguments));
      return feature;
    };
  };

  var assignMixinAccessors = function(feature) {
    createAccessorsFromObject(feature);
  };

  var assignMixinProxies = function(feature) {
    assignD3SelectionProxy(feature);
    d4.each(feature.proxies, function(obj) {
      if (d4.isUndefined(obj.target)) {
        err('You included a feature which has a malformed proxy target.', feature.name);
      }
      d4.createAccessorProxy(feature, obj.target, obj.prefix);
    });
  };

  var mixin = function(features) {
    if (!features) {
      err('You need to supply an object or array of objects to mixin to the chart.');
    }
    var mixins = d4.flatten([features]);
    d4.each(mixins, function(mixin) {
      var name = mixin.name;
      var overrides = extractOverrides.bind(this)(mixin, name);
      var baseFeature = {
        accessors: {
          afterRender: function() {},
          beforeRender: function() {}
        },
        proxies: []
      };
      mixin[name] = d4.merge(d4.merge(baseFeature, mixin.feature(name)), overrides);
      d4.extend(this.features, mixin);
      addToMixins(this.mixins, name, mixin.index);
      assignMixinProxies(this.features[name]);
      assignMixinAccessors(this.features[name]);
    }.bind(this));
  };

  var mixout = function(features) {
    var arr = [];
    if (d4.isUndefined(features)) {
      err('A string or array of names is required in order to mixout a chart feature.');
    }
    arr.push(features);
    d4.each(d4.flatten(arr), function(name) {
      delete this.features[name];
      this.mixins = this.mixins.filter(function(val) {
        return val !== name;
      });
    }.bind(this));
  };

  var usingFeature = function(name, funct) {
    var feature = this.features[name];
    if (d4.isNotFunction(funct)) {
      err('You must supply a continuation function in order to use a chart feature.');
    }
    if (!feature) {
      err('Could not find feature: "{0}", maybe you forgot to mix it in?', name);
    } else {
      funct.bind(this)(feature);
    }
  };

  var usingAxis = function(key, funct) {
    var axis = this.axes[key];
    if (d4.isNotFunction(funct)) {
      err('You must supply a continuation function in order to use a chart axis.');
    }
    if (!axis) {
      err('Could not find axis: "{0}", maybe you forgot to define it?', key);
    } else {
      funct.bind(this)(axis);
    }
  };

  // This approach was inspired by SizzleJS. Most of the REGEX is based off their own expressions.
  var tokenizeSelector = function(selector) {
    var soFar = selector,
      whitespace = '[\\x20\\t\\r\\n\\f]',
      characterEncoding = '(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+',
      identifier = characterEncoding.replace('w', 'w#'),
      attributes = '\\[' + whitespace + '*(' + characterEncoding + ')' + whitespace +
        '*(?:([*^$|!~]?=)' + whitespace + '*(?:([\'"])((?:\\\\.|[^\\\\])*?)\\3|(' + identifier + ')|)|)' + whitespace + '*\\]',
      order = ['TAG', 'ID', 'CLASS'],
      matchers = {
        'ID': new RegExp('#(' + characterEncoding + ')'),
        'CLASS': new RegExp('\\.(' + characterEncoding + ')'),
        'TAG': new RegExp('^(' + characterEncoding.replace('w', 'w*') + ')'),
        'ATTR': new RegExp('' + attributes)
      },
      parse = function(exp) {
        matched = false;
        tokens[exp] = [];
        match = true;
        while (match) {
          match = matchers[exp].exec(soFar);
          if (match !== null) {
            matched = match.shift();
            tokens[exp].push(match[0]);
            soFar = soFar.slice(matched.length);
          }
        }
      },
      matched,
      match,
      tokens = {};
    d4.each(order, parse);
    d4.each(order, function(exp) {
      while (soFar) {
        tokens[exp] = tokens[exp].join(' ');
        if (!matched) {
          break;
        }
      }
    });
    return tokens;
  };

  var createChart = function(opts) {
    var chart = applyScaffold(opts);
    createAccessorsFromArray(chart, opts.margin, d3.keys(opts.margin), 'margin');
    createAccessorsFromArray(chart, opts, opts.accessors);
    createAccessorsFromAxes(chart, opts);

    /**
     * This function returns the internal axes object as a parameter to the
     * supplied function.
     * @param {Function} funct - function which will perform the modifcation.
     * @return {Function} chart instance
     */
    chart.axes = function(funct) {
      if (!arguments.length) {
        return opts.axes;
      }
      funct(opts.axes);
      return chart;
    };

    /**
     * Specifies an object, which d4 uses to initialize the chart with. By default
     * d4 expects charts to return a builder object, which will be used to
     * configure defaults for the chart. Typically this means determining the
     * the default value for the various axes. This accessor allows you to
     * override the existing builder provided by a chart and use your own.
     *
     *##### Examples
     *
     *     myChart.builder = function(chart, data){
     *         return {
     *            link: function(chart, data) {
     *                configureScales.bind(this)(chart, data);
     *            }
     *         };
     *     };
     *
     * @param {Function} funct - function which returns a builder object.
     * @return {Function} chart instance
     */
    chart.builder = function(funct) {
      opts.builder = validateBuilder(funct.bind(opts)());
      return chart;
    };

    /**
     * This function creates a deep copy of the current chart and returns it.
     * This is useful if you have to create several charts which have a variety
     * of shared features but deviate from each other in a small number of ways.
     *
     *##### Examples
     *
     *      var chart = d4.charts.column();
     *      var clone = chart.clone();
     *
     * @return {Function} a copy of the current chart
     */
    chart.clone = function() {
      var dupe = d4.extend({}, opts);
      return createChart(dupe);
    };

    /**
     * To see what features are currently mixed into your chart you can use
     * this method. This function cannot be chained.
     *
     *##### Examples
     *
     *      // Mixout the yAxis which is provided as a default
     *      var chart = d4.charts.column()
     *      .mixout('yAxis');
     *
     *      // Now test that the feature has been removed.
     *      console.log(chart.features());
     *      // => ["bars", "barLabels", "xAxis"]
     *
     * @return {Array} An array of features.
     */
    chart.features = function() {
      return opts.mixins;
    };

    /**
     * To adjust the chart's margins supply either an object or a function that returns
     * an object to this method.
     *
     *##### Examples
     *
     *      // set the margin this using an object:
     *      chart.margin({ top: 10, right: 10, bottom: 10, left: 10 });
     *
     *      // set using a function:
     *      chart.margin(function(){
     *          return { top: 10, right: 10, bottom: 10, left: 10 };
     *      });
     *
     *      // since JavaScript is a pass by reference language you can also
     *      // set portions of the margin this way:
     *      chart.margin().left = 20;
     *
     *      // there are also accessor method for each property of the margin
     *      // object:
     *      chart.marginLeft(20);
     *      chart.marginLeft() // => 20;
     *
     * @param {*} funct - an object or a function that returns an object.
     * @return {Function} chart instance
     */
    chart.margin = function(funct) {
      if (!arguments.length) {
        return opts.margin;
      }
      opts.margin = d4.merge(opts.margin, d4.functor(funct)());
      chart.height(chart.outerHeight() - opts.margin.top - opts.margin.bottom);
      chart.width(chart.outerWidth() - opts.margin.left - opts.margin.right);
      return chart;
    };

    /**
     * Specifies a feature to be mixed into a given chart.
     * The feature is an object where the key represents the feature name, and a
     * value which is a function that when invoked returns a d4 feature object.
     *
     *##### Examples
     *
     *      // Mix in a single feature at a specific depth
     *      chart.mixin({ name : 'grid', feature : d4.features.grid, index: 0 })
     *
     *      // Mix in multiple features at once.
     *      chart.mixin([
     *                   { name : 'zeroLine', feature : d4.features.referenceLine },
     *                   { name : 'grid', feature : d4.features.grid, index: 0 }
     *                  ])
     *
     * @param {*} features - an object or array of objects describing the feature to mix in.
     * @return {Function} chart instance
     */
    chart.mixin = function(features) {
      mixin.bind(opts)(features);
      return chart;
    };

    /**
     * Specifies an existing feature of a chart to be removed (mixed out).
     *
     *##### Examples
     *
     *      // Mixout the yAxis which is provided as a default
     *      var chart = d4.charts.column()
     *      .mixout('yAxis');
     *
     *      // Now test that the feature has been removed.
     *      console.log(chart.features());
     *      => ["bars", "barLabels", "xAxis"]
     *
     * @param {String} name - accessor name for chart feature.
     * @return {Function} chart instance
     */
    chart.mixout = function(feature, index) {
      mixout.bind(opts)(feature, index);
      return chart;
    };

    /**
     * Returns or sets the outerHeight of the chart.
     *
     * @param {Number} height
     * @return {Function} chart instance
     */
    chart.outerHeight = function(funct) {
      var height = d4.functor(funct)();
      if (!arguments.length) {
        return opts.outerHeight;
      }
      opts.outerHeight = height;
      chart.height(height - opts.margin.top - opts.margin.bottom);
      return chart;
    };

    /**
     * Returns or sets the outerWidth of the chart.
     *
     * @param {Number} width
     * @return {Function} chart instance
     */
    chart.outerWidth = function(funct) {
      var width = d4.functor(funct)();
      if (!arguments.length) {
        return opts.outerWidth;
      }
      opts.outerWidth = width;
      chart.width(width - opts.margin.left - opts.margin.right);
      return chart;
    };

    /**
     * The heart of the d4 API is the `using` function, which allows you to
     * contextually modify attributes of the chart or one of its features.
     *
     *##### Examples
     *
     *      chart.mixin({ 'zeroLine': d4.features.referenceLine })
     *      .using('zeroLine', function(zero) {
     *        zero
     *          .x1(function() {
     *            return this.x(0);
     *          })
     *      });
     *
     * @param {String} name - accessor name for chart feature.
     * @param {Function} funct - function which will perform the modifcation.
     * @return {Function} chart instance
     */
    chart.using = function(name, funct) {
      usingFeature.bind(opts)(name, funct);
      return chart;
    };

    return chart;
  };

  /**
   * This function conditionally appends a SVG element if it doesn't already
   * exist within the parent element.
   *
   *##### Examples
   *
   *    // this will create a svg element, with the id of chart and apply two classes "d4 and chart"
   *    d4.appendOnce(selection, 'svg#chart.d4.chart')
   *
   * @param {D3 Selection} - parent DOM element
   * @param {String} - string to use as the dom selector
   *
   * @return {D3 Selection} selection
   */
  d4.appendOnce = function(element, selector) {
    var selected = element.selectAll(selector),
      tokens;

    if (selected.empty()) {
      tokens = tokenizeSelector(selector);
      selected = element.append(tokens.TAG)
        .attr('class', tokens.CLASS.join(' '));
      if (tokens.ID) {
        selected.attr('id', tokens.ID.pop());
      }
    }
    return selected;
  };

  /**
   * This function creates a d4 chart object. It is only used when creating a
   * new chart factory.
   *
   *##### Examples
   *
   *      var chart = d4.baseChart({
   *        builder: myBuilder,
   *        config: {
   *          axes: {
   *            x: {
   *              scale: 'linear'
   *            },
   *            y: {
   *              scale: 'ordinal'
   *            }
   *          }
   *        }
   *      });
   *
   * @param {Object} options - object which contains an optional config and /or
   * builder property
   * @return {Function} chart instance
   */
  d4.baseChart = function(options) {
    var opts = assignDefaults(options && options.config || {}, options && options.builder || undefined);
    return createChart(opts);
  };

  /**
   * This function allows you to register a reusable chart builder with d4.
   * @param {String} name - accessor name for chart builder.
   * @param {Function} funct - function which will instantiate the chart builder.
   * @return {Function} a reference to the chart builder
   */
  d4.builder = function(name, funct) {
    d4.builders[name] = funct;
    return d4.builders[name];
  };

  /**
   * This function allows you to register a reusable chart with d4.
   * @param {String} name - accessor name for chart.
   * @param {Function} funct - function which will instantiate the chart.
   * @return {Function} a reference to the chart function
   */
  d4.chart = function(name, funct) {
    d4.charts[name] = funct;
    return d4.charts[name];
  };

  /**
   * This function allows create proxy accessor to other objects. This is most
   * useful when you need a feature to transparently control a component of a
   * d3 object. Consider the example of the yAxis feature. It allows you to control
   * a d3 axis object. To the user the d4 axis feature and the d3 axis object are
   * one in the same, and they will expect that they can interact with an d4 axis
   * feature in the same way they could with a d3 axis object. Therefore before
   * the feature is created we first use this function to create a transparent
   * proxy that links the two.
   *
   *##### Examples
   *
   *        d4.feature('yAxis', function(name) {
   *            var axis = d3.svg.axis();
   *            var obj = { accessors : {} };
   *            d4.createAccessorProxy(obj, axis);
   *            return obj;
   *       });
   *
   *       // Then when using the feature you can transparently access the axis properties
   *       chart.using('yAxis', function(axis){
   *           // => 0
   *           axis.ticks();
   *       });
   *
   * @param {Object} proxy - The proxy object, which masks the target.
   * @param {Object} target - The target objet, which is masked by the proxy
   * @param {String} prefix - Optional prefix to add to the method names, which helps avoid naming collisions on the proxy.
   */
  d4.createAccessorProxy = function(proxy, target, prefix) {

    each(d3.keys(target), function(funct) {
      var proxyFunct = funct;
      if (d4.isDefined(prefix)) {
        proxyFunct = prefix + capitalize(funct);
      }

      proxy[proxyFunct] = function() {
        if (!arguments.length) {
          return target[funct]();
        }
        target[funct].$dirty = true;
        proxy[proxyFunct].$dirty = true;

        // target function is executed but proxy is returned so as not to break
        // the chaining.
        target[funct].apply(target, arguments);
        return proxy;
      };
      target[funct].$dirty = false;
      proxy[proxyFunct].$dirty = false;
    });
  };

  d4.defaultKey = function(d, i) {
    return (d.key || 0) + '_' + i;
  };

  /**
   * Helper method to extend one object with the attributes of another.
   *
   *##### Examples:
   *
   *        var opts = d4.extend({
   *          margin: {
   *            top: 20,
   *            right: 20,
   *            bottom: 40,
   *            left: 40
   *          },
   *          width: 400
   *        }, config);
   *
   * @param {Object} obj - the object to extend
   * @param {Object} overrides - the second object who will extend the first.
   * @return {Object} the first object which has now been extended;
   */
  d4.extend = function(obj) {
    each(Array.prototype.slice.call(arguments, 1), function(source) {
      var dupeItems = function(items) {
        var dupe = [];
        d4.each(items, function(item) {
          var i = item;
          if (d4.isObject(item)) {
            i = d4.extend({}, item);
          }
          dupe.push(i);
        });
        return dupe;
      };

      if (source) {
        for (var prop in source) {
          if (source[prop] && source[prop].constructor &&
            source[prop].constructor === Object) {
            obj[prop] = obj[prop] || {};
            d4.extend(obj[prop], source[prop]);
          } else if (d4.isArray(source[prop])) {
            var items = dupeItems(source[prop].slice());
            if (d4.isArray(obj[prop])) {
              obj[prop] = obj[prop].concat(items);
            } else {
              obj[prop] = items;
            }

          } else {
            obj[prop] = source[prop];
          }
        }
      }
    });
    return obj;
  };

  /**
   * This function allows you to register a reusable chart feature with d4.
   * @param {String} name - accessor name for chart feature.
   * @param {Function} funct - function which will instantiate the chart feature.
   * @return {Function} a reference to the chart feature
   */
  d4.feature = function(name, funct) {
    d4.features[name] = funct;
    return d4.features[name];
  };

  /**
   * Helper method to flatten a multi-dimensional array into a single array.
   * @param {Array} arr - array to be flattened.
   * @return {Array} flattened array.
   */
  d4.flatten = function(arr) {
    var result = arr.reduce(function(a, b) {
      a = d4.isArray(a) ? a : [a];
      b = d4.isArray(b) ? b : [b];
      return a.concat(b);
    });
    return d4.isArray(result) ? result : [result];
  };

  /**
   * Based on D3's own functor function.
   * > If the specified value is a function, returns the specified value. Otherwise,
   * > returns a function that returns the specified value. This method is used
   * > internally as a lazy way of upcasting constant values to functions, in
   * > cases where a property may be specified either as a function or a constant.
   * > For example, many D3 layouts allow properties to be specified this way,
   * > and it simplifies the implementation if we automatically convert constant
   * > values to functions.
   *
   * @param {*} funct - An function or other variable to be wrapped in a function
   * @return {Function}
   */
  d4.functor = function(funct) {
    return d4.isFunction(funct) ? funct : function() {
      return funct;
    };
  };

  /**
   * Helper method to determine if a supplied argument is an array
   * @param {*} obj - the argument to test
   * @return {Boolean}
   */
  d4.isArray = Array.isArray || function(val) {
    return Object.prototype.toString.call(val) === '[object Array]';
  };

  /**
   * Helper method to determine if the supplied scale wants continuous as
   * opposed to ordinal values.
   */
  d4.isContinuousScale = function(scale) {
    return d4.isDefined(scale.rangeRound);
  };

  /**
   * Helper method to determine if a supplied argument is a date
   * @param {*} obj - the argument to test
   * @return {Boolean}
   */
  d4.isDate = function(val) {
    return Object.prototype.toString.call(val) === '[object Date]';
  };

  /**
   * Helper method to determine if a supplied argument is defined
   * @param {*} value - the argument to test
   * @return {Boolean}
   */
  d4.isDefined = function(value) {
    return !d4.isUndefined(value);
  };

  /**
   * Helper method to determine if a supplied argument is a function
   * @param {*} obj - the argument to test
   * @return {Boolean}
   */
  d4.isFunction = function(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
  };

  /**
   * Helper method to determine if a supplied argument is not an object
   * @param {*} obj - the argument to test
   * @return {Boolean}
   */
  d4.isObject = function(value) {
    return value !== null && typeof value === 'object';
  };

  /**
   * Helper method to determine if the supplied scale wants ordinal as
   * opposed to continuous values.
   */
  d4.isOrdinalScale = function(scale) {
    return d4.isUndefined(scale.rangeRound);
  };

  /**
   * Helper method to determine if a supplied argument is not a function
   * @param {*} obj - the argument to test
   * @return {Boolean}
   */
  d4.isNotFunction = function(obj) {
    return !d4.isFunction(obj);
  };

  /**
   * Helper method to determine if a supplied argument is not null
   * @param {*} value - the argument to test
   * @return {Boolean}
   */
  d4.isNotNull = function(value) {
    return !d4.isNull(value);
  };

  /**
   * Helper method to determine if a supplied argument is null
   * @param {*} value - the argument to test
   * @return {Boolean}
   */
  d4.isNull = function(value) {
    return value === null;
  };

  /**
   * Helper method to determine if a supplied argument is undefined
   * @param {*} value - the argument to test
   * @return {Boolean}
   */
  d4.isUndefined = function(value) {
    return typeof value === 'undefined';
  };

  /**
   * Helper method to merge two objects together into a new object. This will leave
   * the two orignal objects untouched. The overrides object will replace any
   * values which also occur in the options object.
   *
   *##### Examples:
   *
   *        var opts = d4.merge({
   *          margin: {
   *            top: 20,
   *            right: 20,
   *            bottom: 40,
   *            left: 40
   *          },
   *          width: 400
   *        }, config);
   *
   * @param {Object} options - the first object
   * @param {Object} overrides - the second object to merge onto the top.
   * @return {Object} newly merged object;
   */
  d4.merge = function(options, overrides) {
    return d4.extend(d4.extend({}, options), overrides);
  };

  /**
   * This function allows you to register a reusable data parser with d4.
   * @param {String} name - accessor name for data parser.
   * @param {Function} funct - function which will instantiate the data parser.
   * @return {*} a reference to the data parser
   */
  d4.parser = function(name, funct) {
    d4.parsers[name] = funct;
    return d4.parsers[name];
  };
}).call(this);

(function() {
  'use strict';
  d4.helpers = {};

  // FIXME: Provide this using DI.
  var staggerText = function(text, callback) {
    var maxAttempts = 5,
      attempts = 0,

      intersects = function(rect1, rect2) {
        return !(rect1.right < rect2.left ||
          rect1.left > rect2.right ||
          rect1.bottom < rect2.top ||
          rect1.top > rect2.bottom);
      },

      loop = function(text) {
        var intersecting = false,
          index = 0,
          bb,
          pbb,
          last;
        text.each(function() {
          if (index > 0) {
            bb = this.getBoundingClientRect();
            pbb = last.getBoundingClientRect();
            if (intersects(bb, pbb)) {
              callback.bind(this)(pbb, bb);
              intersecting = true;
            }
          }
          index++;
          last = this;
        });

        if (intersecting && attempts < maxAttempts) {
          attempts++;
          loop.bind(this)(text);
        }
      };
    loop.bind(this)(text);
  };

  d4.helpers.staggerTextVertically = function(text, direction) {
    var move = function(lastRect, rect) {
      var text = d3.select(this);
      var lastOffset = text.attr('data-last-vertical-offset') || 1;
      var top = lastRect.top - rect.top;
      var offset = (rect.height - top + lastOffset) * direction;
      text.attr('transform', 'translate(0,' + offset + ')');
      text.attr('data-last-vertical-offset', Math.abs(offset));
    };
    staggerText.bind(this)(text, move);
  };

  // based on: http://bl.ocks.org/ezyang/4236639
  d4.helpers.rotateText = function(transform) {
    return function(node) {
      node.each(function() {
        var t = d3.transform(d3.functor(transform).apply(this, arguments));
        node.attr('alignment-baseline', 'central');
        node.style('dominant-baseline', 'central');
        if (t.rotate <= 90 && t.rotate >= -90) {
          node.attr('text-anchor', 'begin');
          node.attr('transform', t.toString());
        } else {
          node.attr('text-anchor', 'end');
          t.rotate = (t.rotate > 0 ? -1 : 1) * (180 - Math.abs(t.rotate));
          node.attr('transform', t.toString());
        }
      });
    };
  };

  d4.helpers.staggerTextHorizontally = function(text, direction) {
    var move = function(lastRect, rect) {
      var text = d3.select(this);
      var lastOffset = +(text.attr('data-last-horizontal-offset') || 1);
      var left = lastRect.left - rect.left;
      var offset = (rect.width - left + lastOffset) * direction;
      text.attr('transform', 'translate(' + offset + ', 0)');
      text.attr('data-last-horizontal-offset', Math.abs(offset));
    };
    staggerText.bind(this)(text, move);
  };

  d4.helpers.textSize = function(text, klasses) {
    var obj = {
      height: 0,
      width: 0,
      x: 0,
      y: 0
    };
    if (d4.isDefined(text)) {
      var container = d3.select('body').append('svg').attr('class', '' + klasses);
      container.append('text')
        .attr('x', -5000)
        .text(text);
      obj = container.node().getBBox();
      container.remove();
    }
    return obj;
  };

  // From Mike Bostock's example on wrapping long axis text.
  d4.helpers.wrapText = function(text, width) {
    text.each(function() {
      var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        x = text.attr('x'),
        y = text.attr('y'),
        dy = parseFloat(text.attr('dy')),
        tspan = text.text(null).append('tspan').attr('x', x).attr('y', y).attr('dy', dy + 'em');
      word = words.pop();
      while (word) {
        line.push(word);
        tspan.text(line.join(' '));
        if (tspan.node().getComputedTextLength() > width - Math.abs(x)) {
          line.pop();
          tspan.text(line.join(' '));
          line = [word];
          tspan = text.append('tspan').attr('x', x).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
        }
        word = words.pop();
      }
    });
  };

}).call(this);

(function() {
  'use strict';

  /*
   * The column chart has two axes (`x` and `y`). By default the column chart expects
   * linear values for the `y` and ordinal values on the `x`. The basic column chart
   * has four default features:
   *
   *##### Features
   *
   * `bars` - series bars
   * `barLabels` - data labels above the bars
   * `xAxis` - the axis for the x dimension
   * `yAxis` - the axis for the y dimension
   *
   *##### Example Usage
   *
   *     var data = [
   *         { x: '2010', y:-10 },
   *         { x: '2011', y:20 },
   *         { x: '2012', y:30 },
   *         { x: '2013', y:40 },
   *         { x: '2014', y:50 },
   *       ];
   *     var chart = d4.charts.column();
   *     d3.select('#example')
   *     .datum(data)
   *     .call(chart);
   *
   * By default d4 expects a series object, which uses the following format: `{ x : '2010', y : 10 }`.
   * The default format may not be desired and so we'll override it:
   *
   *     var data = [
   *       ['2010', -10],
   *       ['2011', 20],
   *       ['2012', 30],
   *       ['2013', 40],
   *       ['2014', 50]
   *     ];
   *     var chart = d4.charts.column()
   *     .x(function(x) {
   *          x.key(0)
   *     })
   *     .y(function(y){
   *          y.key(1);
   *     });
   *
   *     d3.select('#example')
   *     .datum(data)
   *     .call(chart);
   *
   * @name column
   */
  d4.chart('column', function column() {
    return d4.baseChart()
      .mixin([{
        'name': 'bars',
        'feature': d4.features.rectSeries
      }, {
        'name': 'barLabels',
        'feature': d4.features.stackedLabels
      }, {
        'name': 'xAxis',
        'feature': d4.features.xAxis
      }, {
        'name': 'yAxis',
        'feature': d4.features.yAxis
      }]);
  });
}).call(this);

(function() {
  'use strict';

  /*
   * The donut chart
   *
   *##### Features
   *
   * `arcs` - The arc series
   * `arcLabels` - The data labels linked to the arcs
   * `radius` - The total radius of the chart
   * `arcWidth` - The width of the arc
   *
   *##### Example Usage
   *
   *     var generateData = function() {
   *       var data = [];
   *       var names = ['Clay Hauck', 'Diego Hickle', 'Heloise Quitzon',
   *         'Hildegard Littel', 'Janiya Legros', 'Karolann Boehm',
   *         'Lilyan Deckow IV', 'Lizeth Blick', 'Marlene O\'Kon', 'Marley Gutmann'
   *       ],
   *         pie = d3.layout.pie()
   *           .sort(null)
   *           .value(function(d) {
   *             return d.unitsSold;
   *           });
   *       d4.each(names, function(name) {
   *         data.push({
   *           unitsSold: Math.max(10, Math.random() * 100),
   *           salesman: name
   *         });
   *       });
   *       return pie(data);
   *     };
   *
   *     var chart = d4.charts.donut()
   *       .outerWidth($('#pie').width())
   *       .margin({
   *         left: 0,
   *         top: 0,
   *         right: 0,
   *         bottom: 0
   *       })
   *       .radius(function() {
   *         return this.width / 8;
   *       })
   *       .arcWidth(50)
   *       .using('arcLabels', function(labels) {
   *         labels.text(function(d) {
   *           return d.data.salesman;
   *         })
   *       })
   *       .using('arcs', function(slices) {
   *         slices.key(function(d) {
   *           return d.data.salesman;
   *         });
   *       });
   *
   *
   *     var redraw = function() {
   *       var data = generateData();
   *       d3.select('#pie')
   *         .datum(data)
   *         .call(chart);
   *     };
   *     (function loop() {
   *       redraw();
   *       setTimeout(loop, 4500);
   *     })();
   *
   * @name donut
   */
  d4.chart('donut', function donut() {
    return d4.baseChart({
      config: {
        accessors: {
          radius: function() {
            return Math.min(this.width, this.height) / 2;
          },
          arcWidth: function(radius) {
            return radius / 3;
          }
        }
      }
    })
      .mixin(
        [{
          'name': 'arcs',
          'feature': d4.features.arcSeries
        }, {
          'name': 'arcLabels',
          'feature': d4.features.arcLabels
        }]);
  });
}).call(this);

(function() {
  'use strict';

  /*
   * The grouped column chart is used to compare a series of data elements grouped
   * along the xAxis. This chart is often useful in conjunction with a stacked column
   * chart because they can use the same data series, and where the stacked column highlights
   * the sum of the data series across an axis the grouped column can be used to show the
   * relative distribution.
   *
   *##### Features
   *
   * `bars` - series bars
   * `barLabels` - data labels above the bars
   * `groupsOf` - an integer representing the number of columns in each group
   * `xAxis` - the axis for the x dimension
   * `yAxis` - the axis for the y dimension
   *
   *##### Example Usage
   *
   *     var data = [
   *       { year: '2010', unitsSold:-100, salesman : 'Bob' },
   *       { year: '2011', unitsSold:200, salesman : 'Bob' },
   *       { year: '2012', unitsSold:300, salesman : 'Bob' },
   *       { year: '2013', unitsSold:400, salesman : 'Bob' },
   *       { year: '2014', unitsSold:500, salesman : 'Bob' },
   *       { year: '2010', unitsSold:100, salesman : 'Gina' },
   *       { year: '2011', unitsSold:100, salesman : 'Gina' },
   *       { year: '2012', unitsSold:-100, salesman : 'Gina' },
   *       { year: '2013', unitsSold:500, salesman : 'Gina' },
   *       { year: '2014', unitsSold:600, salesman : 'Gina' },
   *       { year: '2010', unitsSold:400, salesman : 'Average' },
   *       { year: '2011', unitsSold:0, salesman : 'Average' },
   *       { year: '2012', unitsSold:400, salesman : 'Average' },
   *       { year: '2013', unitsSold:400, salesman : 'Average' },
   *       { year: '2014', unitsSold:400, salesman : 'Average' }
   *     ];
   *
   *     var parsedData = d4.parsers.nestedGroup()
   *       .x('year')
   *       .y('unitsSold')
   *       .value('unitsSold')(data);
   *
   *     var chart = d4.charts.groupedColumn()
   *     .width($('#example').width())
   *     .x.$key('year')
   *     .y.$key('unitsSold')
   *     .groupsOf(parsedData.data[0].values.length);
   *
   *     d3.select('#example')
   *     .datum(parsedData.data)
   *     .call(chart);
   *
   * @name groupedColumn
   */
  d4.chart('groupedColumn', function groupedColumn() {
    var columnLabelOverrides = function() {
      return {
        accessors: {
          x: function(d, i) {
            var width = this.x.rangeBand() / this.groupsOf;
            var xPos = this.x(d[this.x.$key]) + width * i;
            var gutter = width * 0.1;
            return xPos + width / 2 - gutter;
          }
        }
      };
    };

    return d4.baseChart({
      config: {
        accessors: {
          groupsOf: 1
        }
      }
    })
      .mixin([{
        'name': 'bars',
        'feature': d4.features.groupedColumnSeries
      }, {
        'name': 'barLabels',
        'feature': d4.features.stackedLabels,
        'overrides': columnLabelOverrides
      }, {
        'name': 'xAxis',
        'feature': d4.features.xAxis
      }, {
        'name': 'yAxis',
        'feature': d4.features.yAxis
      }]);
  });
}).call(this);

(function() {
  'use strict';

  /*
   * The grouped row chart is used to compare a series of data elements grouped
   * along the xAxis. This chart is often useful in conjunction with a stacked row
   * chart because they can use the same data series, and where the stacked row highlights
   * the sum of the data series across an axis the grouped row can be used to show the
   * relative distribution.
   *
   *##### Features
   *
   * `bars` - series bars
   * `barLabels` - data labels above the bars
   * `groupsOf` - an integer representing the number of rows in each group
   * `xAxis` - the axis for the x dimension
   * `yAxis` - the axis for the y dimension
   *
   *##### Example Usage
   *
   *     var data = [
   *       { year: '2010', unitsSold:-100, salesman : 'Bob' },
   *       { year: '2011', unitsSold:200, salesman : 'Bob' },
   *       { year: '2012', unitsSold:300, salesman : 'Bob' },
   *       { year: '2013', unitsSold:400, salesman : 'Bob' },
   *       { year: '2014', unitsSold:500, salesman : 'Bob' },
   *       { year: '2010', unitsSold:100, salesman : 'Gina' },
   *       { year: '2011', unitsSold:100, salesman : 'Gina' },
   *       { year: '2012', unitsSold:-100, salesman : 'Gina' },
   *       { year: '2013', unitsSold:500, salesman : 'Gina' },
   *       { year: '2014', unitsSold:600, salesman : 'Gina' },
   *       { year: '2010', unitsSold:400, salesman : 'Average' },
   *       { year: '2011', unitsSold:0, salesman : 'Average' },
   *       { year: '2012', unitsSold:400, salesman : 'Average' },
   *       { year: '2013', unitsSold:400, salesman : 'Average' },
   *       { year: '2014', unitsSold:400, salesman : 'Average' }
   *     ];
   *
   *     var parsedData = d4.parsers.nestedGroup()
   *       .x('year')
   *       .y('unitsSold')
   *       .value('unitsSold')(data);
   *
   *     var chart = d4.charts.groupedRow()
   *     .width($('#example').width())
   *     .x.$key('year')
   *     .y.$key('unitsSold')
   *     .groupsOf(parsedData.data[0].values.length);
   *
   *     d3.select('#example')
   *     .datum(parsedData.data)
   *     .call(chart);
   *
   * @name groupedRow
   */
  d4.chart('groupedRow', function groupedRow() {
    var rowLabelOverrides = function() {
      return {
        accessors: {
          y: function(d, i) {
            var height = this.y.rangeBand() / this.groupsOf;
            var yPos = this.y(d[this.y.$key]) + height * i;
            var gutter = height * 0.1;
            return yPos + height / 4 + gutter;
          }
        }
      };
    };

    return d4.baseChart({
      config: {
        accessors: {
          groupsOf: 1
        },
        margin: {
          top: 20,
          right: 40,
          bottom: 20,
          left: 40
        },
        axes: {
          x: {
            scale: 'linear'
          },
          y: {
            scale: 'ordinal'
          }
        }
      }
    })
      .mixin([{
        'name': 'bars',
        'feature': d4.features.groupedColumnSeries
      }, {
        'name': 'barLabels',
        'feature': d4.features.stackedLabels,
        'overrides': rowLabelOverrides
      }, {
        'name': 'xAxis',
        'feature': d4.features.xAxis
      }, {
        'name': 'yAxis',
        'feature': d4.features.yAxis
      }]);
  });
}).call(this);

(function() {
  'use strict';

  /*
   * The line series chart is used to compare a series of data elements grouped
   * along the xAxis.
   *
   *##### Features
   *
   * `lineSeries` - series lines
   * `lineSeriesLabels` - data labels beside the lines
   * `xAxis` - the axis for the x dimension
   * `yAxis` - the axis for the y dimension
   *
   *##### Example Usage
   *
   *      var data = [
   *        { year: '2010', unitsSold:-100, salesman : 'Bob' },
   *        { year: '2011', unitsSold:200, salesman : 'Bob' },
   *        { year: '2012', unitsSold:300, salesman : 'Bob' },
   *        { year: '2013', unitsSold:400, salesman : 'Bob' },
   *        { year: '2014', unitsSold:500, salesman : 'Bob' },
   *        { year: '2010', unitsSold:100, salesman : 'Gina' },
   *        { year: '2011', unitsSold:100, salesman : 'Gina' },
   *        { year: '2012', unitsSold:-100, salesman : 'Gina' },
   *        { year: '2013', unitsSold:500, salesman : 'Gina' },
   *        { year: '2014', unitsSold:600, salesman : 'Gina' },
   *        { year: '2010', unitsSold:400, salesman : 'Average' },
   *        { year: '2011', unitsSold:0, salesman : 'Average' },
   *        { year: '2012', unitsSold:400, salesman : 'Average' },
   *        { year: '2013', unitsSold:400, salesman : 'Average' },
   *        { year: '2014', unitsSold:400, salesman : 'Average' }
   *      ];
   *      var parsedData = d4.parsers.nestedGroup()
   *        .x(function(){
   *          return 'year';
   *        })
   *        .nestKey(function(){
   *          return 'salesman';
   *        })
   *        .y(function(){
   *          return 'unitsSold';
   *        })
   *        .value(function(){
   *          return 'unitsSold';
   *        })(data);
   *
   *      var chart = d4.charts.line()
   *      .width($('#example').width())
   *      .x.$key('year')
   *      .y.$key('unitsSold');
   *
   *      d3.select('#example')
   *      .datum(parsedData.data)
   *      .call(chart);
   *
   * @name line
   */
  d4.chart('line', function line() {
    return d4.baseChart().mixin([{
      'name': 'lineSeries',
      'feature': d4.features.lineSeries
    }, {
      'name': 'xAxis',
      'feature': d4.features.xAxis
    }, {
      'name': 'yAxis',
      'feature': d4.features.yAxis
    }, {
      'name': 'lineSeriesLabels',
      'feature': d4.features.lineSeriesLabels
    }]);
  });
}).call(this);

(function() {
  'use strict';

  /*
   * The row chart has two axes (`x` and `y`). By default the column chart expects
   * linear scale values for the `x` and ordinal scale values on the `y`. The basic column chart
   * has four default features:
   *
   *##### Features
   *
   * `bars` - series bars
   * `barLabels` - data labels to the right of the bars
   * `xAxis` - the axis for the x dimension
   * `yAxis` - the axis for the y dimension
   *
   *##### Example Usage
   *
   *      var data = [
   *            { y: '2010', x:-10 },
   *            { y: '2011', x:20 },
   *            { y: '2012', x:30 },
   *            { y: '2013', x:40 },
   *            { y: '2014', x:50 },
   *          ];
   *        var chart = d4.charts.row();
   *        d3.select('#example')
   *        .datum(data)
   *        .call(chart);
   *
   * @name row
   */
  d4.chart('row', function row() {
    return d4.baseChart({
      config: {
        margin: {
          top: 20,
          right: 40,
          bottom: 20,
          left: 40
        },
        valueKey: 'x',
        axes: {
          x: {
            scale: 'linear'
          },
          y: {
            scale: 'ordinal'
          }
        }
      }
    })
      .mixin([{
        'name': 'bars',
        'feature': d4.features.rectSeries
      }, {
        'name': 'barLabels',
        'feature': d4.features.stackedLabels
      }, {
        'name': 'xAxis',
        'feature': d4.features.xAxis
      }, {
        'name': 'yAxis',
        'feature': d4.features.yAxis
      }]);
  });
}).call(this);

(function() {
  'use strict';

  var scatterPlotBuilder = function() {
    var configureScales = function(chart, data) {
      d4.builders[chart.x.$scale + 'ScaleForNestedData'](chart, data, 'x');
      d4.builders[chart.y.$scale + 'ScaleForNestedData'](chart, data, 'y');
      d4.builders[chart.z.$scale + 'ScaleForNestedData'](chart, data, 'z');

      // FIXME: Remove this hard coding.
      var min = 5;
      var max = Math.max(min + 1, (chart.height - chart.margin.top - chart.margin.bottom) / 10);
      chart.z.range([min, max]);
    };

    var builder = {
      link: function(chart, data) {
        configureScales.bind(this)(chart, data);
      }
    };
    return builder;
  };
  var useDiscretePosition = function(dimension, d) {
    var axis = this[dimension];
    return axis(d[axis.$key]) + (axis.rangeBand() / 2);
  };

  var useContinuousPosition = function(dimension, d) {
    var axis = this[dimension];
    var offset = Math.abs(axis(d.y0) - axis(d.y0 + d.y)) / 2;

    // FIXME: Remove this hardcoding.
    var padding = 10;
    var val;
    if (dimension === 'x') {
      offset *= -1;
      padding *= -1;
    }
    if (d4.isDefined(d.y0)) {
      val = d.y0 + d.y;
      return axis(val) + offset;
    } else {
      return axis(d[axis.$key]) - padding;
    }
  };

  var stackedLabelOverrides = function() {
    return {
      accessors: {
        x: function(d) {
          if (d4.isOrdinalScale(this.x)) {
            return useDiscretePosition.bind(this)('x', d);
          } else {
            return useContinuousPosition.bind(this)('x', d);
          }
        },

        y: function(d) {
          if (d4.isOrdinalScale(this.y)) {
            return useDiscretePosition.bind(this)('y', d);
          } else {
            return useContinuousPosition.bind(this)('y', d);
          }
        }
      }
    };
  };

  var circleOverrides = function() {
    return {
      accessors: {
        cx: function(d) {
          return this.x(d[this.x.$key]);
        },

        cy: function(d) {
          return this.y(d[this.y.$key]);
        },

        r: function(d) {
          return this.z(d[this.z.$key]);
        }
      }
    };
  };

  /*
   * The scatter plot has three axes (`x`, `y` and `z`). By default the scatter
   * plot expects linear scale values for all axes. The basic scatter plot chart
   * has these default features:
   *
   *##### Features
   *
   * `circles` - series of circles
   * `xAxis` - the axis for the x dimension
   * `yAxis` - the axis for the y dimension
   *
   *##### Example Usage
   *
   *      var data = [
   *        { age: 12, unitsSold: 0,    month: 1 },
   *        { age: 22, unitsSold: 200,  month: 2 },
   *        { age: 42, unitsSold: 300,  month: 3 },
   *        { age: 32, unitsSold: 400,  month: 4 },
   *        { age: 2 , unitsSold: 400,  month: 2 }
   *      ];
   *
   *      var chart = d4.charts.scatterPlot()
   *      .x(function(x){
   *        x.min(-10)
   *        x.key('age');
   *      })
   *      .y(function(y){
   *        y.key('month');
   *      })
   *      .z(function(z){
   *        z.key('unitsSold');
   *      });
   *
   *      d3.select('#example')
   *      .datum(data)
   *      .call(chart);
   *
   * @name scatterPlot
   */
  d4.chart('scatterPlot', function scatterPlot() {
    return d4.baseChart({
      builder: scatterPlotBuilder,
      config: {
        axes: {
          x: {
            scale: 'linear'
          },
          z: {
            scale: 'linear'
          }
        }
      }
    })
      .mixin([{
        'name': 'circles',
        'feature': d4.features.circleSeries,
        'overrides': circleOverrides
      }, {
        'name': 'circleLabels',
        'feature': d4.features.stackedLabels,
        'overrides': stackedLabelOverrides
      }, {
        'name': 'xAxis',
        'feature': d4.features.xAxis
      }, {
        'name': 'yAxis',
        'feature': d4.features.yAxis
      }]);
  });
}).call(this);

(function() {
  'use strict';

  /*
   * The stacked column chart has two axes (`x` and `y`). By default the stacked
   * column expects continious scale for the `y` axis and a discrete scale for
   * the `x` axis. The stacked column has the following default features:
   *
   *##### Features
   *
   * `bars` - series of rects
   * `barLabels` - individual data values inside the stacked rect
   * `connectors` - visual lines that connect the various stacked columns together
   * `columnTotals` - column labels which total the values of each stack.
   * `xAxis` - the axis for the x dimension
   * `yAxis` - the axis for the y dimension
   *
   *##### Example Usage
   *
   *      var data = [
   *          { year: '2010', unitsSold: 200, salesman : 'Bob' },
   *          { year: '2011', unitsSold: 200, salesman : 'Bob' },
   *          { year: '2012', unitsSold: 300, salesman : 'Bob' },
   *          { year: '2013', unitsSold: -400, salesman : 'Bob' },
   *          { year: '2014', unitsSold: -500, salesman : 'Bob' },
   *          { year: '2010', unitsSold: 100, salesman : 'Gina' },
   *          { year: '2011', unitsSold: 100, salesman : 'Gina' },
   *          { year: '2012', unitsSold: 200, salesman : 'Gina' },
   *          { year: '2013', unitsSold: -500, salesman : 'Gina' },
   *          { year: '2014', unitsSold: -600, salesman : 'Gina' },
   *          { year: '2010', unitsSold: 400, salesman : 'Average' },
   *          { year: '2011', unitsSold: 100, salesman : 'Average' },
   *          { year: '2012', unitsSold: 400, salesman : 'Average' },
   *          { year: '2013', unitsSold: -400, salesman : 'Average' },
   *          { year: '2014', unitsSold: -400, salesman : 'Average' }
   *        ];
   *
   *      var parsedData = d4.parsers.nestedStack()
   *        .x(function(){
   *          return 'year';
   *        })
   *        .y(function(){
   *          return 'salesman';
   *        })
   *        .value(function(){
   *          return 'unitsSold';
   *        })(data);
   *
   *      var chart = d4.charts.stackedColumn()
   *      .x(function(x){
   *        x.key('year');
   *      })
   *      .y(function(y){
   *        y.key('unitsSold');
   *      })
   *
   *      d3.select('#example')
   *      .datum(parsedData.data)
   *      .call(chart);
   *
   * @name stackedColumn
   */
  d4.chart('stackedColumn', function stackedColumn() {
    var columnLabelsOverrides = function() {
      var extractValues = function(data) {
        var arr = [];
        data.map(function(d) {
          d.values.map(function(n) {
            arr.push(n);
          });
        });
        return arr;
      };

      var calculateTotalsAsNest = function(arr) {
        return d3.nest()
          .key(function(d) {
            return d[this.x.$key];
          }.bind(this))

        .rollup(function(leaves) {
          var text = d3.sum(leaves, function(d) {
            return d[this.valueKey];
          }.bind(this));

          var size = d3.sum(leaves, function(d) {
            return Math.max(0, d[this.valueKey]);
          }.bind(this));

          return {
            text: text,
            size: size
          };
        }.bind(this))
          .entries(arr);
      };

      var calculateStackTotals = function(data) {
        return calculateTotalsAsNest.bind(this)(extractValues(data)).map(function(d) {
          var item = {};
          item[this.x.$key] = d.key;
          item.size = d.values.size;
          item[this.valueKey] = d.values.text;
          return item;
        }.bind(this));
      };

      return {
        accessors: {
          beforeRender: function(data) {
            return calculateStackTotals.bind(this)(data);
          },
          y: function(d) {
            var padding = 5;
            return this.y(d.size) - padding;
          }
        }
      };
    };

    return d4.baseChart()
      .mixin([{
        'name': 'bars',
        'feature': d4.features.rectSeries
      }, {
        'name': 'barLabels',
        'feature': d4.features.stackedLabels
      }, {
        'name': 'connectors',
        'feature': d4.features.stackedColumnConnectors
      }, {
        'name': 'columnTotals',
        'feature': d4.features.columnLabels,
        'overrides': columnLabelsOverrides
      }, {
        'name': 'xAxis',
        'feature': d4.features.xAxis
      }, {
        'name': 'yAxis',
        'feature': d4.features.yAxis
      }]);
  });
}).call(this);

(function() {
  'use strict';
  /*
   * The stacked row chart has two axes (`x` and `y`). By default the stacked
   * row expects continious scale for the `x` axis and a discrete scale for
   * the `y` axis. The stacked row has the following default features:
   *
   *##### Features
   *
   * `bars` - series of rects
   * `barLabels` - individual data values inside the stacked rect
   * `connectors` - visual lines that connect the various stacked columns together
   * `columnTotals` - column labels which total the values of each stack.
   * `xAxis` - the axis for the x dimension
   * `yAxis` - the axis for the y dimension
   *
   *##### Example Usage
   *
   *      var data = [
   *            { year: '2010', unitsSold: 200, salesman : 'Bob' },
   *            { year: '2011', unitsSold: 200, salesman : 'Bob' },
   *            { year: '2012', unitsSold: 300, salesman : 'Bob' },
   *            { year: '2013', unitsSold: -400, salesman : 'Bob' },
   *            { year: '2014', unitsSold: -500, salesman : 'Bob' },
   *            { year: '2010', unitsSold: 100, salesman : 'Gina' },
   *            { year: '2011', unitsSold: 100, salesman : 'Gina' },
   *            { year: '2012', unitsSold: 200, salesman : 'Gina' },
   *            { year: '2013', unitsSold: -500, salesman : 'Gina' },
   *            { year: '2014', unitsSold: -600, salesman : 'Gina' },
   *            { year: '2010', unitsSold: 400, salesman : 'Average' },
   *            { year: '2011', unitsSold: 200, salesman : 'Average' },
   *            { year: '2012', unitsSold: 400, salesman : 'Average' },
   *            { year: '2013', unitsSold: -400, salesman : 'Average' },
   *            { year: '2014', unitsSold: -400, salesman : 'Average' }
   *          ];
   *
   *        var parsedData = d4.parsers.nestedStack()
   *          .x(function(){
   *            return 'year';
   *          })
   *          .y(function(){
   *            return 'salesman';
   *          })
   *          .value(function(){
   *            return 'unitsSold';
   *          })(data);
   *
   *        var chart = d4.charts.stackedRow()
   *        .x(function(x){
   *          x.key('unitsSold');
   *        })
   *        .valueKey('unitsSold')
   *        .y(function(y){
   *          y.key('year');
   *        });
   *
   *       d3.select('#example')
   *       .datum(parsedData.data)
   *       .call(chart);
   *
   * @name stackedRow
   */
  d4.chart('stackedRow', function stackedRow() {
    var columnLabelsOverrides = function() {
      var extractValues = function(data) {
        var arr = [];
        data.map(function(d) {
          d.values.map(function(n) {
            arr.push(n);
          });
        });
        return arr;
      };

      var calculateTotalsAsNest = function(arr) {
        return d3.nest()
          .key(function(d) {
            return d[this.y.$key];
          }.bind(this))

        .rollup(function(leaves) {
          var text = d3.sum(leaves, function(d) {
            return d[this.valueKey];
          }.bind(this));

          var size = d3.sum(leaves, function(d) {
            return Math.max(0, d[this.valueKey]);
          }.bind(this));

          return {
            text: text,
            size: size
          };
        }.bind(this))
          .entries(arr);
      };

      var calculateStackTotals = function(data) {
        return calculateTotalsAsNest.bind(this)(extractValues(data)).map(function(d) {
          var item = {};
          item[this.y.$key] = d.key;
          item.size = d.values.size;
          item[this.valueKey] = d.values.text;
          return item;
        }.bind(this));
      };

      return {
        accessors: {
          beforeRender: function(data) {
            return calculateStackTotals.bind(this)(data);
          },

          x: function(d) {
            var padding = 5;
            return this.x(d.size) + padding;
          }
        },
      };
    };

    return d4.baseChart({
      config: {
        margin: {
          top: 20,
          right: 40,
          bottom: 20,
          left: 40
        },
        axes: {
          x: {
            scale: 'linear'
          },
          y: {
            scale: 'ordinal'
          }
        }
      }
    })
      .mixin([{
        'name': 'bars',
        'feature': d4.features.rectSeries
      }, {
        'name': 'barLabels',
        'feature': d4.features.stackedLabels
      }, {
        'name': 'connectors',
        'feature': d4.features.stackedColumnConnectors
      }, {
        'name': 'columnTotals',
        'feature': d4.features.columnLabels,
        'overrides': columnLabelsOverrides
      }, {
        'name': 'xAxis',
        'feature': d4.features.xAxis
      }, {
        'name': 'yAxis',
        'feature': d4.features.yAxis
      }]);
  });
}).call(this);

(function() {
  'use strict';

  var columnSeriesOverrides = function waterfall() {
    return {
      accessors: {
        y: function(d) {
          if (d4.isContinuousScale(this.y)) {
            var yVal = (d.y0 + d.y) - Math.min(0, d.y);
            return this.y(yVal);
          } else {
            return this.y(d[this.y.$key]);
          }
        },

        x: function(d) {
          if (d4.isOrdinalScale(this.x)) {
            return this.x(d[this.x.$key]);
          } else {
            var xVal = (d.y0 + d.y) - Math.max(0, d.y);
            return this.x(xVal);
          }
        },

        width: function(d) {
          if (d4.isOrdinalScale(this.x)) {
            return this.x.rangeBand();
          } else {
            return Math.abs(this.x(d.y0) - this.x(d.y0 + d.y));
          }
        },

        height: function(d) {
          if (d4.isContinuousScale(this.y)) {
            return Math.abs(this.y(d.y0) - this.y(d.y0 + d.y));
          } else {
            return this.y.rangeBand();
          }
        },

        classes: function(d, i, n) {
          var klass = (d.y > 0) ? 'positive' : 'negative';
          if (n > 0 && d.y0 === 0) {
            klass = 'subtotal';
          }
          return 'bar fill item' + i + ' ' + klass + ' ' + d[this.y.$key];
        }
      }
    };
  };

  var columnLabelOverrides = function() {
    return {
      accessors: {
        y: function(d) {
          if (d4.isContinuousScale(this.y)) {
            var height = Math.abs(this.y(d.y0) - this.y(d.y0 + d.y));
            var yVal = (d.y0 + d.y) - Math.max(0, d.y);
            return this.y(yVal) - 10 - height;
          } else {
            return this.y(d[this.y.$key]) + (this.y.rangeBand() / 2);
          }
        },

        x: function(d) {
          if (d4.isOrdinalScale(this.x)) {
            return this.x(d[this.x.$key]) + (this.x.rangeBand() / 2);
          } else {
            var xVal = (d.y0 + d.y) - Math.max(0, d.y);
            var width = Math.abs(this.x(d.y0) - this.x(d.y0 + d.y));
            return this.x(xVal) + 10 + width;
          }
        },

        text: function(d) {
          return d[this.valueKey];
        }
      }
    };
  };

  var waterfallChartBuilder = function() {
    var rangeBoundsFor = function(chart, dimension) {
      var rangeBounds;
      if (dimension === 'x') {
        return [0, chart.width];
      } else {
        rangeBounds = [0, chart.height];
        return (d4.isOrdinalScale(chart.x)) ? rangeBounds.reverse() : rangeBounds;
      }
    };

    var setOrdinal = function(chart, dimension, data) {
      var keys = data.map(function(d) {
        return d.key;
      }.bind(this));

      chart[dimension]
        .domain(keys)
        .rangeRoundBands(rangeBoundsFor.bind(this)(chart, dimension), chart.xRoundBands || 0.3);
    };

    var setLinear = function(chart, dimension, data) {
      var ext = d3.extent(d3.merge(data.map(function(datum) {
        return d3.extent(datum.values, function(d) {

          // This is anti-intuative but the stack only returns y and y0 even
          // when it applies to the x dimension;
          return d.y + d.y0;
        });
      })));

      ext[0] = d4.isDefined(chart[dimension].$min) ? chart[dimension].$min : Math.min(0, ext[0]);

      if(d4.isDefined(chart[dimension].$max)){
        ext[1] = chart[dimension].$max;
      }

      chart[dimension].domain(ext);
      chart[dimension].range(rangeBoundsFor.bind(this)(chart, dimension))
        .clamp(true)
        .nice();
    };

    var configureScales = function(chart, data) {
      if (d4.isOrdinalScale(chart.x)) {
        setOrdinal.bind(this)(chart, 'x', data);
        setLinear.bind(this)(chart, 'y', data);
      } else {
        setOrdinal.bind(this)(chart, 'y', data);
        setLinear.bind(this)(chart, 'x', data);
      }
    };

    var builder = {
      link: function(chart, data) {
        configureScales.bind(this)(chart, data);
      }
    };
    return builder;
  };

  /*
   * The waterfall chart visually tallies the cumulative result of negative and
   * positive values over a data series. In addition to specifying the normal
   * positive and negative values d4's also lets you designate a column as a subtotal
   * column by passing in an "e" as the value key, which may be a familiar convention
   * if you have used think-cell.
   *
   * The waterfall chart has two axes (`x` and `y`). By default the stacked
   * column expects continious scale for the `y` axis and a discrete scale for
   * the `x` axis. This will render the waterfall chart vertically. However,
   * if you swap the scale types then the waterfall will render horizontally.
   *
   *##### Features
   *
   * `bars` - series of rects
   * `connectors` - visual lines that connect the various stacked columns together
   * `columnLabels` - column labels which total the values of each rect.
   * `xAxis` - the axis for the x dimension
   * `yAxis` - the axis for the y dimension
   *
   *##### Example Usage
   *
   *      var data = [
   *          { 'category': 'Job',       'value': 27  },
   *          { 'category': 'Groceries', 'value': -3  },
   *          { 'category': 'Allowance', 'value': 22  },
   *          { 'category': 'Subtotal',  'value': 'e' },
   *          { 'category': 'Videos',    'value': -22 },
   *          { 'category': 'Coffee',    'value': -4  },
   *          { 'category': 'Total',     'value': 'e' }
   *        ];
   *        var parsedData = d4.parsers.waterfall()
   *          .x(function() {
   *            return 'category';
   *          })
   *          .y(function() {
   *            return 'value';
   *          })
   *          .nestKey(function() {
   *            return 'category';
   *          })(data);
   *
   *        var chart = d4.charts.waterfall()
   *          .width($('#example').width())
   *          .x(function(x){
   *            x.key('category');
   *          })
   *          .y(function(y){
   *            y.key('value');
   *          });
   *
   *        d3.select('#example')
   *          .datum(parsedData.data)
   *          .call(chart);
   *
   * @name waterfall
   */
  d4.chart('waterfall', function waterfallChart() {
    return d4.baseChart({
      builder: waterfallChartBuilder
    })
      .mixin([{
        'name': 'bars',
        'feature': d4.features.rectSeries,
        'overrides': columnSeriesOverrides
      }, {
        'name': 'connectors',
        'feature': d4.features.waterfallConnectors
      }, {
        'name': 'columnLabels',
        'feature': d4.features.stackedLabels,
        'overrides': columnLabelOverrides
      }, {
        'name': 'xAxis',
        'feature': d4.features.xAxis
      }, {
        'name': 'yAxis',
        'feature': d4.features.yAxis
      }]);
  });
}).call(this);

(function() {
  'use strict';
  /*
   * Arc labels are used to annotate arc series, for example those created by pie and donut charts.
   * Many of the accessors of this feature proxy directly to D3's arc object:
   * https://github.com/mbostock/d3/wiki/SVG-Shapes#arc
   *
   *##### Accessors
   *
   * `centroid` - proxied accessor to the navtive d3 function
   * `classes` - classes assigned to the arc label.
   * `duration` - time in milliseconds for the transition to occur.
   * `endAngle` - proxied accessor to the navtive d3 function
   * `innerRadius` - proxied accessor to the navtive d3 function
   * `key` - unique identifier used for linking the element during d3's transition process
   * `outerRadius` - proxied accessor to the navtive d3 function
   * `startAngle` - proxied accessor to the navtive d3 function
   * `text` - value to display in the label.
   * `x` - position across the x axis
   * `y` - position across the y axis
   *
   * @name arcLabels
   */
  d4.feature('arcLabels', function(name) {
    var arc = d3.svg.arc();
    return {
      accessors: {
        classes: function(d, n) {
          return 'arc stroke fill series' + n;
        },

        duration: 750,

        key: d4.functor(d4.defaultKey),

        text: function(d) {
          return d.value;
        },

        x: function() {
          return this.width / 2;
        },

        y: function() {
          return this.height / 2;
        }
      },
      proxies: [{
        target: arc
      }],
      render: function(scope, data, selection) {
        var labelAngle = function(d) {
          return (180 / Math.PI * (d.startAngle + d.endAngle) / 2 - 90);
        };

        // extracted from: http://bl.ocks.org/mbostock/1346410
        // Store the displayed angles in _current.
        // Then, interpolate from _current to the new angles.
        // During the transition, _current is updated in-place by d3.interpolate.
        var arcTween = function(d) {
          var i = d3.interpolate(this._current, d);
          this._current = i(0);
          return function(t) {
            return 'translate(' + arc.centroid(i(t)) + ') rotate(' + labelAngle(d) + ')';
          };
        };

        // FIXME: #radius() is assumed to be provided by the enclosing chart. maybe we should default back to a feature based implementation if it doesn't find it?
        var r = d4.functor(this.radius).bind(this)(),
          x = d4.functor(scope.accessors.x).bind(this)(),
          y = d4.functor(scope.accessors.y).bind(this)();
        arc
          .innerRadius(r)
          .outerRadius(r + 10);

        var group = selection.selectAll('g.' + name).data(data);
        group.enter()
          .append('g')
          .attr('class', name)
          .attr('transform', 'translate(' + x + ',' + y + ')');

        var labels = group.selectAll('text')
          .data(function(d) {
            return d.values;
          }, d4.functor(scope.accessors.key).bind(this));

        // update
        labels.transition()
          .duration(d4.functor(scope.accessors.duration).bind(this)())
          .attrTween('transform', arcTween);

        // create new elements as needed
        labels.enter()
          .append('text')
          .attr('dy', 5)
          .attr('transform', function(d) {
            return 'translate(' + arc.centroid(d) + ') rotate(' + labelAngle(d) + ')';
          })
          .style('text-anchor', 'start')
          .text(d4.functor(scope.accessors.text).bind(this))
          .attr('class', d4.functor(scope.accessors.classes).bind(this))
          .attr('data-key', d4.functor(scope.accessors.key).bind(this))
          .attr('d', arc)
          .each(function(d) {
            this._current = d;
          });

        //remove old elements as needed
        labels.exit().remove();
        group.exit().remove();
        return arc;
      }
    };
  });
}).call(this);

(function() {
  'use strict';
  /*
   * Arc series is a collection of arcs suitable for those needed by pie and donut charts.
   * Many of the accessors of this feature proxy directly to D3's arc object:
   * https://github.com/mbostock/d3/wiki/SVG-Shapes#arc
   *
   *##### Accessors
   *
   * `centroid` - proxied accessor to the navtive d3 function
   * `classes` - classes assigned to the arc label.
   * `duration` - time in milliseconds for the transition to occur.
   * `endAngle` - proxied accessor to the navtive d3 function
   * `innerRadius` - proxied accessor to the navtive d3 function
   * `key` - unique identifier used for linking the element during d3's transition process
   * `outerRadius` - proxied accessor to the navtive d3 function
   * `startAngle` - proxied accessor to the navtive d3 function
   * `x` - position across the x axis
   * `y` - position across the y axis
   *
   * @name arcSeries
   */
  d4.feature('arcSeries', function(name) {
    var arc = d3.svg.arc();
    return {
      accessors: {
        classes: function(d, n) {
          return 'arc stroke fill series' + n;
        },

        duration: 750,

        key: d4.functor(d4.defaultKey),

        x: function() {
          return this.width / 2;
        },

        y: function() {
          return this.height / 2;
        }
      },
      proxies: [{
        target: arc
      }],
      render: function(scope, data, selection) {

        // extracted from: http://bl.ocks.org/mbostock/1346410
        // Store the displayed angles in _current.
        // Then, interpolate from _current to the new angles.
        // During the transition, _current is updated in-place by d3.interpolate.
        var arcTween = function(a) {
          var i = d3.interpolate(this._current, a);
          this._current = i(0);
          return function(t) {
            return arc(i(t));
          };
        };

        // FIXME: radius and arcWidth are assumed to be provided by the enclosing chart. maybe we should default back to a feature based implementation if it doesn't find it?
        var r = d4.functor(this.radius).bind(this)(),
          x = d4.functor(scope.accessors.x).bind(this)(),
          y = d4.functor(scope.accessors.y).bind(this)(),
          aw = d4.functor(this.arcWidth).bind(this)(r);
        arc
          .innerRadius(r)
          .outerRadius(r - aw);

        var group = selection.selectAll('g.' + name).data(data);
        group.enter()
          .append('g')
          .attr('class', name)
          .attr('transform', 'translate(' + x + ',' + y + ')');

        var arcs = group.selectAll('path')
          .data(function(d) {
            return d.values;
          }, d4.functor(scope.accessors.key).bind(this));

        // update
        arcs.transition()
          .duration(d4.functor(scope.accessors.duration).bind(this)())
          .attrTween('d', arcTween);

        // create new elements as needed
        arcs.enter()
          .append('path')
          .attr('class', d4.functor(scope.accessors.classes).bind(this))
          .attr('data-key', d4.functor(scope.accessors.key).bind(this))
          .attr('d', arc)
          .each(function(d) {
            this._current = d;
          });

        //remove old elements as needed
        arcs.exit().remove();
        group.exit().remove();
        return arc;
      }
    };
  });
}).call(this);

(function() {
  'use strict';
  /*
   * The arrow feature is a convienient way to visually draw attention to a portion
   * of a chart by pointing an arrow at it.
   *
   * @name arrow
   */
  d4.feature('arrow', function(name) {
    return {
      accessors: {
        classes: 'line',
        tipSize: 6,
        x1: function() {
          return this.x(0);
        },

        x2: function() {
          return this.x(this.width);
        },

        y1: function() {
          return this.y(0);
        },

        y2: function() {
          return this.y(this.height);
        }
      },
      render: function(scope, data, selection) {
        var defs = this.container.select('defs');

        d4.appendOnce(defs, 'marker#' + name + '-end')
          .attr('viewBox', '0 0 10 10')
          .attr('refX', 10)
          .attr('refY', 5)
          .attr('markerWidth', d4.functor(scope.accessors.tipSize).bind(this))
          .attr('markerHeight', d4.functor(scope.accessors.tipSize).bind(this))
          .attr('orient', 'auto')
          .append('path')
          .attr('d', 'M 0 0 L 10 5 L 0 10 z');

        d4.appendOnce(defs, 'marker#' + name + '-start')
          .attr('viewBox', '0 0 10 10')
          .attr('refX', 10)
          .attr('refY', 5)
          .attr('markerWidth', d4.functor(scope.accessors.tipSize).bind(this)())
          .attr('markerHeight', d4.functor(scope.accessors.tipSize).bind(this))
          .attr('orient', 'auto')
          .append('path')
          .attr('d', 'M 0 0 L 10 5 L 0 10 z');

        d4.appendOnce(selection, 'g.' + name);

        var arrow = d4.appendOnce(this.container.select('.' + name), 'line')
          .attr('class', d4.functor(scope.accessors.classes).bind(this))
          .attr('x1', d4.functor(scope.accessors.x1).bind(this))
          .attr('x2', d4.functor(scope.accessors.x2).bind(this))
          .attr('y1', d4.functor(scope.accessors.y1).bind(this))
          .attr('y2', d4.functor(scope.accessors.y2).bind(this))
          .attr('marker-end', 'url(#' + name + '-end)');

        return arrow;
      }
    };
  });
}).call(this);

(function() {
  'use strict';

  d4.feature('brush', function(name) {
    var brush = d3.svg.brush();
    var setBrushScale = function(funct) {

      // User passed a d4 scale function directly into the brush's axis accessor.
      if (d4.isDefined(funct.$scale)) {
        return funct;
      } else {
        return d4.functor(funct).bind(this)();
      }
    };

    var brushDetectionFunction = function(e) {
      if (d4.isNull(brush.y())) {
        return function(d) {
          var x = d[this.x.$key];
          var selected = e[0] <= x && x <= e[1];
          return selected;
        }.bind(this);
      }

      if (d4.isNull(brush.x())) {
        return function(d) {
          var y = d[this.y.$key];
          var selected = e[0] <= y && y <= e[1];
          return selected;
        }.bind(this);
      }

      if (d4.isNotNull(brush.x()) && d4.isNotNull(brush.y())) {
        return function(d) {
          var selected = e[0][0] <= d[this.x.$key] &&
            d[this.x.$key] <= e[1][0] &&
            e[0][1] <= d[this.y.$key] &&
            d[this.y.$key] <= e[1][1];
          return selected;
        }.bind(this);
      }
    };

    var obj = {
      accessors: {
        brushable: function() {
          return d3.selectAll('.brushable');
        },
        brushend: function() {
          this.container.classed('selecting', !d3.event.target.empty());
        },
        brushmove: function() {
          var e = d3.event.target.extent();
          var brushDetected = brushDetectionFunction.bind(this)(e);
          this.features[name].accessors.brushable().classed('selected', brushDetected);
        },
        brushstart: function() {
          this.container.classed('selecting', true);
        },
        clamp: brush.clamp,
        clear: brush.clear,
        extent: brush.extent,
        empty: brush.empty,
        event: brush.event,
        selection: function(selection) {
          return selection;
        },
        x: function() {
          return null;
        },
        y: function() {
          return null;
        },
      },

      render: function(scope, data, selection) {
        var brushX = setBrushScale.bind(this)(scope.accessors.x);
        var brushY = setBrushScale.bind(this)(scope.accessors.y);
        if (typeof brushX !== null) {
          brush.x(brushX);
        }
        if (typeof brushY !== null) {
          brush.y(brushY);
        }

        brush
          .on('brushstart', d4.functor(scope.accessors.brushstart).bind(this))
          .on('brush', d4.functor(scope.accessors.brushmove).bind(this))
          .on('brushend', d4.functor(scope.accessors.brushend).bind(this));
        d4.appendOnce(selection, 'g.' + name)
          .call(brush);

        scope.accessors.selection.bind(this)(selection.select('.brush'));
        scope.accessors.brush.bind(this)(brush);
        return brush;
      }
    };
    return obj;
  });
}).call(this);

(function() {
  'use strict';
  /*
   * The columnLabels feature is used to affix data labels to column series.
   *
   * @name columnLabels
   */
  d4.feature('columnLabels', function(name) {

    // FIXME: Remove this hardcoded variable or expose it as a setting.
    var padding = 5;
    var anchorText = function() {
      if (d4.isContinuousScale(this.y)) {
        return 'middle';
      } else {
        return 'start';
      }
    };
    return {
      accessors: {
        key: d4.functor(d4.defaultKey),

        x: function(d) {
          if (d4.isOrdinalScale(this.x)) {
            return this.x(d[this.x.$key]) + (this.x.rangeBand() / 2);
          } else {
            var width = Math.abs(this.x(d[this.x.$key]) - this.x(0));
            return this.x(d[this.x.$key]) - width / 2;
          }
        },

        y: function(d) {
          if (d4.isOrdinalScale(this.y)) {
            return this.y(d[this.y.$key]) + (this.y.rangeBand() / 2) + padding;
          } else {
            var height = Math.abs(this.y(d[this.y.$key]) - this.y(0));
            return (d[this.y.$key] < 0 ? this.y(d[this.y.$key]) - height : this.y(d[this.y.$key])) - padding;
          }
        },

        text: function(d) {
          return d[this.valueKey];
        }
      },
      render: function(scope, data, selection) {
        selection.append('g').attr('class', name);
        var label = this.container.select('.' + name).selectAll('.' + name)
          .data(data, d4.functor(scope.accessors.key).bind(this));
        label.enter().append('text');
        label.exit().remove();
        label.attr('class', 'column-label')
          .text(d4.functor(scope.accessors.text).bind(this))
          .attr('text-anchor', anchorText.bind(this))
          .attr('x', d4.functor(scope.accessors.x).bind(this))
          .attr('y', d4.functor(scope.accessors.y).bind(this));
        return label;
      }
    };
  });
}).call(this);

(function() {
  'use strict';
  /*
   * This feature allows you to specify a grid over a portion or the entire chart area.
   *
   * @name grid
   */
  d4.feature('grid', function(name) {

    var xAxis = d3.svg.axis();
    var yAxis = d3.svg.axis();

    return {
      accessors: {
        formatXAxis: function(xAxis) {
          return xAxis.orient('bottom');
        },

        formatYAxis: function(yAxis) {
          return yAxis.orient('left');
        }
      },
      proxies: [{
        target: xAxis,
        prefix: 'x'
      }, {
        target: yAxis,
        prefix: 'y'
      }],
      render: function(scope, data, selection) {
        xAxis.scale(this.x);
        yAxis.scale(this.y);

        var formattedXAxis = d4.functor(scope.accessors.formatXAxis).bind(this)(xAxis);
        var formattedYAxis = d4.functor(scope.accessors.formatYAxis).bind(this)(yAxis);

        selection.append('g').attr('class', 'grid border ' + name)
          .attr('transform', 'translate(0,0)')
          .append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', this.width)
          .attr('height', this.height);

        selection.append('g')
          .attr('class', 'x grid ' + name)
          .attr('transform', 'translate(0,' + this.height + ')')
          .call(formattedXAxis
            .tickSize(-this.height, 0, 0)
            .tickFormat(''));

        selection.append('g')
          .attr('class', 'y grid ' + name)
          .attr('transform', 'translate(0,0)')
          .call(formattedYAxis
            .tickSize(-this.width, 0, 0)
            .tickFormat(''));
        return selection;
      }
    };
  });
}).call(this);

(function() {
  'use strict';
  /*
   * This feature is specifically designed to use with the groupedColumn and groupedRow charts.
   *
   * @name groupedColumnSeries
   */
  d4.feature('groupedColumnSeries', function(name) {
    var sign = function(val) {
      return (val > 0) ? 'positive' : 'negative';
    };

    var useDiscretePosition = function(dimension, d, i) {
      var axis = this[dimension];
      var size = axis.rangeBand() / this.groupsOf;
      var pos = axis(d[axis.$key]) + size * i;
      return pos;
    };

    var useDiscreteSize = function(dimension) {
      var axis = this[dimension];
      var size = axis.rangeBand() / this.groupsOf;
      var gutter = size * 0.1;
      return size - gutter;
    };

    var useContinuousSize = function(dimension, d) {
      var axis = this[dimension];
      return Math.abs(axis(d[axis.$key]) - axis(0));
    };

    var useContinuousPosition = function(dimension, d) {
      var axis = this[dimension],
        val;
      if (dimension === 'y') {
        return d[axis.$key] < 0 ? axis(0) : axis(d[axis.$key]);
      } else {
        val = d[axis.$key] - Math.max(0, d[axis.$key]);
        return axis(val);
      }
    };

    return {
      accessors: {
        classes: function(d, i) {
          return 'bar fill item' + i + ' ' + sign(d[this.valueKey]) + ' ' + d[this.valueKey];
        },

        height: function(d) {
          if (d4.isOrdinalScale(this.y)) {
            return useDiscreteSize.bind(this)('y');
          } else {
            return useContinuousSize.bind(this)('y', d);
          }
        },

        key: d4.functor(d4.defaultKey),

        rx: 0,

        ry: 0,

        width: function(d) {
          if (d4.isOrdinalScale(this.x)) {
            return useDiscreteSize.bind(this)('x');
          } else {
            return useContinuousSize.bind(this)('x', d);
          }
        },

        x: function(d, i) {
          if (d4.isOrdinalScale(this.x)) {
            return useDiscretePosition.bind(this)('x', d, i);
          } else {
            return useContinuousPosition.bind(this)('x', d, i);
          }
        },

        y: function(d, i) {
          if (d4.isOrdinalScale(this.y)) {
            return useDiscretePosition.bind(this)('y', d, i);
          } else {
            return useContinuousPosition.bind(this)('y', d, i);
          }
        }
      },
      render: function(scope, data, selection) {
        selection.append('g').attr('class', name);
        var group = this.container.select('.' + name).selectAll('g')
          .data(data, d4.functor(scope.accessors.key).bind(this));
        group.enter().append('g');
        group.exit().remove();
        group.attr('class', function(d, i) {
          return 'series' + i + ' ' + this.x.$key;
        }.bind(this));

        var rect = group.selectAll('rect')
          .data(function(d) {
            return d.values;
          }.bind(this));
        rect.enter().append('rect')
          .attr('class', d4.functor(scope.accessors.classes).bind(this))
          .attr('x', d4.functor(scope.accessors.x).bind(this))
          .attr('y', d4.functor(scope.accessors.y).bind(this))
          .attr('ry', d4.functor(scope.accessors.ry).bind(this))
          .attr('rx', d4.functor(scope.accessors.rx).bind(this))
          .attr('width', d4.functor(scope.accessors.width).bind(this))
          .attr('height', d4.functor(scope.accessors.height).bind(this));
        return rect;
      }
    };
  });
}).call(this);

(function() {
  'use strict';
  /*
   * Approach based off this example:
   * http://bl.ocks.org/mbostock/3902569
   *
   * @name lineSeriesLabels
   */
  d4.feature('lineSeriesLabels', function(name) {
    var addDataPoint = function(scope, data) {
      var point = this.container.select('.' + name).selectAll('.' + name + ' circle.dataPoint').data(data);
      point.enter().append('circle');
      point.exit().remove();
      point.attr('data-key', d4.functor(scope.accessors.key).bind(this))
        .style('display', 'none')
        .attr('r', d4.functor(scope.accessors.r).bind(this)())
        .attr('class', function(d, n) {
          return d4.functor(scope.accessors.classes).bind(this)(d, n) + ' dataPoint';
        }.bind(this));
    };

    var addDataPointLabel = function(scope, data) {
      var xLabel = this.container.select('.' + name).selectAll('.' + name + ' text.dataPoint').data(data);
      xLabel.enter().append('text');
      xLabel.exit().remove();
      xLabel
        .attr('data-key', d4.functor(scope.accessors.key).bind(this))
        .style('display', 'none')
        .attr('class', function(d, n) {
          return d4.functor(scope.accessors.classes).bind(this)(d, n) + ' dataPoint';
        }.bind(this));
    };

    var addOverlay = function(scope) {
      this.container.select('.' + name).append('rect')
        .attr('class', 'overlay')
        .style('fill-opacity', 0)
        .attr('width', this.width)
        .attr('height', this.height)
        .on('mouseover', function() {
          this.container.selectAll('.' + name + ' .dataPoint').style('display', null);
        }.bind(this))
        .on('mouseout', function() {
          this.container.selectAll('.' + name + ' .dataPoint').style('display', 'none');
        }.bind(this))
        .on('mousemove', d4.functor(scope.accessors.mouseMove).bind(this));

    };

    var displayXValue = function(scope, data) {
      if (d4.functor(scope.accessors.displayPointValue).bind(this)()) {
        if (d4.isNotFunction(this.x.invert)) {
          d4.err(' In order to track the x position of a line series your scale must have an invert() function.  However, your {0} scale does not have the invert() function.', this.x.$scale);
        } else {
          addDataPointLabel.bind(this)(scope, data);
          addDataPoint.bind(this)(scope, data);
          addOverlay.bind(this)(scope);
        }
      }
    };

    return {
      accessors: {
        classes: function(d, n) {
          return 'stroke series' + n;
        },

        displayPointValue: false,

        key: d4.functor(d4.defaultKey),

        mouseMove: function(data) {
          var inRange = function(a, b) {
            if (this.x.$scale === 'time') {
              return a.getTime() >= b[this.x.$key].getTime();
            } else {
              return a >= b[this.x.$key];
            }
          };

          var bisectX = d3.bisector(function(d) {
            return d[this.x.$key];
          }.bind(this)).right;
          var overlay = this.container.select('.' + name + ' rect.overlay')[0][0];
          var x0 = this.x.invert(d3.mouse(overlay)[0]);
          d4.each(data, function(datum, n) {
            var i = bisectX(datum.values, x0, 1);
            var d0 = datum.values[i - 1];
            if (inRange.bind(this)(x0, d0)) {
              var d1 = datum.values[i];
              d1 = (d4.isUndefined(d1)) ? datum.values[datum.values.length - 1] : d1;
              var d = x0 - d0[this.x.$key] > d1[this.x.$key] - x0 ? d1 : d0;
              d4.functor(this.features[name].accessors.showDataPoint).bind(this)(d, datum, n);
              d4.functor(this.features[name].accessors.showDataLabel).bind(this)(d, datum, n);
            } else {
              var selector = '.' + name + ' .dataPoint[data-key="' + d4.functor(this.features[name].accessors.key).bind(this)(datum, n) + '"]';
              var point = this.container.select(selector);
              point
                .style('display', 'none');
            }
          }.bind(this));
        },

        pointLabelText: function(d, datum) {
          var str = datum.key + ' ' + this.x.$key + ': ' + d[this.x.$key];
          str += ' ' + this.y.$key + ': ' + d[this.y.$key];
          return str;
        },

        r: 4.5,

        showDataLabel: function(d, datum, n) {
          var pointLabelSelector = '.' + name + ' text.dataPoint[data-key="' + d4.functor(this.features[name].accessors.key).bind(this)(datum, n) + '"]';
          var label = this.container.select(pointLabelSelector);
          var offset = n * 20;
          label
            .style('display', null)
            .attr('transform', 'translate(5,' + offset + ')')
            .text(d4.functor(this.features[name].accessors.pointLabelText).bind(this)(d, datum));
        },

        showDataPoint: function(d, datum, n) {
          var pointSelector = '.' + name + ' circle.dataPoint[data-key="' + d4.functor(this.features[name].accessors.key).bind(this)(datum, n) + '"]';
          var point = this.container.select(pointSelector);
          point
            .style('display', null)
            .attr('transform', 'translate(' + this.x(d[this.x.$key]) + ',' + this.y(d[this.y.$key]) + ')');
        },

        text: function(d) {
          return d.key;
        },

        x: function(d) {
          return this.x(d.values[d.values.length - 1][this.x.$key]);
        },

        y: function(d) {
          return this.y(d.values[d.values.length - 1][this.y.$key]);
        }
      },

      render: function(scope, data, selection) {
        selection.append('g').attr('class', name);
        var label = this.container.select('.' + name).selectAll('.' + name).data(data);
        label.enter().append('text');
        label.exit().remove();
        label.attr('class', 'line-series-label')
          .text(d4.functor(scope.accessors.text).bind(this))
          .attr('x', d4.functor(scope.accessors.x).bind(this))
          .attr('y', d4.functor(scope.accessors.y).bind(this))
          .attr('data-key', d4.functor(scope.accessors.key).bind(this))
          .attr('class', function(d, n) {
            return d4.functor(scope.accessors.classes).bind(this)(d, n) + ' seriesLabel';
          }.bind(this));
        displayXValue.bind(this)(scope, data, selection);

        return label;
      }
    };
  });
}).call(this);

(function() {
  'use strict';
  /*
   *
   * @name lineSeries
   */
  d4.feature('lineSeries', function(name) {
    var line = d3.svg.line();
    line.interpolate('linear');
    return {
      accessors: {
        classes: function(d, n) {
          return 'line stroke series' + n;
        },

        key: d4.functor(d4.defaultKey),

        x: function(d) {
          return this.x(d[this.x.$key]);
        },

        y: function(d) {
          return this.y(d[this.y.$key]);
        }
      },
      proxies: [{
        target: line
      }],
      render: function(scope, data, selection) {
        selection.append('g').attr('class', name);
        line
          .x(d4.functor(scope.accessors.x).bind(this))
          .y(d4.functor(scope.accessors.y).bind(this));

        var group = selection.select('.' + name).selectAll('g')
          .data(data, d4.functor(scope.accessors.key).bind(this));
        group.exit().remove();
        group.enter().append('g')
          .attr('data-key', function(d) {
            return d.key;
          })
          .attr('class', d4.functor(scope.accessors.classes).bind(this))
          .append('path')
          .attr('d', function(d) {
            return line(d.values);
          });
        return group;
      }
    };
  });
}).call(this);

(function() {
  'use strict';
  /*
   * The reference line feature is helpful when you want to apply a line to a chart
   * which demarcates a value within the data. For example a common use of this
   * feature is to specify the zero value across an axis.
   *
   * @name referenceLine
   */
  d4.feature('referenceLine', function(name) {
    return {
      accessors: {
        x1: function() {
          return this.x(this.x.domain()[0]);
        },

        x2: function() {
          return this.x(this.x.domain()[1]);
        },

        y1: function() {
          return this.y(this.y.domain()[1]);
        },

        y2: function() {
          return this.y(this.y.domain()[0]);
        },
        classes: function() {
          return 'line';
        }
      },
      render: function(scope, data, selection) {
        selection.append('g').attr('class', name);
        var referenceLine = d4.appendOnce(this.container.select('.' + name), 'line')
          .attr('class', d4.functor(scope.accessors.classes).bind(this))
          .attr('x1', d4.functor(scope.accessors.x1).bind(this))
          .attr('x2', d4.functor(scope.accessors.x2).bind(this))
          .attr('y1', d4.functor(scope.accessors.y1).bind(this))
          .attr('y2', d4.functor(scope.accessors.y2).bind(this));
        return referenceLine;
      }
    };
  });
}).call(this);

(function() {
  'use strict';
  /*
   * Column connectors helpful when displaying a stacked column chart.
   * A connector will not connect positve and negative columns. This is because
   * in a stacked column a negative column may move many series below its previous
   * location. This creates a messy collection of crisscrossing lines.
   *
   * @name stackedColumnConnectors
   */
  d4.feature('stackedColumnConnectors', function(name) {
    var sign = function(num) {
      return (num) ? (num < 0) ? -1 : 1 : 0;
    };

    var sharedSigns = function(a, b, key) {
      return (sign(a[key]) === sign(b[key]));
    };

    var processPoint = function(d, i, n, data, callback) {
      var key = (d4.isOrdinalScale(this.y)) ? this.x.$key : this.y.$key;
      if (i === 0 || !sharedSigns(data[n].values[i - 1], d, key)) {
        return 0;
      }
      return callback.bind(this)();
    };

    return {
      accessors: {
        x1: function(d) {
          if (d4.isOrdinalScale(this.x)) {
            return this.x(d[this.x.$key]);
          } else {
            return this.x(d.y0 + d.y);
          }
        },

        y1: function(d) {
          if (d4.isOrdinalScale(this.y)) {
            return this.y(d[this.y.$key]);
          } else {
            return this.y(d.y0 + d.y);
          }
        },

        size: function() {
          if (d4.isOrdinalScale(this.x)) {
            return this.x.rangeBand();
          } else {
            return this.y.rangeBand();
          }
        },

        classes: function(d, i) {
          return 'series' + i;
        }
      },

      render: function(scope, data, selection) {
        selection.append('g').attr('class', name);
        var group = this.container.select('.' + name).selectAll('g')
          .data(data)
          .enter().append('g')
          .attr('class', function(d, i) {
            return 'series' + i + ' ' + this.y.$key;
          }.bind(this));

        var lines = group.selectAll('lines')
          .data(function(d) {
            return d.values;
          }.bind(this));

        lines.enter().append('line');
        lines.exit().remove();
        lines
          .attr('class', d4.functor(scope.accessors.classes).bind(this))
          .attr('stroke-dasharray', '5, 5')
          .attr('x1', function(d, i, n) {
            return processPoint.bind(this)(d, i, n, data, function() {
              return d4.functor(scope.accessors.x1).bind(this)(d);
            });
          }.bind(this))

        .attr('y1', function(d, i, n) {
          var offset = (d4.isOrdinalScale(this.y)) ? d4.functor(scope.accessors.size).bind(this)(d) : 0;
          return processPoint.bind(this)(d, i, n, data, function() {
            return d4.functor(scope.accessors.y1).bind(this)(d) + offset;
          });
        }.bind(this))

        .attr('x2', function(d, i, n) {
          var offset = (d4.isOrdinalScale(this.x)) ? scope.accessors.size.bind(this)(d) : 0;
          return processPoint.bind(this)(d, i, n, data, function() {
            return d4.functor(scope.accessors.x1).bind(this)(data[n].values[i - 1]) + offset;
          });
        }.bind(this))

        .attr('y2', function(d, i, n) {
          return processPoint.bind(this)(d, i, n, data, function() {
            return d4.functor(scope.accessors.y1).bind(this)(data[n].values[i - 1]);
          });
        }.bind(this));

        return lines;
      }
    };
  });
}).call(this);

(function() {
  'use strict';
  /*
   * The stackedLabels are appropriate for use with the stacked shape series.
   *
   * @name stackedLabels
   */
  d4.feature('stackedLabels', function(name) {

    // FIXME: We should not need to sniff this out.
    var dataInColumns = function(d) {
      if (d4.isDefined(d.y0)) {
        return true;
      }
      return d4.isContinuousScale(this.y);
    };

    var anchorText = function(d) {
      return dataInColumns.bind(this)(d) ? 'middle' : 'start';
    };

    var useDiscretePosition = function(dimension, d) {
      var axis = this[dimension];
      return axis(d[axis.$key]) + (axis.rangeBand() / 2);
    };

    var useContinuousPosition = function(dimension, d) {
      var axis = this[dimension];
      var offset = Math.abs(axis(d.y0) - axis(d.y0 + d.y)) / 2;

      // FIXME: Remove this hardcoding.
      var padding = 10;
      var val;
      if (dimension === 'x') {
        offset *= -1;
        padding *= -1;
      }
      if (d4.isDefined(d.y0)) {
        val = d.y0 + d.y;
        return (val <= 0 ? axis(d.y0) : axis(val)) + offset;
      } else {
        return (d[axis.$key] <= 0 ? axis(0) : axis(d[axis.$key])) - padding;
      }
    };

    return {
      accessors: {
        classes: 'column-label',

        key: d4.functor(d4.defaultKey),

        stagger: true,

        text: function(d) {
          if (d4.isDefined(d.y0)) {
            if (d4.isOrdinalScale(this.x)) {
              if (Math.abs(this.y(d.y0) - this.y(d.y0 + d.y)) > 20) {
                return d[this.valueKey];
              }
            } else {
              if (Math.abs(this.x(d.y0) - this.x(d.y0 + d.y)) > 20) {
                return d[this.valueKey];
              }
            }
          } else {
            return d[this.valueKey];
          }
        },

        textAnchor: function(d) {
          return anchorText.bind(this)(d);
        },

        x: function(d) {
          if (d4.isOrdinalScale(this.x)) {
            return useDiscretePosition.bind(this)('x', d);
          } else {
            return useContinuousPosition.bind(this)('x', d);
          }
        },

        y: function(d) {
          if (d4.isOrdinalScale(this.y)) {
            return useDiscretePosition.bind(this)('y', d);
          } else {
            return useContinuousPosition.bind(this)('y', d);
          }
        }
      },

      render: function(scope, data, selection) {
        selection.append('g').attr('class', name);
        var group = this.container.select('.' + name).selectAll('g')
          .data(data, d4.functor(scope.accessors.key).bind(this));
        group.enter().append('g')
          .attr('class', function(d, i) {
            return 'series' + i + ' ' + this.x.$key;
          }.bind(this));
        group.exit().remove();

        var text = group.selectAll('text')
          .data(function(d) {
            return d.values;
          }.bind(this));
        text.enter().append('text')
          .text(d4.functor(scope.accessors.text).bind(this))
          .attr('text-anchor', d4.functor(scope.accessors.textAnchor).bind(this))
          .attr('class', d4.functor(scope.accessors.classes).bind(this))
          .attr('y', d4.functor(scope.accessors.y).bind(this))
          .attr('x', d4.functor(scope.accessors.x).bind(this));

        text.exit().remove();

        if (d4.functor(scope.accessors.stagger).bind(this)()) {

          // FIXME: This should be moved into a helper injected using DI.
          if (d4.isContinuousScale(this.y)) {
            group.selectAll('text').call(d4.helpers.staggerTextVertically, -1);
          } else {
            group.selectAll('text').call(d4.helpers.staggerTextHorizontally, 1);
          }
        }
        group.selectAll('text').call(function(rows) {
          var rect;
          d4.each(rows, function(cols) {
            d4.each(cols, function(text) {
              var txt = d3.select(text);
              rect = text.getBoundingClientRect();
              if (txt.attr('transform') === null) {
                txt.attr('transform', 'translate(0,' + Math.floor(rect.height / 2) + ')');
              }
            });
          });
        });
        return text;
      }
    };
  });
}).call(this);

(function() {
  'use strict';
  var sign = function(val) {
    return (val > 0) ? 'positive' : 'negative';
  };

  var useDiscretePosition = function(dimension, d) {
    var axis = this[dimension];
    return axis(d[axis.$key]);
  };

  var useDiscreteSize = function(dimension) {
    var axis = this[dimension];
    return axis.rangeBand();
  };

  var useContinuousSize = function(dimension, d) {
    var axis = this[dimension];
    if (d4.isDefined(d.y0)) {
      return Math.abs(axis(d.y0) - axis(d.y0 + d.y));
    } else {
      return Math.abs(axis(d[axis.$key]) - axis(0));
    }
  };

  var useContinuousPosition = function(dimension, d) {
    var axis = this[dimension];
    var val;
    if (d4.isDefined(d.y0)) {
      if (dimension === 'y') {
        val = d.y0 + d.y;
        return val < 0 ? axis(d.y0) : axis(val);
      } else {
        val = (d.y0 + d.y) - Math.max(0, d.y);
        return axis(val);
      }
    } else {
      if (dimension === 'y') {
        return d[axis.$key] < 0 ? axis(0) : axis(d[axis.$key]);
      } else {
        val = d[axis.$key] - Math.max(0, d[axis.$key]);
        return axis(val);
      }
    }
  };

  var baseShapeFeature = function(name, shapeType, renderShapeAttributes) {
    return {
      accessors: {
        classes: function(d, i) {
          return 'bar fill item' + i + ' ' + sign(d[this.valueKey]) + ' ' + d[this.y.$key];
        },
        key: d4.functor(d4.defaultKey)
      },

      render: function(scope, data, selection) {
        selection.append('g').attr('class', name);

        // create data join with the series data
        var group = this.container.select('.' + name).selectAll('g')
          .data(data, d4.functor(scope.accessors.key).bind(this));

        group.enter().append('g')
          .attr('class', function(d, i) {
            return 'series' + i + ' ' + this.y.$key;
          }.bind(this));
        group.exit().remove();

        var shape = group.selectAll(shapeType)
          .data(function(d) {
            return d.values;
          });

        shape.enter().append(shapeType)
          .attr('class', d4.functor(scope.accessors.classes).bind(this));
        renderShapeAttributes.bind(this)(scope, shape);

        shape.exit().remove();
        return shape;
      }
    };
  };

  /**
   * This feature is useful for displaying charts which need stacked circles.
   * Note: Many of the d4 charts use the stacked series as the base, and simply
   * renders only one series, if there is nothing to stack.
   *
   *##### Accessors
   *
   * `classes` - classes assigned to each circle in the series
   * `cx` - placement on the chart's x axis
   * `cy` - placement on the chart's y axis
   * `r` - radius of the circle
   *
   * @name circleSeries
   */
  d4.feature('circleSeries', function(name) {
    var rectObj = {
      accessors: {
        cx: function(d) {
          var size = 0;
          if (d4.isOrdinalScale(this.x)) {
            size = useDiscreteSize.bind(this)('x');
            return useDiscretePosition.bind(this)('x', d) + size / 2;
          } else {
            size = useContinuousSize.bind(this)('x', d);
            return useContinuousPosition.bind(this)('x', d) + size / 2;
          }
        },

        cy: function(d) {
          var size = 0;
          if (d4.isOrdinalScale(this.y)) {
            size = useDiscreteSize.bind(this)('y');
            return useDiscretePosition.bind(this)('y', d) + size / 2;
          } else {
            size = useContinuousSize.bind(this)('y', d);
            return useContinuousPosition.bind(this)('y', d) + size / 2;
          }
        },

        r: function(d) {
          var x, y;
          if (d4.isOrdinalScale(this.x)) {
            x = useDiscreteSize.bind(this)('x');
          } else {
            x = useContinuousSize.bind(this)('x', d);
          }
          if (d4.isOrdinalScale(this.y)) {
            y = useDiscreteSize.bind(this)('y');
          } else {
            y = useContinuousSize.bind(this)('y', d);
          }
          return Math.min(x, y) / 2;
        }
      }
    };

    var renderShape = function(scope, selection) {
      selection
        .attr('r', d4.functor(scope.accessors.r).bind(this))
        .attr('cx', d4.functor(scope.accessors.cx).bind(this))
        .attr('cy', d4.functor(scope.accessors.cy).bind(this));
    };
    var baseObj = baseShapeFeature.bind(this)(name, 'circle', renderShape);
    return d4.merge(baseObj, rectObj);
  });

  /**
   * This feature is useful for displaying charts which need stacked ellipses.
   * Note: Many of the d4 charts use the stacked series as the base, and simply
   * renders only one series, if there is nothing to stack.
   *
   *##### Accessors
   *
   * `classes` - classes assigned to each ellipse in the series
   * `cx` - placement on the chart's x axis
   * `cy` - placement on the chart's y axis
   * `rx` - radius of the ellipse on the x axis
   * `ry` - radius of the ellipse on the y axis
   *
   * @name ellipseSeries
   */
  d4.feature('ellipseSeries', function(name) {
    var rectObj = {
      accessors: {
        cx: function(d) {
          var size = 0;
          if (d4.isOrdinalScale(this.x)) {
            size = useDiscreteSize.bind(this)('x');
            return useDiscretePosition.bind(this)('x', d) + size / 2;
          } else {
            size = useContinuousSize.bind(this)('x', d);
            return useContinuousPosition.bind(this)('x', d) + size / 2;
          }
        },

        cy: function(d) {
          var size = 0;
          if (d4.isOrdinalScale(this.y)) {
            size = useDiscreteSize.bind(this)('y');
            return useDiscretePosition.bind(this)('y', d) + size / 2;
          } else {
            size = useContinuousSize.bind(this)('y', d);
            return useContinuousPosition.bind(this)('y', d) + size / 2;
          }
        },

        rx: function(d) {
          if (d4.isOrdinalScale(this.x)) {
            return useDiscreteSize.bind(this)('x') / 2;
          } else {
            return useContinuousSize.bind(this)('x', d) / 2;
          }
        },

        ry: function(d) {
          if (d4.isOrdinalScale(this.y)) {
            return useDiscreteSize.bind(this)('y') / 2;
          } else {
            return useContinuousSize.bind(this)('y', d) / 2;
          }
        }
      }
    };

    var renderShape = function(scope, selection) {
      selection
        .attr('rx', d4.functor(scope.accessors.rx).bind(this))
        .attr('ry', d4.functor(scope.accessors.ry).bind(this))
        .attr('cx', d4.functor(scope.accessors.cx).bind(this))
        .attr('cy', d4.functor(scope.accessors.cy).bind(this));
    };
    var baseObj = baseShapeFeature.bind(this)(name, 'ellipse', renderShape);
    return d4.merge(baseObj, rectObj);
  });

  /**
   * This feature is useful for displaying charts which need stacked rects.
   * Note: Many of the d4 charts use the stacked series as the base, and simply
   * renders only one series, if there is nothing to stack.
   *
   *##### Accessors
   *
   * `classes` - classes assigned to each rect in the series
   * `height` - height of the rect
   * `rx` -  rounding of the corners against the x dimension
   * `ry` -  rounding of the corners against the y dimension
   * `width` - width of the rect
   * `x` - placement on the chart's x axis
   * `y` - placement on the chart's y axis
   *
   * @name rectSeries
   */
  d4.feature('rectSeries', function(name) {
    var rectObj = {
      accessors: {
        height: function(d) {
          if (d4.isOrdinalScale(this.y)) {
            return useDiscreteSize.bind(this)('y');
          } else {
            return useContinuousSize.bind(this)('y', d);
          }
        },

        rx: 0,

        ry: 0,

        width: function(d) {
          if (d4.isOrdinalScale(this.x)) {
            return useDiscreteSize.bind(this)('x');
          } else {
            return useContinuousSize.bind(this)('x', d);
          }
        },

        x: function(d) {
          if (d4.isOrdinalScale(this.x)) {
            return useDiscretePosition.bind(this)('x', d);
          } else {
            return useContinuousPosition.bind(this)('x', d);
          }
        },

        y: function(d) {
          if (d4.isOrdinalScale(this.y)) {
            return useDiscretePosition.bind(this)('y', d);
          } else {
            return useContinuousPosition.bind(this)('y', d);
          }
        }
      }
    };
    var renderShape = function(scope, selection) {
      selection
        .attr('x', d4.functor(scope.accessors.x).bind(this))
        .attr('y', d4.functor(scope.accessors.y).bind(this))
        .attr('ry', d4.functor(scope.accessors.ry).bind(this))
        .attr('rx', d4.functor(scope.accessors.rx).bind(this))
        .attr('width', d4.functor(scope.accessors.width).bind(this))
        .attr('height', d4.functor(scope.accessors.height).bind(this));
    };
    var baseObj = baseShapeFeature.bind(this)(name, 'rect', renderShape);
    return d4.merge(baseObj, rectObj);
  });
}).call(this);

(function() {
  'use strict';
  /*
   * A trendline allows you to associate a line with a numerical value.
   *
   * @name trendLine
   */
  d4.feature('trendLine', function(name) {
    return {
      accessors: {
        tipSize: 6,
        text: function(d) {
          return d[this.valueKey];
        },

        textX: function() {
          return this.x(this.width);
        },

        textY: function() {
          return this.x(this.height);
        },

        x1: function() {
          return this.x(this.x.$key);
        },

        x2: function() {
          return this.x(this.width);
        },

        y1: function() {
          return this.y(this.y.$key);
        },

        y2: function() {
          return this.y(this.height);
        },

      },
      render: function(scope, data, selection) {
        var defs = this.container.select('defs');

        d4.appendOnce(defs, 'marker#' + name + '-start')
          .attr('viewBox', '0 0 10 10')
          .attr('refX', 10)
          .attr('refY', 5)
          .attr('markerWidth', d4.functor(scope.accessors.tipSize).bind(this)())
          .attr('markerHeight', d4.functor(scope.accessors.tipSize).bind(this))
          .attr('orient', 'auto')
          .append('path')
          .attr('d', 'M 0 0 L 10 5 L 0 10 z');

        d4.appendOnce(selection, 'g.' + name);
        var trendLine = d4.appendOnce(this.container.select('.' + name), 'line.line')
          .attr('x1', d4.functor(scope.accessors.x1).bind(this))
          .attr('x2', d4.functor(scope.accessors.x2).bind(this))
          .attr('y1', d4.functor(scope.accessors.y1).bind(this))
          .attr('y2', d4.functor(scope.accessors.y2).bind(this))
          .attr('marker-end', 'url(#' + name + '-start)');

        d4.appendOnce(this.container.select('.' + name), 'text.trendLine-label')
          .text(d4.functor(scope.accessors.text).bind(this))
          .attr('x', d4.functor(scope.accessors.textX).bind(this))
          .attr('y', d4.functor(scope.accessors.textY).bind(this));
        return trendLine;
      }
    };
  });
}).call(this);

(function() {
  'use strict';

  /*
   * Waterfall connectors are orthogonal series connectors which visually join
   * column series together by spanning the top or bottom of adjacent columns.
   *
   *##### Accessors
   *
   * `x` - Used in placement of the connector lines.
   * `y` - Used in placement of the connector lines.
   * `span` - calculates the length of the connector line
   * `classes` - applies the class to the connector lines.
   *
   * @name waterfallConnectors
   */
  d4.feature('waterfallConnectors', function(name) {
    return {
      accessors: {
        beforeRender: function(data) {
          var d = data.map(function(o) {
            return o.values[0];
          });
          return d4.flatten(d);
        },

        classes: function(d, i) {
          return 'series' + i;
        },

        span: function() {
          if (d4.isOrdinalScale(this.x)) {
            return this.x.rangeBand();
          } else {
            return this.y.rangeBand();
          }
        },

        x: function(d) {
          if (d4.isOrdinalScale(this.x)) {
            return this.x(d[this.x.$key]);
          } else {
            var width = 0;
            var xVal = (d.y0 + d.y) - Math.max(0, d.y);
            if (d.y > 0) {
              width = Math.abs(this.x(d.y0) - this.x(d.y0 + d.y));
            }
            return this.x(xVal) + width;
          }
        },

        y: function(d) {
          if (d4.isOrdinalScale(this.x)) {
            return this.y(d.y0 + d.y);
          } else {
            return this.y(d[this.y.$key]);
          }
        }
      },

      render: function(scope, data, selection) {
        selection.append('g').attr('class', name);
        var lines = this.container.select('.' + name).selectAll('.' + name).data(data);
        lines.enter().append('line');
        lines.exit().remove();
        lines
          .attr('class', d4.functor(scope.accessors.classes).bind(this))
          .attr('x1', function(d, i) {
            if (i === 0) {
              return 0;
            }
            return d4.functor(scope.accessors.x).bind(this)(data[i - 1]);
          }.bind(this))

        .attr('y1', function(d, i) {
          if (i === 0) {
            return 0;
          }
          return d4.functor(scope.accessors.y).bind(this)(data[i - 1]);
        }.bind(this))

        .attr('x2', function(d, i) {
          if (i === 0) {
            return 0;
          }
          if (d4.isOrdinalScale(this.x)) {
            return d4.functor(scope.accessors.x).bind(this)(d) + d4.functor(scope.accessors.span).bind(this)();
          } else {
            return d4.functor(scope.accessors.x).bind(this)(data[i - 1]);
          }
        }.bind(this))

        .attr('y2', function(d, i) {
          if (i === 0) {
            return 0;
          }
          if (d4.isOrdinalScale(this.x)) {
            return d4.functor(scope.accessors.y).bind(this)(data[i - 1]);
          } else {
            return d4.functor(scope.accessors.y).bind(this)(d) + d4.functor(scope.accessors.span).bind(this)(d);
          }
        }.bind(this));

        return lines;
      }
    };
  });
}).call(this);

(function() {
  'use strict';

  /* This feature creates an xAxis for use within d4. There are a variety of
   * accessors described below which modify the behavior and apperance of the axis.
   *
   *##### Accessors
   *
   * `axis` - The d3 axis object itself.
   * `innerTickSize` - see: https://github.com/mbostock/d3/wiki/SVG-Axes#innerTickSize
   * `orient` - see: https://github.com/mbostock/d3/wiki/SVG-Axes#orient
   * `outerTickSize`- see: https://github.com/mbostock/d3/wiki/SVG-Axes#outerTickSize
   * `scale` - see: https://github.com/mbostock/d3/wiki/SVG-Axes#scale
   * `stagger` - (true | false) determines if the axis should stagger overlapping text (true by default)
   * `tickFormat` - see: https://github.com/mbostock/d3/wiki/SVG-Axes#tickFormat
   * `tickPadding` - see: https://github.com/mbostock/d3/wiki/SVG-Axes#tickPadding
   * `tickSize` - see: https://github.com/mbostock/d3/wiki/SVG-Axes#tickSize
   * `tickSubdivide`- see: https://github.com/mbostock/d3/wiki/SVG-Axes#tickSubdivide
   * `tickValues` - see: https://github.com/mbostock/d3/wiki/SVG-Axes#tickValues
   * `ticks` - see: https://github.com/mbostock/d3/wiki/SVG-Axes#ticks
   *
   *
   *     var chart = d4.charts.groupedColumn()
   *     .using('yAxis', function(axis){
   *
   *       // adjust the number of tick marks based on the height of the chart
   *       axis.ticks($('#example').height()/20);
   *
   *       // set the inner and outer tick sizes
   *       axis.tickSize(10,5);
   *
   *       // adjust the tick padding
   *       axis.tickPadding(5);
   *
   *     })
   *     .using('xAxis', function(axis){
   *
   *       // position the tickmarks on the top of the axis line
   *       axis.orient('top');
   *
   *       // move the axis to the top of the chart.
   *       axis.align('top');
   *     })
   *
   * @name xAxis
   */
  d4.feature('xAxis', function(name) {
    var axis = d3.svg.axis()
      .orient('bottom')
      .tickPadding(10)
      .tickSize(0);

    var textRect = function(text, klasses) {
      var rect = d4.helpers.textSize(text, klasses);
      rect.text = text;
      return rect;
    };

    var positionText = function(obj, aligned, klass) {
      if (obj.text) {
        var axis = this.container.selectAll('.x.axis');
        var axisBB = axis.node().getBBox();
        var textHeight = obj.height * 0.8;
        var text = axis.append('text')
          .text(obj.text)
          .attr('class', '' + klass);

        if (aligned.toLowerCase() === 'bottom') {
          text.attr('transform', 'translate(0,' + (axisBB.height + textHeight) + ')');
        } else {
          text.attr('transform', 'translate(0,' + (axisBB.y - (textHeight / 2)) + ')');
        }
      }
    };

    var alignAxis = function(align, axis) {
      switch (true) {
        case align.toLowerCase() === 'top':
          axis.attr('transform', 'translate(0,0)');
          break;
        case align.toLowerCase() === 'bottom':
          axis.attr('transform', 'translate(0,' + this.height + ')');
          break;
      }
    };

    var obj = {
      accessors: {
        align: 'bottom',

        stagger: true,

        subtitle: undefined,

        title: undefined,
      },
      proxies: [{
        target: axis
      }],

      render: function(scope) {
        scope.scale(this.x);
        var title = textRect(d4.functor(scope.accessors.title).bind(this)(), 'title');
        var subtitle = textRect(d4.functor(scope.accessors.subtitle).bind(this)(), 'subtitle');
        var aligned = d4.functor(scope.accessors.align).bind(this)();
        var group = this.container.select('g.margins')
          .append('g')
          .attr('class', 'x axis ' + name)
          .attr('data-scale', this.x.$scale)
          .call(axis);
        alignAxis.bind(this)(aligned, group);
        if (d4.functor(scope.accessors.stagger).bind(this)()) {

          // FIXME: This should be moved into a helper injected using DI.
          group.selectAll('.tick text').call(d4.helpers.staggerTextVertically, 1);
        }
        if (aligned === 'top') {
          positionText.bind(this)(subtitle, aligned, 'subtitle');
          positionText.bind(this)(title, aligned, 'title');
        } else {
          positionText.bind(this)(title, aligned, 'title');
          positionText.bind(this)(subtitle, aligned, 'subtitle');
        }
        return group;
      }
    };
    return obj;
  });
}).call(this);

(function() {
  'use strict';

  /* This feature creates an xAxis for use within d4. There are a variety of
   * accessors described below which modify the behavior and apperance of the axis.
   *
   *##### Accessors
   * `axis` - The d3 axis object itself.
   * `innerTickSize` - see: https://github.com/mbostock/d3/wiki/SVG-Axes#innerTickSize
   * `orient` - see: https://github.com/mbostock/d3/wiki/SVG-Axes#orient
   * `outerTickSize`- see: https://github.com/mbostock/d3/wiki/SVG-Axes#outerTickSize
   * `scale` - see: https://github.com/mbostock/d3/wiki/SVG-Axes#scale
   * `stagger` - (true | false) determines if the axis should stagger overlapping text (true by default)
   * `tickFormat` - see: https://github.com/mbostock/d3/wiki/SVG-Axes#tickFormat
   * `tickPadding` - see: https://github.com/mbostock/d3/wiki/SVG-Axes#tickPadding
   * `tickSize` - see: https://github.com/mbostock/d3/wiki/SVG-Axes#tickSize
   * `tickSubdivide`- see: https://github.com/mbostock/d3/wiki/SVG-Axes#tickSubdivide
   * `tickValues` - see: https://github.com/mbostock/d3/wiki/SVG-Axes#tickValues
   * `ticks` - see: https://github.com/mbostock/d3/wiki/SVG-Axes#ticks
   *
   *##### Examples
   *
   *     var chart = d4.charts.groupedColumn()
   *     .using('yAxis', function(axis){
   *
   *       // adjust the number of tick marks based on the height of the chart
   *       axis.ticks($('#example').height()/20);
   *
   *       // set the inner and outer tick sizes
   *       axis.tickSize(10,5);
   *
   *       // adjust the tick padding
   *       axis.tickPadding(5);
   *
   *     })
   *     .using('xAxis', function(axis){
   *
   *       // position the tickmarks on the top of the axis line
   *       axis.orient('top');
   *
   *       // move the axis to the top of the chart.
   *       axis.y(-20);
   *     })
   *
   * @name yAxis
   */
  d4.feature('yAxis', function(name) {
    var axis = d3.svg.axis()
      .orient('left')
      .tickPadding(10)
      .tickSize(0);

    var textRect = function(text, klasses) {
      var rect = d4.helpers.textSize(text, klasses);
      rect.text = text;
      return rect;
    };

    var positionText = function(obj, aligned, klass) {
      if (obj.text) {
        var axis = this.container.selectAll('.y.axis');
        var axisBB = axis.node().getBBox();
        var textHeight = obj.height * 0.8;
        var text = axis.append('text')
          .text(obj.text)
          .attr('class', '' + klass);

        if (aligned.toLowerCase() === 'left') {
          text.call(d4.helpers.rotateText('rotate(' + 90 + ')translate(0,' + (Math.abs(axisBB.x) + textHeight) + ')'));
        } else {
          text.call(d4.helpers.rotateText('rotate(' + 90 + ')translate(0,' + (Math.abs(axisBB.x) - (axisBB.width + textHeight)) + ')'));
        }
      }
    };

    var alignAxis = function(align, axis) {
      switch (true) {
        case align.toLowerCase() === 'left':
          axis.attr('transform', 'translate(0,0)');
          break;
        case align.toLowerCase() === 'right':
          axis.attr('transform', 'translate(' + this.width + ', 0)');
          break;
      }
    };

    var obj = {
      accessors: {
        align: 'left',

        stagger: true,

        subtitle: undefined,

        title: undefined,
      },
      proxies: [{
        target: axis
      }],
      render: function(scope) {
        scope.scale(this.y);
        var title = textRect(d4.functor(scope.accessors.title).bind(this)(), 'title');
        var subtitle = textRect(d4.functor(scope.accessors.subtitle).bind(this)(), 'subtitle');
        var aligned = d4.functor(scope.accessors.align).bind(this)();

        var group = this.container.select('g.margins')
          .append('g')
          .attr('class', 'y axis ' + name)
          .attr('data-scale', this.y.$scale)
          .call(axis);

        group.selectAll('.tick text')
          .call(d4.helpers.wrapText, this.margin[aligned]);
        alignAxis.bind(this)(aligned, group);

        if (d4.functor(scope.accessors.stagger).bind(this)()) {

          // FIXME: This should be moved into a helper injected using DI.
          this.container.selectAll('.y.axis .tick text').call(d4.helpers.staggerTextHorizontally, -1);
        }
        if (aligned === 'left') {
          positionText.bind(this)(title, aligned, 'title');
          positionText.bind(this)(subtitle, aligned, 'subtitle');
        } else {
          positionText.bind(this)(subtitle, aligned, 'subtitle');
          positionText.bind(this)(title, aligned, 'title');
        }
        return group;
      }
    };
    return obj;
  });
}).call(this);

(function() {
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

    opts.defined = function() {
      return true;
    };

    opts.nestKey = function() {
      return opts.x.key;
    };

    var removeUndefinedValues = function(items) {
      var onlyDefined = [];
      d4.each(items, function(i) {
        if (opts.defined(i)) {
          onlyDefined.push(i);
        }
      }.bind(this));
      return onlyDefined;
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
      opts.data = removeUndefinedValues(opts.data);
      opts.data = nestByDimension(opts.nestKey(), opts.value.key, opts.data);

      return opts;
    };

    parser.nestKey = function(funct) {
      opts.nestKey = d4.functor(funct).bind(opts);
      return parser;
    };

    parser.defined = function(funct) {
      opts.defined = d4.functor(funct).bind(opts);
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

(function() {
  'use strict';

  /**
   * The nested stack parser is useful for charts which take a data series
   * and wants to sort them across a dimension and then display the results.
   * The most common usecase would be a stacked column chart like this:
   *
   *       _____________________
   *       |    _               |
   *       |   | |   _          |
   *       |   |-|  | |   _     |
   *       |   |-|  |-|  |-|    |
   *       |   | |  |-|  |-|    |
   *       ----------------------
   *
   * This module makes use of the d3's "nest" data structure, and "stack" layout
   *
   * + https://github.com/mbostock/d3/wiki/Arrays#-nest
   * + https://github.com/mbostock/d3/wiki/Stack-Layout
   *
   *##### Approach
   *
   * Just like D3, this parser uses a chaining declaritiave style to build up
   * the necessary prerequistes to create the stacked data. Here is a simple
   * example:
   *
   *      var parser = d4.parsers.nestedStack()
   *          .x(function() {
   *            return 'title';
   *          })
   *          .y(function(){
   *            return 'group';
   *          })
   *          .value(function() {
   *            return 'values';
   *          });
   *
   *      var stackedData = parser(data);
   *
   * Keep reading for more information on these various accessor functions.
   *
   *##### Benefits
   * + Supports negative and positive stacked data series.
   *
   *##### Limitations
   * + The parser expects the stack will occur on the yAxis, which means it is only suitable for column charts presently.
   *
   *##### Accessor Methods
   *
   * `x` : - function which returns a key to access the x values in the data array
   * `y` : - function which returns a key to access the y values in the data array
   * `value` : - function which returns a key to access the values in the data array.
   * `data` : array - An array of objects with their dimensions specified like this:
   *
   *      var data = [{ "title": "3 Years", "group" : "one", "value": 30 },
   *                  { "title": "3 Years", "group" : "two", "value": 20 },
   *                  { "title": "3 Years", "group" : "three", "value": 10 },
   *                  { "title": "5 Years", "group" : "one",  "value": 3 },
   *                  { "title": "5 Years", "group" : "two", "value": 2 },
   *                  { "title": "5 Years", "group" : "three", "value": 1 }]
   *
   *##### Example Usage
   *
   * Given the example data and dimension variables above you can use this module
   * in the following way:
   *
   *      var parser = d4.parsers.nestedStack()
   *      .x(function() {
   *        return 'title';
   *      })
   *      .y(function(){
   *        return 'group';
   *      })
   *      .value(function() {
   *        return 'value';
   *      })
   *      .call(data);
   *
   * The `parser` variable will now be an object containing the following structure:
   *
   *      {
   *        data: Array
   *        value: {
   *          key: string,
   *          values: Array
   *        },
   *        x: {
   *          key: string,
   *          values: Array
   *        },
   *        y: {
   *          key: string,
   *          values: Array
   *        }
   *      }
   *
   * @name nestedStack
   **/
  d4.parser('nestedStack', function nestedStack() {

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

    opts.defined = function() {
      return true;
    };

    opts.nestKey = function() {
      return opts.y.key;
    };

    var removeUndefinedValues = function(items) {
      var onlyDefined = [];
      d4.each(items, function(i) {
        if (opts.defined(i)) {
          onlyDefined.push(i);
        }
      }.bind(this));
      return onlyDefined;
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
      var val = d4.functor(funct)();
      if (dim === 'x' && val === 'y') {
        d4.err('You cannot use `y` as the key for an `x` dimension because it creates an ambiguous `y` property in the nested stack.');
      }
      opts[dim].key = val;
    };

    var parser = function(data) {
      if (data) {
        d4.extend(opts.data, data);
      }

      findValues(opts, opts.data);
      opts.data = removeUndefinedValues(opts.data);
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

    parser.defined = function(funct) {
      opts.defined = d4.functor(funct).bind(opts);
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

(function() {
  'use strict';

  var extractValues = function(data, key) {
    var values = data.map(function(obj) {
      return obj.values.map(function(i) {
        return i[key];
      }.bind(this));
    }.bind(this));
    return d3.merge(values);
  };

  var rangeFor = function(chart, dimension) {

    // This may not be a very robust approach.
    switch (dimension) {
      case 'x':
        return [0, chart.width];
      case 'y':
        return [chart.height, 0];
      default:
        return [];
    }
  };

  var linearOrTimeScale = function(chart, data, dimension) {
    var key = chart[dimension].$key;
    var ext = d3.extent(d3.merge(data.map(function(obj) {
      return d3.extent(obj.values, function(d) {
        if (d4.isDate(d[key])) {
          return d[key];
        } else {
          return d[key] + (d.y0 || 0);
        }
      });
    })));
    var axis = chart[dimension];
    if (!axis.domain.$dirty) {
      if (d4.isDate(ext[0])) {
        var min = axis.$min || ext[0];
        var max = axis.$max || ext[1];
        axis.domain([min, max]);
      } else {
        axis.domain([Math.min(axis.$min || 0, ext[0]), axis.$max || ext[1]]);
      }
    }

    if (!axis.range.$dirty) {
      axis.range(rangeFor(chart, dimension));
    }

    if (!axis.clamp.$dirty) {
      axis.clamp(true);
    }
    return chart[dimension].nice();
  };

  /**
   * Creates a linear scale for a dimension of a given chart.
   * @name linearScaleForNestedData
   * @param {Object} d4 chart object
   * @param {Array} data array
   * @param {string} string represnting a dimension e.g. `x`,`y`.
   * @return {Object} Chart scale object
   */
  d4.builder('linearScaleForNestedData', linearOrTimeScale);

  /**
   * Creates a time scale for a dimension of a given chart.
   * @name timeScaleForNestedData
   * @param {Object} d4 chart object
   * @param {Array} data array
   * @param {string} string represnting a dimension e.g. `x`,`y`.
   * @return {Object} Chart scale object
   */
  d4.builder('timeScaleForNestedData', linearOrTimeScale);

  /**
   * Creates an ordinal scale for a dimension of a given chart.
   * @name ordinalScaleForNestedData
   * @param {Object} d4 chart object
   * @param {Array} data array
   * @param {string} string represnting a dimension e.g. `x`,`y`.
   * @return {Object} Chart scale object
   */
  d4.builder('ordinalScaleForNestedData', function(chart, data, dimension) {
    var parsedData = extractValues(data, chart[dimension].$key);
    var bands = chart[dimension + 'RoundBands'] = chart[dimension + 'RoundBands'] || 0.3;
    var axis = chart[dimension];
    if (!axis.domain.$dirty) {
      axis.domain(parsedData);
    }

    if (!axis.rangeRoundBands.$dirty && !axis.rangePoints.$dirty && !axis.rangeBands.$dirty) {
      axis.rangeRoundBands(rangeFor(chart, dimension), bands);
    }
    return axis;
  });
}).call(this);
