(function() {
  'use strict';
  d4.feature('arcLabels', function(name) {
    return {
      accessors: {

      },
      render: function(scope, data, selection) {
        //var g = svg.selectAll(".arc")
        //     .data(pie(data))
        //   .enter().append("g")
        //     .attr("class", "arc");
        //
        // g.append("path")
        //     .attr("d", arc)
        //     .style("fill", function(d) { return color(d.data.label); });
        //
        // var pos = d3.svg.arc().innerRadius(radius + 2).outerRadius(radius + 2);
        //
        // var getAngle = function (d) {
        //     return (180 / Math.PI * (d.startAngle + d.endAngle) / 2 - 90);
        // };
        //
        // g.append("text")
        //     .attr("transform", function(d) {
        //             return "translate(" + pos.centroid(d) + ") " +
        //                     "rotate(" + getAngle(d) + ")"; })
        //     .attr("dy", 5)
        //     .style("text-anchor", "start")
        //     .text(function(d) { return d.data.label; });
        //return;
      }
    };
  });
}).call(this);
