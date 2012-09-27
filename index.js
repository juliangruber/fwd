var Stream = require('stream');

function fwd(src, dest, rules) {
  var emit = src.emit;
  src.emit = function() {
    var args = [].slice.call(arguments);
    if (!(args = fwd.applyRules(rules, args))) return;
    if (src.pipe && dest.pipe) {
      var transmitter = new Stream();
      transmitter.readable = true;
      transmitter.pipe(dest);
      transmitter.emit('data', args[1]);
    } else if (dest.pipe) {
      dest.write(args[1]);
    } else {
      dest.emit.apply(dest, args);
    }
    emit.apply(src, arguments);
  }
}

fwd.applyRules = function(rules, data) {
  if (!rules) return data;
  if (!isArray(rules)) rules = [rules];
  var matched = false;
  for (var i = 0; i < rules.length; i++) {
    var rule = rules[i];
    if (match(rule, data[0])) matched = true;
    if (typeof rule == 'function') {
      matched = true;
      data = applyFn(rule, data);
    } else if (typeof rule == 'object') {
      for (var event in rule) {
        if (data[0] == event) {
          matched = true;
          if (typeof rule[event] == 'function') {
            data = applyFn(rule[event], data);
          } else {
            data[0] = rule[event];
          }
        }
      }  
    }
  }
  if (!matched) return false;
  return data;
};

function applyFn(fn, data) {
  if (fn.length == 1) data[1] = fn(data[1]);
  if (fn.length == 2) {
    var res = fn.apply(null, data);
    data[0] = res.event;
    data[1] = res.data;
  }
  return data;
}

function match(rule, string) {
  if (rule == '*') return true;
  if (rule == string) return true;
  return false;
}

function isArray(arr) {
  return Object.prototype.toString.apply(arr) === '[object Array]';
}

module.exports = fwd;
