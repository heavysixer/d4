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
