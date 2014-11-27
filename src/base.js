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
