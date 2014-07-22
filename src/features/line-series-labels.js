(function() {
  'use strict';
  /*
   *
   *
   * @name lineSeriesLabels
   */
  d4.feature('lineSeriesLabels', function(name) {
    var trackMouse = function(scope, data) {
      if (d4.functor(scope.accessors.trackMouse).bind(this)()) {
        var label = this.svg.select('.' + name).selectAll('.' + name + 'DataPoint').data(data);
        label.enter().append('text');
        label.exit().remove();
        label.attr('class', 'line-series-data-point')
          .text(d4.functor(scope.accessors.dataPointText).bind(this))
          .attr('data-key', function(d) {
            return d.key;
          })
          .attr('class', d4.functor(scope.accessors.classes).bind(this));

        this.svg.select('.' + name).append('rect')
          .attr('class', 'overlay')
          .style('fill', 'none')
          .attr('width', this.width)
          .attr('height', this.height)
          .on('mouseover', function() {
            label.style('display', null);
          })
          .on('mouseout', function() {
            label.style('display', 'none');
          })
          .on('mousemove', d4.functor(scope.accessors.mouseMove));
      }
    };

    return {
      accessors: {
        classes: function(d, n) {
          return 'stroke series' + n;
        },

        mouseMove: function() {
        },

        text: function(d) {
          return d.key;
        },

        // Fixme: This should be renamed to something more expressive.
        trackMouse: false,

        x: function(d) {
          return this.x(d.values[d.values.length - 1][this.x.$key]);
        },

        y: function(d) {
          return this.y(d.values[d.values.length - 1][this.y.$key]);
        }
      },
      render: function(scope, data, selection) {
        selection.append('g').attr('class', name);
        var label = this.svg.select('.' + name).selectAll('.' + name).data(data);
        label.enter().append('text');
        label.exit().remove();
        label.attr('class', 'line-series-label')
          .text(d4.functor(scope.accessors.text).bind(this))
          .attr('x', d4.functor(scope.accessors.x).bind(this))
          .attr('y', d4.functor(scope.accessors.y).bind(this))
          .attr('data-key', function(d) {
            return d.key;
          })
          .attr('class', d4.functor(scope.accessors.classes).bind(this));
        trackMouse.bind(this)(scope, data, selection);

        return label;
      }
    };
  });
}).call(this);
