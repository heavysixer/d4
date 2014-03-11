(function() {
  /*!
   * global d3: false
   * global d4: false
   */

  /*!
    Column connectors helpful when displaying a stacked column chart.
    A connector will not connect positve and negative columns. This is because
    in a stacked column a negative column may move many series below its previous
    location. This creates a messy collection of crisscrossing lines.
  */
  'use strict';
  d4.feature('stackedColumnConnectors', function(name) {
    var sign = function(num) {
      return (num) ? (num < 0) ? -1 : 1 : 0;
    };

    var sharedSigns = function(a, b, key){
      return (sign(a[key]) === sign(b[key]));
    };

    return {
      accessors: {
        x1: function(d) {
          return this.x(d[this.x.$key]);
        },

        y1: function(d) {
          if(this.x.$scale === 'linear'){
            return this.y(d[this.y.$key]);
          } else {
            return this.y(Math.max(0, d.y0 + d.y));
          }
        },

        span: function(){
          return this.x.rangeBand();
        },

        classes : function(d, i){
          return 'series' +i;
        }
      },

      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var group = this.svg.select('.' + name).selectAll('.group')
          .data(data)
          .enter().append('g')
          .attr('class', function(d,i) {
            return 'series'+ i + ' ' +  this.y.$key;
          }.bind(this));

        var lines = group.selectAll('lines')
          .data(function(d) {
            return d.values;
          }.bind(this));

        lines.enter().append('line');
        lines.exit().remove();
        lines
        .attr('class', scope.accessors.classes.bind(this))
        .attr('stroke-dasharray','5, 5')
        .attr('x1', function(d, i, n) {
          if(i === 0 || !sharedSigns(data[n].values[i-1], d, this.y.$key)){
            return 0;
          }
          return scope.accessors.x1.bind(this)(data[n].values[i-1]) + scope.accessors.span.bind(this)(d);
        }.bind(this))

        .attr('y1', function(d, i, n) {
          if(i === 0 || !sharedSigns(data[n].values[i-1], d, this.y.$key)){
            return 0;
          }
          return scope.accessors.y1.bind(this)(data[n].values[i-1]);
        }.bind(this))

        .attr('x2', function(d, i, n) {
          if(i === 0 || !sharedSigns(data[n].values[i-1], d, this.y.$key)){
            return 0;
          }
          return scope.accessors.x1.bind(this)(d);
        }.bind(this))

        .attr('y2', function(d, i, n) {
          if(i === 0 || !sharedSigns(data[n].values[i-1], d, this.y.$key)){
            return 0;
          }
          return scope.accessors.y1.bind(this)(d);
        }.bind(this));

        return lines;
      }
    };
  });
}).call(this);
