(function() {
  /*!
   * global d3: false
   * global d4: false
   */

  'use strict';
  d4.features.stackedColumnLabels = function(name) {
    var sign = function(val) {
      return val > 0 ? 'positive' : 'negative';
    };

    return {
      accessors: {
        x: function(d) {
          return this.x(d[this.xKey]) + (this.x.rangeBand() / 2);
        },

        y: function(d) {
          var halfHeight = Math.abs(this.y(d.y0) - this.y(d.y0 + d.y)) / 2;
          var yVal = d.y0 + d.y;
          return (yVal < 0 ? this.y(d.y0) : this.y(yVal)) + halfHeight;
        },

        text: function(d) {
          if(Math.abs(this.y(d.y0) - this.y(d.y0 + d.y)) > 20) {
            return d3.format('').call(this, d[this.valueKey]);
          }
        }
      },
      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var group = this.svg.select('.' + name).selectAll('.group')
          .data(data)
          .enter().append('g')
          .attr('class', function(d, i) {
            return 'series' + i + ' '+ sign(d.y) + ' ' + this.xKey;
          }.bind(this));

        var text = group.selectAll('text')
          .data(function(d) {
            return d.values;
          }.bind(this));
        text.exit().remove();
        text.enter().append('text')
          .text(scope.accessors.text.bind(this))
          .attr('class', 'column-label')
          .attr('y', scope.accessors.y.bind(this))
          .attr('x', scope.accessors.x.bind(this));
        return text;
      }
    };
  };
}).call(this);
