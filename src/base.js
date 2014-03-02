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

  // FIXME These namespaces should not be publicly explosed, instead
  // they should be assigned though a registration function.
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

  var assignDefaults = function(config, defaultBuilder) {
    if (!defaultBuilder) {
      err('No builder defined');
    }
    var opts = d4.merge({
      width: 400,
      height: 400,
      features: {},
      mixins: [],
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
    assignDefaultBuilder.bind(opts)(defaultBuilder);
    opts.accessors = ['margin', 'width', 'height', 'x', 'y', 'xKey', 'yKey', 'valueKey'].concat(config.accessors || []);
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
    var accessors = feature.accessors;
    if (accessors) {
      each(d3.keys(accessors), function(functName) {
        feature[functName] = function(attr) {
          if (!arguments.length) {
            return feature.accessors[functName];
          }
          feature.accessors[functName] = attr;
          return feature;
        }.bind(this);
      });
    }
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

  d4.baseChart = function(config, defaultBuilder) {
    var opts = assignDefaults(config, defaultBuilder);
    var chart = applyScaffold(opts);

    /*!
      FIXME: d4 wraps the inner property object `opts` in a series of class
    functions. For example: `chart.width(300)` will set the internal
    `opts.width` property to 300. Additionally chart.width() will return 300.
    However, this behavior creates ambiguity in API because it is unclear to the
    developer which accessors require functions and which can simply supply
    values. Ideally the API should support something like this:
    chart.xKey('foo') or chart.xKey(function(){ return 'foo'; })
    Presently only the latter is allowed, which is confusing.
    */
    chart.accessors = opts.accessors;
    chart.accessors.forEach(function(accessor) {
      chart[accessor] = function(attr) {
        if (!arguments.length) {
          return opts[accessor];
        }
        opts[accessor] = attr;
        return chart;
      };
    });

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
     *      var chart = d4.columnChart()
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
     * this method.
     *
     *##### Examples
     *
     *      // Mixout the yAxis which is provided as a default
     *      var chart = d4.columnChart()
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
