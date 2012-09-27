var Emitter = require('events').EventEmitter;
var Stream = require('stream');

function fwd(src, dest, rules) {
  if (src instanceof Emitter) {
    var emit = src.emit;
    src.emit = function() {
      var args = [].slice.call(arguments);
      args = fwd.applyRules(rules, args);
      if (dest instanceof Stream) {
        dest.write(args[1]);
      } else {
        dest.emit.apply(dest, args);
      }
      emit.apply(src, arguments);
    }
  }
}

fwd.applyRules = function(rules, data) {
  if (typeof rules == 'object') {
    for (var event in rules) {
      if (data[0] == event) data[0] = rules[event];
    }  
  }
  return data;
};

module.exports = fwd;
