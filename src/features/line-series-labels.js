(function() {
  'use strict';
  /*
   * Approach based off this example:
   * http://bl.ocks.org/mbostock/3902569
   *
   * @name lineSeriesLabels
   */
  d4.feature('lineSeriesLabels', function(name) {
    var displayXValue = function(scope, data) {
      if (d4.functor(scope.accessors.displayPointValue).bind(this)()) {
        var xLabel = this.svg.select('.' + name).selectAll('.' + name + ' dataPointLabel').data(data);
        xLabel.enter().append('text');
        xLabel.exit().remove();
        xLabel
          .attr('data-key', d4.functor(scope.accessors.key).bind(this))
          .attr('class', function(d, n){
            return d4.functor(scope.accessors.classes).bind(this)(d, n) + ' dataPointLabel';
          }.bind(this));

        var point = this.svg.select('.' + name).selectAll('.' + name + ' dataPoint').data(data);
        point.enter().append('circle');
        point.exit().remove();
        point.attr('data-key', function(d) {
          return d.key;
        })
        .style('display','none')
        .attr('r', d4.functor(scope.accessors.r).bind(this)())
        .attr('class',  function(d, n){
          return d4.functor(scope.accessors.classes).bind(this)(d, n) + ' dataPoint';
        }.bind(this));

        this.svg.select('.' + name).append('rect')
          .attr('class', 'overlay')
          .style('fill-opacity',0)
          .attr('width', this.width)
          .attr('height', this.height)
          .on('mouseover', function() {
            xLabel.style('display', null);
          })
          .on('mouseout', function() {
            xLabel.style('display', 'none');
          })
          .on('mousemove', d4.functor(scope.accessors.mouseMove).bind(this));
      }
    };

    return {
      accessors: {
        classes: function(d, n) {
          return 'stroke series' + n;
        },

        displayPointValue: false,

        key : function(d) {
          return d.key;
        },

        mouseMove: function(data) {
          var bisectX = d3.bisector(function(d) {
            return d[this.x.$key];
          }.bind(this)).right;
          var overlay = this.svg.select('.' + name + ' rect.overlay')[0][0];
          var x0 = this.x.invert(d3.mouse(overlay)[0]);
          d4.each(data, function(datum, n){
            var i = bisectX(datum.values, x0, 1);
            var d0 = datum.values[i - 1];
            if(x0.getTime() >= d0[this.x.$key].getTime()) {
              var d1 = datum.values[i];
              d1 = (d4.isUndefined(d1)) ? datum.values[datum.values.length -1] : d1;
              var d = x0 - d0[this.x.$key] > d1[this.x.$key] - x0 ? d1 : d0;
              d4.functor(this.features[name].accessors.showDataPoint).bind(this)(d, datum, n);
              d4.functor(this.features[name].accessors.showDataLabel).bind(this)(d, datum, n);
            } else {
              var selector = '.' + name + ' circle.dataPoint[data-key="' + datum.key + '"]';
              var circle = this.svg.select(selector);
              circle
              .style('display', 'none');
            }
          }.bind(this));
        },

        pointLabelText : function(d) {
          var str = this.x.$key + ': ' + d[this.x.$key];
          str += ' ' + this.y.$key + ': ' + d[this.y.$key];
          return str;
        },
        r: 4.5,

        showDataLabel : function(d, datum, n) {
          var pointLabelSelector = '.' + name + ' text.dataPointLabel[data-key="' + datum.key + '"]';
          var label = this.svg.select(pointLabelSelector);
          var offset = n * 20;
          label
          .style('display', null)
          .attr('transform', 'translate(' + this.x(0) + ',' + (this.y(this.y.domain()[1]) + offset) + ')')
          .text(d4.functor(this.features[name].accessors.pointLabelText).bind(this)(d));
        },

        showDataPoint: function(d, datum) {
          var pointSelector = '.' + name + ' circle.dataPoint[data-key="' + datum.key + '"]';
          var point = this.svg.select(pointSelector);
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
        selection.append('g').attr('class', name);
        var label = this.svg.select('.' + name).selectAll('.' + name).data(data);
        label.enter().append('text');
        label.exit().remove();
        label.attr('class', 'line-series-label')
          .text(d4.functor(scope.accessors.text).bind(this))
          .attr('x', d4.functor(scope.accessors.x).bind(this))
          .attr('y', d4.functor(scope.accessors.y).bind(this))
          .attr('data-key', d4.functor(scope.accessors.key).bind(this))
          .attr('class', d4.functor(scope.accessors.classes).bind(this));
        displayXValue.bind(this)(scope, data, selection);

        return label;
      }
    };
  });
}).call(this);
