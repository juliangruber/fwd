var Emitter = require('events').EventEmitter;
var Stream = require('stream');

function fwd(src, dest, rules) {
  var emit = src.emit;
  src.emit = function() {
    dest.emit.apply(dest, arguments);
    emit.apply(src, arguments);
  }
}

module.exports = fwd;
