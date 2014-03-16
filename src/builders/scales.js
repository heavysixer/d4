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
