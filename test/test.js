var fwd = require('../index');
var Emitter = require('events').EventEmitter;
var Stream = require('stream');
var expect = require('expect.js');

describe('fwd', function() {
  describe('fwd(ee, ee)', function() {
    it('should forward all events', function(done) {
      var src = new Emitter();
      var dest = new Emitter();
      fwd(src, dest);
      dest.on('event', function(data) {
        expect(data).to.be('data');
        done();
      });
      src.emit('event', 'data');
    });
  });
  describe('fwd(s, ee)', function() {
    it('should forward all data', function(done) {
      var src = new Stream();
      src.readable = true;
      var dest = new Emitter();
      fwd(src, dest, {'data': 'event'});
      dest.on('event', function(data) {
        expect(data).to.be('mydata');
        done();
      });
      src.emit('data', 'mydata');
    });
  });
  describe('fwd(ee, s)', function() {
    it('should forward all data', function(done) {
      var src = new Emitter();
      var dest = new Stream();
      dest.writable = true;
      fwd(src, dest, 'event');
      dest.write = function(data) {
        expect(data).to.be('my-data');
        done();
      }
      src.emit('event', 'my-data');
    });
  });
});
