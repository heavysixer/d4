(function() {
  'use strict';
  /*
   * The columnLabels feature is used to affix data labels to column series.
   *
   * @name columnLabels
   */
  d4.feature('columnLabels', function(name) {

    // FIXME: Remove this hardcoded variable or expose it as a setting.
    var padding = 5;
    var anchorText = function() {
      if (d4.isContinuousScale(this.y)) {
        return 'middle';
      } else {
        return 'start';
      }
    };
    return {
      accessors: {
        key: d4.functor(d4.defaultKey),

        x: function(d) {
          if (d4.isOrdinalScale(this.x)) {
            return this.x(d[this.x.$key]) + (this.x.rangeBand() / 2);
          } else {
            var width = Math.abs(this.x(d[this.x.$key]) - this.x(0));
            return this.x(d[this.x.$key]) - width / 2;
          }
        },

        y: function(d) {
          if (d4.isOrdinalScale(this.y)) {
            return this.y(d[this.y.$key]) + (this.y.rangeBand() / 2) + padding;
          } else {
            var height = Math.abs(this.y(d[this.y.$key]) - this.y(0));
            return (d[this.y.$key] < 0 ? this.y(d[this.y.$key]) - height : this.y(d[this.y.$key])) - padding;
          }
        },

        text: function(d) {
          return d[this.valueKey];
        }
      },
      render: function(scope, data, selection) {
        var group = d4.appendOnce(selection, 'g.' + name);
        var label = group.selectAll('text')
          .data(data, d4.functor(scope.accessors.key).bind(this));
        label.enter().append('text');
        label.exit().remove();
        label.attr('class', 'column-label ' + name)
          .text(d4.functor(scope.accessors.text).bind(this))
          .attr('text-anchor', anchorText.bind(this))
          .attr('x', d4.functor(scope.accessors.x).bind(this))
          .attr('y', d4.functor(scope.accessors.y).bind(this));
        return label;
      }
    };
  });
}).call(this);
