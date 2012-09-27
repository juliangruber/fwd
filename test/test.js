var fwd = require('../index');
var Emitter = require('events').EventEmitter;
var Stream = require('stream');
var expect = require('expect.js');

describe('fwd', function() {
  describe('fwd(ee, ee)', function() {
    var src, dest;
    beforeEach(function() {
      src = new Emitter();
      dest = new Emitter();
    });
    it('should forward all events', function(done) {
      fwd(src, dest);
      dest.on('event', function(data) {
        expect(data).to.be('data');
        done();
      });
      src.emit('event', 'data');
    });
    it('should forward one event', function(done) {
      fwd(src, dest, 'one');
      dest.on('one', function(data) {
        expect(data).to.be('my-data');
        done();
      });
      dest.on('another', function() {
        throw new Error('bad');
      });
      src.emit('enother');
      src.emit('one', 'my-data');
    });
    it('should forward multiple events', function(done) {
      fwd(src, dest, ['one', 'another']);
      var received = 0;
      dest.on('false', function() {
        throw new Error('bad');
      });
      dest.on('one', function(data) {
        expect(data).to.be('my-data');
        received++;
      });
      dest.on('another', function(data) {
        expect(data).to.be('my-data');
        expect(++received).to.be(2);
        done();
      });
      src.emit('false');
      src.emit('one', 'my-data');
      src.emit('another', 'my-data');
    });
    it('should support [*]', function(done) {
      fwd(src, dest, ['*']);
      dest.on('event', function(data) {
        expect(data).to.be('my-data');
        done();
      });
      src.emit('event', 'my-data');
    });
    it('should put single arguments in an array', function(done) {
      fwd(src, dest, '*');
      dest.on('event', function(data) {
        expect(data).to.be('my-data');
        done();
      });
      src.emit('event', 'my-data');
    });
    it('should support {from: to}', function(done) {
      fwd(src, dest, {'from': 'to'});
      dest.on('to', done);
      src.emit('from');
    });
    it('should support [{from: to}, *]', function(done) {
      fwd(src, dest, [{'from': 'to'}, '*']);
      var received = 0;
      dest.on('to', function() {
        received++;
      });
      dest.on('another', function() {
        expect(++received).to.be(2);
        done();
      });
      src.emit('from');
      src.emit('another');
    });
    it('should call a function with 1 argument', function(done) {
      fwd(src, dest, function(data) {
        expect(data).to.be('my-data');
        return 'changed';
      });
      dest.on('data', function(data) {
        expect(data).to.be('changed');
        done();
      });
      src.emit('data', 'my-data');
    });
    it('should call a function with 2 arguments', function(done) {
      fwd(src, dest, function(event, data) {
        expect(event).to.be('data');
        expect(data).to.be('my-data');
        return {
          'event': 'changed-event',
          'data' : 'changed-data'
        };
      });
      dest.on('changed-event', function(data) {
        expect(data).to.be('changed-data');
        done();
      });
      src.emit('data', 'my-data');
    });
    it('should call a function in a map', function(done) {
      fwd(src, dest, [{'change-me': function(data) {
        return 'changed-'+data;
      }}, '*']);
      var received = 0;
      dest.on('unchanged', function(data) {
        expect(data).to.be('data');
        received++;
      });
      dest.on('change-me', function(data) {
        expect(++received).to.be(2);
        expect(data).to.be('changed-data');
        done();
      });
      src.emit('unchanged', 'data');
      src.emit('change-me', 'data');
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
      src.emit('else', 'bad');
      src.emit('event', 'my-data');
    });
  });
  describe('fwd(s, s)', function() {
    it('should forward all data', function(done) {
      var src = new Stream();
      src.readable = true;
      var dest = new Stream();
      dest.writable = true;

      fwd(src, dest);

      dest.write = function(data) {
        expect(data).to.be('my-data');
        done();
      }
      src.emit('data', 'my-data');
    })
  });
});
