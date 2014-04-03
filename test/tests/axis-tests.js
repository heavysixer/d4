/*global describe:true*/
/*global it:true*/
/*global beforeEach:true*/
/*global document:true*/
'use strict';

describe('axis tests', function() {
  beforeEach(function() {
    var container = document.getElementById('test');
    container.innerHTML = '<div id="chart"></div>';
  });

  it('should create accessors for the d3 axis object, which can be interacted with transparently', function(){
    var d3Axis = d3.svg.axis();
    var chart = d4.charts.column();
    var axisTests = function(axis){
      d4.each(d3.keys(d3Axis), function(method){
        expect(axis[method]).to.not.be.an('undefined');
      });
      expect(axis.$orient).to.be.an('undefined');
      axis.orient('bottom');
      expect(axis.orient()).to.equal('bottom');
    };
    chart.using('xAxis', axisTests);
    chart.using('yAxis', axisTests);
  });
});