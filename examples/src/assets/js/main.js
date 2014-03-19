'use strict';
$(document).ready(function() {
  window.gradientFactory = (function() {
    var _beginColor = {
      red: 0,
      green: 0,
      blue: 0
    };
    var _endColor = {
      red: 255,
      green: 255,
      blue: 255
    };
    var _colorStops = 24;
    var _colorKeys = ['red', 'green', 'blue'];
    var _rgbToHex = function(r, g, b) {
      return '#' + _byteToHex(r) + _byteToHex(g) + _byteToHex(b);
    };
    var _byteToHex = function(n) {
      var hexVals = '0123456789ABCDEF';
      return String(hexVals.substr((n >> 4) & 0x0F, 1)) + hexVals.substr(n & 0x0F, 1);
    };
    var _parseColor = function(color) {
      if ((color).toString() === '[object Object]') {
        return color;
      } else {
        color = (color.charAt(0) === '#') ? color.substring(1, 7) : color;
        return {
          red: parseInt((color).substring(0, 2), 16),
          green: parseInt((color).substring(2, 4), 16),
          blue: parseInt((color).substring(4, 6), 16)
        };
      }
    };
    var _generate = function(opts) {
      var _colors = [];
      var options = opts || {};
      var diff = {
        red: 0,
        green: 0,
        blue: 0
      };
      var len = _colorKeys.length;
      var pOffset = 0;
      if (typeof(options.from) !== 'undefined') {
        _beginColor = _parseColor(options.from);
      }
      if (typeof(options.to) !== 'undefined') {
        _endColor = _parseColor(options.to);
      }
      if (typeof(options.stops) !== 'undefined') {
        _colorStops = options.stops;
      }
      _colorStops = Math.max(1, _colorStops - 1);
      for (var x = 0; x < _colorStops; x++) {
        pOffset = parseFloat(x, 10) / _colorStops;
        for (var y = 0; y < len; y++) {
          diff[_colorKeys[y]] = _endColor[_colorKeys[y]] - _beginColor[_colorKeys[y]];
          diff[_colorKeys[y]] = (diff[_colorKeys[y]] * pOffset) + _beginColor[_colorKeys[y]];
        }
        _colors.push(_rgbToHex(diff.red, diff.green, diff.blue));
      }
      _colors.push(_rgbToHex(_endColor.red, _endColor.green, _endColor.blue));
      return _colors;
    };
    return {
      generate: _generate
    };
  }).call(this);

  // ensure our example code is always using the most recent source.
  $('#source_code').each(function(x, i) {
    $('#code').text($(i).html());
  });
});
