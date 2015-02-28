(function() {
  'use strict';
  /*
   * Column connectors helpful when displaying a stacked column chart.
   * A connector will not connect positve and negative columns. This is because
   * in a stacked column a negative column may move many series below its previous
   * location. This creates a messy collection of crisscrossing lines.
   *
   * @name stackedColumnConnectors
   */
  d4.feature('stackedColumnConnectors', function(name) {
    var sign = function(num) {
      return (num) ? (num < 0) ? -1 : 1 : 0;
    };

    var sharedSigns = function(a, b, key) {
      return (sign(a[key]) === sign(b[key]));
    };

    var processPoint = function(d, i, n, data, callback) {
      var key = (d4.isOrdinalScale(this.y)) ? this.x.$key : this.y.$key;
      if (i === 0 || !sharedSigns(data[n].values[i - 1], d, key)) {
        return 0;
      }
      return callback.bind(this)();
    };

    return {
      accessors: {
        x1: function(d) {
          if (d4.isOrdinalScale(this.x)) {
            return this.x(d[this.x.$key]);
          } else {
            return this.x(d.y0 + d.y);
          }
        },

        y1: function(d) {
          if (d4.isOrdinalScale(this.y)) {
            return this.y(d[this.y.$key]);
          } else {
            return this.y(d.y0 + d.y);
          }
        },

        size: function() {
          if (d4.isOrdinalScale(this.x)) {
            return this.x.rangeBand();
          } else {
            return this.y.rangeBand();
          }
        },

        classes: function(d, i) {
          return 'series' + i;
        }
      },

      render: function(scope, data, selection) {
        var group = d4.appendOnce(selection, 'g.' + name);
        var connectorGroups = group.selectAll('g')
          .data(data);

        connectorGroups.enter().append('g')
          .attr('class', function(d, i) {
            return 'series' + i + ' ' + this.y.$key;
          }.bind(this));

        var lines = connectorGroups.selectAll('line')
          .data(function(d) {
            return d.values;
          }.bind(this));

        lines.enter().append('line');
        lines
          .attr('class', d4.functor(scope.accessors.classes).bind(this))
          .attr('stroke-dasharray', '5, 5')
          .attr('x1', function(d, i, n) {
            return processPoint.bind(this)(d, i, n, data, function() {
              return d4.functor(scope.accessors.x1).bind(this)(d);
            });
          }.bind(this))

        .attr('y1', function(d, i, n) {
          var offset = (d4.isOrdinalScale(this.y)) ? d4.functor(scope.accessors.size).bind(this)(d) : 0;
          return processPoint.bind(this)(d, i, n, data, function() {
            return d4.functor(scope.accessors.y1).bind(this)(d) + offset;
          });
        }.bind(this))

        .attr('x2', function(d, i, n) {
          var offset = (d4.isOrdinalScale(this.x)) ? scope.accessors.size.bind(this)(d) : 0;
          return processPoint.bind(this)(d, i, n, data, function() {
            return d4.functor(scope.accessors.x1).bind(this)(data[n].values[i - 1]) + offset;
          });
        }.bind(this))

        .attr('y2', function(d, i, n) {
          return processPoint.bind(this)(d, i, n, data, function() {
            return d4.functor(scope.accessors.y1).bind(this)(data[n].values[i - 1]);
          });
        }.bind(this));

        connectorGroups.exit().remove();
        lines.exit().remove();
        return lines;
      }
    };
  });
}).call(this);
