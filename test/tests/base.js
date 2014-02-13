/*global describe:true*/
/*global it:true*/
/*global before:true*/
'use strict';

describe('d4.base', function() {
  it('should expose the d4 namespace globally', function() {
    expect(d4).to.not.be.an('undefined');
  });

  it('should expose an object of features', function() {
    expect(d4).to.not.be.an('undefined');
  });

  it('should expose an object of parsers', function() {
    expect(d4).to.not.be.an('undefined');
  });

  describe('#baseChart()', function() {
    before(function() {
      this.builder = function() {
        return {
          configure : function() {},
          render : function() {}
        };
      };
    });

    it('should require a config and builder object', function() {
      expect(function() {
        d4.baseChart();
      }).to.throw(Error, '[d4] no builder defined');
    });

    describe('when defining a builder', function(){
      it('should allow you to pass in a custom builder', function() {
        var chart = d4.baseChart({}, this.builder);
        expect(chart.builder).to.not.be.an('undefined');
      });

      it('should require the builder to have a configure function', function(){
        var badBuilder = function(){
          return {};
        };
        expect(function(){
          d4.baseChart({}, badBuilder);
        }).to.throw(Error, '[d4] the supplied builder does not have a configure function');

        badBuilder = function() {
          return { configure : 'foo' };
        };

        expect(function(){
          d4.baseChart({}, badBuilder);
        }).to.throw(Error, '[d4] the supplied builder does not have a configure function');
      });

      it('should require the builder to have a render function', function(){
        var badBuilder = function(){
          return { configure : function(){} };
        };
        expect(function(){
          d4.baseChart({}, badBuilder);
        }).to.throw(Error, '[d4] the supplied builder does not have a render function');

        badBuilder = function() {
          return { configure : function() {}, render : 'foo' };
        };

        expect(function(){
          d4.baseChart({}, badBuilder);
        }).to.throw(Error, '[d4] the supplied builder does not have a render function');
      });
    });

    describe('when defining a config object', function(){
      it('should allow you to specify public accessors functions', function(){
        var chart = d4.baseChart({ accessors: ['z'] }, this.builder);
        expect(chart.z).to.not.be.an('undefined');
        expect(chart.accessors).to.include('z');
      });

      it('should define a collection of common accessors useful to all charts which are exposed through an accessors array', function(){
        var chart = d4.baseChart({}, this.builder);
        expect(chart.z).to.be.an('undefined');
        chart.accessors.forEach(function(accessor) {
          expect(chart[accessor]).to.not.be.an('undefined');
        });
      });
    });
  });

  describe('#merge()',function(){
    it('should take two objects and merge them into a new object', function(){
      var a = { a : 'foo' }, b = { b : 'bar' };
      var c = d4.merge(a,b);
      expect(c.a).to.equal('foo');
      expect(c.b).to.equal('bar');
      expect(a).to.not.equal(c);
    });
  });

  describe('#extend()', function(){
    it('should extend one object with the properties of another', function(){
      var a = {a : 'baz' }, b = { a : 'foo', bar : function(){ return 'bar'; }};
      d4.extend(a,b);
      expect(a.a).to.equal('foo');
      expect(a.bar()).to.equal('bar');
    });
  });

  describe('#mixin()', function(){
    it('should require a valid object to mixin', function(){
      var chart = d4.columnChart();
      expect(function(){
        chart.mixin();
      }).to.throw(Error, '[d4] you need to supply an object to mixin');
    });

    it('should add the newly mixed in feature into the list of features', function(){
      var chart = d4.columnChart();
      ['bars', 'barLabels', 'xAxis', 'yAxis'].forEach(function(feature){
        expect(chart.features()).to.include(feature);
      });
      expect(chart.features()).to.not.include('grid');
      chart.mixin({ 'grid' : d4.features.grid });
      expect(chart.features()).to.include('grid');
    });

    it('should add a feature in a specific index', function(){
      var chart = d4.columnChart();
      expect(chart.features()).to.not.include('grid');
      chart.mixin({ 'grid' : d4.features.grid }, 0);
      expect(chart.features()[0]).to.equal('grid');
    });

    it('should convert a negative index to zero', function(){
      var chart = d4.columnChart();
      expect(chart.features()).to.not.include('grid2');
      chart.mixin({ 'grid2' : d4.features.grid }, -1);
      expect(chart.features()[0]).to.equal('grid2');
    });

    it('should add a feature to the end if the index is larger than the features array length', function(){
      var chart = d4.columnChart();
      expect(chart.features()).to.not.include('grid3');
      chart.mixin({ 'grid3' : d4.features.grid }, 1000);
      expect(chart.features()[chart.features().length - 1]).to.equal('grid3');
    });
  });
});
