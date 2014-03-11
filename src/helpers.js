(function() {
  /*!
   * global d3: false
   * global d4: false
   */

  'use strict';
  d4.helpers = {};

  // FIXME: Provide this using DI.
  d4.helpers.staggerText = function(text, direction) {
    var maxAttempts = 5,
      attempts = 0,
      move = function(lastRect, rect, direction) {
        var text = d3.select(this);
        var lastOffset = text.attr('data-last-offset') || 1;
        var top = lastRect.top - rect.top;
        var offset = (rect.height - top + lastOffset) * direction;
        text.attr('transform', 'translate(0,' + offset + ')');
        text.attr('data-last-offset', Math.abs(offset));
      },

      intersects = function(rect1, rect2) {
        return !(rect1.right < rect2.left ||
          rect1.left > rect2.right ||
          rect1.bottom < rect2.top ||
          rect1.top > rect2.bottom);
      },

      loop = function(text, direction) {
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
              move.bind(this)(pbb, bb, direction);
              intersecting = true;
            }
          }
          index++;
          last = this;
        });

        if (intersecting && attempts < maxAttempts) {
          attempts++;
          loop.bind(this)(text, direction);
        }
      };
    loop.bind(this)(text, direction);
  };
}).call(this);