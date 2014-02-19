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
      }).to.
      throw (Error, '[d4] No builder defined');
    });

    describe('when defining a builder', function() {
      it('should allow you to pass in a custom builder', function() {
        var chart = d4.baseChart({}, this.builder);
        expect(chart.builder).to.not.be.an('undefined');
      });

      it('should require the builder to have a configure function', function() {
        var badBuilder = function() {
          return {};
        };
        expect(function() {
          d4.baseChart({}, badBuilder);
        }).to.
        throw (Error, '[d4] The supplied builder does not have a configure function');

        badBuilder = function() {
          return {
            configure: 'foo'
          };
        };

        expect(function() {
          d4.baseChart({}, badBuilder);
        }).to.
        throw (Error, '[d4] The supplied builder does not have a configure function');
      });

      it('should require the builder to have a render function', function() {
        var badBuilder = function() {
          return {
            configure: function() {}
          };
        };
        expect(function() {
          d4.baseChart({}, badBuilder);
        }).to.
        throw (Error, '[d4] The supplied builder does not have a render function');

        badBuilder = function() {
          return {
            configure: function() {},
            render: 'foo'
          };
        };

        expect(function() {
          d4.baseChart({}, badBuilder);
        }).to.
        throw (Error, '[d4] The supplied builder does not have a render function');
      });
    });

    describe('when defining a config object', function() {
      it('should allow you to specify public accessors functions', function() {
        var chart = d4.baseChart({
          accessors: ['z']
        }, this.builder);
        expect(chart.z).to.not.be.an('undefined');
        expect(chart.accessors).to.include('z');
      });

      it('should define a collection of common accessors useful to all charts which are exposed through an accessors array', function() {
        var chart = d4.baseChart({}, this.builder);
        expect(chart.z).to.be.an('undefined');
        chart.accessors.forEach(function(accessor) {
          expect(chart[accessor]).to.not.be.an('undefined');
        });
      });
    });
  });

  describe('#merge()', function() {
    it('should take two objects and merge them into a new object', function() {
      var a = {
        a: 'foo'
      }, b = {
          b: 'bar'
        };
      var c = d4.merge(a, b);
      expect(c.a).to.equal('foo');
      expect(c.b).to.equal('bar');
      expect(a).to.not.equal(c);
    });
  });

  describe('#extend()', function() {
    it('should extend one object with the properties of another', function() {
      var a = {
        a: 'baz'
      }, b = {
          a: 'foo',
          bar: function() {
            return 'bar';
          }
        };
      d4.extend(a, b);
      expect(a.a).to.equal('foo');
      expect(a.bar()).to.equal('bar');
    });
  });

  describe('#mixin()', function() {
    it('should require a valid object to mixin', function() {
      var chart = d4.columnChart();
      expect(function() {
        chart.mixin();
      }).to.
      throw (Error, '[d4] You need to supply an object to mixin');
    });

    it('should add the newly mixed in feature into the list of features', function() {
      var chart = d4.columnChart();
      ['bars', 'barLabels', 'xAxis', 'yAxis'].forEach(function(feature) {
        expect(chart.features()).to.include(feature);
      });
      expect(chart.features()).to.not.include('grid');
      chart.mixin({
        'grid': d4.features.grid
      });
      expect(chart.features()).to.include('grid');
    });

    it('should add a feature in a specific index', function() {
      var chart = d4.columnChart();
      expect(chart.features()).to.not.include('grid');
      chart.mixin({
        'grid': d4.features.grid
      }, 0);
      expect(chart.features()[0]).to.equal('grid');
    });

    it('should convert a negative index to zero', function() {
      var chart = d4.columnChart();
      expect(chart.features()).to.not.include('grid2');
      chart.mixin({
        'grid2': d4.features.grid
      }, -1);
      expect(chart.features()[0]).to.equal('grid2');
    });

    it('should add a feature to the end if the index is larger than the features array length', function() {
      var chart = d4.columnChart();
      expect(chart.features()).to.not.include('grid3');
      chart.mixin({
        'grid3': d4.features.grid
      }, 1000);
      expect(chart.features()[chart.features().length - 1]).to.equal('grid3');
    });

    it('should allow the mixin to specify overrides to the feature at the point of being mixed in', function() {
      var spy = chai.spy(function(yAxis) {
        return yAxis.orient('left');
      });
      var data = [{
        x: '2010',
        y: -10
      }, {
        x: '2011',
        y: 20
      }, {
        x: '2012',
        y: 30
      }, {
        x: '2013',
        y: 40
      }, {
        x: '2014',
        y: 50
      }, ];
      var overrides = function() {
        return {
          accessors: {
            formatYAxis: spy,
            newAccessor: function() {}
          }
        };
      };
      var chart = d4.columnChart();
      chart.mixin({
        'grid': d4.features.grid,
        'overrides': overrides
      })
        .using('grid', function(grid) {
          expect(grid.newAccessor).to.not.be.an('undefined');
        });

      d3.select('#test')
        .datum(data)
        .call(chart);

      expect(spy).to.have.been.called();

    });
  });

  describe('#mixout()', function() {
    it('should allow you to mix out an existing feature from a chart', function() {
      var chart = d4.columnChart();
      expect(chart.features()).to.include('bars');
      chart.mixout('bars');
      expect(chart.features()).to.not.include('bars');
    });

    it('should require a feature name to mixout of the chart', function() {
      var chart = d4.columnChart();
      expect(function() {
        chart.mixout();
      }).to.
      throw (Error, '[d4] A name is required in order to mixout a chart feature.');
    });
  });

  describe('#using()', function() {
    it('should throw an error if you try to use a non-existent feature', function() {
      var chart = d4.columnChart();
      expect(function() {
        chart.using('foo', function() {});
      }).to.
      throw (Error, '[d4] Could not find feature: "foo", maybe you forgot to mix it in?');
    });

    it('should allow you to use a feature of a chart', function() {
      var chart = d4.columnChart();
      chart.using('bars', function(bars) {
        expect(bars.accessors).to.not.be.an('undefined');
      });
    });

    it('should throw an error is you try and use a feature without supplying a function', function() {
      var chart = d4.columnChart();
      expect(function() {
        chart.using('bars');
      }).to.
      throw (Error, '[d4] You must supply a continuation function in order to use a chart feature.');
    });
  });

  describe('#builder()', function() {
    it('should require a valid builder function to use as a builder', function() {
      var chart = d4.columnChart();
      var badBuilder = function() {
        return {
          configure: 'foo'
        };
      };
      expect(function() {
        chart.builder(badBuilder);
      }).to.
      throw (Error, '[d4] The supplied builder does not have a configure function');
    });

    it('should allow you to replace the default builder with your custom one', function() {
      var chart = d4.columnChart();
      var chartData = [1, 2, 3];
      chart.builder(function() {
        return {
          configure: function(data) {
            expect(data).to.equal(chartData);
          },
          render: function(data) {
            expect(data).to.equal(chartData);
          }
        };
      });

      d3.select('#test')
        .datum(chartData)
        .call(chart);
    });
  });
});
