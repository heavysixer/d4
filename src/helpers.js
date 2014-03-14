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

}).call(this);
