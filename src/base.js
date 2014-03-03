/*!
  Functions "each", "extend", and "isFunction" based on Underscore.js 1.5.2
  http://underscorejs.org
  (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
  Underscore may be freely distributed under the MIT license.
*/
(function() {
  /*!
   * global d3: false
   * global d4: false
   */

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

  var err = function() {
    var parts = Array.prototype.slice.call(arguments);
    var message = parts.shift();
    var regexp;
    each(parts, function(str, i){
      regexp = new RegExp('\\{' + i + '\\}', 'gi');
      message = message.replace(regexp, str);
    });
    throw new Error('[d4] ' + message);
  };

  var validateBuilder = function(builder) {
    each(['configure'], function(funct) {
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

  var validateScale = function(scale){
    var supportedScales = ['identity', 'linear', 'log', 'ordinal', 'pow', 'quantile', 'quantize', 'sqrt', 'threshold'];
    if(supportedScales.indexOf(scale.kind) < 0){
      err('The scale type: "{0}" is unrecognized. D4 only supports these scale types: {1}', scale.kind, supportedScales.join(', '));
    }
  };

  /*!
    FIXME: d4 wraps the inner property object `opts` in a series of class
  functions. For example: `chart.width(300)` will set the internal
  `opts.width` property to 300. Additionally chart.width() will return 300.
  However, this behavior creates ambiguity in API because it is unclear to the
  developer which accessors require functions and which can simply supply
  values. Ideally the API should support something like this:
  chart.width(300) or chart.width(function(){ return 300; })
  */
  var accessorForObject = function(wrapperObj, innerObj, functName) {
    wrapperObj[functName] = function(attr) {
      if (!arguments.length) {
        return innerObj[functName];
      }
      innerObj[functName] = attr;
      return wrapperObj;
    };
  };

  var createAccessorsFromArray = function(wrapperObj, innerObj, accessors){
    each(accessors, function(functName) {
      accessorForObject(wrapperObj, innerObj, functName);
    });
  };

  /*!
   * In order to have a uniform API, objects with accessors, need to have wrapper
   * functions created for them so that users may access them in the declarative
   * nature we promote. This function will take an object, which contains an
   * accessors key and create the wrapper function for each accessor item.
   * This function is used internally by the feature mixin and scales objects.
   */
  var createAccessorsFromObject = function(obj){
    var accessors = obj.accessors;
    if (accessors) {
      createAccessorsFromArray(obj, obj.accessors, d3.keys(accessors));
    }
  };

  var createAccessorsFromScales = function(chart, scales) {
    each(d3.keys(scales), function(key) {
      accessorForObject(chart, scales.accessors, key);
    });
  };

  var addScale = function(opts, scale){
    validateScale(scale);
    opts.scales[scale.key] = {
      accessors : d4.extend({
        key : undefined,
        kind : undefined,
        min : undefined,
        max : undefined,
        link: undefined
      },scale)
    };
    createAccessorsFromObject(opts.scales[scale.key]);
  };

  var linkScales = function(opts) {
    each(d3.keys(opts.scales), function(dimension){
      addScale(opts, opts.scales[dimension]);
    });

    if(typeof(opts.scales.x) === 'undefined') {
      addScale(opts, { key : 'x', kind : 'ordinal' });
    }

    if(typeof(opts.scales.y) === 'undefined') {
      addScale(opts, { key : 'y', kind : 'linear' });
    }
  };

  var assignDefaults = function(config, defaultBuilder) {
    if (!defaultBuilder) {
      err('No builder defined');
    }
    var opts = d4.merge({
      width: 400,
      height: 400,
      features: {},
      mixins: [],
      scales: {},
      xKey: 'x',
      yKey: 'y',
      valueKey: 'y',
      margin: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 40
      }
    }, config);
    linkScales(opts);
    assignDefaultBuilder.bind(opts)(defaultBuilder);
    opts.accessors = ['margin', 'width', 'height', 'xKey', 'yKey', 'valueKey'].concat(config.accessors || []);
    return opts;
  };

  /*!
    d3 allows events to be bound to selections using the `#on()` function. We
    want to allow the developer to bind to these events transparently. However,
    we are not actually dealing with the d3 selection itself and so we need to
    create this proxy which passes any custom events on to the correct selection.
    For more information see the #selection.on documentation for d3:
    https://github.com/mbostock/d3/wiki/Selections#wiki-animation--interaction
  */
  var addEventsProxy = function(feature, selection){
    if(selection){
      each(d3.keys(feature._proxiedFunctions), function(key){
        each(feature._proxiedFunctions[key], function(proxiedArgs){
          selection[key].apply(selection, proxiedArgs);
        });
      });
    }
  };

  var linkFeatures = function(opts, data) {
    opts.mixins.forEach(function(name) {
      var selection = opts.features[name].render.bind(opts)(opts.features[name], data);
      addEventsProxy(opts.features[name], selection);
    });
  };

  var build = function(opts, data) {
    if (opts.builder) {
      opts.builder.configure(opts, data);
      linkFeatures(opts, data);
    } else {
      err('No builder defined');
    }
  };

  var scaffoldChart = function(selection, data) {
    this.svg = d3.select(selection).selectAll('svg').data([data]);
    this.featuresGroup = this.svg.enter().append('svg').append('g')
      .attr('class', 'featuresGroup')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
    this.svg.attr('width', this.width).attr('height', this.height).attr('class', 'd4');
    this.svg.append('defs');
  };

  /*!
    Normally d4 series elements inside the data array to be in a specific
  format, which is designed to support charts which require multiple data
  series. However, some charts can easily be used to display only a single data
  series in which case the default structure is overly verbose. In these cases
  d4 accepts the simplified objects in the array payload and silently
  parses them using the d4.nestedGroup parser. It will configure the parser's
  dimensions based on the configuration applied to the chart object itself.
  */
  var applyDefaultParser = function(opts, data) {
    if(opts.yKey !== opts.valueKey){
      opts.valueKey = opts.yKey;
    }
    var parsed = d4.parsers.nestedGroup()
    .x(opts.xKey)
    .y(opts.yKey)
    .nestKey(opts.xKey)
    .value(opts.valueKey)(data);
    return parsed.data;
  };

  var prepareData = function(opts, data) {
    var needsParsing = false, keys, item;
    if(data.length > 0){
      item = data[0];
      if(d4.isArray(item)) {
        needsParsing = true;
      } else {
        keys = d3.keys(item);
        if(keys.indexOf('key') + keys.indexOf('values') <= 0) {
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
        scaffoldChart.bind(opts, this)(data);
        build(opts, data);
      });
    };
  };

  var extractOverrides = function(feature) {
    if (feature.overrides) {
      return feature.overrides(this);
    } else {
      return {};
    }
  };

  var addToMixins = function(mixins, name, index){
    if (typeof index !== 'undefined') {
      index = Math.max(Math.min(index, mixins.length), 0);
      mixins.splice(index, 0, name);
    } else {
      mixins.push(name);
    }
  };

  var assignD3SelectionProxy = function(feature){
    feature._proxiedFunctions = {
      on : []
    };
    feature.on = function(){
      feature._proxiedFunctions.on.push(Array.prototype.slice.call(arguments));
    };
  };

  /*!
    FIXME: see fixme note related to the chart accessor functions, the same
  inconsistency applies here.
  */
  var assignMixinAccessors = function(feature){
    assignD3SelectionProxy(feature);
    createAccessorsFromObject(feature);
  };

  var mixin = function(feature, index) {
    if (!feature) {
      err('You need to supply an object to mixin.');
    }
    var name = d3.keys(feature)[0];
    var overrides = extractOverrides.bind(this)(feature, name);
    feature[name] = d4.merge(feature[name](name), overrides);
    d4.extend(this.features, feature);
    addToMixins(this.mixins, name, index);
    assignMixinAccessors(this.features[name]);
  };

  var mixout = function(name) {
    if (!name) {
      err('A name is required in order to mixout a chart feature.');
    }

    delete this.features[name];
    this.mixins = this.mixins.filter(function(val) {
      return val !== name;
    });
  };

  /*!
   * The using function is a bit of a catch all, it will attempt to find the
   * object provided by the name in the order of importance. First it will look
   * for an object in the scales object, then in the features object.
   */
  var using = function(name, funct) {
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

  /**
   * This function allows you to register a reusable chart with d4.
   * @param {String} name - accessor name for chart.
   * @param {Function} funct - function which will instantiate the chart.
   * @returns a reference to the chart function
  */
  d4.chart = function(name, funct) {
    d4.charts[name] = funct;
    return d4.charts[name];
  };

  /**
   * This function allows you to register a reusable chart feature with d4.
   * @param {String} name - accessor name for chart feature.
   * @param {Function} funct - function which will instantiate the chart feature.
   * @returns a reference to the chart feature
  */
  d4.feature = function(name, funct) {
    d4.features[name] = funct;
    return d4.features[name];
  };

  /**
   * This function allows you to register a reusable chart builder with d4.
   * @param {String} name - accessor name for chart builder.
   * @param {Function} funct - function which will instantiate the chart builder.
   * @returns a reference to the chart builder
  */
  d4.builder = function(name, funct) {
    d4.builders[name] = funct;
    return d4.builders[name];
  };

  /**
   * This function allows you to register a reusable data parser with d4.
   * @param {String} name - accessor name for data parser.
   * @param {Function} funct - function which will instantiate the data parser.
   * @returns a reference to the data parser
  */
  d4.parser = function(name, funct) {
    d4.parsers[name] = funct;
    return d4.parsers[name];
  };

  /**
   * This function creates a d4 chart object. It is only used when creating a
   * new chart factory.
   *
   *##### Examples
   *
   *     d4.chart('column', function columnChart() {
   *         var chart = d4.baseChart({
   *           scales: [{
   *             key: 'x',
   *             kind: 'ordinal'
   *           }, {
   *             key: 'y',
   *             kind: 'linear'
   *           }]
   *         }, columnChartBuilder);
   *         return chart;
   *     });
   *
   * @param {Object} config - an object representing chart configuration settings
   * @param {Function} defaultBuilder - function which will return a valid builder object when invoked.
   * @returns a reference to the chart object
   */
  d4.baseChart = function(config, defaultBuilder) {
    var opts = assignDefaults(config, defaultBuilder);
    var chart = applyScaffold(opts);

    chart.accessors = opts.accessors;
    createAccessorsFromArray(chart, opts, chart.accessors);
    createAccessorsFromScales(chart, opts.scales);

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
     *            configure: function(chart, data) {
     *                configureScales.bind(this)(chart, data);
     *            }
     *         };
     *     };
     *
     * @param {Function} funct - function which returns a builder object.
     */
    chart.builder = function(funct) {
      validateBuilder(funct.bind(chart)(opts));
      return chart;
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
     *      => ["bars", "barLabels", "xAxis"]
     *
     */
    chart.features = function() {
      return opts.mixins;
    };

    /**
     * Specifies a feature to be mixed into a given chart.
     * The feature is an object where the key represents the feature name, and a
     * value which is a function that when invoked returns a d4 feature object.
     *
     *##### Examples
     *
     *      // Mix in a feature at a specific depth
     *      chart.mixin({ 'grid': d4.features.grid }, 0)
     *
     *      chart.mixin({ 'zeroLine': d4.features.referenceLine })
     *
     * @param {Object} feature - an object describing the feature to mix in.
     * @param {Integer} index - an optional number to specify the insertion layer.
     */
    chart.mixin = function(feature, index) {
      mixin.bind(opts)(feature, index);
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
     */
    chart.mixout = function(feature, index) {
      mixout.bind(opts)(feature, index);
      return chart;
    };

    /**
     * This function returns the internal scales object as a parameter to the
     * supplied function.
     * @param {Function} funct - function which will perform the modifcation.
     */
    chart.scales = function(funct) {
      funct(opts.scales);
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
     */
    chart.using = function(name, funct) {
      using.bind(opts)(name, funct);
      return chart;
    };

    return chart;
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
   * @param {Varies} funct - An function or other variable to be wrapped in a function
   */
  d4.functor = function(funct) {
    return d4.isFunction(funct) ? funct : function() {
      return funct;
    };
  };

  d4.isArray = Array.isArray || function(val) {
    return Object.prototype.toString.call(val) === '[object Array]';
  };

  d4.isFunction = function(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
  };

  d4.isNotFunction = function(obj) {
    return !d4.isFunction(obj);
  };

  d4.merge = function(options, overrides) {
    return d4.extend(d4.extend({}, options), overrides);
  };

  d4.extend = function(obj) {
    each(Array.prototype.slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (source[prop] && source[prop].constructor &&
            source[prop].constructor === Object) {
            obj[prop] = obj[prop] || {};
            d4.extend(obj[prop], source[prop]);
          } else {
            obj[prop] = source[prop];
          }
        }
      }
    });
    return obj;
  };

}).call(this);
