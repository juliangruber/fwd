
# fwd

Forward one `(emitter|stream)`'s events to another -> connect parts of your application whose interface you have no control over.

## Installation

```bash
$ component install juliangruber/fwd
$ npm install fwd
```

## Usage

### EventEmitter → EventEmitter

```javascript
var fwd = require('fwd');
var Stream = require('stream');
var EventEmitter = require('events').EventEmitter;

var src = new EventEmitter();
var dest = new EventEmitter();

fwd(src, dest);

dest.on('event', function() {
  // success
});

src.emit('event');

```

### Stream → EventEmitter

```javascript
var src = new Stream();
src.readable = true;
var dest = new EventEmitter();

fwd(src, dest, {'data': 'entry'});
```

### EventEmitter → Stream

```javascript
var src = new EventEmitter();
var dest = new Stream();
dest.writable = true;

fwd(src, dest, {'entry': 'data'});
fwd(src, dest, {'wrong': JSON.stringify})

```

### Rules

You can rewrite data on-the-fly:

```javascript
var src = new EventEmitter();
var dest = new EventEmitter();

fwd(src, dest, '*');                                // the same as with no 3rd argument
fwd(src, dest, ['event1', 'event2'])                // only forward event1 and event2
fwd(src, dest, [{'event1': 'entry'}, '*'])          // forward event1 as entry and everything else
fwd(src, dest, [{'event1': function(data) {         // forward event1 with it's data doubled 
  return data*2;
}}]);
fwd(src, dest, [{'event1': function(event, data) {  // also rewrite the event name
  return {
    event: 'event-foo',
    data : data*2
  }
}}]);
fwd(src, dest, function(event, data) {              // forward and rewrite everything
  return {                                          // the same as: {'*': function(){ ... }}
    event: 'my-'+event,
    data : JSON.stringify(data)
  }
});
```

## API

### fwd(src, dest)

Forward all events from `src` to `dest`.

### fwd(src, dest, event=string)

Forward only `event`.

### fwd(src, dest, events=[string,..])

Forward only `events`.

### fwd(src, dest, mapping={from: to})

Rewrite names and fwd only that. `mapping` can be in an array to do multiple rewrites at one.

### fwd(src, dest, fn=function)

Apply `fn` to

* `(data)` and return modified `data`
* `(event, data)` and return `{event:'event', data:'data'}`

`fn` can also appear inside mappings.
