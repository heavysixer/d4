(function() {
  /*!
   * global d3: false
   * global d4: false
   */
  'use strict';
  d4.feature('groupedColumnLabels', function(name) {
    var anchorText = function(d){
      if(typeof d.y0 !== 'undefined'){
        if(this.x.$scale === 'ordinal') {
          return 'middle';
        } else {
          return 'left';
        }
      }
      if(this.y.$scale === 'linear' || this.x.$scale === 'ordinal'){
        return 'middle';
      } else {
        return 'left';
      }
    };

    return {
      accessors: {
        x: function(d, i) {
          var width = this.x.rangeBand() / this.groupsOf;
          var xPos = this.x(d[this.x.$key]) + width * i;
          var gutter = width * 0.1;
          return xPos + width/2 - gutter;
        },

        y: function(d) {
          return (d[this.y.$key] < 0 ? this.y(0) : this.y(d[this.y.$key])) -5;
        },

        text: function(d) {
          return d3.format('').call(this, d[this.y.$key]);
        },

        stagger: true,

        classes: 'column-label'
      },

      render: function(scope, data) {
        this.featuresGroup.append('g').attr('class', name);
        var group = this.svg.select('.' + name).selectAll('.group')
          .data(data)
          .enter().append('g')
          .attr('class', function(d,i) {
            return 'series'+ i +  ' ' + this.x.$key;
          }.bind(this));

        var text = group.selectAll('text')
          .data(function(d) {
            return d.values;
          }.bind(this));
        text.exit().remove();
        text.enter().append('text')
          .attr('class', d4.functor(scope.accessors.classes).bind(this))
          .text(scope.accessors.text.bind(this))
          .attr('text-anchor', anchorText.bind(this))
          .attr('y', scope.accessors.y.bind(this))
          .attr('x', scope.accessors.x.bind(this));

        if (d4.functor(scope.accessors.stagger).bind(this)()) {

          // FIXME: This should be moved into a helper injected using DI.
          group.selectAll('text').call(d4.helpers.staggerText, -1);
        }
        return text;
      }
    };
  });
}).call(this);
