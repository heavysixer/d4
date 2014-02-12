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
          configure: function() {},
          render: function() {}
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
  });
});
