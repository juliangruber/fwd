var Emitter = require('events').EventEmitter;
var Stream = require('stream');

function fwd(src, dest, rules) {
  var emit = src.emit;
  src.emit = function() {
    var args = [].slice.call(arguments);
    if (!(args = fwd.applyRules(rules, args))) return;
    if (src instanceof Stream && dest instanceof Stream) {
      var transmitter = new Stream();
      transmitter.readable = true;
      transmitter.pipe(dest);
      transmitter.emit('data', args[1]);
    } else if (dest instanceof Stream) {
      dest.write(args[1]);
    } else {
      dest.emit.apply(dest, args);
    }
    emit.apply(src, arguments);
  }
}

fwd.applyRules = function(rules, data) {
  if (typeof rules == 'string') {
    if (data[0] != rules) return false;
  }
  else if (typeof rules == 'object') {
    for (var event in rules) {
      if (data[0] == event) data[0] = rules[event];
    }  
  }
  return data;
};

module.exports = fwd;
