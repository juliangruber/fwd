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
      dest.on('event', done);
      src.emit('event');
    });
  });
});
