/*! d4 - v0.5.6
 *  License: MIT Expat
 *  Date: 2014-03-19
 */
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

  var capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  var readOnlyProp = function(obj, prop, functName, value){
    Object.defineProperty(obj, prop, {
      configurable: true,
      get: function(){
        return d4.functor(value)();
      },
      set: function() {
        err(' You cannot directly assign values to the {0} property. Instead use the {1}() function.', prop, functName);
      }
    });
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

  /*!
    In an effort to make the API more succient we store the last known proplerty
  of an accessor with the same name but prepended with a $ character. This allows
  the developer to do something like this:
      chart.width(500)
      chart.$width //500
  */
  var storeLastValue = function(obj, functName, attr) {
    if(d4.isNotFunction(attr)){
      var prop = '$' + functName;
      readOnlyProp(obj, prop, functName, attr);
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
  var accessorForObject = function(wrapperObj, innerObj, functName, prefix) {
    var wrapperFunct = functName;
    if(typeof prefix !== 'undefined') {
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

  var createAccessorsFromArray = function(wrapperObj, innerObj, accessors, prefix){
    each(accessors, function(functName) {
      accessorForObject(wrapperObj, innerObj, functName, prefix);
    });
  };

  /*!
   * In order to have a uniform API, objects with accessors, need to have wrapper
   * functions created for them so that users may access them in the declarative
   * nature we promote. This function will take an object, which contains an
   * accessors key and create the wrapper function for each accessor item.
   * This function is used internally by the feature mixin and axes objects.
   */
  var createAccessorsFromObject = function(obj){
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
      each(d3.keys(opts.axes[key].accessors), function(prop){
        chart[key][prop] = opts.axes[key][prop];
      });
    });
  };

  var validateScale = function(kind){
    var supportedScales = d3.keys(d3.scale);
    if(supportedScales.indexOf(kind) < 0){
      err('The scale type: "{0}" is unrecognized. D4 only supports these scale types: {1}', kind, supportedScales.join(', '));
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
   * Special Note: Because builders during the link function may define defaults
   * for a given axis, it will also need to know if the property in question was
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

    dimension.scale = function(val){
      if (!arguments.length) {
        return dimension.accessors.scale;
      }
      dimension.accessors.scale = val;
      resetFunct();
      return dimension;
    };
  };

  var createAxisScale = function(dimension, opts, axis){
    validateScale(axis.accessors.scale);
    var scale = d3.scale[axis.accessors.scale]();
    createAccessorsFromObject(axis);
    opts[dimension] = scale;

    createAxisScaleAccessor(scale, opts.axes[dimension], function(){
      createAxisScale(dimension, opts, axis);
    });

    // Danger Zone (TM): This is setting read-only function properties on a d3 scale instance. This may not be totally wise.
    each(d3.keys(opts.axes[dimension].accessors), function(key){
      readOnlyProp(opts[dimension], '$' + key, opts.axes[dimension][key], opts.axes[dimension][key]);
    });
  };

  var addAxis = function(dimension, opts, axis){
    opts.axes[dimension] = {
      accessors : d4.extend({
        key : dimension,
        min : undefined,
        max : undefined
      }, axis)
    };
    createAxisScale(dimension, opts, opts.axes[dimension]);
  };

  var linkAxes = function(opts) {
    each(d3.keys(opts.axes), function(dimension){
      addAxis(dimension, opts, opts.axes[dimension]);
    });

    if(typeof(opts.axes.x) === 'undefined') {
      addAxis('x', opts, { scale : 'ordinal' });
    }

    if(typeof(opts.axes.y) === 'undefined') {
      addAxis('y', opts, { scale : 'linear' });
    }
  };

  var assignDefaults = function(config, defaultBuilder) {
    var builder = d4.functor({
      link: function(chart, data) {
        d4.builders[chart.x.$scale + 'ScaleForNestedData'](chart, data, 'x');
        d4.builders[chart.y.$scale + 'ScaleForNestedData'](chart, data, 'y');
      }
    });

    var opts = d4.merge({
      width: 400,
      height: 400,
      features: {},
      mixins: [],
      axes: {},
      margin: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 40
      },
    }, config);

    linkAxes(opts);
    assignDefaultBuilder.bind(opts)(defaultBuilder || builder);
    opts.accessors = ['margin', 'width', 'height', 'valueKey'].concat(d3.keys(config.accessors) || []);
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

  var prepareDataForFeature = function(opts, name, data) {
    var feature = opts.features[name];
    if(d4.isFunction(feature.prepare)){
      data = feature.prepare.bind(opts)(data);
      if(typeof data === 'undefined') {
        err('"feature.prepare()" must return a data array. However, the prepare function for the "{0}" feature did not', name);
      }
    }
    return data;
  };

  var linkFeatures = function(opts, data) {
    opts.mixins.forEach(function(name) {
      data = prepareDataForFeature(opts, name, data);
      var selection = opts.features[name].render.bind(opts)(opts.features[name], data);
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

  var scaffoldChart = function(selection, data) {
    this.svg = d3.select(selection).selectAll('svg').data([data]);
    this.featuresGroup = this.svg.enter().append('svg')
    .append('g')
      .attr('class', 'featuresGroup')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
    this.svg
    .attr('width', this.width + this.margin.left + this.margin.right)
    .attr('height', this.height + this.margin.top + this.margin.bottom)
    .attr('class', 'd4');
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
    var parsed = d4.parsers.nestedGroup()
    .x(opts.x.$key)
    .y(opts.y.$key)
    .nestKey(opts.x.$key)
    .value(opts.valueKey)(data);
    return parsed.data;
  };

  var prepareData = function(opts, data) {
    if(typeof opts.valueKey === 'undefined'){
      opts.valueKey = opts.y.$key;
    }

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

  /*!
   * We want to ensure that the visual dimensions are set the first time. This
   * prevents the chart from shrinking if it were to be redrawn more than once.
   */
  var calculateDimensions = function() {
    if(!this._calculated) {
      this.width  = this.width - this.margin.left - this.margin.right;
      this.height = this.height - this.margin.top - this.margin.bottom;
      this._calculated = true;
    }
  };

  var applyScaffold = function(opts) {
    return function(selection) {
      selection.each(function(data) {
        data = prepareData(opts, data);
        calculateDimensions.bind(opts, this)();
        scaffoldChart.bind(opts, this)(data);
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

  var assignMixinAccessors = function(feature){
    createAccessorsFromObject(feature);
  };

  var assignMixinProxies = function(feature){
    assignD3SelectionProxy(feature);
    d4.each(feature.proxies, function(obj){
      d4.createAccessorProxy(feature, obj);
    });
  };

  var mixin = function(feature, index) {
    if (!feature) {
      err('You need to supply an object to mixin.');
    }
    var name = d3.keys(feature)[0];
    var overrides = extractOverrides.bind(this)(feature, name);
    var baseFeature = {
      proxies : []
    };
    feature[name] = d4.merge(d4.merge(baseFeature, feature[name](name)), overrides);
    d4.extend(this.features, feature);
    addToMixins(this.mixins, name, index);
    assignMixinProxies(this.features[name]);
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
   * @returns a reference to the chart object
   */
  d4.baseChart = function(options) {
    var opts = assignDefaults(options && options.config || {}, options && options.builder || undefined);
    var chart = applyScaffold(opts);
    createAccessorsFromArray(chart, opts.margin, d3.keys(opts.margin), 'margin');

    chart.accessors = opts.accessors;
    createAccessorsFromArray(chart, opts, chart.accessors);
    createAccessorsFromAxes(chart, opts);

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
     */
    chart.builder = function(funct) {
      opts.builder = validateBuilder(funct.bind(opts)());
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
     * This function returns the internal axes object as a parameter to the
     * supplied function.
     * @param {Function} funct - function which will perform the modifcation.
     */
    chart.axes = function(funct) {
      if (!arguments.length) {
        return opts.axes;
      }
      funct(opts.axes);
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
      usingFeature.bind(opts)(name, funct);
      return chart;
    };

    return chart;
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

    each(d3.keys(target), function(funct){
      var proxyFunct = funct;
      if(typeof prefix !== 'undefined') {
        proxyFunct = prefix + capitalize(funct);
      }

      proxy[proxyFunct] = function(){
        if (!arguments.length) {
          return target[funct]();
        }
        target[funct].$dirty = true;
        proxy[proxyFunct].$dirty = true;

        /*!
         * Instead of returning the target object we must return the proxy, this
         * is so that we do not break the functional programming chaining of
         * proxy function calls. Unfortunately, this also means that the results
         * of the target function are not captured. Ideally, it would be nice
         * to return the value of the target command if the target object
         * itself is not returned.
         */
        target[funct].apply(target, arguments);
        return proxy;
      };
      target[funct].$dirty = false;
      proxy[proxyFunct].$dirty = false;
    });
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

}).call(this);

(function() {
  /*!
   * global d3: false
   * global d4: false
   */

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
      var lastOffset = text.attr('data-last-horizontal-offset') || 1;
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
    if (typeof text !== 'undefined') {
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
  /*!
   * global d3: false
   * global d4: false
   */
  'use strict';

 /*
  * The column chart has two axes (`x` and `y`). By default the column chart expects
  * linear values for the `y` and ordinal values on the `x`. The basic column chart
  * has four default features:
  *
  *##### Accessors
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
    var chart = d4.baseChart();
    [{
      'bars': d4.features.stackedColumnSeries
    }, {
      'barLabels': d4.features.stackedColumnLabels
    }, {
      'xAxis': d4.features.xAxis
    }, {
      'yAxis': d4.features.yAxis
    }].forEach(function(feature) {
      chart.mixin(feature);
    });
    return chart;
  });
}).call(this);

(function() {
  /*!
   * global d3: false
   * global d4: false
   */
  'use strict';

 /*
  * The grouped column chart is used to compare a series of data elements grouped
  * along the xAxis. This chart is often useful in conjunction with a stacked column
  * chart because they can use the same data series, and where the stacked column highlights
  * the sum of the data series across an axis the grouped column can be used to show the
  * relative distribution.
  *
  *##### Accessors
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
        accessors : {
          x: function(d, i) {
            var width = this.x.rangeBand() / this.groupsOf;
            var xPos = this.x(d[this.x.$key]) + width * i;
            var gutter = width * 0.1;
            return xPos + width/2 - gutter;
          }
        }
      };
    };

    var chart = d4.baseChart({
      config: {
        accessors: {
          groupsOf: 1
        }
      }
    });
    [{
      'bars': d4.features.groupedColumnSeries
    }, {
      'columnLabels': d4.features.stackedColumnLabels,
      'overrides': columnLabelOverrides
    }, {
      'xAxis': d4.features.xAxis
    }, {
      'yAxis': d4.features.yAxis
    }].forEach(function(feature) {
      chart.mixin(feature);
    });
    return chart;
  });
}).call(this);

(function() {
  /*!
   * global d3: false
   * global d4: false
   */
  'use strict';

  /*
   * The line series chart is used to compare a series of data elements grouped
   * along the xAxis.
   *
   *##### Accessors
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
    var chart = d4.baseChart();
    [{
      'lineSeries': d4.features.lineSeries
    }, {
      'xAxis': d4.features.xAxis
    }, {
      'yAxis': d4.features.yAxis
    }, {
      'lineSeriesLabels': d4.features.lineSeriesLabels
    }].forEach(function(feature) {
      chart.mixin(feature);
    });
    return chart;
  });
}).call(this);
(function() {
  /*!
   * global d3: false
   * global d4: false
   */
  'use strict';

 /*
  * The row chart has two axes (`x` and `y`). By default the column chart expects
  * linear scale values for the `x` and ordinal scale values on the `y`. The basic column chart
  * has four default features:
  *
  *##### Accessors
  *
  * `bars` - series bars
  * `rowLabels` - data labels to the right of the bars
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
    var chart = d4.baseChart({
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
    });
    [{
      'bars': d4.features.stackedColumnSeries
    }, {
      'barLabels': d4.features.stackedColumnLabels
    }, {
      'xAxis': d4.features.xAxis
    }, {
      'yAxis': d4.features.yAxis
    }].forEach(function(feature) {
      chart.mixin(feature);
    });
    return chart;
  });
}).call(this);

(function() {
  /*!
   * global d3: false
   * global d4: false
   */
  'use strict';

  var scatterPlotBuilder = function() {
    var configureScales = function(chart, data) {
      d4.builders[chart.x.$scale + 'ScaleForNestedData'](chart, data, 'x');
      d4.builders[chart.y.$scale + 'ScaleForNestedData'](chart, data, 'y');
      d4.builders[chart.z.$scale + 'ScaleForNestedData'](chart, data, 'z');
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

  d4.chart('scatterPlot', function scatterPlot() {
    var chart = d4.baseChart({
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
    });
    [{
      'circles': d4.features.dotSeries
    }, {
      'xAxis': d4.features.xAxis
    }, {
      'yAxis': d4.features.yAxis
    }].forEach(function(feature) {
      chart.mixin(feature);
    });
    return chart;
  });
}).call(this);

(function() {
  /*!
   * global d3: false
   * global d4: false
   */
  'use strict';

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
        accessors : {
          y: function(d){
            var padding = 5;
            return this.y(d.size) - padding;
          }
        },
        prepare: function(data) {
          return calculateStackTotals.bind(this)(data);
        }
      };
    };

    var chart = d4.baseChart();
    [{
      'bars': d4.features.stackedColumnSeries
    }, {
      'barLabels': d4.features.stackedColumnLabels
    }, {
      'connectors': d4.features.stackedColumnConnectors
    }, {
      'columnTotals': d4.features.columnLabels,
      'overrides': columnLabelsOverrides
    }, {
      'xAxis': d4.features.xAxis
    }, {
      'yAxis': d4.features.yAxis
    }].forEach(function(feature) {
      chart.mixin(feature);
    });
    return chart;
  });
}).call(this);

(function() {
  /*!
   * global d3: false
   * global d4: false
   */
  'use strict';

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
        accessors : {
          x: function(d){
            var padding = 5;
            return this.x(d.size) + padding;
          }
        },
        prepare: function(data) {
          return calculateStackTotals.bind(this)(data);
        }
      };
    };

    var chart = d4.baseChart({
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
    });
    [{
      'bars': d4.features.stackedColumnSeries
    }, {
      'barLabels': d4.features.stackedColumnLabels
    }, {
      'connectors': d4.features.stackedColumnConnectors
    }, {
      'columnTotals': d4.features.columnLabels,
      'overrides': columnLabelsOverrides
    }, {
      'xAxis': d4.features.xAxis
    }, {
      'yAxis': d4.features.yAxis
    }].forEach(function(feature) {
      chart.mixin(feature);
    });
    return chart;
  });
}).call(this);
(function() {
  /*!
   * global d3: false
   * global d4: false
   */
  'use strict';

  var columnSeriesOverrides = function waterfall() {
    return {
      accessors: {
        y: function(d) {
          if (this.y.$scale === 'linear') {
            var yVal = (d.y0 + d.y) - Math.min(0, d.y);
            return this.y(yVal);
          } else {
            return this.y(d[this.y.$key]);
          }
        },

        x: function(d) {
          if (this.x.$scale === 'ordinal') {
            return this.x(d[this.x.$key]);
          } else {
            var xVal = (d.y0 + d.y) - Math.max(0, d.y);
            return this.x(xVal);
          }
        },

        width: function(d) {
          if (this.x.$scale === 'ordinal') {
            return this.x.rangeBand();
          } else {
            return Math.abs(this.x(d.y0) - this.x(d.y0 + d.y));
          }
        },

        height: function(d) {
          if (this.y.$scale === 'linear') {
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
          if (this.y.$scale === 'linear') {
            var height = Math.abs(this.y(d.y0) - this.y(d.y0 + d.y));
            var yVal = (d.y0 + d.y) - Math.max(0, d.y);
            return this.y(yVal) - 10 - height;
          } else {
            return this.y(d[this.y.$key]) + (this.y.rangeBand() / 2);
          }
        },

        x: function(d) {
          if (this.x.$scale === 'ordinal') {
            return this.x(d[this.x.$key]) + (this.x.rangeBand() / 2);
          } else {
            var xVal = (d.y0 + d.y) - Math.max(0, d.y);
            var width = Math.abs(this.x(d.y0) - this.x(d.y0 + d.y));
            return this.x(xVal) + 10 + width;
          }
        },

        text: function(d) {
          return d3.format('').call(this, d[this.valueKey]);
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
        return (chart.x.$scale === 'ordinal') ? rangeBounds.reverse() : rangeBounds;
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
        ext[0] = Math.min(0, ext[0]);
        chart[dimension].domain(ext);
        chart[dimension].range(rangeBoundsFor.bind(this)(chart, dimension))
        .clamp(true)
        .nice();
      };

    var configureScales = function(chart, data) {
      if (chart.x.$scale === 'ordinal') {
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

  d4.chart('waterfall', function waterfallChart() {
    var chart = d4.baseChart({ builder: waterfallChartBuilder });
    [{
      'bars': d4.features.stackedColumnSeries,
      'overrides': columnSeriesOverrides
    }, {
      'connectors': d4.features.waterfallConnectors
    }, {
      'columnLabels': d4.features.stackedColumnLabels,
      'overrides': columnLabelOverrides
    }, {
      'xAxis': d4.features.xAxis
    }, {
      'yAxis': d4.features.yAxis
    }].forEach(function(feature) {
      chart.mixin(feature);
    });

    return chart;
  });
}).call(this);

(function() {
  /*!
   * global d3: false
   * global d4: false
   */
  'use strict';
  d4.feature('arrow', function(name) {
    return {
      accessors: {
        tipSize: function(){
          return 6;
        },
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
          return  this.y(this.height);
        },
        classes: function(){
          return 'line';
        }
      },
      render: function(scope) {
        var defs = this.svg.select('defs');

        defs.append('marker')
          .attr('id', name + '-end')
          .attr('viewBox', '0 0 10 10')
          .attr('refX', 10)
          .attr('refY', 5)
          .attr('markerWidth', scope.accessors.tipSize.bind(this))
          .attr('markerHeight', scope.accessors.tipSize.bind(this))
          .attr('orient', 'auto')
          .append('path')
          .attr('d', 'M 0 0 L 10 5 L 0 10 z');

        defs.append('marker')
          .attr('id', name + '-start')
          .attr('viewBox', '0 0 10 10')
          .attr('refX', 10)
          .attr('refY', 5)
          .attr('markerWidth', -scope.accessors.tipSize.bind(this)())
          .attr('markerHeight', scope.accessors.tipSize.bind(this))
          .attr('orient', 'auto')
          .append('path')
          .attr('d', 'M 0 0 L 10 5 L 0 10 z');

        this.featuresGroup.append('g').attr('class', name);
        var arrow = this.svg.select('.' + name)
          .append('line')
          .attr('class', scope.accessors.classes.bind(this))
          .attr('x1', scope.accessors.x1.bind(this))
          .attr('x2', scope.accessors.x2.bind(this))
          .attr('y1', scope.accessors.y1.bind(this))
          .attr('y2', scope.accessors.y2.bind(this))
          .attr('marker-end', 'url(#' + name + '-end)');

        return arrow;
      }
    };
  });
}).call(this);

(function() {
  /*!
   * global d3: false
   * global d4: false
   */

  'use strict';
  d4.feature('columnLabels',function(name) {
    var padding = 5;
    var anchorText = function() {
      if (this.y.$scale !== 'ordinal') {
        return 'middle';
      } else {
        return 'start';
      }
    };
    return {
      accessors: {
        x: function(d) {
          return this.x(d[this.x.$key]) + (this.x.rangeBand() / 2);
        },

        y: function(d) {
          if(this.y.$scale === 'ordinal') {
            return this.y(d[this.y.$key]) + (this.y.rangeBand() / 2) + padding;
          } else {
            var height = Math.abs(this.y(d[this.y.$key]) - this.y(0));
            return (d[this.y.$key] < 0 ? this.y(d[this.y.$key]) - height : this.y(d[this.y.$key])) - padding;
          }
        },

        text: function(d) {
          return d3.format('').call(this, d[this.valueKey]);
        }
      },
      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var label = this.svg.select('.'+name).selectAll('.'+name).data(data);
        label.enter().append('text');
        label.exit().remove();
        label.attr('class', 'column-label')
          .text(scope.accessors.text.bind(this))
          .attr('text-anchor', anchorText.bind(this))
          .attr('x', scope.accessors.x.bind(this))
          .attr('y', scope.accessors.y.bind(this));
        return label;
      }
    };
  });
}).call(this);
(function() {
  /*!
   * global d3: false
   * global d4: false
   */

  'use strict';
  d4.feature('dotSeries', function(name) {
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
        },

        classes : function(d, i) {
          return 'dot series' + i + ' fill';
        }
      },
      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var group = this.svg.select('.' + name).selectAll('.group')
          .data(data)
          .enter().append('g')
          .attr('class', function(d,i) {
            return 'series'+ i + ' ' +  this.y.$key;
          }.bind(this));

        var dots = group.selectAll('circle')
          .data(function(d) {
            return d.values;
          }.bind(this));

        dots.enter().append('circle');
        dots.exit().remove();
        dots
          .attr('class', scope.accessors.classes.bind(this))
          .attr('r', scope.accessors.r.bind(this))
          .attr('cx', scope.accessors.cx.bind(this))
          .attr('cy', scope.accessors.cy.bind(this));
        return dots;
      }
    };
  });
}).call(this);

(function() {
  /*!
   * global d3: false
   * global d4: false
   */
  'use strict';
  d4.feature('grid', function(name) {

    return {
      accessors: {
        formatXAxis: function(xAxis) {
          return xAxis.orient('bottom');
        },

        formatYAxis: function(yAxis) {
          return yAxis.orient('left');
        }
      },
      render: function(scope) {
        var xAxis = d3.svg.axis().scale(this.x);
        var yAxis = d3.svg.axis().scale(this.y);
        var formattedXAxis = scope.accessors.formatXAxis.bind(this)(xAxis);
        var formattedYAxis = scope.accessors.formatYAxis.bind(this)(yAxis);

        this.featuresGroup.append('g').attr('class', 'grid border '+ name)
          .attr('transform', 'translate(0,0)')
          .append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', this.width)
          .attr('height', this.height);

        this.featuresGroup.append('g')
          .attr('class', 'x grid '+ name)
          .attr('transform', 'translate(0,' + this.height + ')')
          .call(formattedXAxis
          .tickSize(-this.height, 0, 0)
          .tickFormat(''));

        this.featuresGroup.append('g')
          .attr('class', 'y grid '+ name)
          .attr('transform', 'translate(0,0)')
          .call(formattedYAxis
          .tickSize(-this.width, 0, 0)
          .tickFormat(''));
      }
    };
  });
}).call(this);
(function() {
  /*!
   * global d3: false
   * global d4: false
   */
  'use strict';
  d4.feature('groupedColumnSeries', function(name) {
    var sign = function(val) {
      return (val > 0) ? 'positive' : 'negative';
    };

    return {
      accessors: {
        x: function(d, i) {
          var width = this.x.rangeBand() / this.groupsOf;
          var xPos = this.x(d[this.x.$key]) + width * i;
          return xPos;
        },

        y: function(d) {
          return d[this.y.$key] < 0 ? this.y(0) : this.y(d[this.y.$key]);
        },

        width: function() {
          var width = this.x.rangeBand() / this.groupsOf;
          var gutter = width * 0.1;
          return width - gutter;
        },

        height: function(d) {
          return Math.abs(this.y(d[this.y.$key]) - this.y(0));
        },

        classes: function(d, i) {
          return 'bar fill item' + i + ' ' + sign(d[this.y.$key]) + ' ' + d[this.y.$key];
        }
      },
      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var group = this.svg.select('.' + name).selectAll('.group')
          .data(data);
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
          .attr('class', scope.accessors.classes.bind(this))
          .attr('x', scope.accessors.x.bind(this))
          .attr('y', scope.accessors.y.bind(this))
          .attr('width', scope.accessors.width.bind(this))
          .attr('height', scope.accessors.height.bind(this));
        return rect;
      }
    };
  });
}).call(this);

(function() {
  /*!
   * global d3: false
   * global d4: false
   */

  'use strict';
  d4.feature('lineSeriesLabels', function(name) {
    return {
      accessors: {
        x: function(d) {
          return this.x(d.values[d.values.length - 1][this.x.$key]);
        },

        y: function(d) {
          return this.y(d.values[d.values.length - 1][this.y.$key]);
        },

        text: function(d) {
          return d.key;
        },

        classes: function(d,n) {
          return 'stroke series' + n;
        }
      },
      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var label = this.svg.select('.'+name).selectAll('.'+name).data(data);
        label.enter().append('text');
        label.exit().remove();
        label.attr('class', 'lineSeriesLabel')
          .text(scope.accessors.text.bind(this))
          .attr('x', scope.accessors.x.bind(this))
          .attr('y', scope.accessors.y.bind(this))
          .attr('data-key', function(d){
            return d.key;
          })
          .attr('class', scope.accessors.classes.bind(this));
        return label;
      }
    };
  });
}).call(this);
(function() {
  /*!
   * global d3: false
   * global d4: false
   */

  'use strict';
  d4.feature('lineSeries', function(name) {
    return {
      accessors: {
        x: function(d) {
          return this.x(d[this.x.$key]);
        },

        y: function(d) {
          return this.y(d[this.y.$key]);
        },

        interpolate: function() {
          return 'basis';
        },

        classes: function(d, n) {
          return 'line stroke series' + n;
        }
      },
      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var line = d3.svg.line()
          .interpolate(scope.accessors.interpolate.bind(this)())
          .x(scope.accessors.x.bind(this))
          .y(scope.accessors.y.bind(this));

        var group = this.svg.select('.' + name).selectAll('.group')
          .data(data);
        group.exit().remove();
        group.enter().append('g')
          .attr('data-key', function(d) {
            return d.key;
          })
          .attr('class', scope.accessors.classes.bind(this))
          .append('path')
          .attr('d', function(d) {
            return line(d.values);
          });
      }
    };
  });
}).call(this);

(function() {
  /*!
   * global d3: false
   * global d4: false
   */

  'use strict';
  d4.feature('referenceLine', function(name) {
    return {
      accessors: {
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
        },
        classes: function() {
          return 'line';
        }
      },
      render: function(scope) {
        this.featuresGroup.append('g').attr('class', name);
        var referenceLine = this.svg.select('.' + name)
          .append('line')
          .attr('class', scope.accessors.classes.bind(this))
          .attr('x1', scope.accessors.x1.bind(this))
          .attr('x2', scope.accessors.x2.bind(this))
          .attr('y1', scope.accessors.y1.bind(this))
          .attr('y2', scope.accessors.y2.bind(this));
        return referenceLine;
      }
    };
  });
}).call(this);

(function() {
  /*!
   * global d3: false
   * global d4: false
   */

  /*!
    Column connectors helpful when displaying a stacked column chart.
    A connector will not connect positve and negative columns. This is because
    in a stacked column a negative column may move many series below its previous
    location. This creates a messy collection of crisscrossing lines.
  */
  'use strict';
  d4.feature('stackedColumnConnectors', function(name) {
    var sign = function(num) {
      return (num) ? (num < 0) ? -1 : 1 : 0;
    };

    var sharedSigns = function(a, b, key){
      return (sign(a[key]) === sign(b[key]));
    };

    var processPoint = function(d, i, n, data, callback) {
      var key = (this.y.$scale === 'ordinal') ? this.x.$key : this.y.$key;
      if(i === 0 || !sharedSigns(data[n].values[i-1], d, key)){
        return 0;
      }
      return callback.bind(this)();
    };

    return {
      accessors: {
        x1: function(d) {
          if(this.x.$scale === 'ordinal'){
            return this.x(d[this.x.$key]);
          } else {
            return this.x(d.y0 + d.y);
          }
        },

        y1: function(d) {
          if(this.y.$scale === 'ordinal'){
            return this.y(d[this.y.$key]);
          } else {
            return this.y(d.y0 + d.y);
          }
        },

        size: function(){
          if(this.x.$scale === 'ordinal') {
            return this.x.rangeBand();
          } else {
            return this.y.rangeBand();
          }
        },

        classes : function(d, i){
          return 'series' +i;
        }
      },

      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var group = this.svg.select('.' + name).selectAll('.group')
          .data(data)
          .enter().append('g')
          .attr('class', function(d,i) {
            return 'series'+ i + ' ' +  this.y.$key;
          }.bind(this));

        var lines = group.selectAll('lines')
          .data(function(d) {
            return d.values;
          }.bind(this));

        lines.enter().append('line');
        lines.exit().remove();
        lines
        .attr('class', scope.accessors.classes.bind(this))
        .attr('stroke-dasharray','5, 5')
        .attr('x1', function(d, i, n) {
          return processPoint.bind(this)(d, i, n, data, function(){
            return scope.accessors.x1.bind(this)(d);
          });
        }.bind(this))

        .attr('y1', function(d, i, n) {
          var offset = (this.y.$scale === 'ordinal') ? scope.accessors.size.bind(this)(d) : 0;
          return processPoint.bind(this)(d, i, n, data, function(){
            return scope.accessors.y1.bind(this)(d) + offset;
          });
        }.bind(this))

        .attr('x2', function(d, i, n) {
          var offset = (this.x.$scale === 'ordinal') ? scope.accessors.size.bind(this)(d) : 0;
          return processPoint.bind(this)(d, i, n, data, function(){
            return scope.accessors.x1.bind(this)(data[n].values[i-1]) + offset;
          });
        }.bind(this))

        .attr('y2', function(d, i, n) {
          return processPoint.bind(this)(d, i, n, data, function(){
            return scope.accessors.y1.bind(this)(data[n].values[i-1]);
          });
        }.bind(this));

        return lines;
      }
    };
  });
}).call(this);

(function() {
  /*!
   * global d3: false
   * global d4: false
   */

  'use strict';
  d4.feature('stackedColumnLabels', function(name) {
    var sign = function(val) {
      return val > 0 ? 'positive' : 'negative';
    };

    // FIXME: We should not need to sniff this out.
    var dataInColumns = function(d) {
      if (typeof d.y0 !== 'undefined') {
        return true;
      }
      if (this.y.$scale !== 'ordinal') {
        return true;
      } else {
        return false;
      }
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
      var padding = 5;
      var val;
      if (dimension === 'x') {
        offset *= -1;
        padding *= -1;
      }
      if (typeof d.y0 !== 'undefined') {
        val = d.y0 + d.y;
        return (val <= 0 ? axis(d.y0) : axis(val)) + offset;
      } else {
        return (d[axis.$key] <= 0 ? axis(0) : axis(d[axis.$key])) - padding;
      }
    };

    return {
      accessors: {
        x: function(d) {
          if (this.x.$scale === 'ordinal') {
            return useDiscretePosition.bind(this)('x', d);
          } else {
            return useContinuousPosition.bind(this)('x', d);
          }
        },

        y: function(d) {
          if (this.y.$scale === 'ordinal') {
            return useDiscretePosition.bind(this)('y', d);
          } else {
            return useContinuousPosition.bind(this)('y', d);
          }
        },

        text: function(d) {
          if (typeof d.y0 !== 'undefined') {
            if (this.x.$scale === 'ordinal') {
              if (Math.abs(this.y(d.y0) - this.y(d.y0 + d.y)) > 20) {
                return d3.format('').call(this, d[this.valueKey]);
              }
            } else {
              if (Math.abs(this.x(d.y0) - this.x(d.y0 + d.y)) > 20) {
                return d3.format('').call(this, d[this.valueKey]);
              }
            }
          } else {
            return d3.format('').call(this, d[this.valueKey]);
          }
        },
        stagger: true,
        classes: 'column-label'
      },

      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var group = this.svg.select('.' + name).selectAll('.group')
          .data(data)
          .enter().append('g')
          .attr('class', function(d, i) {
            return 'series' + i + ' ' + sign(d.y) + ' ' + this.x.$key;
          }.bind(this));

        var text = group.selectAll('text')
          .data(function(d) {
            return d.values;
          }.bind(this));
        text.exit().remove();
        text.enter().append('text')
          .text(scope.accessors.text.bind(this))
          .attr('text-anchor', anchorText.bind(this))
          .attr('class', d4.functor(scope.accessors.classes).bind(this))
          .attr('y', scope.accessors.y.bind(this))
          .attr('x', scope.accessors.x.bind(this));

        if (d4.functor(scope.accessors.stagger).bind(this)()) {

          // FIXME: This should be moved into a helper injected using DI.
          if(this.y.$scale !== 'ordinal') {
            group.selectAll('text').call(d4.helpers.staggerTextVertically, -1);
          } else {
            group.selectAll('text').call(d4.helpers.staggerTextHorizontally, 1);
          }
        }
        return text;
      }
    };
  });
}).call(this);

(function() {
  /*!
   * global d3: false
   * global d4: false
   */

  'use strict';
  d4.feature('stackedColumnSeries', function(name) {
    var sign = function(val){
      return (val > 0) ? 'positive' : 'negative';
    };

    var useDiscretePosition = function(dimension, d){
      var axis = this[dimension];
      return axis(d[axis.$key]);
    };

    var useDiscreteSize = function(dimension) {
      var axis = this[dimension];
      return axis.rangeBand();
    };

    var useContinuousSize = function(dimension, d) {
      var axis = this[dimension];
      if(typeof d.y0 !== 'undefined'){
        return Math.abs(axis(d.y0) - axis(d.y0 + d.y));
      }else {
        return Math.abs(axis(d[axis.$key]) - axis(0));
      }
    };

    var useContinuousPosition = function(dimension, d) {
      var axis = this[dimension];
      var val;
      if(typeof d.y0 !== 'undefined'){
        if(dimension === 'y') {
          val = d.y0 + d.y;
          return  val < 0 ? axis(d.y0) : axis(val);
        } else {
          val = (d.y0 + d.y) - Math.max(0, d.y);
          return axis(val);
        }
      } else {
        if(dimension === 'y') {
          return d[axis.$key] < 0 ? axis(0) : axis(d[axis.$key]);
        } else {
          val = d[axis.$key] - Math.max(0, d[axis.$key]);
          return axis(val);
        }
      }
    };

    return {
      accessors: {
        classes: function(d,i) {
          return 'bar fill item'+ i + ' ' + sign(d[this.valueKey]) + ' ' + d[this.y.$key];
        },

        height: function(d) {
          if(this.y.$scale === 'ordinal'){
            return useDiscreteSize.bind(this)('y');
          } else {
            return useContinuousSize.bind(this)('y', d);
          }
        },

        rx: 0,

        ry: 0,

        width: function(d) {
          if(this.x.$scale === 'ordinal'){
            return useDiscreteSize.bind(this)('x');
          } else {
            return useContinuousSize.bind(this)('x', d);
          }
        },

        x: function(d) {
          if(this.x.$scale === 'ordinal'){
            return useDiscretePosition.bind(this)('x', d);
          } else {
            return  useContinuousPosition.bind(this)('x', d);
          }
        },

        y: function(d) {
          if(this.y.$scale === 'ordinal'){
            return useDiscretePosition.bind(this)('y', d);
          } else {
            return useContinuousPosition.bind(this)('y', d);
          }
        }
      },

      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var group = this.svg.select('.' + name).selectAll('.group')
          .data(data)
          .enter().append('g')
          .attr('class', function(d,i) {
            return 'series'+ i + ' ' +  this.y.$key;
          }.bind(this));

        var rect = group.selectAll('rect')
          .data(function(d) {
            return d.values;
          }.bind(this));

        rect.enter().append('rect')
          .attr('class', scope.accessors.classes.bind(this))
          .attr('x', scope.accessors.x.bind(this))
          .attr('rx', d4.functor(scope.accessors.rx).bind(this)())
          .attr('y', scope.accessors.y.bind(this))
          .attr('ry', d4.functor(scope.accessors.ry).bind(this)())
          .attr('width', scope.accessors.width.bind(this))
          .attr('height', scope.accessors.height.bind(this));
        return rect;
      }
    };
  });
}).call(this);

(function() {
  /*!
   * global d3: false
   * global d4: false
   */

  'use strict';
  d4.feature('trendLine', function(name) {
    return {
      accessors: {
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
        },

        text: function(d) {
          return d3.format('').call(this, d[1]);
        },

        textX: function() {
          return this.x(this.width);
        },

        textY: function(){
          return this.x(this.height);
        }
      },
      render: function(scope) {
        var defs = this.svg.select('defs');

        defs.append('marker')
          .attr('id', name + '-start')
          .attr('viewBox', '0 0 10 10')
          .attr('refX', 10)
          .attr('refY', 5)
          .attr('markerWidth', -6)
          .attr('markerHeight', 6)
          .attr('orient', 'auto')
          .append('path')
          .attr('d', 'M 0 0 L 10 5 L 0 10 z');

        this.featuresGroup.append('g').attr('class', name);
        var trendLine = this.svg.select('.' + name)
          .append('line')
          .attr('class', 'line')
          .attr('x1', scope.accessors.x1.bind(this))
          .attr('x2', scope.accessors.x2.bind(this))
          .attr('y1', scope.accessors.y1.bind(this))
          .attr('y2', scope.accessors.y2.bind(this))
          .attr('marker-end', 'url(#' + name + '-start)');

        this.svg.select('.' + name)
          .append('text')
          .attr('class', 'trendLine-label')
          .text(scope.accessors.text.bind(this))
          .attr('x', scope.accessors.textX.bind(this))
          .attr('y', scope.accessors.textY.bind(this));
        return trendLine;
      }
    };
  });
}).call(this);

(function() {
  'use strict';
  /*!
   * global d3: false
   * global d4: false
   */

/*
 * Waterfall connectors are orthogonal series connectors which visually join
 * column series together by spanning the top or bottom of adjacent columns.
 *
 * When using this feature in charts other than waterfall, be aware that the
 * mixin expects an accessor property for `orientation`, which it uses to render
 * the direction of the lines.
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
        x: function(d) {
          if(this.x.$scale === 'linear'){
            var width = 0;
            var xVal = (d.y0 + d.y) - Math.max(0, d.y);
            if(d.y > 0){
              width = Math.abs(this.x(d.y0) - this.x(d.y0 + d.y));
            }
            return this.x(xVal) + width;
          } else {
            return this.x(d[this.x.$key]);
          }
        },

        y: function(d) {
          if(this.x.$scale === 'linear'){
            return this.y(d[this.y.$key]);
          } else {
            return this.y(d.y0 + d.y);
          }
        },

        span: function(){
          if(this.x.$scale === 'linear'){
            return this.y.rangeBand();
          } else {
            return this.x.rangeBand();
          }
        },

        classes : function(d, i){
          return 'series' +i;
        }
      },

      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var lines = this.svg.select('.' + name).selectAll('.' + name).data(function(d) {
          return d.map(function(o) {
            return o.values[0];
          });
        }.bind(this));
        lines.enter().append('line');
        lines.exit().remove();
        lines
        .attr('class', scope.accessors.classes.bind(this))
        .attr('x1', function(d, i) {
          if(i === 0){
            return 0;
          }
          return scope.accessors.x.bind(this)(data[i - 1].values[0]);
        }.bind(this))

        .attr('y1', function(d, i) {
          if(i === 0){
            return 0;
          }
          return scope.accessors.y.bind(this)(data[i - 1].values[0]);
        }.bind(this))

        .attr('x2', function(d, i) {
          if(i === 0){
            return 0;
          }
          if(this.x.$scale === 'ordinal') {
            return scope.accessors.x.bind(this)(d) + scope.accessors.span.bind(this)();
          } else {
            return scope.accessors.x.bind(this)(data[i - 1].values[0]);
          }
        }.bind(this))

        .attr('y2', function(d, i) {
          if(i === 0){
            return 0;
          }
          if(this.x.$scale === 'ordinal') {
            return scope.accessors.y.bind(this)(data[i - 1].values[0]);
          }else {
            return scope.accessors.y.bind(this)(d) + scope.accessors.span.bind(this)(d);
          }
        }.bind(this));

        return lines;
      }
    };
  });
}).call(this);

(function() {
  /*!
   * global d3: false
   * global d4: false
   */

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
      .tickSize(0);

    var textRect = function(text, klasses) {
      var rect = d4.helpers.textSize(text, klasses);
      rect.text = text;
      return rect;
    };

    var positionText = function(obj, aligned, klass) {
      if (obj.text) {
        var axis = this.svg.selectAll('.x.axis');
        var axisBB = axis.node().getBBox();
        var textHeight = obj.height * 0.8;
        var text = axis.append('text')
          .text(obj.text)
          .attr('class', '' + klass);

        if (aligned.toLowerCase() === 'bottom') {
          text.attr('transform', 'translate(0,' + (axisBB.height + textHeight) + ')');
        } else {
          text.attr('transform', 'translate(0,' + (axisBB.y - (textHeight/2)) + ')');
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
        stagger: true,
        subtitle: undefined,
        title: undefined,
        align: 'bottom'
      },
      proxies: [axis],

      render: function(scope) {
        scope.scale(this.x);
        var title = textRect(d4.functor(scope.accessors.title).bind(this)(), 'title');
        var subtitle = textRect(d4.functor(scope.accessors.subtitle).bind(this)(), 'subtitle');
        var aligned = d4.functor(scope.accessors.align).bind(this)();
        var group = this.featuresGroup.append('g').attr('class', 'x axis ' + name)
          .call(axis);
        alignAxis.bind(this)(aligned, group);
        if (d4.functor(scope.accessors.stagger).bind(this)()) {

          // FIXME: This should be moved into a helper injected using DI.
          group.selectAll('.tick text').call(d4.helpers.staggerTextVertically, 1);
        }
        if(aligned === 'top') {
          positionText.bind(this)(subtitle, aligned, 'subtitle');
          positionText.bind(this)(title, aligned, 'title');
        } else {
          positionText.bind(this)(title, aligned, 'title');
          positionText.bind(this)(subtitle, aligned, 'subtitle');
        }
      }
    };

    //d4.createAccessorProxy(obj, axis);
    return obj;
  });
}).call(this);

(function() {
  /*!
   * global d3: false
   * global d4: false
   */

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
  /*!
   * FIXME: There is a lot of similarity between the x and y axis features, it would be
   * great to combine these two.
   */
  d4.feature('yAxis', function(name) {
    var axis = d3.svg.axis()
    .orient('left')
    .tickSize(0);

    var textRect = function(text, klasses) {
      var rect = d4.helpers.textSize(text, klasses);
      rect.text = text;
      return rect;
    };

    var positionText = function(obj, aligned, klass) {
      if (obj.text) {
        var axis = this.svg.selectAll('.y.axis');
        var axisBB = axis.node().getBBox();
        var textHeight = obj.height * 0.8;
        var text = axis.append('text')
          .text(obj.text)
          .attr('class', '' + klass);

        if (aligned.toLowerCase() === 'left') {
          text.call(d4.helpers.rotateText('rotate(' + 90 + ')translate(0,'+ (Math.abs(axisBB.x) + textHeight)+')'));
        } else {
          text.call(d4.helpers.rotateText('rotate(' + 90 + ')translate(0,'+ (Math.abs(axisBB.x) - (axisBB.width + textHeight))+')'));
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
        stagger: true,
        subtitle: undefined,
        title: undefined,
        align: 'left'
      },
      proxies: [axis],
      render: function(scope) {
        scope.scale(this.y);
        var title = textRect(d4.functor(scope.accessors.title).bind(this)(), 'title');
        var subtitle = textRect(d4.functor(scope.accessors.subtitle).bind(this)(), 'subtitle');
        var aligned = d4.functor(scope.accessors.align).bind(this)();
        var group = this.featuresGroup.append('g').attr('class', 'y axis ' + name)
          .call(axis);
        group.selectAll('.tick text')
        .call(d4.helpers.wrapText, this.margin[aligned]);
        alignAxis.bind(this)(aligned, group);

        if (d4.functor(scope.accessors.stagger).bind(this)()) {

          // FIXME: This should be moved into a helper injected using DI.
          this.svg.selectAll('.y.axis .tick text').call(d4.helpers.staggerTextHorizontally, -1);
        }
        if(aligned === 'left') {
          positionText.bind(this)(title, aligned, 'title');
          positionText.bind(this)(subtitle, aligned, 'subtitle');
        } else {
          positionText.bind(this)(subtitle, aligned, 'subtitle');
          positionText.bind(this)(title, aligned, 'title');
        }

      }
    };
    //d4.createAccessorProxy(obj.accessors, axis);
    return obj;
  });
}).call(this);

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

(function() {
  /*! global d3: false */
  /*! global d4: false */
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
      opts[dim].key = d4.functor(funct)();
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
  });
}).call(this);

(function() {
  /*! global d3: false */
  /*! global d4: false */
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

    var stackByDimension = function(key, items) {
      var lastOffset = 0;
      var noNaN = function(num){
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
          if(isNaN(y)){
            if(isNaN(y0)){
              y0 = lastOffset;
            }
            d.y0 = 0;
            d.y = y0;
            d[opts.value.key] = y0;
            lastOffset = y0;
          } else {
            if(isNaN(y0)){
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

      stackByDimension(opts.x.key, opts.data);
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

(function() {
  /*!
   * global d3: false
   * global d4: false
   */
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

  /**
   *
   * Creates a linear scale for a dimension of a given chart.
   * @name linearScaleForNestedData
   * @param {Object} d4 chart object
   * @param {Array} data array
   * @param {string} string represnting a dimension e.g. `x`,`y`.
   * @returns {Object} Chart scale object
   */
  d4.builder('linearScaleForNestedData', function(chart, data, dimension) {
    var key = chart[dimension].$key;
    var ext = d3.extent(d3.merge(data.map(function(obj) {
      return d3.extent(obj.values, function(d) {
        return d[key] + (d.y0 || 0);
      });
    })));
    var axis = chart[dimension];
    if(!axis.domain.$dirty) {
      axis.domain([Math.min(axis.$min || 0, ext[0]), axis.$max || ext[1]]);
    }
    if(!axis.range.$dirty) {
      axis.range(rangeFor(chart, dimension));
    }
    if(!axis.clamp.$dirty) {
      axis.clamp(true);
    }
    return chart[dimension].nice();
  });

  /**
   * Creates an ordinal scale for a dimension of a given chart.
   * @name ordinalScaleForNestedData
   * @param {Object} d4 chart object
   * @param {Array} data array
   * @param {string} string represnting a dimension e.g. `x`,`y`.
   * @returns {Object} Chart scale object
   */
  d4.builder('ordinalScaleForNestedData', function(chart, data, dimension) {
    var parsedData = extractValues(data, chart[dimension].$key);
    var bands = chart[dimension + 'RoundBands'] = chart[dimension + 'RoundBands'] || 0.3;
    var axis = chart[dimension];
    if(!axis.domain.$dirty) {
      axis.domain(parsedData);
    }
    if(!axis.rangeRoundBands.$dirty) {
      axis.rangeRoundBands(rangeFor(chart, dimension), bands);
    }
    return axis;
  });
}).call(this);
