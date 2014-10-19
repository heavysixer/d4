/*global describe:true*/
/*global it:true*/
/*global beforeEach:true*/
/*global document:true*/
'use strict';

describe('d4.base', function() {
  beforeEach(function() {
    var container = document.getElementById('test');
    container.innerHTML = '<div id="chart"></div>';
  });

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
    beforeEach(function() {
      this.builder = function() {
        return {
          link: function() {}
        };
      };
    });

    describe('when binding axes', function(){
      it('should create a d3 scale as part of the build process', function(){
        var chart = d4.charts.column();
        chart.x(function(x){
          expect(x.scale()).to.be.equal('ordinal');
        });
      });
      it('should pass the settings configured in the accessors along to the features', function(){

        // These are the previously calculated range points for this chart's settings. based on the supplied chartData and chart width.
        var rangePoints = [1,34,67,100];
        var chartData =[1,2,3,4];

        d4.feature('pathSeries', function(name) {
          return {
            render: function(scope, data, selection) {
              selection.append('g').attr('class', name);
              var group = selection.select('.' + name).selectAll('g').data(data);
              group.exit().remove();
              group.enter().append('g');
              var path = group.selectAll('path')
              .data(function(d){
                return d.values;
              });
              path.enter().append('path')
              .attr('transform', function(d,i) {
                expect(this.x(d)).to.equal(rangePoints[i]);
              }.bind(this));
            }
          };
        }).call(this);

        var chart = d4.baseChart().mixin([
          {
            'name': 'pathSeries',
            'feature' : d4.features.pathSeries
          },
          {
            'name': 'xAxis',
            'feature': d4.features.xAxis
          }
        ]);
        chart.width(200);
        chart.x(function(x){
          expect(x.scale()).to.equal('ordinal');
          x.domain(chartData).rangePoints([1, 100], 0);
          var points = x.range();
          d4.each(rangePoints, function(e,i){
            expect(e).to.equal(points[i]);
          });
        });
        d3.select('#chart')
          .datum(chartData)
          .call(chart);
      });

      it('should create accessors for the chosen scale from d3', function(){
        var chart = d4.charts.column();

        chart.y(function(y){
          expect(function() {

            // clamp is a function of a d3 linear scale.
            y.clamp(true);

            // min is a function of d4
            y.min(1);

          }).to.not.throw(Error);
        });
      });

      it('should create readonly function properties on a scale instance', function(){
        var chart = d4.charts.column();
        var axes = chart.axes();
        expect(axes.x.$key).to.equal('x');
        expect(axes.x.$scale).to.equal('ordinal');
        expect(function(){
          axes.x.$scale = 'linear';
        }).to.throw(Error,  '[d4]  You cannot directly assign values to the $scale property. Instead use the scale() function.');
        chart.axes().x.scale('linear');
        chart.x(function(x){
          expect(x.scale()).to.equal('linear');
          expect(x.$scale).to.equal('linear');
        });
        expect(chart.axes().x.$scale).to.equal('linear');
      });
    });

    describe('when defining a builder', function() {
      it('should allow you to pass in a custom builder', function() {
        var chart = d4.baseChart({ builder : this.builder });
        expect(chart.builder).to.not.be.an('undefined');
      });

      it('should create a ordinal scale for the x dimension if no axes are provided', function() {
        var chart = d4.baseChart({ builder : this.builder });
        d3.select('#chart')
          .datum([{
            x: 1,
            y: 2
          }])
          .call(chart);

        chart.axes(function(axes) {
          expect(axes.x.scale()).to.equal('ordinal');
        });
      });

      it('should create a linear scale for the y dimension if no axes are provided', function() {
        var chart = d4.baseChart({ builder : this.builder });
        d3.select('#chart')
          .datum([{
            x: 1,
            y: 2
          }])
          .call(chart);

        chart.axes(function(axes) {
          expect(axes.y.scale()).to.equal('linear');
        });
      });

      it('should allow you to override the default axes', function() {
        var obj = {
          axes: {
            y: {
              scale: 'ordinal'
            }
          }
        };
        var chart = d4.baseChart( { builder : this.builder, config : obj });
        d3.select('#chart')
          .datum([{
            x: 1,
            y: 2
          }])
          .call(chart);

        chart.axes(function(axes) {

          // default for x is unchanged
          expect(axes.x.scale()).to.equal('ordinal');

          // the y scale is now ordinal instead of linear
          expect(axes.y.scale()).to.equal('ordinal');
        });
      });

      it('should make axes a custom accessor for the chart object', function() {
        var obj = {
          axes: {
            z: {
              scale: 'ordinal',
              customProperty: 'foo'
            }
          }
        };
        var chart = d4.baseChart({ builder : this.builder, config : obj });
        expect(d3.keys(chart.axes()).length).to.equal(3);
        expect(chart.z).to.not.be.an('undefined');

        // should be able to retrieve a scale accessor
        chart.z(function(axis){
          expect(axis.scale()).to.equal('ordinal');
          axis.scale('linear');

          // should create custom accessors
          expect(axis.customProperty()).to.equal('foo');
        });

        // should be able to set a scale accessor
        chart.z(function(axis){
          expect(axis.scale()).to.equal('linear');
        });
      });

      it('should throw an error if an unsupported scale is used.', function() {
        var obj = { axes : { z : { scale : 'foo' } } };
        var builder = this.builder;
        expect(function() {
          d4.baseChart({ builder : builder, config : obj });
        }).to.throw(Error, '[d4] The scale type: "foo" is unrecognized. D4 only supports these scale types: category10, category20, category20b, category20c, identity, linear, log, ordinal, pow, quantile, quantize, sqrt, threshold, time, time.utc');
      });

      it('should allow you to specify a time scale even though it is not part of the normal collection of scales', function(){
        var obj = { axes : { x : { scale : 'time' } } };
        var builder = this.builder;
        var chart = d4.baseChart({ builder : builder, config : obj });
        chart.x(function(x){
          expect(x.invert).to.be.an('Function');
        });
      });

      it('should allow you to specify a time utc scale even though it is not part of the normal collection of scales', function(){
        var obj = { axes : { x : { scale : 'time.utc' } } };
        var builder = this.builder;
        var chart = d4.baseChart({ builder : builder, config : obj });
        chart.x(function(x){
          expect(x.invert).to.be.an('Function');
        });
      });

      it('should require the builder to have a link function', function() {
        var badBuilder = function() {
          return {};
        };
        expect(function() {
          d4.baseChart({ builder : badBuilder });
        }).to.throw(Error, '[d4] The supplied builder does not have a link function');

        badBuilder = function() {
          return {
            link: 'foo'
          };
        };
        expect(function() {
          d4.baseChart({ builder : badBuilder });
        }).to.throw(Error, '[d4] The supplied builder does not have a link function');
      });
    });

    describe('when using accessors', function() {
      it('should set a custom property for each accessor, which will give you the last assigned value', function(){
        var chart = d4.baseChart({ builder : this.builder });
        expect(chart.$width).to.equal(400);
        expect(chart.width()).to.equal(400);
        expect(chart.$width).to.equal(400);
        chart.width(undefined);
        expect(chart.$width).to.equal(undefined);
      });

      it('should not allow you to directly set the variables which store the last assigned value', function(){
        var chart = d4.baseChart({ builder : this.builder });
        expect(chart.$width).to.equal(400);
        expect(function(){
          chart.$width = 500;
        }).to.throw(Error,  '[d4]  You cannot directly assign values to the $width property. Instead use the width() function.');
        chart.width(500);
        expect(chart.$width).to.equal(500);
      });

      it('should allow you to get and set nested accessors', function(){
        var chart = d4.baseChart({ builder : this.builder });
        expect(chart.x).to.be.an('function');
        expect(chart.x.key()).to.equal('x');
        chart.x.key('y');
        expect(chart.x.key()).to.equal('y');
      });
    });

    describe('when setting margins', function() {
      it('should recalculate the `height()` and `width()` when margins are adjusted', function(){
        var margin = {top: 20, right: 20, bottom: 40, left: 40};
        var testMargin = function(){
          d4.each(d3.keys(margin), function(k){
            expect(chart.margin()[k]).to.be.equal(margin[k]);
          }.bind(this));
        };
        var chart = d4.charts.column()
        .outerWidth(400)
        .outerHeight(400);
        testMargin.bind(this)();

        expect(chart.height()).to.be.equal(340);
        expect(chart.width()).to.be.equal(340);

        expect(chart.outerHeight()).to.be.equal(400);
        expect(chart.outerWidth()).to.be.equal(400);
        margin = {top: 0, left:0, right: 0, bottom: 0};
        chart.margin(margin);
        testMargin.bind(this)();

        expect(chart.outerHeight()).to.be.equal(400);
        expect(chart.outerWidth()).to.be.equal(400);
        expect(chart.height()).to.be.equal(400);
        expect(chart.width()).to.be.equal(400);
      });

      it('should allow you to specify all four margins in a single object', function(){
        var chart = d4.charts.column();
        chart.margin({ left: 10, right: 10, top: 10, bottom: 10 });
        expect(chart.margin().left).to.be.equal(10);
        expect(chart.margin().right).to.be.equal(10);
        expect(chart.margin().top).to.be.equal(10);
        expect(chart.margin().bottom).to.be.equal(10);
      });

      it('should allow you to specify an arbitrary number of margin using an object', function(){
        var chart = d4.charts.column();
        expect(chart.margin().top).to.be.equal(20);
        chart.margin({ left: 100 });
        expect(chart.margin().left).to.be.equal(100);
        expect(chart.margin().top).to.be.equal(20);
        chart.margin(function(){
          return { left: 1000 };
        });
        expect(chart.margin().left).to.be.equal(1000);

      });

      it('should allow you to specify a single margin property using the custom accessors', function(){
        var chart = d4.charts.column();
        expect(chart.margin().top).to.be.equal(20);
        chart.marginTop(200);
        expect(chart.margin().top).to.be.equal(200);
        chart.marginTop(300);
        expect(chart.margin().top).to.be.equal(300);
      });
    });

    describe('when defining a config object', function() {
      it('should allow you to specify public accessors functions', function() {
        var chart = d4.baseChart({ builder : this.builder, config : {
          accessors: { z: 'z', arcWidth : function(){return 10;} }
        }});
        expect(chart.arcWidth).to.not.be.an('undefined');
        expect(chart.z).to.not.be.an('undefined');
      });

      it('should allow you to get the value or set the value using the accessor methods', function() {
        var chart = d4.baseChart({builder : this.builder, config : {
          margin: {
            left: 4000
          }
        }});
        expect(chart.margin().left).to.equal(4000);
        chart.margin({left:500});
        expect(chart.margin().left).to.equal(500);
      });

      it('should allow you to set a single attribute of the margin object', function(){
        var chart = d4.baseChart({builder : this.builder, config : {
          margin: {
            left: 4000
          }
        }});
        expect(chart.margin().left).to.equal(4000);
        chart.marginLeft(500);
        expect(chart.margin().left).to.equal(500);
        expect(chart.marginLeft()).to.equal(500);
      });
    });
  });

  describe('#outerWidth()', function(){
    it('should calculate the width with or without margin', function(){
      var chart = d4.charts.column();
      chart.margin({ top: 10, bottom: 10, left : 10, right: 10 });
      chart.outerWidth(520);
      expect(chart.outerWidth()).to.equal(520);
      expect(chart.width()).to.equal(500);
    });
  });

  describe('#outerHeight()', function(){
    it('should calculate the height with or without margin', function(){
      var chart = d4.charts.column();
      chart.margin({ top: 10, bottom: 10, left : 10, right: 10 });
      chart.outerHeight(520);
      expect(chart.outerHeight()).to.equal(520);
      expect(chart.height()).to.equal(500);
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

    it('should allow deep merges of two objects', function() {
      var obj2 = {foo: 'bar'};
      var obj = {name: 'martha', items: [obj2] };
      var a = {
        hello: {
          foo: 'foo',
          baz: 'woof',
        },
        items: [obj]
      },
        b = {
          hello: {
            bar: 'bar',
            baz: 'baz'
          },
          items: [{name: 'martha', items: [{foo : 'bar' }]}],
          hi: 'hi'
        };
      var c = d4.merge(a, b);
      expect(c.hello.foo).to.equal('foo');
      expect(c.hello.bar).to.equal('bar');
      expect(c.hello.baz).to.equal('baz');
      expect(a.hello.baz).to.equal('woof');
      expect(c.hi).to.equal('hi');
      expect(c.items.length).to.equal(2);
      d4.each(c.items, function(item){
        expect(item.name).to.equal('martha');
        expect(item.items[0].foo).to.equal('bar');
      }.bind(this));

      obj.name = 'foo';
      obj2.foo = 'baz';

      // ensure we are dealing with copies of the object and not just references
      d4.each(c.items, function(item){
        expect(item.name).to.equal('martha');
        expect(item.items[0].foo).to.equal('bar');
      }.bind(this));
    });
  });

  describe('#flatten()', function(){
    it('should flatten a multidimensional array', function(){
      var a = [[1,2],[3,4]];
      expect(d4.flatten(a)).to.eql([1,2,3,4]);
    });

    it('should flatten a mixed array', function(){
      var a = [1,2,[3,4]];
      expect(d4.flatten(a)).to.eql([1,2,3,4]);
    });
  });

  describe('#isContinuousScale()', function(){
    it('should return true or false if the scale in question supports continuous values', function(){
      expect(d4.isContinuousScale(d3.scale.category10())).to.equal(false);
      expect(d4.isContinuousScale(d3.scale.category20())).to.equal(false);
      expect(d4.isContinuousScale(d3.scale.category20b())).to.equal(false);
      expect(d4.isContinuousScale(d3.scale.category20c())).to.equal(false);
      expect(d4.isContinuousScale(d3.scale.identity())).to.equal(false);
      expect(d4.isContinuousScale(d3.scale.linear())).to.equal(true);
      expect(d4.isContinuousScale(d3.scale.log())).to.equal(true);
      expect(d4.isContinuousScale(d3.scale.ordinal())).to.equal(false);
      expect(d4.isContinuousScale(d3.scale.pow())).to.equal(true);
      expect(d4.isContinuousScale(d3.scale.quantile())).to.equal(false);
      expect(d4.isContinuousScale(d3.scale.quantize())).to.equal(false);
      expect(d4.isContinuousScale(d3.scale.sqrt())).to.equal(true);
      expect(d4.isContinuousScale(d3.scale.threshold())).to.equal(false);
    });
  });

  describe('#isDefined()', function(){
    it('should determine if a value is undefined or not', function(){
      expect(d4.isDefined(undefined)).to.equal(false);
      expect(d4.isDefined(false)).to.equal(true);
      expect(d4.isDefined(true)).to.equal(true);
      expect(d4.isDefined()).to.equal(false);
      expect(d4.isDefined('undefined')).to.equal(true);
    });
  });

  describe('#isOrdinalScale()', function(){
    it('should return true or false if the scale in question supports continuous values', function(){
      expect(d4.isOrdinalScale(d3.scale.category10())).to.equal(true);
      expect(d4.isOrdinalScale(d3.scale.category20())).to.equal(true);
      expect(d4.isOrdinalScale(d3.scale.category20b())).to.equal(true);
      expect(d4.isOrdinalScale(d3.scale.category20c())).to.equal(true);
      expect(d4.isOrdinalScale(d3.scale.identity())).to.equal(true);
      expect(d4.isOrdinalScale(d3.scale.linear())).to.equal(false);
      expect(d4.isOrdinalScale(d3.scale.log())).to.equal(false);
      expect(d4.isOrdinalScale(d3.scale.ordinal())).to.equal(true);
      expect(d4.isOrdinalScale(d3.scale.pow())).to.equal(false);
      expect(d4.isOrdinalScale(d3.scale.quantile())).to.equal(true);
      expect(d4.isOrdinalScale(d3.scale.quantize())).to.equal(true);
      expect(d4.isOrdinalScale(d3.scale.sqrt())).to.equal(false);
      expect(d4.isOrdinalScale(d3.scale.threshold())).to.equal(true);
    });
  });

  describe('#isUndefined()', function(){
    it('should determine if a value is undefined or not', function(){
      expect(d4.isUndefined(undefined)).to.equal(true);
      expect(d4.isUndefined(false)).to.equal(false);
      expect(d4.isUndefined(true)).to.equal(false);
      expect(d4.isUndefined()).to.equal(true);
      expect(d4.isUndefined('undefined')).to.equal(false);
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
      var chart = d4.charts.column();
      expect(function() {
        chart.mixin();
      }).to.throw(Error, '[d4] You need to supply an object or array of objects to mixin to the chart.');
    });
    it('should require features that specify proxies to use the correct format', function(){
      var chart = d4.baseChart();
      d4.feature('faker', function() {
        var arc = d3.svg.arc();
        return { proxies: [{ target : arc }] };
      });
      d4.feature('badfaker', function() {
        var arc = d3.svg.arc();
        return { proxies: [arc] };
      });
      chart.mixin({name : 'fake', feature : d4.features.faker});
      chart.using('fake', function(fake){
        expect(fake.innerRadius).to.not.be.an('undefined');
      });
      expect(function() {
        chart.mixin({name : 'badfake', feature : d4.features.badfaker});
      }).to.throw(Error, '[d4] You included a feature which has a malformed proxy target.');
    });
    it('should allow you to specify a prefix for the proxy', function(){
      var chart = d4.baseChart();
      d4.feature('faker', function() {
        var arc = d3.svg.arc();
        return { proxies: [{ target : arc, prefix: 'foo' }] };
      });
      chart.mixin({name : 'fake', feature : d4.features.faker});
      chart.using('fake', function(fake){
        expect(fake.fooInnerRadius).to.not.be.an('undefined');
      });
    });

    it('should add the newly mixed in feature into the list of features', function() {
      var chart = d4.charts.column();
      ['bars', 'barLabels', 'xAxis', 'yAxis'].forEach(function(feature) {
        expect(chart.features()).to.include(feature);
      });
      expect(chart.features()).to.not.include('grid');
      chart.mixin({
        'name' : 'grid',
        'feature' : d4.features.grid
      });
      expect(chart.features()).to.include('grid');
    });

    it('should add a feature in a specific index', function() {
      var chart = d4.charts.column();
      expect(chart.features()).to.not.include('grid');
      chart.mixin({
        'name' : 'grid',
        'feature' : d4.features.grid,
        'index' : 0
      });
      expect(chart.features()[0]).to.equal('grid');
    });

    it('should convert a negative index to zero', function() {
      var chart = d4.charts.column();
      expect(chart.features()).to.not.include('grid2');
      chart.mixin({
        'name' : 'grid2',
        'feature' : d4.features.grid,
        'index' : -1
      });
      expect(chart.features()[0]).to.equal('grid2');
    });

    it('should add a feature to the end if the index is larger than the features array length', function() {
      var chart = d4.charts.column();
      expect(chart.features()).to.not.include('grid3');
      chart.mixin({
        'name' : 'grid3',
        'feature' : d4.features.grid,
        'index' : 1000
      });
      expect(chart.features()[chart.features().length - 1]).to.equal('grid3');
    });

    it('should allow a feature to beforeRender the data before rendering', function(){
      var chartData = [{
        x: '2010',
        y: -10
      }];
      var overrides = function() {
        return {
          beforeRender : function(data) {
            return {x : data.y, y: data.x};
          },
          render : function(data) {
            expect(data.x).to.be.equal(chartData.y);
            expect(data.y).to.be.equal(chartData.x);
          }
        };
      };
      var chart = d4.charts.column();
      chart.mixin({
        'name' : 'grid',
        'feature' :  d4.features.grid,
        'overrides': overrides
      });

      d3.select('#chart')
        .datum(chartData)
        .call(chart);
    });
    it('should allow a feature to beforeRender the data before rendering', function(){
      var chartData = [{
        x: '2010',
        y: -10
      }];
      var overrides = function() {
        return {
          beforeRender : function(data) {
            return {x : data.y, y: data.x};
          },
          render : function(data) {
            expect(data.x).to.be.equal(chartData.y);
            expect(data.y).to.be.equal(chartData.x);
          }
        };
      };
      var chart = d4.charts.column();
      chart.mixin({
        'name' : 'grid',
        'feature' :  d4.features.grid,
        'overrides': overrides
      });

      d3.select('#chart')
        .datum(chartData)
        .call(chart);
    });

    it('should allow you to override the native beforeRender within the mixin', function(){
      var chart = d4.charts.column();
      var lameFeature = function(name){
        return {
          accessors : {
            foo : function() {
              return 'foo';
            },
            bar : function() {
              return 'bar';
            }
          },
          render : function(scope, data, selection) {
            data.push(1);
            selection.append('g').attr('class', name);
            return 'foo';
          }
        };
      };
      chart.mixin({
        'name' : 'lameness',
        'feature' : lameFeature
      })
      .using('lameness', function(l){
        l.beforeRender(function(data){
          data[0] = 'foo';
          return data;
        })
        .afterRender(function(feature, data){
          expect(feature.afterRender).to.not.be.an('undefined');
          expect(data[0]).to.be.equal('foo');
        });
      });
      d3.select('#chart')
        .datum(['bar'])
        .call(chart);
    });

    it('should not touch existing accessors that were specified in the override object', function(){
      var lameFeature = function(){
        return {
          accessors : {
            foo : function() {
              return 'foo';
            },
            bar : function() {
              return 'bar';
            }
          },
          render : function(scope) {
            expect(scope.accessors.foo.bind(this)()).to.be.equal('foo');
            expect(scope.accessors.bar.bind(this)()).to.be.equal('baz');
          }
        };
      };

      var overrides = function() {
        return {
          accessors : {
            bar : function(){
              return 'baz';
            }
          }
        };
      };

      var chart = d4.charts.column();
      chart.mixin({
        'name' : 'lameness',
        'feature' : lameFeature,
        'overrides' : overrides
      });
      d3.select('#chart')
        .datum([])
        .call(chart);
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
      var chart = d4.charts.column();
      chart.mixin({
        'name' : 'grid',
        'feature' : d4.features.grid,
        'overrides': overrides
      })
        .using('grid', function(grid) {
          expect(grid.newAccessor).to.not.be.an('undefined');
        });

      d3.select('#chart')
        .datum(data)
        .call(chart);

      expect(spy).to.have.been.called();

    });
  });

  describe('#mixout()', function() {
    it('should allow you to mix out an existing feature from a chart', function() {
      var chart = d4.charts.column();
      expect(chart.features()).to.include('bars');
      chart.mixout('bars');
      expect(chart.features()).to.not.include('bars');
    });

    it('should allow you to supply an array of features to mix out', function(){
      var chart = d4.charts.column();
      var features = ['bars', 'barLabels', 'xAxis', 'yAxis'];
      d4.each(features, function(feature){
        expect(chart.features()).to.include(feature);
      });
      chart.mixout(features);
      d4.each(features, function(feature){
        expect(chart.features()).to.not.include(feature);
      });
    });

    it('should require a feature name to mixout of the chart', function() {
      var chart = d4.charts.column();
      expect(function() {
        chart.mixout();
      }).to.throw(Error, '[d4] A string or array of names is required in order to mixout a chart feature.');
    });
  });

  describe('#append()', function() {
    it('should add an element if it does not exist', function(){
      expect(d3.select('svg.chart.foo')[0][0]).to.be.an('null');
      d4.appendOnce(d3.select('#chart'),'svg#one.chart.foo');
      d4.appendOnce(d3.select('#chart'),'svg#two.chart.bar');
      expect(d3.select('svg#one.chart.foo')[0][0]).to.not.be.an('null');
      expect(d3.select('svg.chart.bar')[0][0]).to.not.be.an('null');
    });

    it('should return an element if it does exist', function(){
      d4.appendOnce(d3.select('#chart'),'svg.chart.foo');
      expect(d3.selectAll('svg.chart.foo')[0].length).to.equal(1);
      d4.appendOnce(d3.select('#chart'),'svg.chart.foo');
      expect(d3.selectAll('svg.chart.foo')[0].length).to.equal(1);
      d3.select('#chart').append('svg');
      expect(d3.selectAll('svg')[0].length).to.equal(2);
    });
  });

  describe('#using()', function() {
    it('should throw an error if you try to use a non-existent feature', function() {
      var chart = d4.charts.column();
      expect(function() {
        chart.using('foo', function() {});
      }).to.throw(Error, '[d4] Could not find feature: "foo", maybe you forgot to mix it in?');
    });

    it('should allow you to use a feature of a chart', function() {
      var chart = d4.charts.column();
      chart.using('bars', function(bars) {
        expect(bars.accessors).to.not.be.an('undefined');
      });
    });

    it('should throw an error is you try and use a feature without supplying a function', function() {
      var chart = d4.charts.column();
      expect(function() {
        chart.using('bars');
      }).to.throw(Error, '[d4] You must supply a continuation function in order to use a chart feature.');
    });
    it('should create a proxy for d3 mouse and touch events for a given selection', function(){
      var chart = d4.charts.column();
      chart
      .using('bars', function(bar){
        bar.on('mouseup', function(){})
        .width(function(){});
        expect(bar.on).to.be.an('function');
      });
    });
  });

  describe('#builder()', function() {
    it('should require a valid builder function to use as a builder', function() {
      var chart = d4.charts.column();
      var badBuilder = function() {
        return {
          link: 'foo'
        };
      };
      expect(function() {
        chart.builder(badBuilder);
      }).to.throw(Error, '[d4] The supplied builder does not have a link function');
    });

    it('should be able to determine if a d3 scale property has been overridden by the user', function(){
      var chart = d4.charts.column();
      chart.x(function(x){
        expect(x.range.$dirty).to.equal(false);
        x.range([1,10]);
        expect(x.range.$dirty).to.equal(true);
      });
      var chartData = [{ x: 1, y: 2 }];
      chart.builder(function() {
        return {
          link: function(chart, data) {
            expect(chart.x.domain.$dirty).to.equal(false);
            expect(chart.x.range.$dirty).to.equal(true);
            d4.builders[chart.x.$scale + 'ScaleForNestedData'](chart, data, 'x');
            d4.builders[chart.y.$scale + 'ScaleForNestedData'](chart, data, 'y');
          }
        };
      });

      d3.select('#chart')
        .datum(chartData)
        .call(chart);
    });

    it('should allow you to replace the default builder with your custom one', function() {
      var chart = d4.charts.column();
      var chartData = [{ x: 1, y: 2 }];
      chart.builder(function() {
        return {
          link: function(chart, data) {
            expect(chart).to.not.be.an('undefined');
            expect(data).to.not.be.an('undefined');
            d4.builders[chart.x.$scale + 'ScaleForNestedData'](chart, data, 'x');
            d4.builders[chart.y.$scale + 'ScaleForNestedData'](chart, data, 'y');
          }
        };
      });

      d3.select('#chart')
        .datum(chartData)
        .call(chart);
    });
  });
});
