/*global describe:true*/
/*global it:true*/
/*global beforeEach:true*/
/*global document:true*/

'use strict';

describe( 'using browserify', function(){
  it('should compile d4 with require', function() {
     var d4 = require( '../lib/d4.js' );
     expect(d4).to.not.be.an('undefined');
  });
});
