(function() {
  'use strict';
  /*
   * Approach based off this example:
   * http://bl.ocks.org/mbostock/3902569
   *
   * @name lineSeriesLabels
   */
  d4.feature('lineSeriesLabels', function(name) {
    var addDataPoint = function(scope, data) {
      var point = this.container.select('.' + name).selectAll('.' + name + ' circle.dataPoint').data(data);
      point.enter().append('circle');
      point.exit().remove();
      point.attr('data-key', d4.functor(scope.accessors.key).bind(this))
        .style('display', 'none')
        .attr('r', d4.functor(scope.accessors.r).bind(this)())
        .attr('class', function(d, n) {
          return d4.functor(scope.accessors.classes).bind(this)(d, n) + ' dataPoint';
        }.bind(this));
    };

    var addDataPointLabel = function(scope, data) {
      var xLabel = this.container.select('.' + name).selectAll('.' + name + ' text.dataPoint').data(data);
      xLabel.enter().append('text');
      xLabel.exit().remove();
      xLabel
        .attr('data-key', d4.functor(scope.accessors.key).bind(this))
        .style('display', 'none')
        .attr('class', function(d, n) {
          return d4.functor(scope.accessors.classes).bind(this)(d, n) + ' dataPoint';
        }.bind(this));
    };

    var addOverlay = function(scope) {
      this.container.select('.' + name).append('rect')
        .attr('class', 'overlay')
        .style('fill-opacity', 0)
        .attr('width', this.width)
        .attr('height', this.height)
        .on('mouseover', function() {
          this.container.selectAll('.' + name + ' .dataPoint').style('display', null);
        }.bind(this))
        .on('mouseout', function() {
          this.container.selectAll('.' + name + ' .dataPoint').style('display', 'none');
        }.bind(this))
        .on('mousemove', d4.functor(scope.accessors.mouseMove).bind(this));

    };

    var displayXValue = function(scope, data) {
      if (d4.functor(scope.accessors.displayPointValue).bind(this)()) {
        if (d4.isNotFunction(this.x.invert)) {
          d4.err(' In order to track the x position of a line series your scale must have an invert() function.  However, your {0} scale does not have the invert() function.', this.x.$scale);
        } else {
          addDataPointLabel.bind(this)(scope, data);
          addDataPoint.bind(this)(scope, data);
          addOverlay.bind(this)(scope);
        }
      }
    };

    return {
      accessors: {
        classes: function(d, n) {
          return 'stroke series' + n;
        },

        displayPointValue: false,

        key: d4.functor(d4.defaultKey),

        mouseMove: function(data) {
          var inRange = function(a, b) {
            if (this.x.$scale === 'time') {
              return a.getTime() >= b[this.x.$key].getTime();
            } else {
              return a >= b[this.x.$key];
            }
          };

          var bisectX = d3.bisector(function(d) {
            return d[this.x.$key];
          }.bind(this)).right;
          var overlay = this.container.select('.' + name + ' rect.overlay')[0][0];
          var x0 = this.x.invert(d3.mouse(overlay)[0]);
          d4.each(data, function(datum, n) {
            var i = bisectX(datum.values, x0, 1);
            var d0 = datum.values[i - 1];
            if (inRange.bind(this)(x0, d0)) {
              var d1 = datum.values[i];
              d1 = (d4.isUndefined(d1)) ? datum.values[datum.values.length - 1] : d1;
              var d = x0 - d0[this.x.$key] > d1[this.x.$key] - x0 ? d1 : d0;
              d4.functor(this.features[name].accessors.showDataPoint).bind(this)(d, datum, n);
              d4.functor(this.features[name].accessors.showDataLabel).bind(this)(d, datum, n);
            } else {
              var selector = '.' + name + ' .dataPoint[data-key="' + d4.functor(this.features[name].accessors.key).bind(this)(datum, n) + '"]';
              var point = this.container.select(selector);
              point
                .style('display', 'none');
            }
          }.bind(this));
        },

        pointLabelText: function(d, datum) {
          var str = datum.key + ' ' + this.x.$key + ': ' + d[this.x.$key];
          str += ' ' + this.y.$key + ': ' + d[this.y.$key];
          return str;
        },

        r: 4.5,

        showDataLabel: function(d, datum, n) {
          var pointLabelSelector = '.' + name + ' text.dataPoint[data-key="' + d4.functor(this.features[name].accessors.key).bind(this)(datum, n) + '"]';
          var label = this.container.select(pointLabelSelector);
          var offset = n * 20;
          label
            .style('display', null)
            .attr('transform', 'translate(5,' + offset + ')')
            .text(d4.functor(this.features[name].accessors.pointLabelText).bind(this)(d, datum));
        },

        showDataPoint: function(d, datum, n) {
          var pointSelector = '.' + name + ' circle.dataPoint[data-key="' + d4.functor(this.features[name].accessors.key).bind(this)(datum, n) + '"]';
          var point = this.container.select(pointSelector);
          point
            .style('display', null)
            .attr('transform', 'translate(' + this.x(d[this.x.$key]) + ',' + this.y(d[this.y.$key]) + ')');
        },

        text: function(d) {
          return d.key;
        },

        x: function(d) {
          return this.x(d.values[d.values.length - 1][this.x.$key]);
        },

        y: function(d) {
          return this.y(d.values[d.values.length - 1][this.y.$key]);
        }
      },

      render: function(scope, data, selection) {
        var group = d4.appendOnce(selection, 'g.' + name);
        var label = group.selectAll('.seriesLabel').data(data);
        label.enter().append('text');
        label
          .text(d4.functor(scope.accessors.text).bind(this))
          .attr('x', d4.functor(scope.accessors.x).bind(this))
          .attr('y', d4.functor(scope.accessors.y).bind(this))
          .attr('data-key', d4.functor(scope.accessors.key).bind(this))
          .attr('class', function(d, n) {
            return d4.functor(scope.accessors.classes).bind(this)(d, n) + ' seriesLabel';
          }.bind(this));
        displayXValue.bind(this)(scope, data, selection);

        label.exit().remove();
        return label;
      }
    };
  });
}).call(this);
