/*! d4 - v0.1.0
 *  License: MIT Expat
 *  Date: 2014-02-13
 */
/* global d3: false */

//  Functions "each", "extend", and "isFunction" based on Underscore.js 1.5.2
//  http://underscorejs.org
//  (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//  Underscore may be freely distributed under the MIT license.
/*
  API:
  var columnChart = d4.columnChart()
    .margin({
      top: 15,
      right: 10,
      bottom: 30,
      left: 0
    })
    .mixin({
      'grid': d4.features.grid
    }, 0)
    .using('bars', function(bars){
      bars
      .x(function(d){
        cumulativeX += d[0];
        return this.x(cumulativeX - d[0]);
      })
      .width(function(d){
        return this.x(d[0]);
      })
    })

  d3.select(e[0])
    .datum(preparedValues)
    .call(columnChart);
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

  d4.features = {};
  d4.parsers = {};

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

  var isFunction = function(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
  };

  var assert = function(message) {
    throw new Error('[d4] ' + message);
  };

  var validateBuilder = function(builder){
    each(['configure', 'render'], function(funct){
      if(!builder[funct] || !isFunction(builder[funct])) {
        assert('the supplied builder does not have a '+ funct +' function');
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
    if(!defaultBuilder){
      assert('no builder defined');
    }
    var opts = d4.merge({
      width: 400,
      height: 400,
      features: {},
      mixins: [],
      xKey : function() {
        return 'x';
      },
      yKey : function() {
        return 'y';
      },
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    }, config);
    assignDefaultBuilder.bind(opts)(defaultBuilder);
    opts.accessors = ['margin', 'width', 'height', 'x', 'y', 'xKey', 'yKey'].concat(config.accessors || []);
    return opts;
  };

  var build = function(data) {
    if (this.builder) {
      this.builder.configure(data);
      this.builder.render(data);
    } else {
      assert('no builder defined');
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

  var applyScaffold = function(opts) {
    return function(selection) {
      selection.each(function(data) {
        scaffoldChart.bind(opts, this)(data);
        build.bind(opts)(data);
      });
    };
  };

  // Specify the feature to mixin.
  // `index` is optional and will place a mixin at a specific 'layer.'
  d4.mixin = function(feature, index) {
    if (!feature) {
      assert('you need to supply an object to mixin.');
    }
    var name = d3.keys(feature)[0];
    feature[name] = feature[name](name);
    d4.extend(this.features, feature);
    if(typeof index !== 'undefined'){
      index = Math.max(Math.min(index, this.mixins.length),0);
      this.mixins.splice(index, 0, name);
    } else {
      this.mixins.push(name);
    }

    var accessors = this.features[name].accessors;
    if (accessors) {
      d3.keys(accessors).forEach(function(functName) {
        this.features[name][functName] = function(attr) {
          if (!arguments.length) {
            return this.features[name].accessors[functName];
          }
          this.features[name].accessors[functName] = attr;
          return this.features[name];
        }.bind(this);
      }, this);
    }
  };

  d4.mixout = function(name) {
    delete this.features[name];
    this.mixins = this.mixins.filter(function(val){ return val !== name; });
  };

  d4.using = function(name, funct) {
    var feature = this.features[name];
    if (!feature) {
      assert('Could not find feature: "' + name + '"');
    } else {
      funct.bind(this)(feature);
    }
  };

  d4.baseChart = function(config, defaultBuilder) {
    var opts = assignDefaults(config, defaultBuilder);
    var chart = applyScaffold(opts);

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

    chart.using = function(name, funct) {
      d4.using.bind(opts)(name, funct);
      return chart;
    };

    chart.mixin = function(feature, index) {
      d4.mixin.bind(opts)(feature, index);
      return chart;
    };

    chart.mixout = function(feature, index) {
      d4.mixout.bind(opts)(feature, index);
      return chart;
    };

    chart.builder = function(funct) {
      funct.bind(chart)(opts);
      return chart;
    };

    chart.features = function() {
      return opts.mixins;
    };

    chart.svg = function(funct) {
      funct(opts.svg);
      return chart;
    };

    return chart;
  };

  d4.merge = function(options, overrides) {
    return d4.extend(d4.extend({}, options), overrides);
  };

  d4.extend = function(obj) {
    each(Array.prototype.slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

}).call(this);

(function() {
  /* global d3: false */
  /* global d4: false */
  'use strict';

  var columnChartBuilder = function() {
    var configureX = function(data) {
      if (!this.parent.x) {
        this.parent.xRoundBands = this.parent.xRoundBands || 0.3;
        this.parent.x = d3.scale.ordinal()
          .domain(data.map(function(d) {
            return d[0];
          }))
          .rangeRoundBands([0, this.parent.width - this.parent.margin.left - this.parent.margin.right], this.parent.xRoundBands);
      }
    };

    var configureY = function(data) {
      if (!this.parent.y) {
        this.parent.y = d3.scale.linear()
          .domain(d3.extent(data, function(d) {
            return d[1];
          }));
      }
      this.parent.y.range([this.parent.height - this.parent.margin.top - this.parent.margin.bottom, 0])
        .clamp(true)
        .nice();
    };

    var configureScales = function(data) {
      configureX.bind(this)(data);
      configureY.bind(this)(data);
    };

    var builder = {
      configure: function(data) {
        configureScales.bind(this)(data);
      },
      render: function(data) {
        var parent = this.parent;
        parent.mixins.forEach(function(name) {
          parent.features[name].render.bind(parent)(parent.features[name], data);
        });
      }
    };

    builder.parent = this;
    return builder;
  };

  d4.columnChart = function columnChart() {
    var chart = d4.baseChart({}, columnChartBuilder);
    [{
      'bars': d4.features.columnSeries
    }, {
      'barLabels': d4.features.columnLabels
    }, {
      'xAxis': d4.features.xAxis
    }, {
      'yAxis': d4.features.yAxis
    }].forEach(function(feature) {
      chart.mixin(feature);
    });
    return chart;
  };
}).call(this);

(function() {
  /* global d3: false */
  /* global d4: false */
  'use strict';

  // This accessor is meant to be overridden
  var countGroups = function(){
    return 1;
  };

  var groupedColumnChartBuilder = function() {
    var configureX = function(data) {
      if (!this.parent.x) {
        this.parent.xRoundBands = this.parent.xRoundBands || 0.3;
        this.parent.x = d3.scale.ordinal()
          .domain(data.map(function(d) {
            return d.x;
          }))
          .rangeRoundBands([0, this.parent.width - this.parent.margin.left - this.parent.margin.right], this.parent.xRoundBands);
      }
    };

    var configureY = function(data) {
      if (!this.parent.y) {
        this.parent.y = d3.scale.linear()
          .domain(d3.extent(data, function(d) {
            return d[this.yKey()];
          }));
      }
      this.parent.y.range([this.parent.height - this.parent.margin.top - this.parent.margin.bottom, 0])
        .clamp(true)
        .nice();
    };

    var configureScales = function(data) {
      configureX.bind(this)(data);
      configureY.bind(this)(data);
    };

    var builder = {
      configure: function(data) {
        configureScales.bind(this)(data);
      },

      render: function(data) {
        var parent = this.parent;
        parent.mixins.forEach(function(name) {
          parent.features[name].render.bind(parent)(parent.features[name], data);
        });
      }
    };

    builder.parent = this;
    return builder;
  };

  d4.groupedColumnChart = function groupedColumnChart() {
    var chart = d4.baseChart({
      accessors: ['countGroups'],
      countGroups: countGroups
    }, groupedColumnChartBuilder);
    [{
      'bars': d4.features.groupedColumnSeries
    }, {
      'columnLabels': d4.features.groupedColumnLabels
    }, {
      'xAxis': d4.features.xAxis
    }, {
      'yAxis': d4.features.yAxis
    }].forEach(function(feature) {
      chart.mixin(feature);
    });
    return chart;
  };
}).call(this);

(function() {
  /* global d3: false */
  /* global d4: false */
  'use strict';

  var lineChartBuilder = function() {
    var mapDomain = function(data, index) {
      var domain = [];
      data.map(function(d) {
        return d.values.map(function(v) {
          domain.push(v[index]);
        });
      });
      return d3.extent(domain);
    };

    var configureX = function(data) {
      if (!this.parent.x) {

        this.parent.x = d3.time.scale(this.parent.x)
          .domain(mapDomain(data, 0))
          .nice()
          .clamp(true);
      }
      this.parent.x.range([0, this.parent.width - this.parent.margin.left - this.parent.margin.right]);
    };

    var configureY = function(data) {
      if (!this.parent.y) {
        this.parent.y = d3.scale.linear()
          .domain(mapDomain(data, 1));
      }
      this.parent.y.range([this.parent.height - this.parent.margin.top - this.parent.margin.bottom, 0]);
    };

    var configureScales = function(data) {
      configureX.bind(this)(data);
      configureY.bind(this)(data);
    };

    var builder = {
      configure: function(data) {
        configureScales.bind(this)(data);
      },
      render: function(data) {
        var parent = this.parent;
        parent.mixins.forEach(function(name) {
          parent.features[name].render.bind(parent)(parent.features[name], data);
        });
      }
    };

    builder.parent = this;
    return builder;
  };

  d4.lineChart = function lineChart() {
    var chart = d4.baseChart({}, lineChartBuilder);
    [{
      'linesSeries': d4.features.lineSeries
    },{
      'linesSeriesLabels': d4.features.lineSeriesLabels
    }, {
      'xAxis': d4.features.xAxis
    }, {
      'yAxis': d4.features.yAxis
    }].forEach(function(feature) {
      chart.mixin(feature);
    });
    return chart;
  };
}).call(this);
(function() {
  /* global d3: false */
  /* global d4: false */
  'use strict';

  var rowChartBuilder = function() {
    var configureX = function(data) {
      if (!this.parent.x) {
        this.parent.x = d3.scale.linear()
          .domain(d3.extent(data, function(d) {
            return d[0];
          }));
      }
      this.parent.x.range([0, this.parent.width - this.parent.margin.right - this.parent.margin.left])
      .clamp(true)
      .nice();
    };

    var configureY = function(data) {
      if (!this.parent.y) {
        this.parent.yRoundBands = this.parent.yRoundBands || 0.3;
        this.parent.y = d3.scale.ordinal()
          .domain(data.map(function(d) {
            return d[1];
          }))
          .rangeRoundBands([0, this.parent.height - this.parent.margin.top - this.parent.margin.bottom], this.parent.yRoundBands);
      }
    };

    var configureScales = function(data) {
      configureX.bind(this)(data);
      configureY.bind(this)(data);
    };

    var builder = {
      configure: function(data) {
        configureScales.bind(this)(data);
      },
      render: function(data) {
        var parent = this.parent;
        parent.mixins.forEach(function(name) {
          parent.features[name].render.bind(parent)(parent.features[name], data);
        });
      }
    };

    builder.parent = this;
    return builder;
  };

  d4.rowChart = function rowChart() {
    var chart = d4.baseChart({}, rowChartBuilder);
    [{
      'bars': d4.features.rowSeries
    }, {
      'rowLabels': d4.features.rowLabels
    }, {
      'xAxis': d4.features.xAxis
    }, {
      'yAxis': d4.features.yAxis
    }].forEach(function(feature) {
      chart.mixin(feature);
    });
    return chart;
  };
}).call(this);
(function() {
  /* global d3: false */
  /* global d4: false */
  'use strict';

  var scatterPlotBuilder = function() {
    var configureX = function(data) {
      if (!this.parent.x) {
        d3.scale.linear()
          .domain(data.map(function(d) {
            return d[0];
          }))
          .nice()
          .clamp(true);
      }
      this.parent.x.range([0, this.parent.width - this.parent.margin.left - this.parent.margin.right]);
    };

    var configureY = function(data) {
      if (!this.parent.y) {
        this.parent.y = d3.scale.linear()
          .domain(data.map(function(d) {
            return d[1];
          }))
          .nice()
          .clamp(true);
      }
      this.parent.y.range([this.parent.height - this.parent.margin.top - this.parent.margin.bottom, 0]);
    };

    var configureZ = function(data) {
      if (!this.parent.z) {
        this.parent.z = d3.scale.linear()
          .domain(data.map(function(d) {
            return d[2];
          }))
          .nice()
          .clamp(true);

      }
      var maxSize = (this.parent.height - this.parent.margin.top - this.parent.margin.bottom);
      this.parent.z.range([maxSize / data.length, maxSize / (data.length * 5)]);
    };
    var configureScales = function(data) {
      configureX.bind(this)(data);
      configureY.bind(this)(data);
      configureZ.bind(this)(data);
    };

    var builder = {
      configure: function(data) {
        configureScales.bind(this)(data);
      },
      render: function(data) {
        var parent = this.parent;
        parent.mixins.forEach(function(name) {
          parent.features[name].render.bind(parent)(parent.features[name], data);
        });
      }
    };

    builder.parent = this;
    return builder;
  };

  d4.scatterPlot = function() {
    var chart = d4.baseChart({
      accessors: ['z']
    }, scatterPlotBuilder);
    [{
      'scatterSeries': d4.features.scatterSeries
    }, {
      'xAxis': d4.features.xAxis
    }, {
      'yAxis': d4.features.yAxis
    }].forEach(function(feature) {
      chart.mixin(feature);
    });
    return chart;
  };
}).call(this);

(function() {
  /* global d3: false */
  /* global d4: false */
  'use strict';

  var stackedColumnChartBuilder = function() {
    var configureX = function(data) {
      if (!this.parent.x) {
        this.parent.xRoundBands = this.parent.xRoundBands || 0.3;
        this.parent.x = d3.scale.ordinal()
          .domain(data.map(function(d) {
            return d.x;
          }))
          .rangeRoundBands([0, this.parent.width - this.parent.margin.left - this.parent.margin.right], this.parent.xRoundBands);
      }
    };

    var configureY = function(data) {
      if (!this.parent.y) {
        this.parent.y = d3.scale.linear()
          .domain(d3.extent(data, function(d) {
            return d[1];
          }));
      }
      this.parent.y.range([this.parent.height - this.parent.margin.top - this.parent.margin.bottom, 0])
        .clamp(true)
        .nice();
    };

    var configureScales = function(data) {
      configureX.bind(this)(data);
      configureY.bind(this)(data);
    };

    var builder = {
      configure: function(data) {
        configureScales.bind(this)(data);
      },

      render: function(data) {
        var parent = this.parent;
        parent.mixins.forEach(function(name) {
          parent.features[name].render.bind(parent)(parent.features[name], data);
        });
      }
    };

    builder.parent = this;
    return builder;
  };

  d4.stackedColumnChart = function stackedColumnChart() {
    var chart = d4.baseChart({}, stackedColumnChartBuilder);
    [{
      'bars': d4.features.stackedColumnSeries
    }, {
      'columnLabels': d4.features.stackedColumnLabels
    }, {
      'connectors': d4.features.stackedColumnConnectors
    }, {
      'xAxis': d4.features.xAxis
    }, {
      'yAxis': d4.features.yAxis
    }].forEach(function(feature) {
      chart.mixin(feature);
    });
    return chart;
  };
}).call(this);

(function() {
  /* global d3: false */
  /* global d4: false */
  'use strict';

  var waterfallChartBuilder = function() {
    var configureX = function(data) {
      if (!this.parent.x) {
        this.parent.xRoundBands = this.parent.xRoundBands || 0.3;
        this.parent.x = d3.scale.ordinal()
          .domain(data.map(function(d) {
            return d.x;
          }))
          .rangeRoundBands([0, this.parent.width - this.parent.margin.left - this.parent.margin.right], this.parent.xRoundBands);
      }
    };

    var configureY = function(data) {
      if (!this.parent.y) {
        this.parent.y = d3.scale.linear()
          .domain(d3.extent(data, function(d) {
            return d[1];
          }));
        this.parent.y.range([this.parent.height - this.parent.margin.top - this.parent.margin.bottom, 0])
          .clamp(true)
          .nice();
      }
    };

    var configureScales = function(data) {
      configureX.bind(this)(data);
      configureY.bind(this)(data);
    };

    var builder = {
      configure: function(data) {
        configureScales.bind(this)(data);
      },

      render: function(data) {
        var parent = this.parent;
        parent.mixins.forEach(function(name) {
          parent.features[name].render.bind(parent)(parent.features[name], data);
        });
      }
    };

    builder.parent = this;
    return builder;
  };

  d4.waterfallChart = function waterfallChart() {
    var chart = d4.baseChart({}, waterfallChartBuilder);
    [{
      'bars': d4.features.stackedColumnSeries
    },{
      'connectors': d4.features.waterfallConnectors
    }, {
      'columnLabels': d4.features.stackedColumnLabels
    }, {
      'xAxis': d4.features.xAxis
    }, {
      'yAxis': d4.features.yAxis
    }].forEach(function(feature) {
      chart.mixin(feature);
    });
    return chart;
  };
}).call(this);

/* global d4: false */
(function() {
  'use strict';
  d4.features.arrow = function(name) {
    return {
      accessors: {
        tipSize: function(){
          return 6;
        },
        x1: function() {
          return this.x(0);
        },

        x2: function() {
          return this.x(this.width - this.margin.left - this.margin.right);
        },

        y1: function() {
          return this.y(0);
        },

        y2: function() {
          return  this.y(this.height - this.margin.top - this.margin.bottom);
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
          .attr('class', 'line')
          .attr('x1', scope.accessors.x1.bind(this))
          .attr('x2', scope.accessors.x2.bind(this))
          .attr('y1', scope.accessors.y1.bind(this))
          .attr('y2', scope.accessors.y2.bind(this))
          .attr('marker-end', 'url(#' + name + '-end)');

        return arrow;
      }
    };
  };
}).call(this);

/* global d4: false */
(function() {
  'use strict';
  d4.features.columnLabels = function(name) {
    return {
      accessors: {
        x: function(d) {
          return this.x(d[0]) + (this.x.rangeBand() / 2);
        },

        y: function(d) {
          return d[1] < 0 ? this.y(d[1]) + 10 : this.y(d[1]) - 5;
        },

        text: function(d) {
          return d3.format('').call(this, d[1]);
        }
      },
      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var label = this.svg.select('.'+name).selectAll('.'+name).data(data);
        label.enter().append('text');
        label.exit().remove();
        label.attr('class', 'column-label')
          .text(scope.accessors.text.bind(this))
          .attr('x', scope.accessors.x.bind(this))
          .attr('y', scope.accessors.y.bind(this));
        return label;
      }
    };
  };
}).call(this);

/* global d4: false */
/*

  DEPRECATION WARNING: This feature is deprecated in favor of using the nested
  column series renderer. Intrinsicly this makes sense because a normal column
  chart is mearly a stacked column chart with only one series.
*/
(function() {
  'use strict';
  d4.features.columnSeries = function(name) {
    var isArray = function(val) {
      return (val) instanceof Array;
    };

    // A column series needs to be three arrays deep eg:
    // [
    //  [ "series 1", [1,2,3]],
    //  [ "series 2", [3,5,6]]
    // ]
    // In the cases where a single multi-dimensional array is provided we will
    // assume they are not supplying the outer series array, in which case we
    // wrap the data in an array and return it.
    var ensureSeriesArray = function(data) {
      if (isArray(data) && isArray(data[0]) && isArray(data[0][1])) {
        return data;
      } else {
        return [data];
      }
    };

    return {
      accessors: {
        x: function(d) {
          return this.x(d[0]);
        },

        y: function(d) {
          return d[1] < 0 ? this.y(0) : this.y(d[1]);
        },

        width: function() {
          return this.x.rangeBand();
        },

        height: function(d) {
          return Math.abs(this.y(d[1]) - this.y(0));
        },

        classes: function(d, i) {
          return d[1] < 0 ? 'bar negative fill series' + i : 'bar positive fill series' + i;
        }
      },
      render: function(scope, data) {
        ensureSeriesArray(data);
        this.featuresGroup.append('g').attr('class', name);
        var series = this.svg.select('.' + name).selectAll('.' + name + 'Series').data(data);
        series.enter().append('g');
        series.exit().remove();
        series.attr('class', function(d, i) {
          return 'series' + i;
        });

        var bar = series.selectAll('rect').data(function(d) {
          return [d];
        });
        bar.enter().append('rect');
        bar.exit().remove();
        bar.attr('class', scope.accessors.classes.bind(this))
          .attr('x', scope.accessors.x.bind(this))
          .attr('y', scope.accessors.y.bind(this))
          .attr('width', scope.accessors.width.bind(this))
          .attr('height', scope.accessors.height.bind(this));

        return bar;
      }
    };
  };
}).call(this);

/* global d4: false */
(function() {
  'use strict';
  d4.features.grid = function(name) {

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
          .attr('width', this.width - this.margin.left - this.margin.right)
          .attr('height', this.height - this.margin.top - this.margin.bottom);

        this.featuresGroup.append('g').attr('class', 'x grid '+ name)
          .attr('transform', 'translate(0,' + (this.height - this.margin.top - this.margin.bottom) + ')')
          .call(formattedXAxis
          .tickSize(-(this.height - this.margin.top - this.margin.bottom), 0, 0)
          .tickFormat(''));

        this.featuresGroup.append('g').attr('class', 'y grid '+ name)
          .attr('transform', 'translate(0,0)')
          .call(formattedYAxis
          .tickSize(-(this.width - this.margin.left - this.margin.right), 0, 0)
          .tickFormat(''));
      }
    };
  };
}).call(this);
/* global d4: false */
(function() {
  'use strict';
  d4.features.groupedColumnLabels = function(name) {
    return {
      accessors: {
        x: function(d, i) {
          var width = this.x.rangeBand() / this.countGroups();
          var xPos = this.x(d[this.xKey()]) + width * i;
          var gutter = width * 0.1;
          return xPos + width/2 - gutter;
        },

        y: function(d) {
          return (d[this.yKey()] < 0 ? this.y(0) : this.y(d[this.yKey()])) -5;
        },

        text: function(d) {
          return d3.format('').call(this, d[this.yKey()]);
        }
      },
      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var group = this.svg.select('.' + name).selectAll('.group')
          .data(data)
          .enter().append('g')
          .attr('class', function(d,i) {
            return 'series'+ i +  ' ' + this.xKey();
          }.bind(this));

        var text = group.selectAll('text')
          .data(function(d) {
            return d.values;
          }.bind(this));
        text.exit().remove();
        text.enter().append('text')
          .text(scope.accessors.text.bind(this))
          .attr('y', scope.accessors.y.bind(this))
          .attr('x', scope.accessors.x.bind(this));
      }
    };
  };
}).call(this);

/* global d4: false */
(function() {
  'use strict';
  d4.features.groupedColumnSeries = function(name) {
    var sign = function(val){
      return (val > 0) ? 'positive' : 'negative';
    };

    return {
      accessors: {
        x: function(d,i) {
          var width = this.x.rangeBand() / this.countGroups();
          var xPos = this.x(d[this.xKey()]) + width * i;
          return xPos;
        },

        y: function(d) {
          return d[this.yKey()] < 0 ? this.y(0) : this.y(d[this.yKey()]);
        },

        width: function() {
          var width = this.x.rangeBand() / this.countGroups();
          var gutter = width * 0.1;
          return width - gutter;
        },

        height: function(d) {
          return Math.abs(this.y(d[this.yKey()]) - this.y(0));
        },

        classes: function(d,i) {
          return 'bar fill item'+ i + ' ' + sign(d[this.yKey()]) + ' ' + d[this.yKey()];
        }
      },
      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var group = this.svg.select('.' + name).selectAll('.group')
          .data(data)
          .enter().append('g')
          .attr('class', function(d,i) {
            return 'series'+ i + ' ' + this.xKey();
          }.bind(this));

        group.selectAll('rect')
          .data(function(d) {
            return d.values;
          }.bind(this))
          .enter().append('rect')
          .attr('class', scope.accessors.classes.bind(this))
          .attr('x', scope.accessors.x.bind(this))
          .attr('y', scope.accessors.y.bind(this))
          .attr('width', scope.accessors.width.bind(this))
          .attr('height', scope.accessors.height.bind(this));
      }
    };
  };
}).call(this);

/* global d4: false */
(function() {
  'use strict';
  d4.features.lineSeriesLabels = function(name) {

    // Expects a data series in the following format:
    // [{name: 'series1', values:[[dateObject, number],...]}]
    return {
      accessors: {
        x: function(d) {
          return this.x(d.values[d.values.length - 1][0]);
        },

        y: function(d) {
          return this.y(d.values[d.values.length - 1][1]);
        },

        text: function(d) {
          return d.name;
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
          .attr('class', scope.accessors.classes.bind(this));
        return label;
      }
    };
  };
}).call(this);
/* global d4: false */
(function() {
  'use strict';
  d4.features.lineSeries = function(name) {
    return {
      accessors: {
        x: function(d) {
          return this.x(d[0]);
        },

        y: function(d) {
          return this.y(d[1]);
        },

        classes: function(d, n) {
          return 'line stroke series' + n;
        }
      },
      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var line = d3.svg.line()
          .x(scope.accessors.x.bind(this))
          .y(scope.accessors.y.bind(this));

        var lineSeries = this.svg.select('.'+name).selectAll('.'+name).data(data)
        .enter().append('path')
        .attr('d', function(d) {
          return line(d.values);
        })
        .attr('class', scope.accessors.classes.bind(this));
        return lineSeries;
      }
    };
  };
}).call(this);

/* global d4: false */
(function() {
  'use strict';
  d4.features.referenceLine = function(name) {
    return {
      accessors: {
        x1: function() {
          return this.x(0);
        },

        x2: function() {
          return this.x(this.width - this.margin.left - this.margin.right);
        },

        y1: function() {
          return this.y(0);
        },

        y2: function() {
          return this.y(this.height);
        }
      },
      render: function(scope) {
        this.featuresGroup.append('g').attr('class', name);
        var referenceLine = this.svg.select('.' + name)
          .append('line')
          .attr('class', 'line')
          .attr('x1', scope.accessors.x1.bind(this))
          .attr('x2', scope.accessors.x2.bind(this))
          .attr('y1', scope.accessors.y1.bind(this))
          .attr('y2', scope.accessors.y2.bind(this));
        return referenceLine;
      }
    };
  };
}).call(this);

/* global d4: false */
(function() {
  'use strict';
  d4.features.rowLabels = function(name) {
    return {
      accessors: {
        x: function(d) {
          return this.x(Math.min(0, d[0])) + Math.abs(this.x(d[0]) - this.x(0)) + 5;
        },

        y: function(d) {
          return this.y(d[1]) + (this.y.rangeBand() / 2);
        },

        text: function(d) {
          return d3.format('').call(this, d[0]);
        }
      },
      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var label = this.svg.select('.'+name).selectAll('.'+name).data(data);
        label.enter().append('text');
        label.exit().remove();
        label.attr('class', 'column-label')
          .text(scope.accessors.text.bind(this))
          .attr('x', scope.accessors.x.bind(this))
          .attr('y', scope.accessors.y.bind(this));
        return label;
      }
    };
  };
}).call(this);

/* global d4: false */
(function() {
  'use strict';
  d4.features.rowSeries = function(name) {
    return {
      accessors: {
        x: function(d) {
          return this.x(Math.min(0, d[0]));
        },

        y: function(d) {
          return this.y(d[1]);
        },

        height: function() {
          return this.y.rangeBand();
        },

        width: function(d) {
          return Math.abs(this.x(d[0]) - this.x(0));
        },

        classes: function(d, i) {
          return d[0] < 0 ? 'bar negative fill series' + i : 'bar positive fill series' + i;
        }
      },
      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var bar = this.svg.select('.'+name).selectAll('.'+name).data(data);
        bar.enter().append('rect');
        bar.exit().remove();
        bar.attr('class', scope.accessors.classes.bind(this))
          .attr('x', scope.accessors.x.bind(this))
          .attr('y', scope.accessors.y.bind(this))
          .attr('width', scope.accessors.width.bind(this))
          .attr('height', scope.accessors.height.bind(this));

        this.featuresGroup.append('g').attr('class', 'x zero ' + name)
        .append('line')
        .attr('class', 'line')
        .attr('x1', this.x(0))
        .attr('x2', this.x(0))
        .attr('y1', 0)
        .attr('y2', this.height);
        return bar;
      }
    };
  };
}).call(this);

/* global d4: false */
(function() {
  'use strict';
  d4.features.scatterSeries = function(name) {
    return {
      accessors: {
        cx: function(d) {
          return this.x(d.values[0]);
        },

        cy: function(d) {
          return this.y(d.values[1]);
        },

        r: function(d) {
          return this.z(d.values[2]);
        },

        classes : function(d, i) {
          return 'dot series' + i + ' fill';
        }
      },
      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var dot = this.svg.select('.'+name).selectAll('.'+name).data(data);
        dot.enter().append('circle');
        dot.attr('class', scope.accessors.classes.bind(this))
        .attr('r', scope.accessors.r.bind(this))
        .attr('cx', scope.accessors.cx.bind(this))
        .attr('cy', scope.accessors.cy.bind(this));

        return dot;
      }
    };
  };
}).call(this);

/* global d4: false */
(function() {

  /*
    Column connectors helpful when displaying a stacked column chart.
    A connector will not connect positve and negative columns. This is because
    in a stacked column a negative column may move many series below its previous
    location. This creates a messy collection of crisscrossing lines.
  */
  'use strict';
  d4.features.stackedColumnConnectors = function(name) {

    return {
      accessors: {
        x1: function(d) {
          var width = 0;
          var xVal = (d.y0 + d.y) - Math.max(0, d.y);
          if(d.y > 0){
            width = Math.abs(this.x(d.y0) - this.x(d.y0 + d.y));
          }
          return this.x(xVal) + width;

        },

        y1: function(d) {
          return this.y(d[this.yKey()]);
        },

        span: function(){
          return this.y.rangeBand();
        },

        classes : function(d, i){
          return 'series' +i;
        }
      },

      render: function(scope) {
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
        .attr('x1', function() {
          // if(i === 0){
          //   return 0;
          // }
          // return scope.accessors.x1.bind(this)(data[i - 1].values[0]);
        }.bind(this))

        .attr('y1', function() {
          // if(i === 0){
          //   return 0;
          // }
          // return scope.accessors.y1.bind(this)(data[i - 1].values[0]);
        }.bind(this))

        .attr('x2', function() {
          // if(i === 0){
          //   return 0;
          // }
          // return scope.accessors.x1.bind(this)(data[i - 1].values[0]);
        }.bind(this))

        .attr('y2', function() {
          // if(i === 0){
          //   return 0;
          // }
          // return scope.accessors.y1.bind(this)(d) + scope.accessors.span.bind(this)(d);
        }.bind(this));

        return lines;
      }
    };
  };
}).call(this);

/* global d4: false */
(function() {
  'use strict';
  d4.features.stackedColumnLabels = function(name) {
    var sign = function(val) {
      return val > 0 ? 'positive' : 'negative';
    };

    return {
      accessors: {
        x: function(d) {
          return this.x(d[this.xKey()]) + (this.x.rangeBand() / 2);
        },

        y: function(d) {
          var halfHeight = Math.abs(this.y(d.y0) - this.y(d.y0 + d.y)) / 2;
          var yVal = d.y0 + d.y;
          return yVal < 0 ? this.y(d.y0) - halfHeight : this.y(yVal) + halfHeight;
        },

        text: function(d) {
          return d3.format('').call(this, d.value);
        }
      },
      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var group = this.svg.select('.' + name).selectAll('.group')
          .data(data)
          .enter().append('g')
          .attr('class', function(d, i) {
            return 'series' + i + ' '+ sign(d.y) + ' ' + this.xKey();
          }.bind(this));

        var text = group.selectAll('text')
          .data(function(d) {
            return d.values;
          }.bind(this));
        text.exit().remove();
        text.enter().append('text')
          .text(scope.accessors.text.bind(this))
          .attr('y', scope.accessors.y.bind(this))
          .attr('x', scope.accessors.x.bind(this));
      }
    };
  };
}).call(this);

/* global d4: false */
(function() {
  'use strict';
  d4.features.stackedColumnSeries = function(name) {
    var sign = function(val){
      return (val > 0) ? 'positive' : 'negative';
    };

    return {
      accessors: {
        x: function(d) {
          return this.x(d[this.xKey()]);
        },

        y: function(d) {
          var yVal = d.y0 + d.y;
          return  yVal < 0 ? this.y(d.y0) : this.y(yVal);
        },

        width: function() {
          return this.x.rangeBand();
        },

        height: function(d) {
          return Math.abs(this.y(d.y0) - this.y(d.y0 + d.y));
        },

        classes: function(d,i) {
          return 'bar fill item'+ i + ' ' + sign(d.y) + ' ' + d[this.yKey()];
        }
      },
      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var group = this.svg.select('.' + name).selectAll('.group')
          .data(data)
          .enter().append('g')
          .attr('class', function(d,i) {
            return 'series'+ i + ' ' +  this.xKey();
          }.bind(this));

        group.selectAll('rect')
          .data(function(d) {
            return d.values;
          }.bind(this))
          .enter().append('rect')
          .attr('class', scope.accessors.classes.bind(this))
          .attr('x', scope.accessors.x.bind(this))
          .attr('y', scope.accessors.y.bind(this))
          .attr('width', scope.accessors.width.bind(this))
          .attr('height', scope.accessors.height.bind(this));
      }
    };
  };
}).call(this);

/* global d4: false */
(function() {
  'use strict';
  d4.features.trendLine = function(name) {
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
  };
}).call(this);

/* global d4: false */
(function() {

  /*
    Orthogonal Series Connectors connect column series together by using a
    line which bends only at 90 degrees. This connector type is most commonly
    seen in charts such as waterfalls.
  */
  'use strict';
  d4.features.waterfallConnectors = function(name) {

    return {
      accessors: {
        x1: function(d) {
          var width = 0;
          var xVal = (d.y0 + d.y) - Math.max(0, d.y);
          if(d.y > 0){
            width = Math.abs(this.x(d.y0) - this.x(d.y0 + d.y));
          }
          return this.x(xVal) + width;

        },

        y1: function(d) {
          return this.y(d[this.yKey()]);
        },

        span: function(){
          return this.y.rangeBand();
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
          return scope.accessors.x1.bind(this)(data[i - 1].values[0]);
        }.bind(this))

        .attr('y1', function(d, i) {
          if(i === 0){
            return 0;
          }
          return scope.accessors.y1.bind(this)(data[i - 1].values[0]);
        }.bind(this))

        .attr('x2', function(d, i) {
          if(i === 0){
            return 0;
          }
          return scope.accessors.x1.bind(this)(data[i - 1].values[0]);
        }.bind(this))

        .attr('y2', function(d, i) {
          if(i === 0){
            return 0;
          }
          return scope.accessors.y1.bind(this)(d) + scope.accessors.span.bind(this)(d);
        }.bind(this));

        return lines;
      }
    };
  };
}).call(this);

/* global d4: false */
(function() {
  'use strict';
  d4.features.xAxis = function(name) {
    return {
      accessors: {
        format: function(xAxis) {
          return xAxis.orient('bottom').tickSize(0);
        }
      },
      render: function(scope) {
        var xAxis = d3.svg.axis().scale(this.x);
        var formattedAxis = scope.accessors.format.bind(this)(xAxis);
        this.featuresGroup.append('g').attr('class', 'x axis '+ name)
          .attr('transform', 'translate(0,' + (this.height - this.margin.top - this.margin.bottom) + ')')
          .call(formattedAxis);
      }
    };
  };
}).call(this);

/* global d4: false */
(function() {
  'use strict';
  d4.features.yAxis = function(name) {

    // FIXME: This should be a util function
    // Extracted from: http://bl.ocks.org/mbostock/7555321
    var wrap = function(text, width) {
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

    return {
      accessors: {
        format: function(yAxis) {
          return yAxis.orient('left').tickSize(0);
        }
      },
      render: function(scope) {
        var yAxis = d3.svg.axis().scale(this.y);
        var formattedAxis = scope.accessors.format.bind(this)(yAxis);
        this.featuresGroup.append('g').attr('class', 'y axis ' + name)
          .attr('transform', 'translate(0,0)')
          .call(formattedAxis)
          .selectAll('.tick text')
          .call(wrap, this.margin.left);
      }
    };
  };
}).call(this);
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
    * data - is an array of items stacked by D3

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

(function() {
  /* global d3: false */
  /* global d4: false */
  'use strict';

  /**
    The waterfall parser is useful for waterfall charts where data items need to account
    for the position of earlier values:

    _____________________
    |   _        _______ |
    |  |_|___   | |  | | |
    |      |_|__|_|  | | |
    |                |_| |
    ----------------------

    This module makes use of the d3's "nest" data structure, and "stack" layout
    https://github.com/mbostock/d3/wiki/Arrays#-nest
    https://github.com/mbostock/d3/wiki/Stack-Layout


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
    * Supports horizontal or vertical waterfalls
    * Supports totaling series using a special "e" value in a data item.

    Limitations:
    * Does not support stacked waterfalls.

    Accessor Methods:
    * x : - function which returns a key to access the x values in the data array
    * y : - function which returns a key to access the y values in the data array
    * value : - function which returns a key to access the values in the data array.
    * data : array - An array of objects with their dimensions specified
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
    * data - is an array of items stacked by D3
    * value - an object with a key representing the value accessor and an array of values
    * x - an object with a key representing the x accessor and an array of values
    * y - an object with a key representing the y accessor and an array of values

  **/
  d4.parsers.waterfall = function waterfall() {

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
