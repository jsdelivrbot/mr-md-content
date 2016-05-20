System.registerDynamic("npm:bail@1.0.0/index", [], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  function bail(err) {
    if (err) {
      throw err;
    }
  }
  module.exports = bail;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:bail@1.0.0", ["npm:bail@1.0.0/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:bail@1.0.0/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:co@3.1.0/index", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var slice = Array.prototype.slice;
  module.exports = co;
  function co(fn) {
    var isGenFun = isGeneratorFunction(fn);
    return function(done) {
      var ctx = this;
      var gen = fn;
      if (isGenFun) {
        var args = slice.call(arguments),
            len = args.length;
        var hasCallback = len && 'function' == typeof args[len - 1];
        done = hasCallback ? args.pop() : error;
        gen = fn.apply(this, args);
      } else {
        done = done || error;
      }
      next();
      function exit(err, res) {
        setImmediate(function() {
          done.call(ctx, err, res);
        });
      }
      function next(err, res) {
        var ret;
        if (arguments.length > 2)
          res = slice.call(arguments, 1);
        if (err) {
          try {
            ret = gen.throw(err);
          } catch (e) {
            return exit(e);
          }
        }
        if (!err) {
          try {
            ret = gen.next(res);
          } catch (e) {
            return exit(e);
          }
        }
        if (ret.done)
          return exit(null, ret.value);
        ret.value = toThunk(ret.value, ctx);
        if ('function' == typeof ret.value) {
          var called = false;
          try {
            ret.value.call(ctx, function() {
              if (called)
                return;
              called = true;
              next.apply(ctx, arguments);
            });
          } catch (e) {
            setImmediate(function() {
              if (called)
                return;
              called = true;
              next(e);
            });
          }
          return;
        }
        next(new TypeError('You may only yield a function, promise, generator, array, or object, ' + 'but the following was passed: "' + String(ret.value) + '"'));
      }
    };
  }
  function toThunk(obj, ctx) {
    if (isGeneratorFunction(obj)) {
      return co(obj.call(ctx));
    }
    if (isGenerator(obj)) {
      return co(obj);
    }
    if (isPromise(obj)) {
      return promiseToThunk(obj);
    }
    if ('function' == typeof obj) {
      return obj;
    }
    if (isObject(obj) || Array.isArray(obj)) {
      return objectToThunk.call(ctx, obj);
    }
    return obj;
  }
  function objectToThunk(obj) {
    var ctx = this;
    var isArray = Array.isArray(obj);
    return function(done) {
      var keys = Object.keys(obj);
      var pending = keys.length;
      var results = isArray ? new Array(pending) : new obj.constructor();
      var finished;
      if (!pending) {
        setImmediate(function() {
          done(null, results);
        });
        return;
      }
      if (!isArray) {
        for (var i = 0; i < pending; i++) {
          results[keys[i]] = undefined;
        }
      }
      for (var i = 0; i < keys.length; i++) {
        run(obj[keys[i]], keys[i]);
      }
      function run(fn, key) {
        if (finished)
          return;
        try {
          fn = toThunk(fn, ctx);
          if ('function' != typeof fn) {
            results[key] = fn;
            return --pending || done(null, results);
          }
          fn.call(ctx, function(err, res) {
            if (finished)
              return;
            if (err) {
              finished = true;
              return done(err);
            }
            results[key] = res;
            --pending || done(null, results);
          });
        } catch (err) {
          finished = true;
          done(err);
        }
      }
    };
  }
  function promiseToThunk(promise) {
    return function(fn) {
      promise.then(function(res) {
        fn(null, res);
      }, fn);
    };
  }
  function isPromise(obj) {
    return obj && 'function' == typeof obj.then;
  }
  function isGenerator(obj) {
    return obj && 'function' == typeof obj.next && 'function' == typeof obj.throw;
  }
  function isGeneratorFunction(obj) {
    return obj && obj.constructor && 'GeneratorFunction' == obj.constructor.name;
  }
  function isObject(val) {
    return val && Object == val.constructor;
  }
  function error(err) {
    if (!err)
      return;
    setImmediate(function() {
      throw err;
    });
  }
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:co@3.1.0", ["npm:co@3.1.0/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:co@3.1.0/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:wrap-fn@0.1.4/index", ["npm:co@3.1.0"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var noop = function() {};
  var co = $__require('npm:co@3.1.0');
  module.exports = wrap;
  function wrap(fn, done) {
    done = once(done || noop);
    return function() {
      var i = arguments.length;
      var args = new Array(i);
      while (i--)
        args[i] = arguments[i];
      var ctx = this;
      if (!fn) {
        return done.apply(ctx, [null].concat(args));
      }
      if (fn.length > args.length) {
        try {
          return fn.apply(ctx, args.concat(done));
        } catch (e) {
          return done(e);
        }
      }
      if (generator(fn)) {
        return co(fn).apply(ctx, args.concat(done));
      }
      return sync(fn, done).apply(ctx, args);
    };
  }
  function sync(fn, done) {
    return function() {
      var ret;
      try {
        ret = fn.apply(this, arguments);
      } catch (err) {
        return done(err);
      }
      if (promise(ret)) {
        ret.then(function(value) {
          done(null, value);
        }, done);
      } else {
        ret instanceof Error ? done(ret) : done(null, ret);
      }
    };
  }
  function generator(value) {
    return value && value.constructor && 'GeneratorFunction' == value.constructor.name;
  }
  function promise(value) {
    return value && 'function' == typeof value.then;
  }
  function once(fn) {
    return function() {
      var ret = fn.apply(this, arguments);
      fn = noop;
      return ret;
    };
  }
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:wrap-fn@0.1.4", ["npm:wrap-fn@0.1.4/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:wrap-fn@0.1.4/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:ware@1.3.0/lib/index", ["npm:wrap-fn@0.1.4"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var slice = [].slice;
  var wrap = $__require('npm:wrap-fn@0.1.4');
  module.exports = Ware;
  function fail(err) {
    throw err;
  }
  function Ware(fn) {
    if (!(this instanceof Ware))
      return new Ware(fn);
    this.fns = [];
    if (fn)
      this.use(fn);
  }
  Ware.prototype.use = function(fn) {
    if (fn instanceof Ware) {
      return this.use(fn.fns);
    }
    if (fn instanceof Array) {
      for (var i = 0,
          f; f = fn[i++]; )
        this.use(f);
      return this;
    }
    this.fns.push(fn);
    return this;
  };
  Ware.prototype.run = function() {
    var fns = this.fns;
    var ctx = this;
    var i = 0;
    var last = arguments[arguments.length - 1];
    var done = 'function' == typeof last && last;
    var args = done ? slice.call(arguments, 0, arguments.length - 1) : slice.call(arguments);
    function next(err) {
      if (err)
        return (done || fail)(err);
      var fn = fns[i++];
      var arr = slice.call(args);
      if (!fn) {
        return done && done.apply(null, [null].concat(args));
      }
      wrap(fn, next).apply(ctx, arr);
    }
    next();
    return this;
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:ware@1.3.0", ["npm:ware@1.3.0/lib/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:ware@1.3.0/lib/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:attach-ware@1.0.0/index", ["npm:unherit@1.0.4"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var slice = [].slice;
  var unherit = $__require('npm:unherit@1.0.4');
  function patch(Ware) {
    var useFn = Ware.prototype.use;
    var AttachWare = unherit(Ware);
    AttachWare.prototype.foo = true;
    function use(attach) {
      var self = this;
      var params = slice.call(arguments, 1);
      var index;
      var length;
      var fn;
      if (attach instanceof AttachWare) {
        if (attach.attachers) {
          return self.use(attach.attachers);
        }
        return self;
      }
      if (attach instanceof Ware) {
        self.fns = self.fns.concat(attach.fns);
        return self;
      }
      if ('length' in attach && typeof attach !== 'function') {
        index = -1;
        length = attach.length;
        while (++index < length) {
          self.use.apply(self, [attach[index]].concat(params));
        }
        return self;
      }
      fn = attach.apply(null, [self.context || self].concat(params));
      if (!self.attachers) {
        self.attachers = [];
      }
      self.attachers.push(attach);
      if (fn) {
        useFn.call(self, fn);
      }
      return self;
    }
    AttachWare.prototype.use = use;
    return function(fn) {
      return new AttachWare(fn);
    };
  }
  module.exports = patch;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:attach-ware@1.0.0", ["npm:attach-ware@1.0.0/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:attach-ware@1.0.0/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:vfile@1.3.1/index", ["github:jspm/nodelibs-process@0.1.2"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var SEPARATOR = '/';
    try {
      SEPARATOR = $__require('pa' + 'th').sep;
    } catch (e) {}
    function VFileMessage(reason) {
      this.message = reason;
    }
    function VFileMessagePrototype() {}
    VFileMessagePrototype.prototype = Error.prototype;
    var proto = new VFileMessagePrototype();
    VFileMessage.prototype = proto;
    proto.file = proto.name = proto.reason = proto.message = proto.stack = '';
    proto.fatal = proto.column = proto.line = null;
    function stringify(position) {
      if (!position) {
        position = {};
      }
      return (position.line || 1) + ':' + (position.column || 1);
    }
    function filePathFactory(file) {
      function filePath() {
        var directory = file.directory;
        var separator;
        if (file.filename || file.extension) {
          separator = directory.charAt(directory.length - 1);
          if (separator === '/' || separator === '\\') {
            directory = directory.slice(0, -1);
          }
          if (directory === '.') {
            directory = '';
          }
          return (directory ? directory + SEPARATOR : '') + file.filename + (file.extension ? '.' + file.extension : '');
        }
        return '';
      }
      filePath.toString = filePath;
      return filePath;
    }
    function basename() {
      var self = this;
      var extension = self.extension;
      if (self.filename || extension) {
        return self.filename + (extension ? '.' + extension : '');
      }
      return '';
    }
    function VFile(options) {
      var self = this;
      if (!(self instanceof VFile)) {
        return new VFile(options);
      }
      if (options && typeof options.message === 'function' && typeof options.hasFailed === 'function') {
        return options;
      }
      if (!options) {
        options = {};
      } else if (typeof options === 'string') {
        options = {'contents': options};
      }
      self.contents = options.contents || '';
      self.messages = [];
      self.filePath = filePathFactory(self);
      self.history = [];
      self.move({
        'filename': options.filename,
        'directory': options.directory,
        'extension': options.extension
      });
    }
    function toString() {
      return this.contents;
    }
    function move(options) {
      var self = this;
      var before = self.filePath();
      var after;
      if (!options) {
        options = {};
      }
      self.directory = options.directory || self.directory || '';
      self.filename = options.filename || self.filename || '';
      self.extension = options.extension || self.extension || '';
      after = self.filePath();
      if (after && before !== after) {
        self.history.push(after);
      }
      return self;
    }
    function message(reason, position) {
      var filePath = this.filePath();
      var range;
      var err;
      var location = {
        'start': {
          'line': null,
          'column': null
        },
        'end': {
          'line': null,
          'column': null
        }
      };
      if (position && position.position) {
        position = position.position;
      }
      if (position && position.start) {
        range = stringify(position.start) + '-' + stringify(position.end);
        location = position;
        position = position.start;
      } else {
        range = stringify(position);
        if (position) {
          location.start = position;
          location.end.line = null;
          location.end.column = null;
        }
      }
      err = new VFileMessage(reason.message || reason);
      err.name = (filePath ? filePath + ':' : '') + range;
      err.file = filePath;
      err.reason = reason.message || reason;
      err.line = position ? position.line : null;
      err.column = position ? position.column : null;
      err.location = location;
      if (reason.stack) {
        err.stack = reason.stack;
      }
      return err;
    }
    function warn() {
      var err = this.message.apply(this, arguments);
      err.fatal = false;
      this.messages.push(err);
      return err;
    }
    function fail(reason, position) {
      var err = this.message(reason, position);
      err.fatal = true;
      this.messages.push(err);
      if (!this.quiet) {
        throw err;
      }
      return err;
    }
    function hasFailed() {
      var messages = this.messages;
      var index = -1;
      var length = messages.length;
      while (++index < length) {
        if (messages[index].fatal) {
          return true;
        }
      }
      return false;
    }
    function namespace(key) {
      var self = this;
      var space = self.data;
      if (!space) {
        space = self.data = {};
      }
      if (!space[key]) {
        space[key] = {};
      }
      return space[key];
    }
    var vFilePrototype = VFile.prototype;
    vFilePrototype.basename = basename;
    vFilePrototype.move = move;
    vFilePrototype.toString = toString;
    vFilePrototype.message = message;
    vFilePrototype.warn = warn;
    vFilePrototype.fail = fail;
    vFilePrototype.hasFailed = hasFailed;
    vFilePrototype.namespace = namespace;
    module.exports = VFile;
  })($__require('github:jspm/nodelibs-process@0.1.2'));
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:vfile@1.3.1", ["npm:vfile@1.3.1/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:vfile@1.3.1/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:base64-js@0.0.8/lib/b64", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  ;
  (function(exports) {
    'use strict';
    var Arr = (typeof Uint8Array !== 'undefined') ? Uint8Array : Array;
    var PLUS = '+'.charCodeAt(0);
    var SLASH = '/'.charCodeAt(0);
    var NUMBER = '0'.charCodeAt(0);
    var LOWER = 'a'.charCodeAt(0);
    var UPPER = 'A'.charCodeAt(0);
    var PLUS_URL_SAFE = '-'.charCodeAt(0);
    var SLASH_URL_SAFE = '_'.charCodeAt(0);
    function decode(elt) {
      var code = elt.charCodeAt(0);
      if (code === PLUS || code === PLUS_URL_SAFE)
        return 62;
      if (code === SLASH || code === SLASH_URL_SAFE)
        return 63;
      if (code < NUMBER)
        return -1;
      if (code < NUMBER + 10)
        return code - NUMBER + 26 + 26;
      if (code < UPPER + 26)
        return code - UPPER;
      if (code < LOWER + 26)
        return code - LOWER + 26;
    }
    function b64ToByteArray(b64) {
      var i,
          j,
          l,
          tmp,
          placeHolders,
          arr;
      if (b64.length % 4 > 0) {
        throw new Error('Invalid string. Length must be a multiple of 4');
      }
      var len = b64.length;
      placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0;
      arr = new Arr(b64.length * 3 / 4 - placeHolders);
      l = placeHolders > 0 ? b64.length - 4 : b64.length;
      var L = 0;
      function push(v) {
        arr[L++] = v;
      }
      for (i = 0, j = 0; i < l; i += 4, j += 3) {
        tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3));
        push((tmp & 0xFF0000) >> 16);
        push((tmp & 0xFF00) >> 8);
        push(tmp & 0xFF);
      }
      if (placeHolders === 2) {
        tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4);
        push(tmp & 0xFF);
      } else if (placeHolders === 1) {
        tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2);
        push((tmp >> 8) & 0xFF);
        push(tmp & 0xFF);
      }
      return arr;
    }
    function uint8ToBase64(uint8) {
      var i,
          extraBytes = uint8.length % 3,
          output = "",
          temp,
          length;
      function encode(num) {
        return lookup.charAt(num);
      }
      function tripletToBase64(num) {
        return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F);
      }
      for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
        temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
        output += tripletToBase64(temp);
      }
      switch (extraBytes) {
        case 1:
          temp = uint8[uint8.length - 1];
          output += encode(temp >> 2);
          output += encode((temp << 4) & 0x3F);
          output += '==';
          break;
        case 2:
          temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
          output += encode(temp >> 10);
          output += encode((temp >> 4) & 0x3F);
          output += encode((temp << 2) & 0x3F);
          output += '=';
          break;
      }
      return output;
    }
    exports.toByteArray = b64ToByteArray;
    exports.fromByteArray = uint8ToBase64;
  }(typeof exports === 'undefined' ? (this.base64js = {}) : exports));
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:base64-js@0.0.8", ["npm:base64-js@0.0.8/lib/b64"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:base64-js@0.0.8/lib/b64');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:ieee754@1.1.6/index", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  exports.read = function(buffer, offset, isLE, mLen, nBytes) {
    var e,
        m;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var nBits = -7;
    var i = isLE ? (nBytes - 1) : 0;
    var d = isLE ? -1 : 1;
    var s = buffer[offset + i];
    i += d;
    e = s & ((1 << (-nBits)) - 1);
    s >>= (-nBits);
    nBits += eLen;
    for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}
    m = e & ((1 << (-nBits)) - 1);
    e >>= (-nBits);
    nBits += mLen;
    for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}
    if (e === 0) {
      e = 1 - eBias;
    } else if (e === eMax) {
      return m ? NaN : ((s ? -1 : 1) * Infinity);
    } else {
      m = m + Math.pow(2, mLen);
      e = e - eBias;
    }
    return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
  };
  exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
    var e,
        m,
        c;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
    var i = isLE ? 0 : (nBytes - 1);
    var d = isLE ? 1 : -1;
    var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;
    value = Math.abs(value);
    if (isNaN(value) || value === Infinity) {
      m = isNaN(value) ? 1 : 0;
      e = eMax;
    } else {
      e = Math.floor(Math.log(value) / Math.LN2);
      if (value * (c = Math.pow(2, -e)) < 1) {
        e--;
        c *= 2;
      }
      if (e + eBias >= 1) {
        value += rt / c;
      } else {
        value += rt * Math.pow(2, 1 - eBias);
      }
      if (value * c >= 2) {
        e++;
        c /= 2;
      }
      if (e + eBias >= eMax) {
        m = 0;
        e = eMax;
      } else if (e + eBias >= 1) {
        m = (value * c - 1) * Math.pow(2, mLen);
        e = e + eBias;
      } else {
        m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
        e = 0;
      }
    }
    for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}
    e = (e << mLen) | m;
    eLen += mLen;
    for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}
    buffer[offset + i - d] |= s * 128;
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:ieee754@1.1.6", ["npm:ieee754@1.1.6/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:ieee754@1.1.6/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:isarray@1.0.0/index", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var toString = {}.toString;
  module.exports = Array.isArray || function(arr) {
    return toString.call(arr) == '[object Array]';
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:isarray@1.0.0", ["npm:isarray@1.0.0/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:isarray@1.0.0/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:buffer@3.6.0/index", ["npm:base64-js@0.0.8", "npm:ieee754@1.1.6", "npm:isarray@1.0.0"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var base64 = $__require('npm:base64-js@0.0.8');
  var ieee754 = $__require('npm:ieee754@1.1.6');
  var isArray = $__require('npm:isarray@1.0.0');
  exports.Buffer = Buffer;
  exports.SlowBuffer = SlowBuffer;
  exports.INSPECT_MAX_BYTES = 50;
  Buffer.poolSize = 8192;
  var rootParent = {};
  Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined ? global.TYPED_ARRAY_SUPPORT : typedArraySupport();
  function typedArraySupport() {
    function Bar() {}
    try {
      var arr = new Uint8Array(1);
      arr.foo = function() {
        return 42;
      };
      arr.constructor = Bar;
      return arr.foo() === 42 && arr.constructor === Bar && typeof arr.subarray === 'function' && arr.subarray(1, 1).byteLength === 0;
    } catch (e) {
      return false;
    }
  }
  function kMaxLength() {
    return Buffer.TYPED_ARRAY_SUPPORT ? 0x7fffffff : 0x3fffffff;
  }
  function Buffer(arg) {
    if (!(this instanceof Buffer)) {
      if (arguments.length > 1)
        return new Buffer(arg, arguments[1]);
      return new Buffer(arg);
    }
    if (!Buffer.TYPED_ARRAY_SUPPORT) {
      this.length = 0;
      this.parent = undefined;
    }
    if (typeof arg === 'number') {
      return fromNumber(this, arg);
    }
    if (typeof arg === 'string') {
      return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8');
    }
    return fromObject(this, arg);
  }
  function fromNumber(that, length) {
    that = allocate(that, length < 0 ? 0 : checked(length) | 0);
    if (!Buffer.TYPED_ARRAY_SUPPORT) {
      for (var i = 0; i < length; i++) {
        that[i] = 0;
      }
    }
    return that;
  }
  function fromString(that, string, encoding) {
    if (typeof encoding !== 'string' || encoding === '')
      encoding = 'utf8';
    var length = byteLength(string, encoding) | 0;
    that = allocate(that, length);
    that.write(string, encoding);
    return that;
  }
  function fromObject(that, object) {
    if (Buffer.isBuffer(object))
      return fromBuffer(that, object);
    if (isArray(object))
      return fromArray(that, object);
    if (object == null) {
      throw new TypeError('must start with number, buffer, array or string');
    }
    if (typeof ArrayBuffer !== 'undefined') {
      if (object.buffer instanceof ArrayBuffer) {
        return fromTypedArray(that, object);
      }
      if (object instanceof ArrayBuffer) {
        return fromArrayBuffer(that, object);
      }
    }
    if (object.length)
      return fromArrayLike(that, object);
    return fromJsonObject(that, object);
  }
  function fromBuffer(that, buffer) {
    var length = checked(buffer.length) | 0;
    that = allocate(that, length);
    buffer.copy(that, 0, 0, length);
    return that;
  }
  function fromArray(that, array) {
    var length = checked(array.length) | 0;
    that = allocate(that, length);
    for (var i = 0; i < length; i += 1) {
      that[i] = array[i] & 255;
    }
    return that;
  }
  function fromTypedArray(that, array) {
    var length = checked(array.length) | 0;
    that = allocate(that, length);
    for (var i = 0; i < length; i += 1) {
      that[i] = array[i] & 255;
    }
    return that;
  }
  function fromArrayBuffer(that, array) {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      array.byteLength;
      that = Buffer._augment(new Uint8Array(array));
    } else {
      that = fromTypedArray(that, new Uint8Array(array));
    }
    return that;
  }
  function fromArrayLike(that, array) {
    var length = checked(array.length) | 0;
    that = allocate(that, length);
    for (var i = 0; i < length; i += 1) {
      that[i] = array[i] & 255;
    }
    return that;
  }
  function fromJsonObject(that, object) {
    var array;
    var length = 0;
    if (object.type === 'Buffer' && isArray(object.data)) {
      array = object.data;
      length = checked(array.length) | 0;
    }
    that = allocate(that, length);
    for (var i = 0; i < length; i += 1) {
      that[i] = array[i] & 255;
    }
    return that;
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    Buffer.prototype.__proto__ = Uint8Array.prototype;
    Buffer.__proto__ = Uint8Array;
  } else {
    Buffer.prototype.length = undefined;
    Buffer.prototype.parent = undefined;
  }
  function allocate(that, length) {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      that = Buffer._augment(new Uint8Array(length));
      that.__proto__ = Buffer.prototype;
    } else {
      that.length = length;
      that._isBuffer = true;
    }
    var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1;
    if (fromPool)
      that.parent = rootParent;
    return that;
  }
  function checked(length) {
    if (length >= kMaxLength()) {
      throw new RangeError('Attempt to allocate Buffer larger than maximum ' + 'size: 0x' + kMaxLength().toString(16) + ' bytes');
    }
    return length | 0;
  }
  function SlowBuffer(subject, encoding) {
    if (!(this instanceof SlowBuffer))
      return new SlowBuffer(subject, encoding);
    var buf = new Buffer(subject, encoding);
    delete buf.parent;
    return buf;
  }
  Buffer.isBuffer = function isBuffer(b) {
    return !!(b != null && b._isBuffer);
  };
  Buffer.compare = function compare(a, b) {
    if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
      throw new TypeError('Arguments must be Buffers');
    }
    if (a === b)
      return 0;
    var x = a.length;
    var y = b.length;
    var i = 0;
    var len = Math.min(x, y);
    while (i < len) {
      if (a[i] !== b[i])
        break;
      ++i;
    }
    if (i !== len) {
      x = a[i];
      y = b[i];
    }
    if (x < y)
      return -1;
    if (y < x)
      return 1;
    return 0;
  };
  Buffer.isEncoding = function isEncoding(encoding) {
    switch (String(encoding).toLowerCase()) {
      case 'hex':
      case 'utf8':
      case 'utf-8':
      case 'ascii':
      case 'binary':
      case 'base64':
      case 'raw':
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return true;
      default:
        return false;
    }
  };
  Buffer.concat = function concat(list, length) {
    if (!isArray(list))
      throw new TypeError('list argument must be an Array of Buffers.');
    if (list.length === 0) {
      return new Buffer(0);
    }
    var i;
    if (length === undefined) {
      length = 0;
      for (i = 0; i < list.length; i++) {
        length += list[i].length;
      }
    }
    var buf = new Buffer(length);
    var pos = 0;
    for (i = 0; i < list.length; i++) {
      var item = list[i];
      item.copy(buf, pos);
      pos += item.length;
    }
    return buf;
  };
  function byteLength(string, encoding) {
    if (typeof string !== 'string')
      string = '' + string;
    var len = string.length;
    if (len === 0)
      return 0;
    var loweredCase = false;
    for (; ; ) {
      switch (encoding) {
        case 'ascii':
        case 'binary':
        case 'raw':
        case 'raws':
          return len;
        case 'utf8':
        case 'utf-8':
          return utf8ToBytes(string).length;
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return len * 2;
        case 'hex':
          return len >>> 1;
        case 'base64':
          return base64ToBytes(string).length;
        default:
          if (loweredCase)
            return utf8ToBytes(string).length;
          encoding = ('' + encoding).toLowerCase();
          loweredCase = true;
      }
    }
  }
  Buffer.byteLength = byteLength;
  function slowToString(encoding, start, end) {
    var loweredCase = false;
    start = start | 0;
    end = end === undefined || end === Infinity ? this.length : end | 0;
    if (!encoding)
      encoding = 'utf8';
    if (start < 0)
      start = 0;
    if (end > this.length)
      end = this.length;
    if (end <= start)
      return '';
    while (true) {
      switch (encoding) {
        case 'hex':
          return hexSlice(this, start, end);
        case 'utf8':
        case 'utf-8':
          return utf8Slice(this, start, end);
        case 'ascii':
          return asciiSlice(this, start, end);
        case 'binary':
          return binarySlice(this, start, end);
        case 'base64':
          return base64Slice(this, start, end);
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return utf16leSlice(this, start, end);
        default:
          if (loweredCase)
            throw new TypeError('Unknown encoding: ' + encoding);
          encoding = (encoding + '').toLowerCase();
          loweredCase = true;
      }
    }
  }
  Buffer.prototype.toString = function toString() {
    var length = this.length | 0;
    if (length === 0)
      return '';
    if (arguments.length === 0)
      return utf8Slice(this, 0, length);
    return slowToString.apply(this, arguments);
  };
  Buffer.prototype.equals = function equals(b) {
    if (!Buffer.isBuffer(b))
      throw new TypeError('Argument must be a Buffer');
    if (this === b)
      return true;
    return Buffer.compare(this, b) === 0;
  };
  Buffer.prototype.inspect = function inspect() {
    var str = '';
    var max = exports.INSPECT_MAX_BYTES;
    if (this.length > 0) {
      str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
      if (this.length > max)
        str += ' ... ';
    }
    return '<Buffer ' + str + '>';
  };
  Buffer.prototype.compare = function compare(b) {
    if (!Buffer.isBuffer(b))
      throw new TypeError('Argument must be a Buffer');
    if (this === b)
      return 0;
    return Buffer.compare(this, b);
  };
  Buffer.prototype.indexOf = function indexOf(val, byteOffset) {
    if (byteOffset > 0x7fffffff)
      byteOffset = 0x7fffffff;
    else if (byteOffset < -0x80000000)
      byteOffset = -0x80000000;
    byteOffset >>= 0;
    if (this.length === 0)
      return -1;
    if (byteOffset >= this.length)
      return -1;
    if (byteOffset < 0)
      byteOffset = Math.max(this.length + byteOffset, 0);
    if (typeof val === 'string') {
      if (val.length === 0)
        return -1;
      return String.prototype.indexOf.call(this, val, byteOffset);
    }
    if (Buffer.isBuffer(val)) {
      return arrayIndexOf(this, val, byteOffset);
    }
    if (typeof val === 'number') {
      if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
        return Uint8Array.prototype.indexOf.call(this, val, byteOffset);
      }
      return arrayIndexOf(this, [val], byteOffset);
    }
    function arrayIndexOf(arr, val, byteOffset) {
      var foundIndex = -1;
      for (var i = 0; byteOffset + i < arr.length; i++) {
        if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
          if (foundIndex === -1)
            foundIndex = i;
          if (i - foundIndex + 1 === val.length)
            return byteOffset + foundIndex;
        } else {
          foundIndex = -1;
        }
      }
      return -1;
    }
    throw new TypeError('val must be string, number or Buffer');
  };
  Buffer.prototype.get = function get(offset) {
    console.log('.get() is deprecated. Access using array indexes instead.');
    return this.readUInt8(offset);
  };
  Buffer.prototype.set = function set(v, offset) {
    console.log('.set() is deprecated. Access using array indexes instead.');
    return this.writeUInt8(v, offset);
  };
  function hexWrite(buf, string, offset, length) {
    offset = Number(offset) || 0;
    var remaining = buf.length - offset;
    if (!length) {
      length = remaining;
    } else {
      length = Number(length);
      if (length > remaining) {
        length = remaining;
      }
    }
    var strLen = string.length;
    if (strLen % 2 !== 0)
      throw new Error('Invalid hex string');
    if (length > strLen / 2) {
      length = strLen / 2;
    }
    for (var i = 0; i < length; i++) {
      var parsed = parseInt(string.substr(i * 2, 2), 16);
      if (isNaN(parsed))
        throw new Error('Invalid hex string');
      buf[offset + i] = parsed;
    }
    return i;
  }
  function utf8Write(buf, string, offset, length) {
    return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
  }
  function asciiWrite(buf, string, offset, length) {
    return blitBuffer(asciiToBytes(string), buf, offset, length);
  }
  function binaryWrite(buf, string, offset, length) {
    return asciiWrite(buf, string, offset, length);
  }
  function base64Write(buf, string, offset, length) {
    return blitBuffer(base64ToBytes(string), buf, offset, length);
  }
  function ucs2Write(buf, string, offset, length) {
    return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
  }
  Buffer.prototype.write = function write(string, offset, length, encoding) {
    if (offset === undefined) {
      encoding = 'utf8';
      length = this.length;
      offset = 0;
    } else if (length === undefined && typeof offset === 'string') {
      encoding = offset;
      length = this.length;
      offset = 0;
    } else if (isFinite(offset)) {
      offset = offset | 0;
      if (isFinite(length)) {
        length = length | 0;
        if (encoding === undefined)
          encoding = 'utf8';
      } else {
        encoding = length;
        length = undefined;
      }
    } else {
      var swap = encoding;
      encoding = offset;
      offset = length | 0;
      length = swap;
    }
    var remaining = this.length - offset;
    if (length === undefined || length > remaining)
      length = remaining;
    if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
      throw new RangeError('attempt to write outside buffer bounds');
    }
    if (!encoding)
      encoding = 'utf8';
    var loweredCase = false;
    for (; ; ) {
      switch (encoding) {
        case 'hex':
          return hexWrite(this, string, offset, length);
        case 'utf8':
        case 'utf-8':
          return utf8Write(this, string, offset, length);
        case 'ascii':
          return asciiWrite(this, string, offset, length);
        case 'binary':
          return binaryWrite(this, string, offset, length);
        case 'base64':
          return base64Write(this, string, offset, length);
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return ucs2Write(this, string, offset, length);
        default:
          if (loweredCase)
            throw new TypeError('Unknown encoding: ' + encoding);
          encoding = ('' + encoding).toLowerCase();
          loweredCase = true;
      }
    }
  };
  Buffer.prototype.toJSON = function toJSON() {
    return {
      type: 'Buffer',
      data: Array.prototype.slice.call(this._arr || this, 0)
    };
  };
  function base64Slice(buf, start, end) {
    if (start === 0 && end === buf.length) {
      return base64.fromByteArray(buf);
    } else {
      return base64.fromByteArray(buf.slice(start, end));
    }
  }
  function utf8Slice(buf, start, end) {
    end = Math.min(buf.length, end);
    var res = [];
    var i = start;
    while (i < end) {
      var firstByte = buf[i];
      var codePoint = null;
      var bytesPerSequence = (firstByte > 0xEF) ? 4 : (firstByte > 0xDF) ? 3 : (firstByte > 0xBF) ? 2 : 1;
      if (i + bytesPerSequence <= end) {
        var secondByte,
            thirdByte,
            fourthByte,
            tempCodePoint;
        switch (bytesPerSequence) {
          case 1:
            if (firstByte < 0x80) {
              codePoint = firstByte;
            }
            break;
          case 2:
            secondByte = buf[i + 1];
            if ((secondByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
              if (tempCodePoint > 0x7F) {
                codePoint = tempCodePoint;
              }
            }
            break;
          case 3:
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];
            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
              if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                codePoint = tempCodePoint;
              }
            }
            break;
          case 4:
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];
            fourthByte = buf[i + 3];
            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
              if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                codePoint = tempCodePoint;
              }
            }
        }
      }
      if (codePoint === null) {
        codePoint = 0xFFFD;
        bytesPerSequence = 1;
      } else if (codePoint > 0xFFFF) {
        codePoint -= 0x10000;
        res.push(codePoint >>> 10 & 0x3FF | 0xD800);
        codePoint = 0xDC00 | codePoint & 0x3FF;
      }
      res.push(codePoint);
      i += bytesPerSequence;
    }
    return decodeCodePointsArray(res);
  }
  var MAX_ARGUMENTS_LENGTH = 0x1000;
  function decodeCodePointsArray(codePoints) {
    var len = codePoints.length;
    if (len <= MAX_ARGUMENTS_LENGTH) {
      return String.fromCharCode.apply(String, codePoints);
    }
    var res = '';
    var i = 0;
    while (i < len) {
      res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
    }
    return res;
  }
  function asciiSlice(buf, start, end) {
    var ret = '';
    end = Math.min(buf.length, end);
    for (var i = start; i < end; i++) {
      ret += String.fromCharCode(buf[i] & 0x7F);
    }
    return ret;
  }
  function binarySlice(buf, start, end) {
    var ret = '';
    end = Math.min(buf.length, end);
    for (var i = start; i < end; i++) {
      ret += String.fromCharCode(buf[i]);
    }
    return ret;
  }
  function hexSlice(buf, start, end) {
    var len = buf.length;
    if (!start || start < 0)
      start = 0;
    if (!end || end < 0 || end > len)
      end = len;
    var out = '';
    for (var i = start; i < end; i++) {
      out += toHex(buf[i]);
    }
    return out;
  }
  function utf16leSlice(buf, start, end) {
    var bytes = buf.slice(start, end);
    var res = '';
    for (var i = 0; i < bytes.length; i += 2) {
      res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
    }
    return res;
  }
  Buffer.prototype.slice = function slice(start, end) {
    var len = this.length;
    start = ~~start;
    end = end === undefined ? len : ~~end;
    if (start < 0) {
      start += len;
      if (start < 0)
        start = 0;
    } else if (start > len) {
      start = len;
    }
    if (end < 0) {
      end += len;
      if (end < 0)
        end = 0;
    } else if (end > len) {
      end = len;
    }
    if (end < start)
      end = start;
    var newBuf;
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      newBuf = Buffer._augment(this.subarray(start, end));
    } else {
      var sliceLen = end - start;
      newBuf = new Buffer(sliceLen, undefined);
      for (var i = 0; i < sliceLen; i++) {
        newBuf[i] = this[i + start];
      }
    }
    if (newBuf.length)
      newBuf.parent = this.parent || this;
    return newBuf;
  };
  function checkOffset(offset, ext, length) {
    if ((offset % 1) !== 0 || offset < 0)
      throw new RangeError('offset is not uint');
    if (offset + ext > length)
      throw new RangeError('Trying to access beyond buffer length');
  }
  Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert)
      checkOffset(offset, byteLength, this.length);
    var val = this[offset];
    var mul = 1;
    var i = 0;
    while (++i < byteLength && (mul *= 0x100)) {
      val += this[offset + i] * mul;
    }
    return val;
  };
  Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert) {
      checkOffset(offset, byteLength, this.length);
    }
    var val = this[offset + --byteLength];
    var mul = 1;
    while (byteLength > 0 && (mul *= 0x100)) {
      val += this[offset + --byteLength] * mul;
    }
    return val;
  };
  Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 1, this.length);
    return this[offset];
  };
  Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 2, this.length);
    return this[offset] | (this[offset + 1] << 8);
  };
  Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 2, this.length);
    return (this[offset] << 8) | this[offset + 1];
  };
  Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return ((this[offset]) | (this[offset + 1] << 8) | (this[offset + 2] << 16)) + (this[offset + 3] * 0x1000000);
  };
  Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return (this[offset] * 0x1000000) + ((this[offset + 1] << 16) | (this[offset + 2] << 8) | this[offset + 3]);
  };
  Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert)
      checkOffset(offset, byteLength, this.length);
    var val = this[offset];
    var mul = 1;
    var i = 0;
    while (++i < byteLength && (mul *= 0x100)) {
      val += this[offset + i] * mul;
    }
    mul *= 0x80;
    if (val >= mul)
      val -= Math.pow(2, 8 * byteLength);
    return val;
  };
  Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert)
      checkOffset(offset, byteLength, this.length);
    var i = byteLength;
    var mul = 1;
    var val = this[offset + --i];
    while (i > 0 && (mul *= 0x100)) {
      val += this[offset + --i] * mul;
    }
    mul *= 0x80;
    if (val >= mul)
      val -= Math.pow(2, 8 * byteLength);
    return val;
  };
  Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 1, this.length);
    if (!(this[offset] & 0x80))
      return (this[offset]);
    return ((0xff - this[offset] + 1) * -1);
  };
  Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 2, this.length);
    var val = this[offset] | (this[offset + 1] << 8);
    return (val & 0x8000) ? val | 0xFFFF0000 : val;
  };
  Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 2, this.length);
    var val = this[offset + 1] | (this[offset] << 8);
    return (val & 0x8000) ? val | 0xFFFF0000 : val;
  };
  Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return (this[offset]) | (this[offset + 1] << 8) | (this[offset + 2] << 16) | (this[offset + 3] << 24);
  };
  Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return (this[offset] << 24) | (this[offset + 1] << 16) | (this[offset + 2] << 8) | (this[offset + 3]);
  };
  Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return ieee754.read(this, offset, true, 23, 4);
  };
  Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return ieee754.read(this, offset, false, 23, 4);
  };
  Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 8, this.length);
    return ieee754.read(this, offset, true, 52, 8);
  };
  Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 8, this.length);
    return ieee754.read(this, offset, false, 52, 8);
  };
  function checkInt(buf, value, offset, ext, max, min) {
    if (!Buffer.isBuffer(buf))
      throw new TypeError('buffer must be a Buffer instance');
    if (value > max || value < min)
      throw new RangeError('value is out of bounds');
    if (offset + ext > buf.length)
      throw new RangeError('index out of range');
  }
  Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert)
      checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0);
    var mul = 1;
    var i = 0;
    this[offset] = value & 0xFF;
    while (++i < byteLength && (mul *= 0x100)) {
      this[offset + i] = (value / mul) & 0xFF;
    }
    return offset + byteLength;
  };
  Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert)
      checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0);
    var i = byteLength - 1;
    var mul = 1;
    this[offset + i] = value & 0xFF;
    while (--i >= 0 && (mul *= 0x100)) {
      this[offset + i] = (value / mul) & 0xFF;
    }
    return offset + byteLength;
  };
  Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
      checkInt(this, value, offset, 1, 0xff, 0);
    if (!Buffer.TYPED_ARRAY_SUPPORT)
      value = Math.floor(value);
    this[offset] = (value & 0xff);
    return offset + 1;
  };
  function objectWriteUInt16(buf, value, offset, littleEndian) {
    if (value < 0)
      value = 0xffff + value + 1;
    for (var i = 0,
        j = Math.min(buf.length - offset, 2); i < j; i++) {
      buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>> (littleEndian ? i : 1 - i) * 8;
    }
  }
  Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
      checkInt(this, value, offset, 2, 0xffff, 0);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value & 0xff);
      this[offset + 1] = (value >>> 8);
    } else {
      objectWriteUInt16(this, value, offset, true);
    }
    return offset + 2;
  };
  Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
      checkInt(this, value, offset, 2, 0xffff, 0);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value >>> 8);
      this[offset + 1] = (value & 0xff);
    } else {
      objectWriteUInt16(this, value, offset, false);
    }
    return offset + 2;
  };
  function objectWriteUInt32(buf, value, offset, littleEndian) {
    if (value < 0)
      value = 0xffffffff + value + 1;
    for (var i = 0,
        j = Math.min(buf.length - offset, 4); i < j; i++) {
      buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
    }
  }
  Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
      checkInt(this, value, offset, 4, 0xffffffff, 0);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset + 3] = (value >>> 24);
      this[offset + 2] = (value >>> 16);
      this[offset + 1] = (value >>> 8);
      this[offset] = (value & 0xff);
    } else {
      objectWriteUInt32(this, value, offset, true);
    }
    return offset + 4;
  };
  Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
      checkInt(this, value, offset, 4, 0xffffffff, 0);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value >>> 24);
      this[offset + 1] = (value >>> 16);
      this[offset + 2] = (value >>> 8);
      this[offset + 3] = (value & 0xff);
    } else {
      objectWriteUInt32(this, value, offset, false);
    }
    return offset + 4;
  };
  Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) {
      var limit = Math.pow(2, 8 * byteLength - 1);
      checkInt(this, value, offset, byteLength, limit - 1, -limit);
    }
    var i = 0;
    var mul = 1;
    var sub = value < 0 ? 1 : 0;
    this[offset] = value & 0xFF;
    while (++i < byteLength && (mul *= 0x100)) {
      this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
    }
    return offset + byteLength;
  };
  Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) {
      var limit = Math.pow(2, 8 * byteLength - 1);
      checkInt(this, value, offset, byteLength, limit - 1, -limit);
    }
    var i = byteLength - 1;
    var mul = 1;
    var sub = value < 0 ? 1 : 0;
    this[offset + i] = value & 0xFF;
    while (--i >= 0 && (mul *= 0x100)) {
      this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
    }
    return offset + byteLength;
  };
  Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
      checkInt(this, value, offset, 1, 0x7f, -0x80);
    if (!Buffer.TYPED_ARRAY_SUPPORT)
      value = Math.floor(value);
    if (value < 0)
      value = 0xff + value + 1;
    this[offset] = (value & 0xff);
    return offset + 1;
  };
  Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
      checkInt(this, value, offset, 2, 0x7fff, -0x8000);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value & 0xff);
      this[offset + 1] = (value >>> 8);
    } else {
      objectWriteUInt16(this, value, offset, true);
    }
    return offset + 2;
  };
  Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
      checkInt(this, value, offset, 2, 0x7fff, -0x8000);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value >>> 8);
      this[offset + 1] = (value & 0xff);
    } else {
      objectWriteUInt16(this, value, offset, false);
    }
    return offset + 2;
  };
  Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
      checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value & 0xff);
      this[offset + 1] = (value >>> 8);
      this[offset + 2] = (value >>> 16);
      this[offset + 3] = (value >>> 24);
    } else {
      objectWriteUInt32(this, value, offset, true);
    }
    return offset + 4;
  };
  Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
      checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
    if (value < 0)
      value = 0xffffffff + value + 1;
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value >>> 24);
      this[offset + 1] = (value >>> 16);
      this[offset + 2] = (value >>> 8);
      this[offset + 3] = (value & 0xff);
    } else {
      objectWriteUInt32(this, value, offset, false);
    }
    return offset + 4;
  };
  function checkIEEE754(buf, value, offset, ext, max, min) {
    if (value > max || value < min)
      throw new RangeError('value is out of bounds');
    if (offset + ext > buf.length)
      throw new RangeError('index out of range');
    if (offset < 0)
      throw new RangeError('index out of range');
  }
  function writeFloat(buf, value, offset, littleEndian, noAssert) {
    if (!noAssert) {
      checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38);
    }
    ieee754.write(buf, value, offset, littleEndian, 23, 4);
    return offset + 4;
  }
  Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
    return writeFloat(this, value, offset, true, noAssert);
  };
  Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
    return writeFloat(this, value, offset, false, noAssert);
  };
  function writeDouble(buf, value, offset, littleEndian, noAssert) {
    if (!noAssert) {
      checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308);
    }
    ieee754.write(buf, value, offset, littleEndian, 52, 8);
    return offset + 8;
  }
  Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
    return writeDouble(this, value, offset, true, noAssert);
  };
  Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
    return writeDouble(this, value, offset, false, noAssert);
  };
  Buffer.prototype.copy = function copy(target, targetStart, start, end) {
    if (!start)
      start = 0;
    if (!end && end !== 0)
      end = this.length;
    if (targetStart >= target.length)
      targetStart = target.length;
    if (!targetStart)
      targetStart = 0;
    if (end > 0 && end < start)
      end = start;
    if (end === start)
      return 0;
    if (target.length === 0 || this.length === 0)
      return 0;
    if (targetStart < 0) {
      throw new RangeError('targetStart out of bounds');
    }
    if (start < 0 || start >= this.length)
      throw new RangeError('sourceStart out of bounds');
    if (end < 0)
      throw new RangeError('sourceEnd out of bounds');
    if (end > this.length)
      end = this.length;
    if (target.length - targetStart < end - start) {
      end = target.length - targetStart + start;
    }
    var len = end - start;
    var i;
    if (this === target && start < targetStart && targetStart < end) {
      for (i = len - 1; i >= 0; i--) {
        target[i + targetStart] = this[i + start];
      }
    } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
      for (i = 0; i < len; i++) {
        target[i + targetStart] = this[i + start];
      }
    } else {
      target._set(this.subarray(start, start + len), targetStart);
    }
    return len;
  };
  Buffer.prototype.fill = function fill(value, start, end) {
    if (!value)
      value = 0;
    if (!start)
      start = 0;
    if (!end)
      end = this.length;
    if (end < start)
      throw new RangeError('end < start');
    if (end === start)
      return;
    if (this.length === 0)
      return;
    if (start < 0 || start >= this.length)
      throw new RangeError('start out of bounds');
    if (end < 0 || end > this.length)
      throw new RangeError('end out of bounds');
    var i;
    if (typeof value === 'number') {
      for (i = start; i < end; i++) {
        this[i] = value;
      }
    } else {
      var bytes = utf8ToBytes(value.toString());
      var len = bytes.length;
      for (i = start; i < end; i++) {
        this[i] = bytes[i % len];
      }
    }
    return this;
  };
  Buffer.prototype.toArrayBuffer = function toArrayBuffer() {
    if (typeof Uint8Array !== 'undefined') {
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        return (new Buffer(this)).buffer;
      } else {
        var buf = new Uint8Array(this.length);
        for (var i = 0,
            len = buf.length; i < len; i += 1) {
          buf[i] = this[i];
        }
        return buf.buffer;
      }
    } else {
      throw new TypeError('Buffer.toArrayBuffer not supported in this browser');
    }
  };
  var BP = Buffer.prototype;
  Buffer._augment = function _augment(arr) {
    arr.constructor = Buffer;
    arr._isBuffer = true;
    arr._set = arr.set;
    arr.get = BP.get;
    arr.set = BP.set;
    arr.write = BP.write;
    arr.toString = BP.toString;
    arr.toLocaleString = BP.toString;
    arr.toJSON = BP.toJSON;
    arr.equals = BP.equals;
    arr.compare = BP.compare;
    arr.indexOf = BP.indexOf;
    arr.copy = BP.copy;
    arr.slice = BP.slice;
    arr.readUIntLE = BP.readUIntLE;
    arr.readUIntBE = BP.readUIntBE;
    arr.readUInt8 = BP.readUInt8;
    arr.readUInt16LE = BP.readUInt16LE;
    arr.readUInt16BE = BP.readUInt16BE;
    arr.readUInt32LE = BP.readUInt32LE;
    arr.readUInt32BE = BP.readUInt32BE;
    arr.readIntLE = BP.readIntLE;
    arr.readIntBE = BP.readIntBE;
    arr.readInt8 = BP.readInt8;
    arr.readInt16LE = BP.readInt16LE;
    arr.readInt16BE = BP.readInt16BE;
    arr.readInt32LE = BP.readInt32LE;
    arr.readInt32BE = BP.readInt32BE;
    arr.readFloatLE = BP.readFloatLE;
    arr.readFloatBE = BP.readFloatBE;
    arr.readDoubleLE = BP.readDoubleLE;
    arr.readDoubleBE = BP.readDoubleBE;
    arr.writeUInt8 = BP.writeUInt8;
    arr.writeUIntLE = BP.writeUIntLE;
    arr.writeUIntBE = BP.writeUIntBE;
    arr.writeUInt16LE = BP.writeUInt16LE;
    arr.writeUInt16BE = BP.writeUInt16BE;
    arr.writeUInt32LE = BP.writeUInt32LE;
    arr.writeUInt32BE = BP.writeUInt32BE;
    arr.writeIntLE = BP.writeIntLE;
    arr.writeIntBE = BP.writeIntBE;
    arr.writeInt8 = BP.writeInt8;
    arr.writeInt16LE = BP.writeInt16LE;
    arr.writeInt16BE = BP.writeInt16BE;
    arr.writeInt32LE = BP.writeInt32LE;
    arr.writeInt32BE = BP.writeInt32BE;
    arr.writeFloatLE = BP.writeFloatLE;
    arr.writeFloatBE = BP.writeFloatBE;
    arr.writeDoubleLE = BP.writeDoubleLE;
    arr.writeDoubleBE = BP.writeDoubleBE;
    arr.fill = BP.fill;
    arr.inspect = BP.inspect;
    arr.toArrayBuffer = BP.toArrayBuffer;
    return arr;
  };
  var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;
  function base64clean(str) {
    str = stringtrim(str).replace(INVALID_BASE64_RE, '');
    if (str.length < 2)
      return '';
    while (str.length % 4 !== 0) {
      str = str + '=';
    }
    return str;
  }
  function stringtrim(str) {
    if (str.trim)
      return str.trim();
    return str.replace(/^\s+|\s+$/g, '');
  }
  function toHex(n) {
    if (n < 16)
      return '0' + n.toString(16);
    return n.toString(16);
  }
  function utf8ToBytes(string, units) {
    units = units || Infinity;
    var codePoint;
    var length = string.length;
    var leadSurrogate = null;
    var bytes = [];
    for (var i = 0; i < length; i++) {
      codePoint = string.charCodeAt(i);
      if (codePoint > 0xD7FF && codePoint < 0xE000) {
        if (!leadSurrogate) {
          if (codePoint > 0xDBFF) {
            if ((units -= 3) > -1)
              bytes.push(0xEF, 0xBF, 0xBD);
            continue;
          } else if (i + 1 === length) {
            if ((units -= 3) > -1)
              bytes.push(0xEF, 0xBF, 0xBD);
            continue;
          }
          leadSurrogate = codePoint;
          continue;
        }
        if (codePoint < 0xDC00) {
          if ((units -= 3) > -1)
            bytes.push(0xEF, 0xBF, 0xBD);
          leadSurrogate = codePoint;
          continue;
        }
        codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
      } else if (leadSurrogate) {
        if ((units -= 3) > -1)
          bytes.push(0xEF, 0xBF, 0xBD);
      }
      leadSurrogate = null;
      if (codePoint < 0x80) {
        if ((units -= 1) < 0)
          break;
        bytes.push(codePoint);
      } else if (codePoint < 0x800) {
        if ((units -= 2) < 0)
          break;
        bytes.push(codePoint >> 0x6 | 0xC0, codePoint & 0x3F | 0x80);
      } else if (codePoint < 0x10000) {
        if ((units -= 3) < 0)
          break;
        bytes.push(codePoint >> 0xC | 0xE0, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
      } else if (codePoint < 0x110000) {
        if ((units -= 4) < 0)
          break;
        bytes.push(codePoint >> 0x12 | 0xF0, codePoint >> 0xC & 0x3F | 0x80, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
      } else {
        throw new Error('Invalid code point');
      }
    }
    return bytes;
  }
  function asciiToBytes(str) {
    var byteArray = [];
    for (var i = 0; i < str.length; i++) {
      byteArray.push(str.charCodeAt(i) & 0xFF);
    }
    return byteArray;
  }
  function utf16leToBytes(str, units) {
    var c,
        hi,
        lo;
    var byteArray = [];
    for (var i = 0; i < str.length; i++) {
      if ((units -= 2) < 0)
        break;
      c = str.charCodeAt(i);
      hi = c >> 8;
      lo = c % 256;
      byteArray.push(lo);
      byteArray.push(hi);
    }
    return byteArray;
  }
  function base64ToBytes(str) {
    return base64.toByteArray(base64clean(str));
  }
  function blitBuffer(src, dst, offset, length) {
    for (var i = 0; i < length; i++) {
      if ((i + offset >= dst.length) || (i >= src.length))
        break;
      dst[i + offset] = src[i];
    }
    return i;
  }
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:buffer@3.6.0", ["npm:buffer@3.6.0/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:buffer@3.6.0/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("github:jspm/nodelibs-buffer@0.1.0/index", ["npm:buffer@3.6.0"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = System._nodeRequire ? System._nodeRequire('buffer') : $__require('npm:buffer@3.6.0');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("github:jspm/nodelibs-buffer@0.1.0", ["github:jspm/nodelibs-buffer@0.1.0/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('github:jspm/nodelibs-buffer@0.1.0/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:clone@1.0.2/clone", ["github:jspm/nodelibs-buffer@0.1.0"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  (function(Buffer) {
    var clone = (function() {
      'use strict';
      function clone(parent, circular, depth, prototype) {
        var filter;
        if (typeof circular === 'object') {
          depth = circular.depth;
          prototype = circular.prototype;
          filter = circular.filter;
          circular = circular.circular;
        }
        var allParents = [];
        var allChildren = [];
        var useBuffer = typeof Buffer != 'undefined';
        if (typeof circular == 'undefined')
          circular = true;
        if (typeof depth == 'undefined')
          depth = Infinity;
        function _clone(parent, depth) {
          if (parent === null)
            return null;
          if (depth == 0)
            return parent;
          var child;
          var proto;
          if (typeof parent != 'object') {
            return parent;
          }
          if (clone.__isArray(parent)) {
            child = [];
          } else if (clone.__isRegExp(parent)) {
            child = new RegExp(parent.source, __getRegExpFlags(parent));
            if (parent.lastIndex)
              child.lastIndex = parent.lastIndex;
          } else if (clone.__isDate(parent)) {
            child = new Date(parent.getTime());
          } else if (useBuffer && Buffer.isBuffer(parent)) {
            child = new Buffer(parent.length);
            parent.copy(child);
            return child;
          } else {
            if (typeof prototype == 'undefined') {
              proto = Object.getPrototypeOf(parent);
              child = Object.create(proto);
            } else {
              child = Object.create(prototype);
              proto = prototype;
            }
          }
          if (circular) {
            var index = allParents.indexOf(parent);
            if (index != -1) {
              return allChildren[index];
            }
            allParents.push(parent);
            allChildren.push(child);
          }
          for (var i in parent) {
            var attrs;
            if (proto) {
              attrs = Object.getOwnPropertyDescriptor(proto, i);
            }
            if (attrs && attrs.set == null) {
              continue;
            }
            child[i] = _clone(parent[i], depth - 1);
          }
          return child;
        }
        return _clone(parent, depth);
      }
      clone.clonePrototype = function clonePrototype(parent) {
        if (parent === null)
          return null;
        var c = function() {};
        c.prototype = parent;
        return new c();
      };
      function __objToStr(o) {
        return Object.prototype.toString.call(o);
      }
      ;
      clone.__objToStr = __objToStr;
      function __isDate(o) {
        return typeof o === 'object' && __objToStr(o) === '[object Date]';
      }
      ;
      clone.__isDate = __isDate;
      function __isArray(o) {
        return typeof o === 'object' && __objToStr(o) === '[object Array]';
      }
      ;
      clone.__isArray = __isArray;
      function __isRegExp(o) {
        return typeof o === 'object' && __objToStr(o) === '[object RegExp]';
      }
      ;
      clone.__isRegExp = __isRegExp;
      function __getRegExpFlags(re) {
        var flags = '';
        if (re.global)
          flags += 'g';
        if (re.ignoreCase)
          flags += 'i';
        if (re.multiline)
          flags += 'm';
        return flags;
      }
      ;
      clone.__getRegExpFlags = __getRegExpFlags;
      return clone;
    })();
    if (typeof module === 'object' && module.exports) {
      module.exports = clone;
    }
  })($__require('github:jspm/nodelibs-buffer@0.1.0').Buffer);
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:clone@1.0.2", ["npm:clone@1.0.2/clone"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:clone@1.0.2/clone');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:inherits@2.0.1/inherits_browser", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  if (typeof Object.create === 'function') {
    module.exports = function inherits(ctor, superCtor) {
      ctor.super_ = superCtor;
      ctor.prototype = Object.create(superCtor.prototype, {constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }});
    };
  } else {
    module.exports = function inherits(ctor, superCtor) {
      ctor.super_ = superCtor;
      var TempCtor = function() {};
      TempCtor.prototype = superCtor.prototype;
      ctor.prototype = new TempCtor();
      ctor.prototype.constructor = ctor;
    };
  }
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:inherits@2.0.1", ["npm:inherits@2.0.1/inherits_browser"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:inherits@2.0.1/inherits_browser');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:unherit@1.0.4/index", ["npm:clone@1.0.2", "npm:inherits@2.0.1"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var clone = $__require('npm:clone@1.0.2');
  var inherits = $__require('npm:inherits@2.0.1');
  function unherit(Super) {
    var base = clone(Super.prototype);
    var result;
    var key;
    function From(parameters) {
      return Super.apply(this, parameters);
    }
    function Of() {
      if (!(this instanceof Of)) {
        return new From(arguments);
      }
      return Super.apply(this, arguments);
    }
    inherits(Of, Super);
    inherits(From, Of);
    result = Of.prototype;
    for (key in base) {
      result[key] = base[key];
    }
    return Of;
  }
  module.exports = unherit;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:unherit@1.0.4", ["npm:unherit@1.0.4/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:unherit@1.0.4/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:extend@3.0.0/index", [], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var hasOwn = Object.prototype.hasOwnProperty;
  var toStr = Object.prototype.toString;
  var isArray = function isArray(arr) {
    if (typeof Array.isArray === 'function') {
      return Array.isArray(arr);
    }
    return toStr.call(arr) === '[object Array]';
  };
  var isPlainObject = function isPlainObject(obj) {
    if (!obj || toStr.call(obj) !== '[object Object]') {
      return false;
    }
    var hasOwnConstructor = hasOwn.call(obj, 'constructor');
    var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
    if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
      return false;
    }
    var key;
    for (key in obj) {}
    return typeof key === 'undefined' || hasOwn.call(obj, key);
  };
  module.exports = function extend() {
    var options,
        name,
        src,
        copy,
        copyIsArray,
        clone,
        target = arguments[0],
        i = 1,
        length = arguments.length,
        deep = false;
    if (typeof target === 'boolean') {
      deep = target;
      target = arguments[1] || {};
      i = 2;
    } else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
      target = {};
    }
    for (; i < length; ++i) {
      options = arguments[i];
      if (options != null) {
        for (name in options) {
          src = target[name];
          copy = options[name];
          if (target !== copy) {
            if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
              if (copyIsArray) {
                copyIsArray = false;
                clone = src && isArray(src) ? src : [];
              } else {
                clone = src && isPlainObject(src) ? src : {};
              }
              target[name] = extend(deep, clone, copy);
            } else if (typeof copy !== 'undefined') {
              target[name] = copy;
            }
          }
        }
      }
    }
    return target;
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:extend@3.0.0", ["npm:extend@3.0.0/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:extend@3.0.0/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:unified@2.1.4/index", ["npm:bail@1.0.0", "npm:ware@1.3.0", "npm:attach-ware@1.0.0", "npm:vfile@1.3.1", "npm:unherit@1.0.4", "npm:extend@3.0.0", "github:jspm/nodelibs-process@0.1.2"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var bail = $__require('npm:bail@1.0.0');
    var ware = $__require('npm:ware@1.3.0');
    var AttachWare = $__require('npm:attach-ware@1.0.0')(ware);
    var VFile = $__require('npm:vfile@1.3.1');
    var unherit = $__require('npm:unherit@1.0.4');
    var extend;
    try {
      extend = $__require('npm:extend@3.0.0');
    } catch (e) {
      extend = $__require('npm:extend@3.0.0');
    }
    var pipeline = ware().use(function(ctx) {
      ctx.tree = ctx.context.parse(ctx.file, ctx.settings);
    }).use(function(ctx, next) {
      ctx.context.run(ctx.tree, ctx.file, next);
    }).use(function(ctx) {
      ctx.result = ctx.context.stringify(ctx.tree, ctx.file, ctx.settings);
    });
    function unified(options) {
      var name = options.name;
      var Parser = options.Parser;
      var Compiler = options.Compiler;
      var data = options.data;
      function Processor(processor) {
        var self = this;
        if (!(self instanceof Processor)) {
          return new Processor(processor);
        }
        self.ware = new AttachWare(processor && processor.ware);
        self.ware.context = self;
        self.Parser = unherit(Parser);
        self.Compiler = unherit(Compiler);
        if (self.data) {
          self.data = extend(true, {}, self.data);
        }
      }
      function instance(context) {
        return context instanceof Processor ? context : new Processor();
      }
      function use() {
        var self = instance(this);
        self.ware.use.apply(self.ware, arguments);
        return self;
      }
      function run(node, file, done) {
        var self = this;
        var space;
        if (typeof file === 'function') {
          done = file;
          file = null;
        }
        if (!file && node && !node.type) {
          file = node;
          node = null;
        }
        file = new VFile(file);
        space = file.namespace(name);
        if (!node) {
          node = space.tree || node;
        } else if (!space.tree) {
          space.tree = node;
        }
        if (!node) {
          throw new Error('Expected node, got ' + node);
        }
        done = typeof done === 'function' ? done : bail;
        if (self.ware && self.ware.fns) {
          self.ware.run(node, file, done);
        } else {
          done(null, node, file);
        }
        return node;
      }
      function parse(value, settings) {
        var file = new VFile(value);
        var CustomParser = (this && this.Parser) || Parser;
        var node = new CustomParser(file, settings, instance(this)).parse();
        file.namespace(name).tree = node;
        return node;
      }
      function stringify(node, file, settings) {
        var CustomCompiler = (this && this.Compiler) || Compiler;
        var space;
        if (settings === null || settings === undefined) {
          settings = file;
          file = null;
        }
        if (!file && node && !node.type) {
          file = node;
          node = null;
        }
        file = new VFile(file);
        space = file.namespace(name);
        if (!node) {
          node = space.tree || node;
        } else if (!space.tree) {
          space.tree = node;
        }
        if (!node) {
          throw new Error('Expected node, got ' + node);
        }
        return new CustomCompiler(file, settings, instance(this)).compile();
      }
      function process(value, settings, done) {
        var self = instance(this);
        var file = new VFile(value);
        var result = null;
        if (typeof settings === 'function') {
          done = settings;
          settings = null;
        }
        pipeline.run({
          'context': self,
          'file': file,
          'settings': settings || {}
        }, function(err, res) {
          result = res && res.result;
          if (done) {
            done(err, file, result);
          } else if (err) {
            bail(err);
          }
        });
        return result;
      }
      var proto = Processor.prototype;
      Processor.use = proto.use = use;
      Processor.parse = proto.parse = parse;
      Processor.run = proto.run = run;
      Processor.stringify = proto.stringify = stringify;
      Processor.process = proto.process = process;
      Processor.data = proto.data = data || null;
      return Processor;
    }
    module.exports = unified;
  })($__require('github:jspm/nodelibs-process@0.1.2'));
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:unified@2.1.4", ["npm:unified@2.1.4/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:unified@2.1.4/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:trim-trailing-lines@1.0.0/index", [], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var LINE = '\n';
  function trimTrailingLines(value) {
    var index;
    value = String(value);
    index = value.length;
    while (value.charAt(--index) === LINE) {}
    return value.slice(0, index + 1);
  }
  module.exports = trimTrailingLines;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:trim-trailing-lines@1.0.0", ["npm:trim-trailing-lines@1.0.0/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:trim-trailing-lines@1.0.0/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:remark@3.2.2/lib/block-elements.json!github:systemjs/plugin-json@0.1.0", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = ["article", "header", "aside", "hgroup", "blockquote", "hr", "iframe", "body", "li", "map", "button", "object", "canvas", "ol", "caption", "output", "col", "p", "colgroup", "pre", "dd", "progress", "div", "section", "dl", "table", "td", "dt", "tbody", "embed", "textarea", "fieldset", "tfoot", "figcaption", "th", "figure", "thead", "footer", "tr", "form", "ul", "h1", "h2", "h3", "h4", "h5", "h6", "video", "script", "style"];
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:remark@3.2.2/lib/parse", ["npm:parse-entities@1.0.2", "npm:repeat-string@1.5.2", "npm:trim@0.0.1", "npm:trim-trailing-lines@1.0.0", "npm:extend.js@0.0.2", "npm:remark@3.2.2/lib/utilities", "npm:remark@3.2.2/lib/defaults", "npm:remark@3.2.2/lib/block-elements.json!github:systemjs/plugin-json@0.1.0", "github:jspm/nodelibs-process@0.1.2"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var decode = $__require('npm:parse-entities@1.0.2');
    var repeat = $__require('npm:repeat-string@1.5.2');
    var trim = $__require('npm:trim@0.0.1');
    var trimTrailingLines = $__require('npm:trim-trailing-lines@1.0.0');
    var extend = $__require('npm:extend.js@0.0.2');
    var utilities = $__require('npm:remark@3.2.2/lib/utilities');
    var defaultOptions = $__require('npm:remark@3.2.2/lib/defaults').parse;
    var blockElements = $__require('npm:remark@3.2.2/lib/block-elements.json!github:systemjs/plugin-json@0.1.0');
    var raise = utilities.raise;
    var clean = utilities.clean;
    var validate = utilities.validate;
    var normalize = utilities.normalizeIdentifier;
    var stateToggler = utilities.stateToggler;
    var mergeable = utilities.mergeable;
    var MERGEABLE_NODES = utilities.MERGEABLE_NODES;
    var has = {}.hasOwnProperty;
    var SPACE_SIZE = 1;
    var TAB_SIZE = 4;
    var CODE_INDENT_LENGTH = 4;
    var MIN_FENCE_COUNT = 3;
    var MAX_ATX_COUNT = 6;
    var MAX_LINE_HEADING_INDENT = 3;
    var HORIZONTAL_RULE_MARKER_COUNT = 3;
    var MIN_CLOSING_HTML_NEWLINE_COUNT = 2;
    var MIN_BREAK_LENGTH = 2;
    var MIN_TABLE_COLUMNS = 2;
    var MIN_TABLE_ROWS = 2;
    var ERR_INFINITE_LOOP = 'Infinite loop';
    var ERR_MISSING_LOCATOR = 'Missing locator: ';
    var ERR_INCORRECTLY_EATEN = 'Incorrectly eaten value: please report this ' + 'warning on http://git.io/vUYWz';
    var EXPRESSION_BULLET = /^([ \t]*)([*+-]|\d+[.)])( {1,4}(?! )| |\t|$|(?=\n))([^\n]*)/;
    var EXPRESSION_PEDANTIC_BULLET = /^([ \t]*)([*+-]|\d+[.)])([ \t]+)/;
    var EXPRESSION_INITIAL_INDENT = /^( {1,4}|\t)?/gm;
    var EXPRESSION_INITIAL_TAB = /^( {4}|\t)?/gm;
    var EXPRESSION_HTML_LINK_OPEN = /^<a /i;
    var EXPRESSION_HTML_LINK_CLOSE = /^<\/a>/i;
    var EXPRESSION_LOOSE_LIST_ITEM = /\n\n(?!\s*$)/;
    var EXPRESSION_TASK_ITEM = /^\[([\ \t]|x|X)\][\ \t]/;
    var C_BACKSLASH = '\\';
    var C_UNDERSCORE = '_';
    var C_ASTERISK = '*';
    var C_TICK = '`';
    var C_AT_SIGN = '@';
    var C_HASH = '#';
    var C_PLUS = '+';
    var C_DASH = '-';
    var C_DOT = '.';
    var C_PIPE = '|';
    var C_DOUBLE_QUOTE = '"';
    var C_SINGLE_QUOTE = '\'';
    var C_COMMA = ',';
    var C_SLASH = '/';
    var C_COLON = ':';
    var C_SEMI_COLON = ';';
    var C_QUESTION_MARK = '?';
    var C_CARET = '^';
    var C_EQUALS = '=';
    var C_EXCLAMATION_MARK = '!';
    var C_TILDE = '~';
    var C_LT = '<';
    var C_GT = '>';
    var C_BRACKET_OPEN = '[';
    var C_BRACKET_CLOSE = ']';
    var C_PAREN_OPEN = '(';
    var C_PAREN_CLOSE = ')';
    var C_SPACE = ' ';
    var C_FORM_FEED = '\f';
    var C_NEWLINE = '\n';
    var C_CARRIAGE_RETURN = '\r';
    var C_TAB = '\t';
    var C_VERTICAL_TAB = '\v';
    var C_NO_BREAK_SPACE = '\u00a0';
    var C_OGHAM_SPACE = '\u1680';
    var C_MONGOLIAN_VOWEL_SEPARATOR = '\u180e';
    var C_EN_QUAD = '\u2000';
    var C_EM_QUAD = '\u2001';
    var C_EN_SPACE = '\u2002';
    var C_EM_SPACE = '\u2003';
    var C_THREE_PER_EM_SPACE = '\u2004';
    var C_FOUR_PER_EM_SPACE = '\u2005';
    var C_SIX_PER_EM_SPACE = '\u2006';
    var C_FIGURE_SPACE = '\u2007';
    var C_PUNCTUATION_SPACE = '\u2008';
    var C_THIN_SPACE = '\u2009';
    var C_HAIR_SPACE = '\u200a';
    var C_LINE_SEPARATOR = '​\u2028';
    var C_PARAGRAPH_SEPARATOR = '​\u2029';
    var C_NARROW_NO_BREAK_SPACE = '\u202f';
    var C_IDEOGRAPHIC_SPACE = '\u3000';
    var C_ZERO_WIDTH_NO_BREAK_SPACE = '\ufeff';
    var C_X_LOWER = 'x';
    var CC_A_LOWER = 'a'.charCodeAt(0);
    var CC_A_UPPER = 'A'.charCodeAt(0);
    var CC_Z_LOWER = 'z'.charCodeAt(0);
    var CC_Z_UPPER = 'Z'.charCodeAt(0);
    var CC_0 = '0'.charCodeAt(0);
    var CC_9 = '9'.charCodeAt(0);
    var HTTP_PROTOCOL = 'http://';
    var HTTPS_PROTOCOL = 'https://';
    var MAILTO_PROTOCOL = 'mailto:';
    var PROTOCOLS = [HTTP_PROTOCOL, HTTPS_PROTOCOL, MAILTO_PROTOCOL];
    var PROTOCOLS_LENGTH = PROTOCOLS.length;
    var YAML_FENCE = repeat(C_DASH, 3);
    var CODE_INDENT = repeat(C_SPACE, CODE_INDENT_LENGTH);
    var EMPTY = '';
    var BLOCK = 'block';
    var INLINE = 'inline';
    var COMMENT_START = '<!--';
    var COMMENT_END = '-->';
    var CDATA_START = '<![CDATA[';
    var CDATA_END = ']]>';
    var COMMENT_END_CHAR = COMMENT_END.charAt(0);
    var CDATA_END_CHAR = CDATA_END.charAt(0);
    var COMMENT_START_LENGTH = COMMENT_START.length;
    var COMMENT_END_LENGTH = COMMENT_END.length;
    var CDATA_START_LENGTH = CDATA_START.length;
    var CDATA_END_LENGTH = CDATA_END.length;
    var T_HORIZONTAL_RULE = 'horizontalRule';
    var T_HTML = 'html';
    var T_YAML = 'yaml';
    var T_TABLE = 'table';
    var T_TABLE_CELL = 'tableCell';
    var T_TABLE_HEADER = 'tableHeader';
    var T_TABLE_ROW = 'tableRow';
    var T_PARAGRAPH = 'paragraph';
    var T_TEXT = 'text';
    var T_CODE = 'code';
    var T_LIST = 'list';
    var T_LIST_ITEM = 'listItem';
    var T_DEFINITION = 'definition';
    var T_FOOTNOTE_DEFINITION = 'footnoteDefinition';
    var T_HEADING = 'heading';
    var T_BLOCKQUOTE = 'blockquote';
    var T_LINK = 'link';
    var T_IMAGE = 'image';
    var T_FOOTNOTE = 'footnote';
    var T_STRONG = 'strong';
    var T_EMPHASIS = 'emphasis';
    var T_DELETE = 'delete';
    var T_INLINE_CODE = 'inlineCode';
    var T_BREAK = 'break';
    var T_ROOT = 'root';
    var TABLE_ALIGN_LEFT = 'left';
    var TABLE_ALIGN_CENTER = 'center';
    var TABLE_ALIGN_RIGHT = 'right';
    var TABLE_ALIGN_NONE = null;
    var REFERENCE_TYPE_SHORTCUT = 'shortcut';
    var REFERENCE_TYPE_COLLAPSED = 'collapsed';
    var REFERENCE_TYPE_FULL = 'full';
    var INDENTATION_CHARACTERS = {};
    INDENTATION_CHARACTERS[C_SPACE] = SPACE_SIZE;
    INDENTATION_CHARACTERS[C_TAB] = TAB_SIZE;
    var EMPHASIS_MARKERS = {};
    EMPHASIS_MARKERS[C_ASTERISK] = true;
    EMPHASIS_MARKERS[C_UNDERSCORE] = true;
    var RULE_MARKERS = {};
    RULE_MARKERS[C_ASTERISK] = true;
    RULE_MARKERS[C_UNDERSCORE] = true;
    RULE_MARKERS[C_DASH] = true;
    var LIST_UNORDERED_MARKERS = {};
    LIST_UNORDERED_MARKERS[C_ASTERISK] = true;
    LIST_UNORDERED_MARKERS[C_PLUS] = true;
    LIST_UNORDERED_MARKERS[C_DASH] = true;
    var LIST_ORDERED_MARKERS = {};
    LIST_ORDERED_MARKERS[C_DOT] = true;
    var LIST_ORDERED_COMMONMARK_MARKERS = {};
    LIST_ORDERED_COMMONMARK_MARKERS[C_DOT] = true;
    LIST_ORDERED_COMMONMARK_MARKERS[C_PAREN_CLOSE] = true;
    var LINK_TITLE_MARKERS = {};
    LINK_TITLE_MARKERS[C_DOUBLE_QUOTE] = C_DOUBLE_QUOTE;
    LINK_TITLE_MARKERS[C_SINGLE_QUOTE] = C_SINGLE_QUOTE;
    var COMMONMARK_LINK_TITLE_MARKERS = {};
    COMMONMARK_LINK_TITLE_MARKERS[C_DOUBLE_QUOTE] = C_DOUBLE_QUOTE;
    COMMONMARK_LINK_TITLE_MARKERS[C_SINGLE_QUOTE] = C_SINGLE_QUOTE;
    COMMONMARK_LINK_TITLE_MARKERS[C_PAREN_OPEN] = C_PAREN_CLOSE;
    var SETEXT_MARKERS = {};
    SETEXT_MARKERS[C_EQUALS] = 1;
    SETEXT_MARKERS[C_DASH] = 2;
    var LIST_ITEM_MAP = {};
    LIST_ITEM_MAP.true = renderPedanticListItem;
    LIST_ITEM_MAP.false = renderNormalListItem;
    function isAlphabetic(character) {
      var code = character.charCodeAt(0);
      return (code >= CC_A_LOWER && code <= CC_Z_LOWER) || (code >= CC_A_UPPER && code <= CC_Z_UPPER);
    }
    function isNumeric(character) {
      var code = character.charCodeAt(0);
      return code >= CC_0 && code <= CC_9;
    }
    function isWordCharacter(character) {
      return character === C_UNDERSCORE || isAlphabetic(character) || isNumeric(character);
    }
    function isWhiteSpace(character) {
      return character === C_SPACE || character === C_FORM_FEED || character === C_NEWLINE || character === C_CARRIAGE_RETURN || character === C_TAB || character === C_VERTICAL_TAB || character === C_NO_BREAK_SPACE || character === C_OGHAM_SPACE || character === C_MONGOLIAN_VOWEL_SEPARATOR || character === C_EN_QUAD || character === C_EM_QUAD || character === C_EN_SPACE || character === C_EM_SPACE || character === C_THREE_PER_EM_SPACE || character === C_FOUR_PER_EM_SPACE || character === C_SIX_PER_EM_SPACE || character === C_FIGURE_SPACE || character === C_PUNCTUATION_SPACE || character === C_THIN_SPACE || character === C_HAIR_SPACE || character === C_LINE_SEPARATOR || character === C_PARAGRAPH_SEPARATOR || character === C_NARROW_NO_BREAK_SPACE || character === C_IDEOGRAPHIC_SPACE || character === C_ZERO_WIDTH_NO_BREAK_SPACE;
    }
    function isUnquotedAttributeCharacter(character) {
      return character !== C_DOUBLE_QUOTE && character !== C_SINGLE_QUOTE && character !== C_EQUALS && character !== C_LT && character !== C_GT && character !== C_TICK;
    }
    function isDoubleQuotedAttributeCharacter(character) {
      return character !== C_DOUBLE_QUOTE;
    }
    isDoubleQuotedAttributeCharacter.delimiter = C_DOUBLE_QUOTE;
    function isSingleQuotedAttributeCharacter(character) {
      return character !== C_SINGLE_QUOTE;
    }
    isSingleQuotedAttributeCharacter.delimiter = C_SINGLE_QUOTE;
    function isEnclosedURLCharacter(character) {
      return character !== C_GT && character !== C_BRACKET_OPEN && character !== C_BRACKET_CLOSE;
    }
    isEnclosedURLCharacter.delimiter = C_GT;
    function isUnclosedURLCharacter(character) {
      return character !== C_BRACKET_OPEN && character !== C_BRACKET_CLOSE && !isWhiteSpace(character);
    }
    function decodeFactory(context) {
      function normalize(position) {
        return {
          'start': position,
          'indent': context.getIndent(position.line)
        };
      }
      function handleWarning(reason, position, code) {
        if (code === 3) {
          return;
        }
        context.file.warn(reason, position);
      }
      function decoder(value, position, handler) {
        var hasPosition = context.options.position;
        decode(value, {
          'position': position && normalize(position),
          'warning': hasPosition && handleWarning,
          'text': handler,
          'reference': handler,
          'textContext': context,
          'referenceContext': context
        });
      }
      function decodeRaw(value, position) {
        return decode(value, {
          'position': position && normalize(position),
          'warning': context.options.position && handleWarning
        });
      }
      decoder.raw = decodeRaw;
      return decoder;
    }
    function descapeFactory(scope, key) {
      function descape(value) {
        var prev = 0;
        var index = value.indexOf(C_BACKSLASH);
        var escape = scope[key];
        var queue = [];
        var character;
        while (index !== -1) {
          queue.push(value.slice(prev, index));
          prev = index + 1;
          character = value.charAt(prev);
          if (!character || escape.indexOf(character) === -1) {
            queue.push(C_BACKSLASH);
          }
          index = value.indexOf(C_BACKSLASH, prev);
        }
        queue.push(value.slice(prev));
        return queue.join(EMPTY);
      }
      return descape;
    }
    function getIndent(value) {
      var index = 0;
      var indent = 0;
      var character = value.charAt(index);
      var stops = {};
      var size;
      while (character in INDENTATION_CHARACTERS) {
        size = INDENTATION_CHARACTERS[character];
        indent += size;
        if (size > 1) {
          indent = Math.floor(indent / size) * size;
        }
        stops[indent] = index;
        character = value.charAt(++index);
      }
      return {
        'indent': indent,
        'stops': stops
      };
    }
    function removeIndentation(value, maximum) {
      var values = value.split(C_NEWLINE);
      var position = values.length + 1;
      var minIndent = Infinity;
      var matrix = [];
      var index;
      var indentation;
      var stops;
      var padding;
      values.unshift(repeat(C_SPACE, maximum) + C_EXCLAMATION_MARK);
      while (position--) {
        indentation = getIndent(values[position]);
        matrix[position] = indentation.stops;
        if (trim(values[position]).length === 0) {
          continue;
        }
        if (indentation.indent) {
          if (indentation.indent > 0 && indentation.indent < minIndent) {
            minIndent = indentation.indent;
          }
        } else {
          minIndent = Infinity;
          break;
        }
      }
      if (minIndent !== Infinity) {
        position = values.length;
        while (position--) {
          stops = matrix[position];
          index = minIndent;
          while (index && !(index in stops)) {
            index--;
          }
          if (trim(values[position]).length !== 0 && minIndent && index !== minIndent) {
            padding = C_TAB;
          } else {
            padding = EMPTY;
          }
          values[position] = padding + values[position].slice(index in stops ? stops[index] + 1 : 0);
        }
      }
      values.shift();
      return values.join(C_NEWLINE);
    }
    function tokenizeNewline(eat, value, silent) {
      var character = value.charAt(0);
      var length;
      var subvalue;
      var queue;
      var index;
      if (character !== C_NEWLINE) {
        return;
      }
      if (silent) {
        return true;
      }
      index = 1;
      length = value.length;
      subvalue = C_NEWLINE;
      queue = EMPTY;
      while (index < length) {
        character = value.charAt(index);
        if (!isWhiteSpace(character)) {
          break;
        }
        queue += character;
        if (character === C_NEWLINE) {
          subvalue += queue;
          queue = EMPTY;
        }
        index++;
      }
      eat(subvalue);
    }
    function tokenizeCode(eat, value, silent) {
      var self = this;
      var index = -1;
      var length = value.length;
      var character;
      var subvalue = EMPTY;
      var content = EMPTY;
      var subvalueQueue = EMPTY;
      var contentQueue = EMPTY;
      var blankQueue;
      var indent;
      while (++index < length) {
        character = value.charAt(index);
        if (indent) {
          indent = false;
          subvalue += subvalueQueue;
          content += contentQueue;
          subvalueQueue = contentQueue = EMPTY;
          if (character === C_NEWLINE) {
            subvalueQueue = contentQueue = character;
          } else {
            subvalue += character;
            content += character;
            while (++index < length) {
              character = value.charAt(index);
              if (!character || character === C_NEWLINE) {
                contentQueue = subvalueQueue = character;
                break;
              }
              subvalue += character;
              content += character;
            }
          }
        } else if (character === C_SPACE && value.charAt(index + 1) === C_SPACE && value.charAt(index + 2) === C_SPACE && value.charAt(index + 3) === C_SPACE) {
          subvalueQueue += CODE_INDENT;
          index += 3;
          indent = true;
        } else if (character === C_TAB) {
          subvalueQueue += character;
          indent = true;
        } else {
          blankQueue = EMPTY;
          while (character === C_TAB || character === C_SPACE) {
            blankQueue += character;
            character = value.charAt(++index);
          }
          if (character !== C_NEWLINE) {
            break;
          }
          subvalueQueue += blankQueue + character;
          contentQueue += character;
        }
      }
      if (content) {
        if (silent) {
          return true;
        }
        return eat(subvalue)(self.renderCodeBlock(content));
      }
    }
    function tokenizeFences(eat, value, silent) {
      var self = this;
      var settings = self.options;
      var length = value.length + 1;
      var index = 0;
      var subvalue = EMPTY;
      var fenceCount;
      var marker;
      var character;
      var flag;
      var queue;
      var content;
      var exdentedContent;
      var closing;
      var exdentedClosing;
      var indent;
      var now;
      if (!settings.gfm) {
        return;
      }
      while (index < length) {
        character = value.charAt(index);
        if (character !== C_SPACE && character !== C_TAB) {
          break;
        }
        subvalue += character;
        index++;
      }
      indent = index;
      character = value.charAt(index);
      if (character !== C_TILDE && character !== C_TICK) {
        return;
      }
      index++;
      marker = character;
      fenceCount = 1;
      subvalue += character;
      while (index < length) {
        character = value.charAt(index);
        if (character !== marker) {
          break;
        }
        subvalue += character;
        fenceCount++;
        index++;
      }
      if (fenceCount < MIN_FENCE_COUNT) {
        return;
      }
      while (index < length) {
        character = value.charAt(index);
        if (character !== C_SPACE && character !== C_TAB) {
          break;
        }
        subvalue += character;
        index++;
      }
      flag = queue = EMPTY;
      while (index < length) {
        character = value.charAt(index);
        if (character === C_NEWLINE || character === C_TILDE || character === C_TICK) {
          break;
        }
        if (character === C_SPACE || character === C_TAB) {
          queue += character;
        } else {
          flag += queue + character;
          queue = EMPTY;
        }
        index++;
      }
      character = value.charAt(index);
      if (character && character !== C_NEWLINE) {
        return;
      }
      if (silent) {
        return true;
      }
      now = eat.now();
      now.column += subvalue.length;
      subvalue += flag;
      flag = self.decode.raw(self.descape(flag), now);
      if (queue) {
        subvalue += queue;
      }
      queue = closing = exdentedClosing = content = exdentedContent = EMPTY;
      while (index < length) {
        character = value.charAt(index);
        content += closing;
        exdentedContent += exdentedClosing;
        closing = exdentedClosing = EMPTY;
        if (character !== C_NEWLINE) {
          content += character;
          exdentedClosing += character;
          index++;
          continue;
        }
        if (!content) {
          subvalue += character;
        } else {
          closing += character;
          exdentedClosing += character;
        }
        queue = EMPTY;
        index++;
        while (index < length) {
          character = value.charAt(index);
          if (character !== C_SPACE) {
            break;
          }
          queue += character;
          index++;
        }
        closing += queue;
        exdentedClosing += queue.slice(indent);
        if (queue.length >= CODE_INDENT_LENGTH) {
          continue;
        }
        queue = EMPTY;
        while (index < length) {
          character = value.charAt(index);
          if (character !== marker) {
            break;
          }
          queue += character;
          index++;
        }
        closing += queue;
        exdentedClosing += queue;
        if (queue.length < fenceCount) {
          continue;
        }
        queue = EMPTY;
        while (index < length) {
          character = value.charAt(index);
          if (character !== C_SPACE && character !== C_TAB) {
            break;
          }
          closing += character;
          exdentedClosing += character;
          index++;
        }
        if (!character || character === C_NEWLINE) {
          break;
        }
      }
      subvalue += content + closing;
      return eat(subvalue)(self.renderCodeBlock(exdentedContent, flag));
    }
    function tokenizeHeading(eat, value, silent) {
      var self = this;
      var settings = self.options;
      var length = value.length + 1;
      var index = -1;
      var now = eat.now();
      var subvalue = EMPTY;
      var content = EMPTY;
      var character;
      var queue;
      var depth;
      while (++index < length) {
        character = value.charAt(index);
        if (character !== C_SPACE && character !== C_TAB) {
          index--;
          break;
        }
        subvalue += character;
      }
      depth = 0;
      length = index + MAX_ATX_COUNT + 1;
      while (++index <= length) {
        character = value.charAt(index);
        if (character !== C_HASH) {
          index--;
          break;
        }
        subvalue += character;
        depth++;
      }
      if (!depth || (!settings.pedantic && value.charAt(index + 1) === C_HASH)) {
        return;
      }
      length = value.length + 1;
      queue = EMPTY;
      while (++index < length) {
        character = value.charAt(index);
        if (character !== C_SPACE && character !== C_TAB) {
          index--;
          break;
        }
        queue += character;
      }
      if (!settings.pedantic && !queue.length && character && character !== C_NEWLINE) {
        return;
      }
      if (silent) {
        return true;
      }
      subvalue += queue;
      queue = content = EMPTY;
      while (++index < length) {
        character = value.charAt(index);
        if (!character || character === C_NEWLINE) {
          break;
        }
        if (character !== C_SPACE && character !== C_TAB && character !== C_HASH) {
          content += queue + character;
          queue = EMPTY;
          continue;
        }
        while (character === C_SPACE || character === C_TAB) {
          queue += character;
          character = value.charAt(++index);
        }
        while (character === C_HASH) {
          queue += character;
          character = value.charAt(++index);
        }
        while (character === C_SPACE || character === C_TAB) {
          queue += character;
          character = value.charAt(++index);
        }
        index--;
      }
      now.column += subvalue.length;
      subvalue += content + queue;
      return eat(subvalue)(self.renderHeading(content, depth, now));
    }
    function tokenizeLineHeading(eat, value, silent) {
      var self = this;
      var now = eat.now();
      var length = value.length;
      var index = -1;
      var subvalue = EMPTY;
      var content;
      var queue;
      var character;
      var marker;
      var depth;
      while (++index < length) {
        character = value.charAt(index);
        if (character !== C_SPACE || index >= MAX_LINE_HEADING_INDENT) {
          index--;
          break;
        }
        subvalue += character;
      }
      content = queue = EMPTY;
      while (++index < length) {
        character = value.charAt(index);
        if (character === C_NEWLINE) {
          index--;
          break;
        }
        if (character === C_SPACE || character === C_TAB) {
          queue += character;
        } else {
          content += queue + character;
          queue = EMPTY;
        }
      }
      now.column += subvalue.length;
      subvalue += content + queue;
      character = value.charAt(++index);
      marker = value.charAt(++index);
      if (character !== C_NEWLINE || !SETEXT_MARKERS[marker]) {
        return;
      }
      if (silent) {
        return true;
      }
      subvalue += character;
      queue = marker;
      depth = SETEXT_MARKERS[marker];
      while (++index < length) {
        character = value.charAt(index);
        if (character !== marker) {
          if (character !== C_NEWLINE) {
            return;
          }
          index--;
          break;
        }
        queue += character;
      }
      return eat(subvalue + queue)(self.renderHeading(content, depth, now));
    }
    function tokenizeHorizontalRule(eat, value, silent) {
      var self = this;
      var index = -1;
      var length = value.length + 1;
      var subvalue = EMPTY;
      var character;
      var marker;
      var markerCount;
      var queue;
      while (++index < length) {
        character = value.charAt(index);
        if (character !== C_TAB && character !== C_SPACE) {
          break;
        }
        subvalue += character;
      }
      if (RULE_MARKERS[character] !== true) {
        return;
      }
      marker = character;
      subvalue += character;
      markerCount = 1;
      queue = EMPTY;
      while (++index < length) {
        character = value.charAt(index);
        if (character === marker) {
          markerCount++;
          subvalue += queue + marker;
          queue = EMPTY;
        } else if (character === C_SPACE) {
          queue += character;
        } else if (markerCount >= HORIZONTAL_RULE_MARKER_COUNT && (!character || character === C_NEWLINE)) {
          subvalue += queue;
          if (silent) {
            return true;
          }
          return eat(subvalue)(self.renderVoid(T_HORIZONTAL_RULE));
        } else {
          return;
        }
      }
    }
    function tokenizeBlockquote(eat, value, silent) {
      var self = this;
      var commonmark = self.options.commonmark;
      var now = eat.now();
      var indent = self.indent(now.line);
      var length = value.length;
      var values = [];
      var contents = [];
      var indents = [];
      var add;
      var tokenizers;
      var index = 0;
      var character;
      var rest;
      var nextIndex;
      var content;
      var line;
      var startIndex;
      var prefixed;
      while (index < length) {
        character = value.charAt(index);
        if (character !== C_SPACE && character !== C_TAB) {
          break;
        }
        index++;
      }
      if (value.charAt(index) !== C_GT) {
        return;
      }
      if (silent) {
        return true;
      }
      tokenizers = self.blockTokenizers;
      index = 0;
      while (index < length) {
        nextIndex = value.indexOf(C_NEWLINE, index);
        startIndex = index;
        prefixed = false;
        if (nextIndex === -1) {
          nextIndex = length;
        }
        while (index < length) {
          character = value.charAt(index);
          if (character !== C_SPACE && character !== C_TAB) {
            break;
          }
          index++;
        }
        if (value.charAt(index) === C_GT) {
          index++;
          prefixed = true;
          if (value.charAt(index) === C_SPACE) {
            index++;
          }
        } else {
          index = startIndex;
        }
        content = value.slice(index, nextIndex);
        if (!prefixed && !trim(content)) {
          index = startIndex;
          break;
        }
        if (!prefixed) {
          rest = value.slice(index);
          if (commonmark && (tokenizers.code.call(self, eat, rest, true) || tokenizers.fences.call(self, eat, rest, true) || tokenizers.heading.call(self, eat, rest, true) || tokenizers.lineHeading.call(self, eat, rest, true) || tokenizers.horizontalRule.call(self, eat, rest, true) || tokenizers.html.call(self, eat, rest, true) || tokenizers.list.call(self, eat, rest, true))) {
            break;
          }
          if (!commonmark && (tokenizers.definition.call(self, eat, rest, true) || tokenizers.footnoteDefinition.call(self, eat, rest, true))) {
            break;
          }
        }
        line = startIndex === index ? content : value.slice(startIndex, nextIndex);
        indents.push(index - startIndex);
        values.push(line);
        contents.push(content);
        index = nextIndex + 1;
      }
      index = -1;
      length = indents.length;
      add = eat(values.join(C_NEWLINE));
      while (++index < length) {
        indent(indents[index]);
      }
      return add(self.renderBlockquote(contents.join(C_NEWLINE), now));
    }
    function tokenizeList(eat, value, silent) {
      var self = this;
      var commonmark = self.options.commonmark;
      var pedantic = self.options.pedantic;
      var tokenizers = self.blockTokenizers;
      var markers;
      var index = 0;
      var length = value.length;
      var start = null;
      var queue;
      var ordered;
      var character;
      var marker;
      var nextIndex;
      var startIndex;
      var prefixed;
      var currentMarker;
      var content;
      var line;
      var prevEmpty;
      var empty;
      var items;
      var allLines;
      var emptyLines;
      var item;
      var enterTop;
      var exitBlockquote;
      var isLoose;
      var node;
      var now;
      var end;
      var indented;
      var size;
      while (index < length) {
        character = value.charAt(index);
        if (character !== C_SPACE && character !== C_TAB) {
          break;
        }
        index++;
      }
      character = value.charAt(index);
      markers = commonmark ? LIST_ORDERED_COMMONMARK_MARKERS : LIST_ORDERED_MARKERS;
      if (LIST_UNORDERED_MARKERS[character] === true) {
        marker = character;
        ordered = false;
      } else {
        ordered = true;
        queue = EMPTY;
        while (index < length) {
          character = value.charAt(index);
          if (!isNumeric(character)) {
            break;
          }
          queue += character;
          index++;
        }
        character = value.charAt(index);
        if (!queue || markers[character] !== true) {
          return;
        }
        start = parseInt(queue, 10);
        marker = character;
      }
      character = value.charAt(++index);
      if (character !== C_SPACE && character !== C_TAB) {
        return;
      }
      if (silent) {
        return true;
      }
      index = 0;
      items = [];
      allLines = [];
      emptyLines = [];
      while (index < length) {
        nextIndex = value.indexOf(C_NEWLINE, index);
        startIndex = index;
        prefixed = false;
        indented = false;
        if (nextIndex === -1) {
          nextIndex = length;
        }
        end = index + TAB_SIZE;
        size = 0;
        while (index < length) {
          character = value.charAt(index);
          if (character === C_TAB) {
            size += TAB_SIZE - size % TAB_SIZE;
          } else if (character === C_SPACE) {
            size++;
          } else {
            break;
          }
          index++;
        }
        if (size >= TAB_SIZE) {
          indented = true;
        }
        if (item && size >= item.indent) {
          indented = true;
        }
        character = value.charAt(index);
        currentMarker = null;
        if (!indented) {
          if (LIST_UNORDERED_MARKERS[character] === true) {
            currentMarker = character;
            index++;
            size++;
          } else {
            queue = EMPTY;
            while (index < length) {
              character = value.charAt(index);
              if (!isNumeric(character)) {
                break;
              }
              queue += character;
              index++;
            }
            character = value.charAt(index);
            index++;
            if (queue && markers[character] === true) {
              currentMarker = character;
              size += queue.length + 1;
            }
          }
          if (currentMarker) {
            character = value.charAt(index);
            if (character === C_TAB) {
              size += TAB_SIZE - size % TAB_SIZE;
              index++;
            } else if (character === C_SPACE) {
              end = index + TAB_SIZE;
              while (index < end) {
                if (value.charAt(index) !== C_SPACE) {
                  break;
                }
                index++;
                size++;
              }
              if (index === end && value.charAt(index) === C_SPACE) {
                index -= TAB_SIZE - 1;
                size -= TAB_SIZE - 1;
              }
            } else if (character !== C_NEWLINE && character !== EMPTY) {
              currentMarker = null;
            }
          }
        }
        if (currentMarker) {
          if (commonmark && marker !== currentMarker) {
            break;
          }
          prefixed = true;
        } else {
          if (!commonmark && !indented && value.charAt(startIndex) === C_SPACE) {
            indented = true;
          } else if (commonmark && item) {
            indented = size >= item.indent || size > TAB_SIZE;
          }
          prefixed = false;
          index = startIndex;
        }
        line = value.slice(startIndex, nextIndex);
        content = startIndex === index ? line : value.slice(index, nextIndex);
        if (currentMarker && RULE_MARKERS[currentMarker] === true) {
          if (tokenizers.horizontalRule.call(self, eat, line, true)) {
            break;
          }
        }
        prevEmpty = empty;
        empty = !trim(content).length;
        if (indented && item) {
          item.value = item.value.concat(emptyLines, line);
          allLines = allLines.concat(emptyLines, line);
          emptyLines = [];
        } else if (prefixed) {
          if (emptyLines.length) {
            item.value.push(EMPTY);
            item.trail = emptyLines.concat();
          }
          item = {
            'value': [line],
            'indent': size,
            'trail': []
          };
          items.push(item);
          allLines = allLines.concat(emptyLines, line);
          emptyLines = [];
        } else if (empty) {
          if (prevEmpty) {
            break;
          }
          emptyLines.push(line);
        } else {
          if (prevEmpty) {
            break;
          }
          if (!pedantic && tokenizers.horizontalRule.call(self, eat, line, true)) {
            break;
          }
          if (!commonmark) {
            if (tokenizers.definition.call(self, eat, line, true) || tokenizers.footnoteDefinition.call(self, eat, line, true)) {
              break;
            }
          }
          item.value = item.value.concat(emptyLines, line);
          allLines = allLines.concat(emptyLines, line);
          emptyLines = [];
        }
        index = nextIndex + 1;
      }
      node = eat(allLines.join(C_NEWLINE)).reset({
        'type': T_LIST,
        'ordered': ordered,
        'start': start,
        'loose': null,
        'children': []
      });
      enterTop = self.exitTop();
      exitBlockquote = self.enterBlockquote();
      isLoose = false;
      index = -1;
      length = items.length;
      while (++index < length) {
        item = items[index].value.join(C_NEWLINE);
        now = eat.now();
        item = eat(item)(self.renderListItem(item, now), node);
        if (item.loose) {
          isLoose = true;
        }
        item = items[index].trail.join(C_NEWLINE);
        if (index !== length - 1) {
          item += C_NEWLINE;
        }
        eat(item);
      }
      enterTop();
      exitBlockquote();
      node.loose = isLoose;
      return node;
    }
    function eatHTMLComment(value, settings) {
      var index = COMMENT_START_LENGTH;
      var queue = COMMENT_START;
      var length = value.length;
      var commonmark = settings.commonmark;
      var character;
      var hasNonDash;
      if (value.slice(0, index) === queue) {
        while (index < length) {
          character = value.charAt(index);
          if (character === COMMENT_END_CHAR && value.slice(index, index + COMMENT_END_LENGTH) === COMMENT_END) {
            return queue + COMMENT_END;
          }
          if (commonmark) {
            if (character === C_GT && !hasNonDash) {
              return;
            }
            if (character === C_DASH) {
              if (value.charAt(index + 1) === C_DASH) {
                return;
              }
            } else {
              hasNonDash = true;
            }
          }
          queue += character;
          index++;
        }
      }
    }
    function eatHTMLCDATA(value) {
      var index = CDATA_START_LENGTH;
      var queue = value.slice(0, index);
      var length = value.length;
      var character;
      if (queue.toUpperCase() === CDATA_START) {
        while (index < length) {
          character = value.charAt(index);
          if (character === CDATA_END_CHAR && value.slice(index, index + CDATA_END_LENGTH) === CDATA_END) {
            return queue + CDATA_END;
          }
          queue += character;
          index++;
        }
      }
    }
    function eatHTMLProcessingInstruction(value) {
      var index = 0;
      var queue = EMPTY;
      var length = value.length;
      var character;
      if (value.charAt(index) === C_LT && value.charAt(++index) === C_QUESTION_MARK) {
        queue = C_LT + C_QUESTION_MARK;
        index++;
        while (index < length) {
          character = value.charAt(index);
          if (character === C_QUESTION_MARK && value.charAt(index + 1) === C_GT) {
            return queue + character + C_GT;
          }
          queue += character;
          index++;
        }
      }
    }
    function eatHTMLDeclaration(value) {
      var index = 0;
      var length = value.length;
      var queue = EMPTY;
      var subqueue = EMPTY;
      var character;
      if (value.charAt(index) === C_LT && value.charAt(++index) === C_EXCLAMATION_MARK) {
        queue = C_LT + C_EXCLAMATION_MARK;
        index++;
        while (index < length) {
          character = value.charAt(index);
          if (!isAlphabetic(character)) {
            break;
          }
          subqueue += character;
          index++;
        }
        character = value.charAt(index);
        if (!subqueue || !isWhiteSpace(character)) {
          return;
        }
        queue += subqueue + character;
        index++;
        while (index < length) {
          character = value.charAt(index);
          if (character === C_GT) {
            return queue;
          }
          queue += character;
          index++;
        }
      }
    }
    function eatHTMLClosingTag(value, isBlock) {
      var index = 0;
      var length = value.length;
      var queue = EMPTY;
      var subqueue = EMPTY;
      var character;
      if (value.charAt(index) === C_LT && value.charAt(++index) === C_SLASH) {
        queue = C_LT + C_SLASH;
        subqueue = character = value.charAt(++index);
        if (!isAlphabetic(character)) {
          return;
        }
        index++;
        while (index < length) {
          character = value.charAt(index);
          if (!isAlphabetic(character) && !isNumeric(character)) {
            break;
          }
          subqueue += character;
          index++;
        }
        if (isBlock && blockElements.indexOf(subqueue.toLowerCase()) === -1) {
          return;
        }
        queue += subqueue;
        while (index < length) {
          character = value.charAt(index);
          if (!isWhiteSpace(character)) {
            break;
          }
          queue += character;
          index++;
        }
        if (value.charAt(index) === C_GT) {
          return queue + C_GT;
        }
      }
    }
    function eatHTMLOpeningTag(value, isBlock) {
      var index = 0;
      var length = value.length;
      var queue = EMPTY;
      var subqueue = EMPTY;
      var character = value.charAt(index);
      var hasEquals;
      var test;
      if (character === C_LT) {
        queue = character;
        subqueue = character = value.charAt(++index);
        if (!isAlphabetic(character)) {
          return;
        }
        index++;
        while (index < length) {
          character = value.charAt(index);
          if (!isAlphabetic(character) && !isNumeric(character)) {
            break;
          }
          subqueue += character;
          index++;
        }
        if (isBlock && blockElements.indexOf(subqueue.toLowerCase()) === -1) {
          return;
        }
        queue += subqueue;
        subqueue = EMPTY;
        while (index < length) {
          while (index < length) {
            character = value.charAt(index);
            if (!isWhiteSpace(character)) {
              break;
            }
            subqueue += character;
            index++;
          }
          if (!subqueue) {
            break;
          }
          queue += subqueue;
          subqueue = EMPTY;
          character = value.charAt(index);
          if (isAlphabetic(character) || character === C_UNDERSCORE || character === C_COLON) {
            subqueue = character;
            index++;
            while (index < length) {
              character = value.charAt(index);
              if (!isAlphabetic(character) && !isNumeric(character) && character !== C_UNDERSCORE && character !== C_COLON && character !== C_DOT && character !== C_DASH) {
                break;
              }
              subqueue += character;
              index++;
            }
          }
          if (!subqueue) {
            break;
          }
          queue += subqueue;
          subqueue = EMPTY;
          hasEquals = false;
          while (index < length) {
            character = value.charAt(index);
            if (!isWhiteSpace(character)) {
              if (!hasEquals && character === C_EQUALS) {
                hasEquals = true;
              } else {
                break;
              }
            }
            subqueue += character;
            index++;
          }
          queue += subqueue;
          subqueue = EMPTY;
          if (!hasEquals) {
            queue += subqueue;
          } else {
            character = value.charAt(index);
            queue += subqueue;
            if (character === C_DOUBLE_QUOTE) {
              test = isDoubleQuotedAttributeCharacter;
              subqueue = character;
              index++;
            } else if (character === C_SINGLE_QUOTE) {
              test = isSingleQuotedAttributeCharacter;
              subqueue = character;
              index++;
            } else {
              test = isUnquotedAttributeCharacter;
              subqueue = EMPTY;
            }
            while (index < length) {
              character = value.charAt(index);
              if (!test(character)) {
                break;
              }
              subqueue += character;
              index++;
            }
            character = value.charAt(index);
            index++;
            if (!test.delimiter) {
              if (!subqueue.length) {
                return;
              }
              index--;
            } else if (character === test.delimiter) {
              subqueue += character;
            } else {
              return;
            }
            queue += subqueue;
            subqueue = EMPTY;
          }
        }
        character = value.charAt(index);
        if (character === C_SLASH) {
          queue += character;
          character = value.charAt(++index);
        }
        return character === C_GT ? queue + character : null;
      }
    }
    function tokenizeHTML(eat, value, silent) {
      var self = this;
      var index = 0;
      var length = value.length;
      var subvalue = EMPTY;
      var offset;
      var lineCount;
      var character;
      var queue;
      while (index < length) {
        character = value.charAt(index);
        if (character !== C_TAB && character !== C_SPACE) {
          break;
        }
        subvalue += character;
        index++;
      }
      offset = index;
      value = value.slice(offset);
      queue = eatHTMLComment(value, self.options) || eatHTMLCDATA(value) || eatHTMLProcessingInstruction(value) || eatHTMLDeclaration(value) || eatHTMLClosingTag(value, true) || eatHTMLOpeningTag(value, true);
      if (!queue) {
        return;
      }
      if (silent) {
        return true;
      }
      subvalue += queue;
      index = subvalue.length - offset;
      queue = EMPTY;
      while (index < length) {
        character = value.charAt(index);
        if (character === C_NEWLINE) {
          queue += character;
          lineCount++;
        } else if (queue.length < MIN_CLOSING_HTML_NEWLINE_COUNT) {
          subvalue += queue + character;
          queue = EMPTY;
        } else {
          break;
        }
        index++;
      }
      return eat(subvalue)(self.renderRaw(T_HTML, subvalue));
    }
    function tokenizeDefinition(eat, value, silent) {
      var self = this;
      var commonmark = self.options.commonmark;
      var index = 0;
      var length = value.length;
      var subvalue = EMPTY;
      var beforeURL;
      var beforeTitle;
      var queue;
      var character;
      var test;
      var identifier;
      var url;
      var title;
      while (index < length) {
        character = value.charAt(index);
        if (character !== C_SPACE && character !== C_TAB) {
          break;
        }
        subvalue += character;
        index++;
      }
      character = value.charAt(index);
      if (character !== C_BRACKET_OPEN) {
        return;
      }
      index++;
      subvalue += character;
      queue = EMPTY;
      while (index < length) {
        character = value.charAt(index);
        if (character === C_BRACKET_CLOSE) {
          break;
        } else if (character === C_BACKSLASH) {
          queue += character;
          index++;
          character = value.charAt(index);
        }
        queue += character;
        index++;
      }
      if (!queue || value.charAt(index) !== C_BRACKET_CLOSE || value.charAt(index + 1) !== C_COLON) {
        return;
      }
      identifier = queue;
      subvalue += queue + C_BRACKET_CLOSE + C_COLON;
      index = subvalue.length;
      queue = EMPTY;
      while (index < length) {
        character = value.charAt(index);
        if (character !== C_TAB && character !== C_SPACE && character !== C_NEWLINE) {
          break;
        }
        subvalue += character;
        index++;
      }
      character = value.charAt(index);
      queue = EMPTY;
      beforeURL = subvalue;
      if (character === C_LT) {
        index++;
        while (index < length) {
          character = value.charAt(index);
          if (!isEnclosedURLCharacter(character)) {
            break;
          }
          queue += character;
          index++;
        }
        character = value.charAt(index);
        if (character !== isEnclosedURLCharacter.delimiter) {
          if (commonmark) {
            return;
          }
          index -= queue.length + 1;
          queue = EMPTY;
        } else {
          subvalue += C_LT + queue + character;
          index++;
        }
      }
      if (!queue) {
        while (index < length) {
          character = value.charAt(index);
          if (!isUnclosedURLCharacter(character)) {
            break;
          }
          queue += character;
          index++;
        }
        subvalue += queue;
      }
      if (!queue) {
        return;
      }
      url = queue;
      queue = EMPTY;
      while (index < length) {
        character = value.charAt(index);
        if (character !== C_TAB && character !== C_SPACE && character !== C_NEWLINE) {
          break;
        }
        queue += character;
        index++;
      }
      character = value.charAt(index);
      test = null;
      if (character === C_DOUBLE_QUOTE) {
        test = C_DOUBLE_QUOTE;
      } else if (character === C_SINGLE_QUOTE) {
        test = C_SINGLE_QUOTE;
      } else if (character === C_PAREN_OPEN) {
        test = C_PAREN_CLOSE;
      }
      if (!test) {
        queue = EMPTY;
        index = subvalue.length;
      } else if (!queue) {
        return;
      } else {
        subvalue += queue + character;
        index = subvalue.length;
        queue = EMPTY;
        while (index < length) {
          character = value.charAt(index);
          if (character === test) {
            break;
          }
          if (character === C_NEWLINE) {
            index++;
            character = value.charAt(index);
            if (character === C_NEWLINE || character === test) {
              return;
            }
            queue += C_NEWLINE;
          }
          queue += character;
          index++;
        }
        character = value.charAt(index);
        if (character !== test) {
          return;
        }
        beforeTitle = subvalue;
        subvalue += queue + character;
        index++;
        title = queue;
        queue = EMPTY;
      }
      while (index < length) {
        character = value.charAt(index);
        if (character !== C_TAB && character !== C_SPACE) {
          break;
        }
        subvalue += character;
        index++;
      }
      character = value.charAt(index);
      if (!character || character === C_NEWLINE) {
        if (silent) {
          return true;
        }
        beforeURL = eat(beforeURL).test().end;
        url = self.decode.raw(self.descape(url), beforeURL);
        if (title) {
          beforeTitle = eat(beforeTitle).test().end;
          title = self.decode.raw(self.descape(title), beforeTitle);
        }
        return eat(subvalue)({
          'type': T_DEFINITION,
          'identifier': normalize(identifier),
          'title': title || null,
          'link': url
        });
      }
    }
    tokenizeDefinition.onlyAtTop = true;
    tokenizeDefinition.notInBlockquote = true;
    function tokenizeYAMLFrontMatter(eat, value, silent) {
      var self = this;
      var subvalue;
      var content;
      var index;
      var length;
      var character;
      var queue;
      if (!self.options.yaml || value.charAt(0) !== C_DASH || value.charAt(1) !== C_DASH || value.charAt(2) !== C_DASH || value.charAt(3) !== C_NEWLINE) {
        return;
      }
      subvalue = YAML_FENCE + C_NEWLINE;
      content = queue = EMPTY;
      index = 3;
      length = value.length;
      while (++index < length) {
        character = value.charAt(index);
        if (character === C_DASH && (queue || !content) && value.charAt(index + 1) === C_DASH && value.charAt(index + 2) === C_DASH) {
          if (silent) {
            return true;
          }
          subvalue += queue + YAML_FENCE;
          return eat(subvalue)(self.renderRaw(T_YAML, content));
        }
        if (character === C_NEWLINE) {
          queue += character;
        } else {
          subvalue += queue + character;
          content += queue + character;
          queue = EMPTY;
        }
      }
    }
    tokenizeYAMLFrontMatter.onlyAtStart = true;
    function tokenizeFootnoteDefinition(eat, value, silent) {
      var self = this;
      var index;
      var length;
      var subvalue;
      var now;
      var indent;
      var content;
      var queue;
      var subqueue;
      var character;
      var identifier;
      if (!self.options.footnotes) {
        return;
      }
      index = 0;
      length = value.length;
      subvalue = EMPTY;
      now = eat.now();
      indent = self.indent(now.line);
      while (index < length) {
        character = value.charAt(index);
        if (!isWhiteSpace(character)) {
          break;
        }
        subvalue += character;
        index++;
      }
      if (value.charAt(index) !== C_BRACKET_OPEN || value.charAt(index + 1) !== C_CARET) {
        return;
      }
      subvalue += C_BRACKET_OPEN + C_CARET;
      index = subvalue.length;
      queue = EMPTY;
      while (index < length) {
        character = value.charAt(index);
        if (character === C_BRACKET_CLOSE) {
          break;
        } else if (character === C_BACKSLASH) {
          queue += character;
          index++;
          character = value.charAt(index);
        }
        queue += character;
        index++;
      }
      if (!queue || value.charAt(index) !== C_BRACKET_CLOSE || value.charAt(index + 1) !== C_COLON) {
        return;
      }
      if (silent) {
        return true;
      }
      identifier = normalize(queue);
      subvalue += queue + C_BRACKET_CLOSE + C_COLON;
      index = subvalue.length;
      while (index < length) {
        character = value.charAt(index);
        if (character !== C_TAB && character !== C_SPACE) {
          break;
        }
        subvalue += character;
        index++;
      }
      now.column += subvalue.length;
      queue = content = subqueue = EMPTY;
      while (index < length) {
        character = value.charAt(index);
        if (character === C_NEWLINE) {
          subqueue = character;
          index++;
          while (index < length) {
            character = value.charAt(index);
            if (character !== C_NEWLINE) {
              break;
            }
            subqueue += character;
            index++;
          }
          queue += subqueue;
          subqueue = EMPTY;
          while (index < length) {
            character = value.charAt(index);
            if (character !== C_SPACE) {
              break;
            }
            subqueue += character;
            index++;
          }
          if (!subqueue.length) {
            break;
          }
          queue += subqueue;
        }
        if (queue) {
          content += queue;
          queue = EMPTY;
        }
        content += character;
        index++;
      }
      subvalue += content;
      content = content.replace(EXPRESSION_INITIAL_TAB, function(line) {
        indent(line.length);
        return EMPTY;
      });
      return eat(subvalue)(self.renderFootnoteDefinition(identifier, content, now));
    }
    tokenizeFootnoteDefinition.onlyAtTop = true;
    tokenizeFootnoteDefinition.notInBlockquote = true;
    function tokenizeTable(eat, value, silent) {
      var self = this;
      var index;
      var alignments;
      var alignment;
      var subvalue;
      var row;
      var length;
      var lines;
      var queue;
      var character;
      var hasDash;
      var align;
      var cell;
      var preamble;
      var count;
      var opening;
      var now;
      var position;
      var lineCount;
      var line;
      var rows;
      var table;
      var lineIndex;
      var pipeIndex;
      var first;
      if (!self.options.gfm) {
        return;
      }
      index = lineCount = 0;
      length = value.length + 1;
      lines = [];
      while (index < length) {
        lineIndex = value.indexOf(C_NEWLINE, index);
        pipeIndex = value.indexOf(C_PIPE, index + 1);
        if (lineIndex === -1) {
          lineIndex = value.length;
        }
        if (pipeIndex === -1 || pipeIndex > lineIndex) {
          if (lineCount < MIN_TABLE_ROWS) {
            return;
          }
          break;
        }
        lines.push(value.slice(index, lineIndex));
        lineCount++;
        index = lineIndex + 1;
      }
      subvalue = lines.join(C_NEWLINE);
      alignments = lines.splice(1, 1)[0];
      index = 0;
      length = alignments.length;
      lineCount--;
      alignment = false;
      align = [];
      while (index < length) {
        character = alignments.charAt(index);
        if (character === C_PIPE) {
          hasDash = null;
          if (alignment === false) {
            if (first === false) {
              return;
            }
          } else {
            align.push(alignment);
            alignment = false;
          }
          first = false;
        } else if (character === C_DASH) {
          hasDash = true;
          alignment = alignment || TABLE_ALIGN_NONE;
        } else if (character === C_COLON) {
          if (alignment === TABLE_ALIGN_LEFT) {
            alignment = TABLE_ALIGN_CENTER;
          } else if (hasDash && alignment === TABLE_ALIGN_NONE) {
            alignment = TABLE_ALIGN_RIGHT;
          } else {
            alignment = TABLE_ALIGN_LEFT;
          }
        } else if (!isWhiteSpace(character)) {
          return;
        }
        index++;
      }
      if (alignment !== false) {
        align.push(alignment);
      }
      if (align.length < MIN_TABLE_COLUMNS) {
        return;
      }
      if (silent) {
        return true;
      }
      position = -1;
      rows = [];
      table = eat(subvalue).reset({
        'type': T_TABLE,
        'align': align,
        'children': rows
      });
      while (++position < lineCount) {
        line = lines[position];
        row = self.renderParent(position ? T_TABLE_ROW : T_TABLE_HEADER, []);
        if (position) {
          eat(C_NEWLINE);
        }
        eat(line).reset(row, table);
        length = line.length + 1;
        index = 0;
        queue = EMPTY;
        cell = EMPTY;
        preamble = true;
        count = opening = null;
        while (index < length) {
          character = line.charAt(index);
          if (character === C_TAB || character === C_SPACE) {
            if (cell) {
              queue += character;
            } else {
              eat(character);
            }
            index++;
            continue;
          }
          if (character === EMPTY || character === C_PIPE) {
            if (preamble) {
              eat(character);
            } else {
              if (character && opening) {
                queue += character;
                index++;
                continue;
              }
              if ((cell || character) && !preamble) {
                subvalue = cell;
                if (queue.length > 1) {
                  if (character) {
                    subvalue += queue.slice(0, queue.length - 1);
                    queue = queue.charAt(queue.length - 1);
                  } else {
                    subvalue += queue;
                    queue = EMPTY;
                  }
                }
                now = eat.now();
                eat(subvalue)(self.renderInline(T_TABLE_CELL, cell, now), row);
              }
              eat(queue + character);
              queue = EMPTY;
              cell = EMPTY;
            }
          } else {
            if (queue) {
              cell += queue;
              queue = EMPTY;
            }
            cell += character;
            if (character === C_BACKSLASH && index !== length - 2) {
              cell += line.charAt(index + 1);
              index++;
            }
            if (character === C_TICK) {
              count = 1;
              while (line.charAt(index + 1) === character) {
                cell += character;
                index++;
                count++;
              }
              if (!opening) {
                opening = count;
              } else if (count >= opening) {
                opening = 0;
              }
            }
          }
          preamble = false;
          index++;
        }
        if (!position) {
          eat(C_NEWLINE + alignments);
        }
      }
      return table;
    }
    tokenizeTable.onlyAtTop = true;
    function tokenizeParagraph(eat, value, silent) {
      var self = this;
      var settings = self.options;
      var commonmark = settings.commonmark;
      var gfm = settings.gfm;
      var tokenizers = self.blockTokenizers;
      var index = value.indexOf(C_NEWLINE);
      var length = value.length;
      var position;
      var subvalue;
      var character;
      var size;
      var now;
      while (index < length) {
        if (index === -1) {
          index = length;
          break;
        }
        if (value.charAt(index + 1) === C_NEWLINE) {
          break;
        }
        if (commonmark) {
          size = 0;
          position = index + 1;
          while (position < length) {
            character = value.charAt(position);
            if (character === C_TAB) {
              size = TAB_SIZE;
              break;
            } else if (character === C_SPACE) {
              size++;
            } else {
              break;
            }
            position++;
          }
          if (size >= TAB_SIZE) {
            index = value.indexOf(C_NEWLINE, index + 1);
            continue;
          }
        }
        subvalue = value.slice(index + 1);
        if (tokenizers.horizontalRule.call(self, eat, subvalue, true) || tokenizers.heading.call(self, eat, subvalue, true) || tokenizers.fences.call(self, eat, subvalue, true) || tokenizers.blockquote.call(self, eat, subvalue, true) || tokenizers.html.call(self, eat, subvalue, true)) {
          break;
        }
        if (gfm && tokenizers.list.call(self, eat, subvalue, true)) {
          break;
        }
        if (!commonmark && (tokenizers.lineHeading.call(self, eat, subvalue, true) || tokenizers.definition.call(self, eat, subvalue, true) || tokenizers.footnoteDefinition.call(self, eat, subvalue, true))) {
          break;
        }
        index = value.indexOf(C_NEWLINE, index + 1);
      }
      subvalue = value.slice(0, index);
      if (trim(subvalue) === EMPTY) {
        eat(subvalue);
        return null;
      }
      if (silent) {
        return true;
      }
      now = eat.now();
      subvalue = trimTrailingLines(subvalue);
      return eat(subvalue)(self.renderInline(T_PARAGRAPH, subvalue, now));
    }
    function tokenizeText(eat, value, silent) {
      var self = this;
      var methods;
      var tokenizers;
      var index;
      var length;
      var subvalue;
      var position;
      var tokenizer;
      var name;
      var min;
      var now;
      if (silent) {
        return true;
      }
      methods = self.inlineMethods;
      length = methods.length;
      tokenizers = self.inlineTokenizers;
      index = -1;
      min = value.length;
      while (++index < length) {
        name = methods[index];
        if (name === 'inlineText' || !tokenizers[name]) {
          continue;
        }
        tokenizer = tokenizers[name].locator;
        if (!tokenizer) {
          eat.file.fail(ERR_MISSING_LOCATOR + C_TICK + name + C_TICK);
          continue;
        }
        position = tokenizer.call(self, value, 1);
        if (position !== -1 && position < min) {
          min = position;
        }
      }
      subvalue = value.slice(0, min);
      now = eat.now();
      self.decode(subvalue, now, function(content, position, source) {
        eat(source || content)(self.renderRaw(T_TEXT, content));
      });
    }
    function renderCodeBlock(value, language) {
      return {
        'type': T_CODE,
        'lang': language || null,
        'value': trimTrailingLines(value || EMPTY)
      };
    }
    function renderPedanticListItem(value, position) {
      var self = this;
      var indent = self.indent(position.line);
      function replacer($0) {
        indent($0.length);
        return EMPTY;
      }
      value = value.replace(EXPRESSION_PEDANTIC_BULLET, replacer);
      indent = self.indent(position.line);
      return value.replace(EXPRESSION_INITIAL_INDENT, replacer);
    }
    function renderNormalListItem(value, position) {
      var self = this;
      var indent = self.indent(position.line);
      var max;
      var bullet;
      var rest;
      var lines;
      var trimmedLines;
      var index;
      var length;
      value = value.replace(EXPRESSION_BULLET, function($0, $1, $2, $3, $4) {
        bullet = $1 + $2 + $3;
        rest = $4;
        if (Number($2) < 10 && bullet.length % 2 === 1) {
          $2 = C_SPACE + $2;
        }
        max = $1 + repeat(C_SPACE, $2.length) + $3;
        return max + rest;
      });
      lines = value.split(C_NEWLINE);
      trimmedLines = removeIndentation(value, getIndent(max).indent).split(C_NEWLINE);
      trimmedLines[0] = rest;
      indent(bullet.length);
      index = 0;
      length = lines.length;
      while (++index < length) {
        indent(lines[index].length - trimmedLines[index].length);
      }
      return trimmedLines.join(C_NEWLINE);
    }
    function renderListItem(value, position) {
      var self = this;
      var checked = null;
      var node;
      var task;
      var indent;
      value = LIST_ITEM_MAP[self.options.pedantic].apply(self, arguments);
      if (self.options.gfm) {
        task = value.match(EXPRESSION_TASK_ITEM);
        if (task) {
          indent = task[0].length;
          checked = task[1].toLowerCase() === C_X_LOWER;
          self.indent(position.line)(indent);
          value = value.slice(indent);
        }
      }
      node = {
        'type': T_LIST_ITEM,
        'loose': EXPRESSION_LOOSE_LIST_ITEM.test(value) || value.charAt(value.length - 1) === C_NEWLINE
      };
      if (self.options.gfm) {
        node.checked = checked;
      }
      node.children = self.tokenizeBlock(value, position);
      return node;
    }
    function renderFootnoteDefinition(identifier, value, position) {
      var self = this;
      var exitBlockquote = self.enterBlockquote();
      var node;
      node = {
        'type': T_FOOTNOTE_DEFINITION,
        'identifier': identifier,
        'children': self.tokenizeBlock(value, position)
      };
      exitBlockquote();
      return node;
    }
    function renderHeading(value, depth, position) {
      return {
        'type': T_HEADING,
        'depth': depth,
        'children': this.tokenizeInline(value, position)
      };
    }
    function renderBlockquote(value, now) {
      var self = this;
      var exitBlockquote = self.enterBlockquote();
      var node = {
        'type': T_BLOCKQUOTE,
        'children': self.tokenizeBlock(value, now)
      };
      exitBlockquote();
      return node;
    }
    function renderVoid(type) {
      return {'type': type};
    }
    function renderParent(type, children) {
      return {
        'type': type,
        'children': children
      };
    }
    function renderRaw(type, value) {
      return {
        'type': type,
        'value': value
      };
    }
    function renderLink(isLink, href, text, title, position) {
      var self = this;
      var exitLink = self.enterLink();
      var node;
      node = {
        'type': isLink ? T_LINK : T_IMAGE,
        'title': title || null
      };
      if (isLink) {
        node.href = href;
        node.children = self.tokenizeInline(text, position);
      } else {
        node.src = href;
        node.alt = text ? self.decode.raw(self.descape(text), position) : null;
      }
      exitLink();
      return node;
    }
    function renderFootnote(value, position) {
      return this.renderInline(T_FOOTNOTE, value, position);
    }
    function renderInline(type, value, position) {
      return this.renderParent(type, this.tokenizeInline(value, position));
    }
    function renderBlock(type, value, position) {
      return this.renderParent(type, this.tokenizeBlock(value, position));
    }
    function locateEscape(value, fromIndex) {
      return value.indexOf(C_BACKSLASH, fromIndex);
    }
    function tokenizeEscape(eat, value, silent) {
      var self = this;
      var character;
      if (value.charAt(0) === C_BACKSLASH) {
        character = value.charAt(1);
        if (self.escape.indexOf(character) !== -1) {
          if (silent) {
            return true;
          }
          return eat(C_BACKSLASH + character)(character === C_NEWLINE ? self.renderVoid(T_BREAK) : self.renderRaw(T_TEXT, character));
        }
      }
    }
    tokenizeEscape.locator = locateEscape;
    function locateAutoLink(value, fromIndex) {
      return value.indexOf(C_LT, fromIndex);
    }
    function tokenizeAutoLink(eat, value, silent) {
      var self;
      var subvalue;
      var length;
      var index;
      var queue;
      var character;
      var hasAtCharacter;
      var link;
      var now;
      var content;
      var tokenize;
      var node;
      if (value.charAt(0) !== C_LT) {
        return;
      }
      self = this;
      subvalue = EMPTY;
      length = value.length;
      index = 0;
      queue = EMPTY;
      hasAtCharacter = false;
      link = EMPTY;
      index++;
      subvalue = C_LT;
      while (index < length) {
        character = value.charAt(index);
        if (character === C_SPACE || character === C_GT || character === C_AT_SIGN || (character === C_COLON && value.charAt(index + 1) === C_SLASH)) {
          break;
        }
        queue += character;
        index++;
      }
      if (!queue) {
        return;
      }
      link += queue;
      queue = EMPTY;
      character = value.charAt(index);
      link += character;
      index++;
      if (character === C_AT_SIGN) {
        hasAtCharacter = true;
      } else {
        if (character !== C_COLON || value.charAt(index + 1) !== C_SLASH) {
          return;
        }
        link += C_SLASH;
        index++;
      }
      while (index < length) {
        character = value.charAt(index);
        if (character === C_SPACE || character === C_GT) {
          break;
        }
        queue += character;
        index++;
      }
      character = value.charAt(index);
      if (!queue || character !== C_GT) {
        return;
      }
      if (silent) {
        return true;
      }
      link += queue;
      content = link;
      subvalue += link + character;
      now = eat.now();
      now.column++;
      if (hasAtCharacter) {
        if (link.substr(0, MAILTO_PROTOCOL.length).toLowerCase() !== MAILTO_PROTOCOL) {
          link = MAILTO_PROTOCOL + link;
        } else {
          content = content.substr(MAILTO_PROTOCOL.length);
          now.column += MAILTO_PROTOCOL.length;
        }
      }
      tokenize = self.inlineTokenizers.escape;
      self.inlineTokenizers.escape = null;
      node = eat(subvalue)(self.renderLink(true, decode(link), content, null, now, eat));
      self.inlineTokenizers.escape = tokenize;
      return node;
    }
    tokenizeAutoLink.notInLink = true;
    tokenizeAutoLink.locator = locateAutoLink;
    function locateURL(value, fromIndex) {
      var index = -1;
      var min = -1;
      var position;
      if (!this.options.gfm) {
        return -1;
      }
      while (++index < PROTOCOLS_LENGTH) {
        position = value.indexOf(PROTOCOLS[index], fromIndex);
        if (position !== -1 && (position < min || min === -1)) {
          min = position;
        }
      }
      return min;
    }
    function tokenizeURL(eat, value, silent) {
      var self = this;
      var subvalue;
      var content;
      var character;
      var index;
      var position;
      var protocol;
      var match;
      var length;
      var queue;
      var once;
      var now;
      if (!self.options.gfm) {
        return;
      }
      subvalue = EMPTY;
      index = -1;
      length = PROTOCOLS_LENGTH;
      while (++index < length) {
        protocol = PROTOCOLS[index];
        match = value.slice(0, protocol.length);
        if (match.toLowerCase() === protocol) {
          subvalue = match;
          break;
        }
      }
      if (!subvalue) {
        return;
      }
      index = subvalue.length;
      length = value.length;
      queue = EMPTY;
      while (index < length) {
        character = value.charAt(index);
        if (isWhiteSpace(character) || character === C_LT) {
          break;
        }
        if (character === C_DOT || character === C_COMMA || character === C_COLON || character === C_SEMI_COLON || character === C_DOUBLE_QUOTE || character === C_SINGLE_QUOTE || character === C_PAREN_CLOSE || character === C_BRACKET_CLOSE) {
          if (once) {
            break;
          }
          once = true;
        }
        queue += character;
        index++;
      }
      if (!queue) {
        return;
      }
      subvalue += queue;
      content = subvalue;
      if (protocol === MAILTO_PROTOCOL) {
        position = queue.indexOf(C_AT_SIGN);
        if (position === -1 || position === length - 1) {
          return;
        }
        content = content.substr(MAILTO_PROTOCOL.length);
      }
      if (silent) {
        return true;
      }
      now = eat.now();
      return eat(subvalue)(self.renderLink(true, decode(subvalue), content, null, now, eat));
    }
    tokenizeURL.notInLink = true;
    tokenizeURL.locator = locateURL;
    function locateTag(value, fromIndex) {
      return value.indexOf(C_LT, fromIndex);
    }
    function tokenizeTag(eat, value, silent) {
      var self = this;
      var subvalue = eatHTMLComment(value, self.options) || eatHTMLCDATA(value) || eatHTMLProcessingInstruction(value) || eatHTMLDeclaration(value) || eatHTMLClosingTag(value) || eatHTMLOpeningTag(value);
      if (!subvalue) {
        return;
      }
      if (silent) {
        return true;
      }
      if (!self.inLink && EXPRESSION_HTML_LINK_OPEN.test(subvalue)) {
        self.inLink = true;
      } else if (self.inLink && EXPRESSION_HTML_LINK_CLOSE.test(subvalue)) {
        self.inLink = false;
      }
      return eat(subvalue)(self.renderRaw(T_HTML, subvalue));
    }
    tokenizeTag.locator = locateTag;
    function locateLink(value, fromIndex) {
      var link = value.indexOf(C_BRACKET_OPEN, fromIndex);
      var image = value.indexOf(C_EXCLAMATION_MARK + C_BRACKET_OPEN, fromIndex);
      if (image === -1) {
        return link;
      }
      return link < image ? link : image;
    }
    function tokenizeLink(eat, value, silent) {
      var self = this;
      var subvalue = EMPTY;
      var index = 0;
      var character = value.charAt(0);
      var beforeURL;
      var beforeTitle;
      var whiteSpaceQueue;
      var commonmark;
      var openCount;
      var hasMarker;
      var markers;
      var isImage;
      var content;
      var marker;
      var length;
      var title;
      var depth;
      var queue;
      var url;
      var now;
      if (character === C_EXCLAMATION_MARK) {
        isImage = true;
        subvalue = character;
        character = value.charAt(++index);
      }
      if (character !== C_BRACKET_OPEN) {
        return;
      }
      if (!isImage && self.inLink) {
        return;
      }
      subvalue += character;
      queue = EMPTY;
      index++;
      commonmark = self.options.commonmark;
      length = value.length;
      now = eat.now();
      depth = 0;
      now.column += index;
      while (index < length) {
        character = value.charAt(index);
        if (character === C_BRACKET_OPEN) {
          depth++;
        } else if (character === C_BRACKET_CLOSE) {
          if (!commonmark && !depth) {
            if (value.charAt(index + 1) === C_PAREN_OPEN) {
              break;
            }
            depth++;
          }
          if (depth === 0) {
            break;
          }
          depth--;
        }
        queue += character;
        index++;
      }
      if (value.charAt(index) !== C_BRACKET_CLOSE || value.charAt(++index) !== C_PAREN_OPEN) {
        return;
      }
      subvalue += queue + C_BRACKET_CLOSE + C_PAREN_OPEN;
      index++;
      content = queue;
      while (index < length) {
        character = value.charAt(index);
        if (!isWhiteSpace(character)) {
          break;
        }
        subvalue += character;
        index++;
      }
      character = value.charAt(index);
      markers = commonmark ? COMMONMARK_LINK_TITLE_MARKERS : LINK_TITLE_MARKERS;
      openCount = 0;
      queue = EMPTY;
      beforeURL = subvalue;
      if (character === C_LT) {
        index++;
        beforeURL += C_LT;
        while (index < length) {
          character = value.charAt(index);
          if (character === C_GT) {
            break;
          }
          if (commonmark && character === C_NEWLINE) {
            return;
          }
          queue += character;
          index++;
        }
        if (value.charAt(index) !== C_GT) {
          return;
        }
        subvalue += C_LT + queue + C_GT;
        url = queue;
        index++;
      } else {
        character = null;
        whiteSpaceQueue = EMPTY;
        while (index < length) {
          character = value.charAt(index);
          if (whiteSpaceQueue && has.call(markers, character)) {
            break;
          }
          if (isWhiteSpace(character)) {
            if (commonmark) {
              break;
            }
            whiteSpaceQueue += character;
          } else {
            if (character === C_PAREN_OPEN) {
              depth++;
              openCount++;
            } else if (character === C_PAREN_CLOSE) {
              if (depth === 0) {
                break;
              }
              depth--;
            }
            queue += whiteSpaceQueue;
            whiteSpaceQueue = EMPTY;
            if (character === C_BACKSLASH) {
              queue += C_BACKSLASH;
              character = value.charAt(++index);
            }
            queue += character;
          }
          index++;
        }
        queue = queue;
        subvalue += queue;
        url = queue;
        index = subvalue.length;
      }
      queue = EMPTY;
      while (index < length) {
        character = value.charAt(index);
        if (!isWhiteSpace(character)) {
          break;
        }
        queue += character;
        index++;
      }
      character = value.charAt(index);
      subvalue += queue;
      if (queue && has.call(markers, character)) {
        index++;
        subvalue += character;
        queue = EMPTY;
        marker = markers[character];
        beforeTitle = subvalue;
        if (commonmark) {
          while (index < length) {
            character = value.charAt(index);
            if (character === marker) {
              break;
            }
            if (character === C_BACKSLASH) {
              queue += C_BACKSLASH;
              character = value.charAt(++index);
            }
            index++;
            queue += character;
          }
          character = value.charAt(index);
          if (character !== marker) {
            return;
          }
          title = queue;
          subvalue += queue + character;
          index++;
          while (index < length) {
            character = value.charAt(index);
            if (!isWhiteSpace(character)) {
              break;
            }
            subvalue += character;
            index++;
          }
        } else {
          whiteSpaceQueue = EMPTY;
          while (index < length) {
            character = value.charAt(index);
            if (character === marker) {
              if (hasMarker) {
                queue += marker + whiteSpaceQueue;
                whiteSpaceQueue = EMPTY;
              }
              hasMarker = true;
            } else if (!hasMarker) {
              queue += character;
            } else if (character === C_PAREN_CLOSE) {
              subvalue += queue + marker + whiteSpaceQueue;
              title = queue;
              break;
            } else if (isWhiteSpace(character)) {
              whiteSpaceQueue += character;
            } else {
              queue += marker + whiteSpaceQueue + character;
              whiteSpaceQueue = EMPTY;
              hasMarker = false;
            }
            index++;
          }
        }
      }
      if (value.charAt(index) !== C_PAREN_CLOSE) {
        return;
      }
      if (silent) {
        return true;
      }
      subvalue += C_PAREN_CLOSE;
      url = self.decode.raw(self.descape(url), eat(beforeURL).test().end);
      if (title) {
        beforeTitle = eat(beforeTitle).test().end;
        title = self.decode.raw(self.descape(title), beforeTitle);
      }
      return eat(subvalue)(self.renderLink(!isImage, url, content, title, now, eat));
    }
    tokenizeLink.locator = locateLink;
    function tokenizeReference(eat, value, silent) {
      var self = this;
      var character = value.charAt(0);
      var index = 0;
      var length = value.length;
      var subvalue = EMPTY;
      var intro = EMPTY;
      var type = T_LINK;
      var referenceType = REFERENCE_TYPE_SHORTCUT;
      var text;
      var identifier;
      var now;
      var node;
      var exitLink;
      var queue;
      var bracketed;
      var depth;
      if (character === C_EXCLAMATION_MARK) {
        type = T_IMAGE;
        intro = character;
        character = value.charAt(++index);
      }
      if (character !== C_BRACKET_OPEN) {
        return;
      }
      index++;
      intro += character;
      queue = EMPTY;
      if (self.options.footnotes && type === T_LINK && value.charAt(index) === C_CARET) {
        intro += C_CARET;
        index++;
        type = T_FOOTNOTE;
      }
      depth = 0;
      while (index < length) {
        character = value.charAt(index);
        if (character === C_BRACKET_OPEN) {
          bracketed = true;
          depth++;
        } else if (character === C_BRACKET_CLOSE) {
          if (!depth) {
            break;
          }
          depth--;
        }
        if (character === C_BACKSLASH) {
          queue += C_BACKSLASH;
          character = value.charAt(++index);
        }
        queue += character;
        index++;
      }
      subvalue = text = queue;
      character = value.charAt(index);
      if (character !== C_BRACKET_CLOSE) {
        return;
      }
      index++;
      subvalue += character;
      queue = EMPTY;
      while (index < length) {
        character = value.charAt(index);
        if (!isWhiteSpace(character)) {
          break;
        }
        queue += character;
        index++;
      }
      character = value.charAt(index);
      if (character !== C_BRACKET_OPEN) {
        if (!text) {
          return;
        }
        identifier = text;
      } else {
        identifier = EMPTY;
        queue += character;
        index++;
        while (index < length) {
          character = value.charAt(index);
          if (character === C_BRACKET_OPEN || character === C_BRACKET_CLOSE) {
            break;
          }
          if (character === C_BACKSLASH) {
            identifier += C_BACKSLASH;
            character = value.charAt(++index);
          }
          identifier += character;
          index++;
        }
        character = value.charAt(index);
        if (character === C_BRACKET_CLOSE) {
          queue += identifier + character;
          index++;
          referenceType = identifier ? REFERENCE_TYPE_FULL : REFERENCE_TYPE_COLLAPSED;
        } else {
          identifier = EMPTY;
        }
        subvalue += queue;
        queue = EMPTY;
      }
      if (referenceType !== REFERENCE_TYPE_FULL && bracketed) {
        return;
      }
      if (type === T_FOOTNOTE && referenceType !== REFERENCE_TYPE_SHORTCUT) {
        type = T_LINK;
        intro = C_BRACKET_OPEN + C_CARET;
        text = C_CARET + text;
      }
      subvalue = intro + subvalue;
      if (type === T_LINK && self.inLink) {
        return null;
      }
      if (silent) {
        return true;
      }
      if (type === T_FOOTNOTE && text.indexOf(C_SPACE) !== -1) {
        return eat(subvalue)(self.renderFootnote(text, eat.now()));
      }
      now = eat.now();
      now.column += intro.length;
      identifier = referenceType === REFERENCE_TYPE_FULL ? identifier : text;
      node = {
        'type': type + 'Reference',
        'identifier': normalize(identifier)
      };
      if (type === T_LINK || type === T_IMAGE) {
        node.referenceType = referenceType;
      }
      if (type === T_LINK) {
        exitLink = self.enterLink();
        node.children = self.tokenizeInline(text, now);
        exitLink();
      } else if (type === T_IMAGE) {
        node.alt = self.decode.raw(self.descape(text), now) || null;
      }
      return eat(subvalue)(node);
    }
    tokenizeReference.locator = locateLink;
    function locateStrong(value, fromIndex) {
      var asterisk = value.indexOf(C_ASTERISK + C_ASTERISK, fromIndex);
      var underscore = value.indexOf(C_UNDERSCORE + C_UNDERSCORE, fromIndex);
      if (underscore === -1) {
        return asterisk;
      }
      if (asterisk === -1) {
        return underscore;
      }
      return underscore < asterisk ? underscore : asterisk;
    }
    function tokenizeStrong(eat, value, silent) {
      var self = this;
      var index = 0;
      var character = value.charAt(index);
      var now;
      var pedantic;
      var marker;
      var queue;
      var subvalue;
      var length;
      var prev;
      if (EMPHASIS_MARKERS[character] !== true || value.charAt(++index) !== character) {
        return;
      }
      pedantic = self.options.pedantic;
      marker = character;
      subvalue = marker + marker;
      length = value.length;
      index++;
      queue = character = EMPTY;
      if (pedantic && isWhiteSpace(value.charAt(index))) {
        return;
      }
      while (index < length) {
        prev = character;
        character = value.charAt(index);
        if (character === marker && value.charAt(index + 1) === marker && (!pedantic || !isWhiteSpace(prev))) {
          character = value.charAt(index + 2);
          if (character !== marker) {
            if (!trim(queue)) {
              return;
            }
            if (silent) {
              return true;
            }
            now = eat.now();
            now.column += 2;
            return eat(subvalue + queue + subvalue)(self.renderInline(T_STRONG, queue, now));
          }
        }
        if (!pedantic && character === C_BACKSLASH) {
          queue += character;
          character = value.charAt(++index);
        }
        queue += character;
        index++;
      }
    }
    tokenizeStrong.locator = locateStrong;
    function locateEmphasis(value, fromIndex) {
      var asterisk = value.indexOf(C_ASTERISK, fromIndex);
      var underscore = value.indexOf(C_UNDERSCORE, fromIndex);
      if (underscore === -1) {
        return asterisk;
      }
      if (asterisk === -1) {
        return underscore;
      }
      return underscore < asterisk ? underscore : asterisk;
    }
    function tokenizeEmphasis(eat, value, silent) {
      var self = this;
      var index = 0;
      var character = value.charAt(index);
      var now;
      var pedantic;
      var marker;
      var queue;
      var subvalue;
      var length;
      var prev;
      if (EMPHASIS_MARKERS[character] !== true) {
        return;
      }
      pedantic = self.options.pedantic;
      subvalue = marker = character;
      length = value.length;
      index++;
      queue = character = EMPTY;
      if (pedantic && isWhiteSpace(value.charAt(index))) {
        return;
      }
      while (index < length) {
        prev = character;
        character = value.charAt(index);
        if (character === marker && (!pedantic || !isWhiteSpace(prev))) {
          character = value.charAt(++index);
          if (character !== marker) {
            if (!trim(queue) || prev === marker) {
              return;
            }
            if (pedantic || marker !== C_UNDERSCORE || !isWordCharacter(character)) {
              if (silent) {
                return true;
              }
              now = eat.now();
              now.column++;
              return eat(subvalue + queue + marker)(self.renderInline(T_EMPHASIS, queue, now));
            }
          }
          queue += marker;
        }
        if (!pedantic && character === C_BACKSLASH) {
          queue += character;
          character = value.charAt(++index);
        }
        queue += character;
        index++;
      }
    }
    tokenizeEmphasis.locator = locateEmphasis;
    function locateDeletion(value, fromIndex) {
      return value.indexOf(C_TILDE + C_TILDE, fromIndex);
    }
    function tokenizeDeletion(eat, value, silent) {
      var self = this;
      var character = EMPTY;
      var previous = EMPTY;
      var preceding = EMPTY;
      var subvalue = EMPTY;
      var index;
      var length;
      var now;
      if (!self.options.gfm || value.charAt(0) !== C_TILDE || value.charAt(1) !== C_TILDE || isWhiteSpace(value.charAt(2))) {
        return;
      }
      index = 1;
      length = value.length;
      now = eat.now();
      now.column += 2;
      while (++index < length) {
        character = value.charAt(index);
        if (character === C_TILDE && previous === C_TILDE && (!preceding || !isWhiteSpace(preceding))) {
          if (silent) {
            return true;
          }
          return eat(C_TILDE + C_TILDE + subvalue + C_TILDE + C_TILDE)(self.renderInline(T_DELETE, subvalue, now));
        }
        subvalue += previous;
        preceding = previous;
        previous = character;
      }
    }
    tokenizeDeletion.locator = locateDeletion;
    function locateInlineCode(value, fromIndex) {
      return value.indexOf(C_TICK, fromIndex);
    }
    function tokenizeInlineCode(eat, value, silent) {
      var self = this;
      var length = value.length;
      var index = 0;
      var queue = EMPTY;
      var tickQueue = EMPTY;
      var contentQueue;
      var whiteSpaceQueue;
      var count;
      var openingCount;
      var subvalue;
      var character;
      var found;
      var next;
      while (index < length) {
        if (value.charAt(index) !== C_TICK) {
          break;
        }
        queue += C_TICK;
        index++;
      }
      if (!queue) {
        return;
      }
      subvalue = queue;
      openingCount = index;
      queue = EMPTY;
      next = value.charAt(index);
      count = 0;
      while (index < length) {
        character = next;
        next = value.charAt(index + 1);
        if (character === C_TICK) {
          count++;
          tickQueue += character;
        } else {
          count = 0;
          queue += character;
        }
        if (count && next !== C_TICK) {
          if (count === openingCount) {
            subvalue += queue + tickQueue;
            found = true;
            break;
          }
          queue += tickQueue;
          tickQueue = EMPTY;
        }
        index++;
      }
      if (!found) {
        if (openingCount % 2 !== 0) {
          return;
        }
        queue = EMPTY;
      }
      if (silent) {
        return true;
      }
      contentQueue = whiteSpaceQueue = EMPTY;
      length = queue.length;
      index = -1;
      while (++index < length) {
        character = queue.charAt(index);
        if (isWhiteSpace(character)) {
          whiteSpaceQueue += character;
          continue;
        }
        if (whiteSpaceQueue) {
          if (contentQueue) {
            contentQueue += whiteSpaceQueue;
          }
          whiteSpaceQueue = EMPTY;
        }
        contentQueue += character;
      }
      return eat(subvalue)(self.renderRaw(T_INLINE_CODE, contentQueue));
    }
    tokenizeInlineCode.locator = locateInlineCode;
    function locateBreak(value, fromIndex) {
      var index = value.indexOf(C_NEWLINE, fromIndex);
      while (index > fromIndex) {
        if (value.charAt(index - 1) !== C_SPACE) {
          break;
        }
        index--;
      }
      return index;
    }
    function tokenizeBreak(eat, value, silent) {
      var self = this;
      var breaks = self.options.breaks;
      var length = value.length;
      var index = -1;
      var queue = EMPTY;
      var character;
      while (++index < length) {
        character = value.charAt(index);
        if (character === C_NEWLINE) {
          if (!breaks && index < MIN_BREAK_LENGTH) {
            return;
          }
          if (silent) {
            return true;
          }
          queue += character;
          return eat(queue)(self.renderVoid(T_BREAK));
        }
        if (character !== C_SPACE) {
          return;
        }
        queue += character;
      }
    }
    tokenizeBreak.locator = locateBreak;
    function Parser(file, options, processor) {
      var self = this;
      self.file = file;
      self.inLink = false;
      self.atTop = true;
      self.atStart = true;
      self.inBlockquote = false;
      self.data = processor.data;
      self.descape = descapeFactory(self, 'escape');
      self.decode = decodeFactory(self);
      self.options = extend({}, self.options);
      self.setOptions(options);
    }
    Parser.prototype.setOptions = function(options) {
      var self = this;
      var escape = self.data.escape;
      var current = self.options;
      var key;
      if (options === null || options === undefined) {
        options = {};
      } else if (typeof options === 'object') {
        options = extend({}, options);
      } else {
        raise(options, 'options');
      }
      for (key in defaultOptions) {
        validate.boolean(options, key, current[key]);
      }
      self.options = options;
      if (options.commonmark) {
        self.escape = escape.commonmark;
      } else if (options.gfm) {
        self.escape = escape.gfm;
      } else {
        self.escape = escape.default;
      }
      return self;
    };
    Parser.prototype.options = defaultOptions;
    Parser.prototype.indent = function(start) {
      var self = this;
      var line = start;
      function indenter(offset) {
        self.offset[line] = (self.offset[line] || 0) + offset;
        line++;
      }
      return indenter;
    };
    Parser.prototype.getIndent = function(start) {
      var offset = this.offset;
      var result = [];
      while (++start) {
        if (!(start in offset)) {
          break;
        }
        result.push((offset[start] || 0) + 1);
      }
      return result;
    };
    Parser.prototype.parse = function() {
      var self = this;
      var value = clean(String(self.file));
      var node;
      self.offset = {};
      node = self.renderBlock(T_ROOT, value);
      if (self.options.position) {
        node.position = {'start': {
            'line': 1,
            'column': 1
          }};
        node.position.end = self.eof || node.position.start;
      }
      return node;
    };
    Parser.prototype.enterLink = stateToggler('inLink', false);
    Parser.prototype.exitTop = stateToggler('atTop', true);
    Parser.prototype.exitStart = stateToggler('atStart', true);
    Parser.prototype.enterBlockquote = stateToggler('inBlockquote', false);
    Parser.prototype.renderRaw = renderRaw;
    Parser.prototype.renderVoid = renderVoid;
    Parser.prototype.renderParent = renderParent;
    Parser.prototype.renderInline = renderInline;
    Parser.prototype.renderBlock = renderBlock;
    Parser.prototype.renderLink = renderLink;
    Parser.prototype.renderCodeBlock = renderCodeBlock;
    Parser.prototype.renderBlockquote = renderBlockquote;
    Parser.prototype.renderListItem = renderListItem;
    Parser.prototype.renderFootnoteDefinition = renderFootnoteDefinition;
    Parser.prototype.renderHeading = renderHeading;
    Parser.prototype.renderFootnote = renderFootnote;
    function tokenizeFactory(type) {
      function tokenize(value, location) {
        var self = this;
        var offset = self.offset;
        var tokens = [];
        var methods = self[type + 'Methods'];
        var tokenizers = self[type + 'Tokenizers'];
        var line = location ? location.line : 1;
        var column = location ? location.column : 1;
        var patchPosition = self.options.position;
        var add;
        var index;
        var length;
        var method;
        var name;
        var matched;
        var valueLength;
        var eater;
        if (!value) {
          return tokens;
        }
        function updatePosition(subvalue) {
          var lastIndex = -1;
          var index = subvalue.indexOf(C_NEWLINE);
          while (index !== -1) {
            line++;
            lastIndex = index;
            index = subvalue.indexOf(C_NEWLINE, index + 1);
          }
          if (lastIndex === -1) {
            column = column + subvalue.length;
          } else {
            column = subvalue.length - lastIndex;
          }
          if (line in offset) {
            if (lastIndex !== -1) {
              column += offset[line];
            } else if (column <= offset[line]) {
              column = offset[line] + 1;
            }
          }
        }
        function getOffset() {
          var indentation = [];
          var pos = line + 1;
          function done() {
            var last = line + 1;
            while (pos < last) {
              indentation.push((offset[pos] || 0) + 1);
              pos++;
            }
            return indentation;
          }
          return done;
        }
        function now() {
          return {
            'line': line,
            'column': column
          };
        }
        function Position(start) {
          this.start = start;
          this.end = now();
        }
        function validateEat(subvalue) {
          if (value.substring(0, subvalue.length) !== subvalue) {
            self.file.fail(ERR_INCORRECTLY_EATEN, now());
          }
        }
        function position() {
          var before = now();
          function update(node, indent) {
            var prev = node.position;
            var start = prev ? prev.start : before;
            var combined = [];
            var n = prev && prev.end.line;
            var l = before.line;
            node.position = new Position(start);
            if (prev && indent && prev.indent) {
              combined = prev.indent;
              if (n < l) {
                while (++n < l) {
                  combined.push((offset[n] || 0) + 1);
                }
                combined.push(before.column);
              }
              indent = combined.concat(indent);
            }
            node.position.indent = indent || [];
            return node;
          }
          return update;
        }
        add = function(node, parent) {
          var prev;
          var children;
          if (!parent) {
            children = tokens;
          } else {
            children = parent.children;
          }
          prev = children[children.length - 1];
          if (prev && node.type === prev.type && node.type in MERGEABLE_NODES && mergeable(prev) && mergeable(node)) {
            node = MERGEABLE_NODES[node.type].call(self, prev, node);
          }
          if (node !== prev) {
            children.push(node);
          }
          if (self.atStart && tokens.length) {
            self.exitStart();
          }
          return node;
        };
        function eat(subvalue) {
          var indent = getOffset();
          var pos = position();
          var current = now();
          validateEat(subvalue);
          function apply(node, parent) {
            return pos(add(pos(node), parent), indent);
          }
          function reset() {
            var node = apply.apply(null, arguments);
            line = current.line;
            column = current.column;
            value = subvalue + value;
            return node;
          }
          function test() {
            var result = pos({});
            line = current.line;
            column = current.column;
            value = subvalue + value;
            return result.position;
          }
          apply.reset = reset;
          apply.test = reset.test = test;
          value = value.substring(subvalue.length);
          updatePosition(subvalue);
          indent = indent();
          return apply;
        }
        function noEat(subvalue) {
          validateEat(subvalue);
          function apply() {
            return add.apply(null, arguments);
          }
          function reset() {
            var node = apply.apply(null, arguments);
            value = subvalue + value;
            return node;
          }
          function test() {
            value = subvalue + value;
            return {};
          }
          apply.reset = reset;
          apply.test = reset.test = test;
          value = value.substring(subvalue.length);
          return apply;
        }
        eater = patchPosition ? eat : noEat;
        eater.now = now;
        eater.file = self.file;
        updatePosition(EMPTY);
        while (value) {
          index = -1;
          length = methods.length;
          matched = false;
          while (++index < length) {
            name = methods[index];
            method = tokenizers[name];
            if (method && (!method.onlyAtStart || self.atStart) && (!method.onlyAtTop || self.atTop) && (!method.notInBlockquote || !self.inBlockquote) && (!method.notInLink || !self.inLink)) {
              valueLength = value.length;
              method.apply(self, [eater, value]);
              matched = valueLength !== value.length;
              if (matched) {
                break;
              }
            }
          }
          if (!matched) {
            self.file.fail(ERR_INFINITE_LOOP, eater.now());
            break;
          }
        }
        self.eof = now();
        return tokens;
      }
      return tokenize;
    }
    Parser.prototype.blockTokenizers = {
      'yamlFrontMatter': tokenizeYAMLFrontMatter,
      'newline': tokenizeNewline,
      'code': tokenizeCode,
      'fences': tokenizeFences,
      'heading': tokenizeHeading,
      'lineHeading': tokenizeLineHeading,
      'horizontalRule': tokenizeHorizontalRule,
      'blockquote': tokenizeBlockquote,
      'list': tokenizeList,
      'html': tokenizeHTML,
      'definition': tokenizeDefinition,
      'footnoteDefinition': tokenizeFootnoteDefinition,
      'table': tokenizeTable,
      'paragraph': tokenizeParagraph
    };
    Parser.prototype.blockMethods = ['yamlFrontMatter', 'newline', 'code', 'fences', 'blockquote', 'heading', 'horizontalRule', 'list', 'lineHeading', 'html', 'footnoteDefinition', 'definition', 'looseTable', 'table', 'paragraph'];
    Parser.prototype.tokenizeBlock = tokenizeFactory(BLOCK);
    Parser.prototype.inlineTokenizers = {
      'escape': tokenizeEscape,
      'autoLink': tokenizeAutoLink,
      'url': tokenizeURL,
      'tag': tokenizeTag,
      'link': tokenizeLink,
      'reference': tokenizeReference,
      'strong': tokenizeStrong,
      'emphasis': tokenizeEmphasis,
      'deletion': tokenizeDeletion,
      'inlineCode': tokenizeInlineCode,
      'break': tokenizeBreak,
      'inlineText': tokenizeText
    };
    Parser.prototype.inlineMethods = ['escape', 'autoLink', 'url', 'tag', 'link', 'reference', 'shortcutReference', 'strong', 'emphasis', 'deletion', 'inlineCode', 'break', 'inlineText'];
    Parser.prototype.tokenizeInline = tokenizeFactory(INLINE);
    Parser.prototype.tokenizeFactory = tokenizeFactory;
    module.exports = Parser;
  })($__require('github:jspm/nodelibs-process@0.1.2'));
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:character-entities@1.0.0/index.json!github:systemjs/plugin-json@0.1.0", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "AElig": "Æ",
    "AMP": "&",
    "Aacute": "Á",
    "Abreve": "Ă",
    "Acirc": "Â",
    "Acy": "А",
    "Afr": "𝔄",
    "Agrave": "À",
    "Alpha": "Α",
    "Amacr": "Ā",
    "And": "⩓",
    "Aogon": "Ą",
    "Aopf": "𝔸",
    "ApplyFunction": "⁡",
    "Aring": "Å",
    "Ascr": "𝒜",
    "Assign": "≔",
    "Atilde": "Ã",
    "Auml": "Ä",
    "Backslash": "∖",
    "Barv": "⫧",
    "Barwed": "⌆",
    "Bcy": "Б",
    "Because": "∵",
    "Bernoullis": "ℬ",
    "Beta": "Β",
    "Bfr": "𝔅",
    "Bopf": "𝔹",
    "Breve": "˘",
    "Bscr": "ℬ",
    "Bumpeq": "≎",
    "CHcy": "Ч",
    "COPY": "©",
    "Cacute": "Ć",
    "Cap": "⋒",
    "CapitalDifferentialD": "ⅅ",
    "Cayleys": "ℭ",
    "Ccaron": "Č",
    "Ccedil": "Ç",
    "Ccirc": "Ĉ",
    "Cconint": "∰",
    "Cdot": "Ċ",
    "Cedilla": "¸",
    "CenterDot": "·",
    "Cfr": "ℭ",
    "Chi": "Χ",
    "CircleDot": "⊙",
    "CircleMinus": "⊖",
    "CirclePlus": "⊕",
    "CircleTimes": "⊗",
    "ClockwiseContourIntegral": "∲",
    "CloseCurlyDoubleQuote": "”",
    "CloseCurlyQuote": "’",
    "Colon": "∷",
    "Colone": "⩴",
    "Congruent": "≡",
    "Conint": "∯",
    "ContourIntegral": "∮",
    "Copf": "ℂ",
    "Coproduct": "∐",
    "CounterClockwiseContourIntegral": "∳",
    "Cross": "⨯",
    "Cscr": "𝒞",
    "Cup": "⋓",
    "CupCap": "≍",
    "DD": "ⅅ",
    "DDotrahd": "⤑",
    "DJcy": "Ђ",
    "DScy": "Ѕ",
    "DZcy": "Џ",
    "Dagger": "‡",
    "Darr": "↡",
    "Dashv": "⫤",
    "Dcaron": "Ď",
    "Dcy": "Д",
    "Del": "∇",
    "Delta": "Δ",
    "Dfr": "𝔇",
    "DiacriticalAcute": "´",
    "DiacriticalDot": "˙",
    "DiacriticalDoubleAcute": "˝",
    "DiacriticalGrave": "`",
    "DiacriticalTilde": "˜",
    "Diamond": "⋄",
    "DifferentialD": "ⅆ",
    "Dopf": "𝔻",
    "Dot": "¨",
    "DotDot": "⃜",
    "DotEqual": "≐",
    "DoubleContourIntegral": "∯",
    "DoubleDot": "¨",
    "DoubleDownArrow": "⇓",
    "DoubleLeftArrow": "⇐",
    "DoubleLeftRightArrow": "⇔",
    "DoubleLeftTee": "⫤",
    "DoubleLongLeftArrow": "⟸",
    "DoubleLongLeftRightArrow": "⟺",
    "DoubleLongRightArrow": "⟹",
    "DoubleRightArrow": "⇒",
    "DoubleRightTee": "⊨",
    "DoubleUpArrow": "⇑",
    "DoubleUpDownArrow": "⇕",
    "DoubleVerticalBar": "∥",
    "DownArrow": "↓",
    "DownArrowBar": "⤓",
    "DownArrowUpArrow": "⇵",
    "DownBreve": "̑",
    "DownLeftRightVector": "⥐",
    "DownLeftTeeVector": "⥞",
    "DownLeftVector": "↽",
    "DownLeftVectorBar": "⥖",
    "DownRightTeeVector": "⥟",
    "DownRightVector": "⇁",
    "DownRightVectorBar": "⥗",
    "DownTee": "⊤",
    "DownTeeArrow": "↧",
    "Downarrow": "⇓",
    "Dscr": "𝒟",
    "Dstrok": "Đ",
    "ENG": "Ŋ",
    "ETH": "Ð",
    "Eacute": "É",
    "Ecaron": "Ě",
    "Ecirc": "Ê",
    "Ecy": "Э",
    "Edot": "Ė",
    "Efr": "𝔈",
    "Egrave": "È",
    "Element": "∈",
    "Emacr": "Ē",
    "EmptySmallSquare": "◻",
    "EmptyVerySmallSquare": "▫",
    "Eogon": "Ę",
    "Eopf": "𝔼",
    "Epsilon": "Ε",
    "Equal": "⩵",
    "EqualTilde": "≂",
    "Equilibrium": "⇌",
    "Escr": "ℰ",
    "Esim": "⩳",
    "Eta": "Η",
    "Euml": "Ë",
    "Exists": "∃",
    "ExponentialE": "ⅇ",
    "Fcy": "Ф",
    "Ffr": "𝔉",
    "FilledSmallSquare": "◼",
    "FilledVerySmallSquare": "▪",
    "Fopf": "𝔽",
    "ForAll": "∀",
    "Fouriertrf": "ℱ",
    "Fscr": "ℱ",
    "GJcy": "Ѓ",
    "GT": ">",
    "Gamma": "Γ",
    "Gammad": "Ϝ",
    "Gbreve": "Ğ",
    "Gcedil": "Ģ",
    "Gcirc": "Ĝ",
    "Gcy": "Г",
    "Gdot": "Ġ",
    "Gfr": "𝔊",
    "Gg": "⋙",
    "Gopf": "𝔾",
    "GreaterEqual": "≥",
    "GreaterEqualLess": "⋛",
    "GreaterFullEqual": "≧",
    "GreaterGreater": "⪢",
    "GreaterLess": "≷",
    "GreaterSlantEqual": "⩾",
    "GreaterTilde": "≳",
    "Gscr": "𝒢",
    "Gt": "≫",
    "HARDcy": "Ъ",
    "Hacek": "ˇ",
    "Hat": "^",
    "Hcirc": "Ĥ",
    "Hfr": "ℌ",
    "HilbertSpace": "ℋ",
    "Hopf": "ℍ",
    "HorizontalLine": "─",
    "Hscr": "ℋ",
    "Hstrok": "Ħ",
    "HumpDownHump": "≎",
    "HumpEqual": "≏",
    "IEcy": "Е",
    "IJlig": "Ĳ",
    "IOcy": "Ё",
    "Iacute": "Í",
    "Icirc": "Î",
    "Icy": "И",
    "Idot": "İ",
    "Ifr": "ℑ",
    "Igrave": "Ì",
    "Im": "ℑ",
    "Imacr": "Ī",
    "ImaginaryI": "ⅈ",
    "Implies": "⇒",
    "Int": "∬",
    "Integral": "∫",
    "Intersection": "⋂",
    "InvisibleComma": "⁣",
    "InvisibleTimes": "⁢",
    "Iogon": "Į",
    "Iopf": "𝕀",
    "Iota": "Ι",
    "Iscr": "ℐ",
    "Itilde": "Ĩ",
    "Iukcy": "І",
    "Iuml": "Ï",
    "Jcirc": "Ĵ",
    "Jcy": "Й",
    "Jfr": "𝔍",
    "Jopf": "𝕁",
    "Jscr": "𝒥",
    "Jsercy": "Ј",
    "Jukcy": "Є",
    "KHcy": "Х",
    "KJcy": "Ќ",
    "Kappa": "Κ",
    "Kcedil": "Ķ",
    "Kcy": "К",
    "Kfr": "𝔎",
    "Kopf": "𝕂",
    "Kscr": "𝒦",
    "LJcy": "Љ",
    "LT": "<",
    "Lacute": "Ĺ",
    "Lambda": "Λ",
    "Lang": "⟪",
    "Laplacetrf": "ℒ",
    "Larr": "↞",
    "Lcaron": "Ľ",
    "Lcedil": "Ļ",
    "Lcy": "Л",
    "LeftAngleBracket": "⟨",
    "LeftArrow": "←",
    "LeftArrowBar": "⇤",
    "LeftArrowRightArrow": "⇆",
    "LeftCeiling": "⌈",
    "LeftDoubleBracket": "⟦",
    "LeftDownTeeVector": "⥡",
    "LeftDownVector": "⇃",
    "LeftDownVectorBar": "⥙",
    "LeftFloor": "⌊",
    "LeftRightArrow": "↔",
    "LeftRightVector": "⥎",
    "LeftTee": "⊣",
    "LeftTeeArrow": "↤",
    "LeftTeeVector": "⥚",
    "LeftTriangle": "⊲",
    "LeftTriangleBar": "⧏",
    "LeftTriangleEqual": "⊴",
    "LeftUpDownVector": "⥑",
    "LeftUpTeeVector": "⥠",
    "LeftUpVector": "↿",
    "LeftUpVectorBar": "⥘",
    "LeftVector": "↼",
    "LeftVectorBar": "⥒",
    "Leftarrow": "⇐",
    "Leftrightarrow": "⇔",
    "LessEqualGreater": "⋚",
    "LessFullEqual": "≦",
    "LessGreater": "≶",
    "LessLess": "⪡",
    "LessSlantEqual": "⩽",
    "LessTilde": "≲",
    "Lfr": "𝔏",
    "Ll": "⋘",
    "Lleftarrow": "⇚",
    "Lmidot": "Ŀ",
    "LongLeftArrow": "⟵",
    "LongLeftRightArrow": "⟷",
    "LongRightArrow": "⟶",
    "Longleftarrow": "⟸",
    "Longleftrightarrow": "⟺",
    "Longrightarrow": "⟹",
    "Lopf": "𝕃",
    "LowerLeftArrow": "↙",
    "LowerRightArrow": "↘",
    "Lscr": "ℒ",
    "Lsh": "↰",
    "Lstrok": "Ł",
    "Lt": "≪",
    "Map": "⤅",
    "Mcy": "М",
    "MediumSpace": " ",
    "Mellintrf": "ℳ",
    "Mfr": "𝔐",
    "MinusPlus": "∓",
    "Mopf": "𝕄",
    "Mscr": "ℳ",
    "Mu": "Μ",
    "NJcy": "Њ",
    "Nacute": "Ń",
    "Ncaron": "Ň",
    "Ncedil": "Ņ",
    "Ncy": "Н",
    "NegativeMediumSpace": "​",
    "NegativeThickSpace": "​",
    "NegativeThinSpace": "​",
    "NegativeVeryThinSpace": "​",
    "NestedGreaterGreater": "≫",
    "NestedLessLess": "≪",
    "NewLine": "\n",
    "Nfr": "𝔑",
    "NoBreak": "⁠",
    "NonBreakingSpace": " ",
    "Nopf": "ℕ",
    "Not": "⫬",
    "NotCongruent": "≢",
    "NotCupCap": "≭",
    "NotDoubleVerticalBar": "∦",
    "NotElement": "∉",
    "NotEqual": "≠",
    "NotEqualTilde": "≂̸",
    "NotExists": "∄",
    "NotGreater": "≯",
    "NotGreaterEqual": "≱",
    "NotGreaterFullEqual": "≧̸",
    "NotGreaterGreater": "≫̸",
    "NotGreaterLess": "≹",
    "NotGreaterSlantEqual": "⩾̸",
    "NotGreaterTilde": "≵",
    "NotHumpDownHump": "≎̸",
    "NotHumpEqual": "≏̸",
    "NotLeftTriangle": "⋪",
    "NotLeftTriangleBar": "⧏̸",
    "NotLeftTriangleEqual": "⋬",
    "NotLess": "≮",
    "NotLessEqual": "≰",
    "NotLessGreater": "≸",
    "NotLessLess": "≪̸",
    "NotLessSlantEqual": "⩽̸",
    "NotLessTilde": "≴",
    "NotNestedGreaterGreater": "⪢̸",
    "NotNestedLessLess": "⪡̸",
    "NotPrecedes": "⊀",
    "NotPrecedesEqual": "⪯̸",
    "NotPrecedesSlantEqual": "⋠",
    "NotReverseElement": "∌",
    "NotRightTriangle": "⋫",
    "NotRightTriangleBar": "⧐̸",
    "NotRightTriangleEqual": "⋭",
    "NotSquareSubset": "⊏̸",
    "NotSquareSubsetEqual": "⋢",
    "NotSquareSuperset": "⊐̸",
    "NotSquareSupersetEqual": "⋣",
    "NotSubset": "⊂⃒",
    "NotSubsetEqual": "⊈",
    "NotSucceeds": "⊁",
    "NotSucceedsEqual": "⪰̸",
    "NotSucceedsSlantEqual": "⋡",
    "NotSucceedsTilde": "≿̸",
    "NotSuperset": "⊃⃒",
    "NotSupersetEqual": "⊉",
    "NotTilde": "≁",
    "NotTildeEqual": "≄",
    "NotTildeFullEqual": "≇",
    "NotTildeTilde": "≉",
    "NotVerticalBar": "∤",
    "Nscr": "𝒩",
    "Ntilde": "Ñ",
    "Nu": "Ν",
    "OElig": "Œ",
    "Oacute": "Ó",
    "Ocirc": "Ô",
    "Ocy": "О",
    "Odblac": "Ő",
    "Ofr": "𝔒",
    "Ograve": "Ò",
    "Omacr": "Ō",
    "Omega": "Ω",
    "Omicron": "Ο",
    "Oopf": "𝕆",
    "OpenCurlyDoubleQuote": "“",
    "OpenCurlyQuote": "‘",
    "Or": "⩔",
    "Oscr": "𝒪",
    "Oslash": "Ø",
    "Otilde": "Õ",
    "Otimes": "⨷",
    "Ouml": "Ö",
    "OverBar": "‾",
    "OverBrace": "⏞",
    "OverBracket": "⎴",
    "OverParenthesis": "⏜",
    "PartialD": "∂",
    "Pcy": "П",
    "Pfr": "𝔓",
    "Phi": "Φ",
    "Pi": "Π",
    "PlusMinus": "±",
    "Poincareplane": "ℌ",
    "Popf": "ℙ",
    "Pr": "⪻",
    "Precedes": "≺",
    "PrecedesEqual": "⪯",
    "PrecedesSlantEqual": "≼",
    "PrecedesTilde": "≾",
    "Prime": "″",
    "Product": "∏",
    "Proportion": "∷",
    "Proportional": "∝",
    "Pscr": "𝒫",
    "Psi": "Ψ",
    "QUOT": "\"",
    "Qfr": "𝔔",
    "Qopf": "ℚ",
    "Qscr": "𝒬",
    "RBarr": "⤐",
    "REG": "®",
    "Racute": "Ŕ",
    "Rang": "⟫",
    "Rarr": "↠",
    "Rarrtl": "⤖",
    "Rcaron": "Ř",
    "Rcedil": "Ŗ",
    "Rcy": "Р",
    "Re": "ℜ",
    "ReverseElement": "∋",
    "ReverseEquilibrium": "⇋",
    "ReverseUpEquilibrium": "⥯",
    "Rfr": "ℜ",
    "Rho": "Ρ",
    "RightAngleBracket": "⟩",
    "RightArrow": "→",
    "RightArrowBar": "⇥",
    "RightArrowLeftArrow": "⇄",
    "RightCeiling": "⌉",
    "RightDoubleBracket": "⟧",
    "RightDownTeeVector": "⥝",
    "RightDownVector": "⇂",
    "RightDownVectorBar": "⥕",
    "RightFloor": "⌋",
    "RightTee": "⊢",
    "RightTeeArrow": "↦",
    "RightTeeVector": "⥛",
    "RightTriangle": "⊳",
    "RightTriangleBar": "⧐",
    "RightTriangleEqual": "⊵",
    "RightUpDownVector": "⥏",
    "RightUpTeeVector": "⥜",
    "RightUpVector": "↾",
    "RightUpVectorBar": "⥔",
    "RightVector": "⇀",
    "RightVectorBar": "⥓",
    "Rightarrow": "⇒",
    "Ropf": "ℝ",
    "RoundImplies": "⥰",
    "Rrightarrow": "⇛",
    "Rscr": "ℛ",
    "Rsh": "↱",
    "RuleDelayed": "⧴",
    "SHCHcy": "Щ",
    "SHcy": "Ш",
    "SOFTcy": "Ь",
    "Sacute": "Ś",
    "Sc": "⪼",
    "Scaron": "Š",
    "Scedil": "Ş",
    "Scirc": "Ŝ",
    "Scy": "С",
    "Sfr": "𝔖",
    "ShortDownArrow": "↓",
    "ShortLeftArrow": "←",
    "ShortRightArrow": "→",
    "ShortUpArrow": "↑",
    "Sigma": "Σ",
    "SmallCircle": "∘",
    "Sopf": "𝕊",
    "Sqrt": "√",
    "Square": "□",
    "SquareIntersection": "⊓",
    "SquareSubset": "⊏",
    "SquareSubsetEqual": "⊑",
    "SquareSuperset": "⊐",
    "SquareSupersetEqual": "⊒",
    "SquareUnion": "⊔",
    "Sscr": "𝒮",
    "Star": "⋆",
    "Sub": "⋐",
    "Subset": "⋐",
    "SubsetEqual": "⊆",
    "Succeeds": "≻",
    "SucceedsEqual": "⪰",
    "SucceedsSlantEqual": "≽",
    "SucceedsTilde": "≿",
    "SuchThat": "∋",
    "Sum": "∑",
    "Sup": "⋑",
    "Superset": "⊃",
    "SupersetEqual": "⊇",
    "Supset": "⋑",
    "THORN": "Þ",
    "TRADE": "™",
    "TSHcy": "Ћ",
    "TScy": "Ц",
    "Tab": "\t",
    "Tau": "Τ",
    "Tcaron": "Ť",
    "Tcedil": "Ţ",
    "Tcy": "Т",
    "Tfr": "𝔗",
    "Therefore": "∴",
    "Theta": "Θ",
    "ThickSpace": "  ",
    "ThinSpace": " ",
    "Tilde": "∼",
    "TildeEqual": "≃",
    "TildeFullEqual": "≅",
    "TildeTilde": "≈",
    "Topf": "𝕋",
    "TripleDot": "⃛",
    "Tscr": "𝒯",
    "Tstrok": "Ŧ",
    "Uacute": "Ú",
    "Uarr": "↟",
    "Uarrocir": "⥉",
    "Ubrcy": "Ў",
    "Ubreve": "Ŭ",
    "Ucirc": "Û",
    "Ucy": "У",
    "Udblac": "Ű",
    "Ufr": "𝔘",
    "Ugrave": "Ù",
    "Umacr": "Ū",
    "UnderBar": "_",
    "UnderBrace": "⏟",
    "UnderBracket": "⎵",
    "UnderParenthesis": "⏝",
    "Union": "⋃",
    "UnionPlus": "⊎",
    "Uogon": "Ų",
    "Uopf": "𝕌",
    "UpArrow": "↑",
    "UpArrowBar": "⤒",
    "UpArrowDownArrow": "⇅",
    "UpDownArrow": "↕",
    "UpEquilibrium": "⥮",
    "UpTee": "⊥",
    "UpTeeArrow": "↥",
    "Uparrow": "⇑",
    "Updownarrow": "⇕",
    "UpperLeftArrow": "↖",
    "UpperRightArrow": "↗",
    "Upsi": "ϒ",
    "Upsilon": "Υ",
    "Uring": "Ů",
    "Uscr": "𝒰",
    "Utilde": "Ũ",
    "Uuml": "Ü",
    "VDash": "⊫",
    "Vbar": "⫫",
    "Vcy": "В",
    "Vdash": "⊩",
    "Vdashl": "⫦",
    "Vee": "⋁",
    "Verbar": "‖",
    "Vert": "‖",
    "VerticalBar": "∣",
    "VerticalLine": "|",
    "VerticalSeparator": "❘",
    "VerticalTilde": "≀",
    "VeryThinSpace": " ",
    "Vfr": "𝔙",
    "Vopf": "𝕍",
    "Vscr": "𝒱",
    "Vvdash": "⊪",
    "Wcirc": "Ŵ",
    "Wedge": "⋀",
    "Wfr": "𝔚",
    "Wopf": "𝕎",
    "Wscr": "𝒲",
    "Xfr": "𝔛",
    "Xi": "Ξ",
    "Xopf": "𝕏",
    "Xscr": "𝒳",
    "YAcy": "Я",
    "YIcy": "Ї",
    "YUcy": "Ю",
    "Yacute": "Ý",
    "Ycirc": "Ŷ",
    "Ycy": "Ы",
    "Yfr": "𝔜",
    "Yopf": "𝕐",
    "Yscr": "𝒴",
    "Yuml": "Ÿ",
    "ZHcy": "Ж",
    "Zacute": "Ź",
    "Zcaron": "Ž",
    "Zcy": "З",
    "Zdot": "Ż",
    "ZeroWidthSpace": "​",
    "Zeta": "Ζ",
    "Zfr": "ℨ",
    "Zopf": "ℤ",
    "Zscr": "𝒵",
    "aacute": "á",
    "abreve": "ă",
    "ac": "∾",
    "acE": "∾̳",
    "acd": "∿",
    "acirc": "â",
    "acute": "´",
    "acy": "а",
    "aelig": "æ",
    "af": "⁡",
    "afr": "𝔞",
    "agrave": "à",
    "alefsym": "ℵ",
    "aleph": "ℵ",
    "alpha": "α",
    "amacr": "ā",
    "amalg": "⨿",
    "amp": "&",
    "and": "∧",
    "andand": "⩕",
    "andd": "⩜",
    "andslope": "⩘",
    "andv": "⩚",
    "ang": "∠",
    "ange": "⦤",
    "angle": "∠",
    "angmsd": "∡",
    "angmsdaa": "⦨",
    "angmsdab": "⦩",
    "angmsdac": "⦪",
    "angmsdad": "⦫",
    "angmsdae": "⦬",
    "angmsdaf": "⦭",
    "angmsdag": "⦮",
    "angmsdah": "⦯",
    "angrt": "∟",
    "angrtvb": "⊾",
    "angrtvbd": "⦝",
    "angsph": "∢",
    "angst": "Å",
    "angzarr": "⍼",
    "aogon": "ą",
    "aopf": "𝕒",
    "ap": "≈",
    "apE": "⩰",
    "apacir": "⩯",
    "ape": "≊",
    "apid": "≋",
    "apos": "'",
    "approx": "≈",
    "approxeq": "≊",
    "aring": "å",
    "ascr": "𝒶",
    "ast": "*",
    "asymp": "≈",
    "asympeq": "≍",
    "atilde": "ã",
    "auml": "ä",
    "awconint": "∳",
    "awint": "⨑",
    "bNot": "⫭",
    "backcong": "≌",
    "backepsilon": "϶",
    "backprime": "‵",
    "backsim": "∽",
    "backsimeq": "⋍",
    "barvee": "⊽",
    "barwed": "⌅",
    "barwedge": "⌅",
    "bbrk": "⎵",
    "bbrktbrk": "⎶",
    "bcong": "≌",
    "bcy": "б",
    "bdquo": "„",
    "becaus": "∵",
    "because": "∵",
    "bemptyv": "⦰",
    "bepsi": "϶",
    "bernou": "ℬ",
    "beta": "β",
    "beth": "ℶ",
    "between": "≬",
    "bfr": "𝔟",
    "bigcap": "⋂",
    "bigcirc": "◯",
    "bigcup": "⋃",
    "bigodot": "⨀",
    "bigoplus": "⨁",
    "bigotimes": "⨂",
    "bigsqcup": "⨆",
    "bigstar": "★",
    "bigtriangledown": "▽",
    "bigtriangleup": "△",
    "biguplus": "⨄",
    "bigvee": "⋁",
    "bigwedge": "⋀",
    "bkarow": "⤍",
    "blacklozenge": "⧫",
    "blacksquare": "▪",
    "blacktriangle": "▴",
    "blacktriangledown": "▾",
    "blacktriangleleft": "◂",
    "blacktriangleright": "▸",
    "blank": "␣",
    "blk12": "▒",
    "blk14": "░",
    "blk34": "▓",
    "block": "█",
    "bne": "=⃥",
    "bnequiv": "≡⃥",
    "bnot": "⌐",
    "bopf": "𝕓",
    "bot": "⊥",
    "bottom": "⊥",
    "bowtie": "⋈",
    "boxDL": "╗",
    "boxDR": "╔",
    "boxDl": "╖",
    "boxDr": "╓",
    "boxH": "═",
    "boxHD": "╦",
    "boxHU": "╩",
    "boxHd": "╤",
    "boxHu": "╧",
    "boxUL": "╝",
    "boxUR": "╚",
    "boxUl": "╜",
    "boxUr": "╙",
    "boxV": "║",
    "boxVH": "╬",
    "boxVL": "╣",
    "boxVR": "╠",
    "boxVh": "╫",
    "boxVl": "╢",
    "boxVr": "╟",
    "boxbox": "⧉",
    "boxdL": "╕",
    "boxdR": "╒",
    "boxdl": "┐",
    "boxdr": "┌",
    "boxh": "─",
    "boxhD": "╥",
    "boxhU": "╨",
    "boxhd": "┬",
    "boxhu": "┴",
    "boxminus": "⊟",
    "boxplus": "⊞",
    "boxtimes": "⊠",
    "boxuL": "╛",
    "boxuR": "╘",
    "boxul": "┘",
    "boxur": "└",
    "boxv": "│",
    "boxvH": "╪",
    "boxvL": "╡",
    "boxvR": "╞",
    "boxvh": "┼",
    "boxvl": "┤",
    "boxvr": "├",
    "bprime": "‵",
    "breve": "˘",
    "brvbar": "¦",
    "bscr": "𝒷",
    "bsemi": "⁏",
    "bsim": "∽",
    "bsime": "⋍",
    "bsol": "\\",
    "bsolb": "⧅",
    "bsolhsub": "⟈",
    "bull": "•",
    "bullet": "•",
    "bump": "≎",
    "bumpE": "⪮",
    "bumpe": "≏",
    "bumpeq": "≏",
    "cacute": "ć",
    "cap": "∩",
    "capand": "⩄",
    "capbrcup": "⩉",
    "capcap": "⩋",
    "capcup": "⩇",
    "capdot": "⩀",
    "caps": "∩︀",
    "caret": "⁁",
    "caron": "ˇ",
    "ccaps": "⩍",
    "ccaron": "č",
    "ccedil": "ç",
    "ccirc": "ĉ",
    "ccups": "⩌",
    "ccupssm": "⩐",
    "cdot": "ċ",
    "cedil": "¸",
    "cemptyv": "⦲",
    "cent": "¢",
    "centerdot": "·",
    "cfr": "𝔠",
    "chcy": "ч",
    "check": "✓",
    "checkmark": "✓",
    "chi": "χ",
    "cir": "○",
    "cirE": "⧃",
    "circ": "ˆ",
    "circeq": "≗",
    "circlearrowleft": "↺",
    "circlearrowright": "↻",
    "circledR": "®",
    "circledS": "Ⓢ",
    "circledast": "⊛",
    "circledcirc": "⊚",
    "circleddash": "⊝",
    "cire": "≗",
    "cirfnint": "⨐",
    "cirmid": "⫯",
    "cirscir": "⧂",
    "clubs": "♣",
    "clubsuit": "♣",
    "colon": ":",
    "colone": "≔",
    "coloneq": "≔",
    "comma": ",",
    "commat": "@",
    "comp": "∁",
    "compfn": "∘",
    "complement": "∁",
    "complexes": "ℂ",
    "cong": "≅",
    "congdot": "⩭",
    "conint": "∮",
    "copf": "𝕔",
    "coprod": "∐",
    "copy": "©",
    "copysr": "℗",
    "crarr": "↵",
    "cross": "✗",
    "cscr": "𝒸",
    "csub": "⫏",
    "csube": "⫑",
    "csup": "⫐",
    "csupe": "⫒",
    "ctdot": "⋯",
    "cudarrl": "⤸",
    "cudarrr": "⤵",
    "cuepr": "⋞",
    "cuesc": "⋟",
    "cularr": "↶",
    "cularrp": "⤽",
    "cup": "∪",
    "cupbrcap": "⩈",
    "cupcap": "⩆",
    "cupcup": "⩊",
    "cupdot": "⊍",
    "cupor": "⩅",
    "cups": "∪︀",
    "curarr": "↷",
    "curarrm": "⤼",
    "curlyeqprec": "⋞",
    "curlyeqsucc": "⋟",
    "curlyvee": "⋎",
    "curlywedge": "⋏",
    "curren": "¤",
    "curvearrowleft": "↶",
    "curvearrowright": "↷",
    "cuvee": "⋎",
    "cuwed": "⋏",
    "cwconint": "∲",
    "cwint": "∱",
    "cylcty": "⌭",
    "dArr": "⇓",
    "dHar": "⥥",
    "dagger": "†",
    "daleth": "ℸ",
    "darr": "↓",
    "dash": "‐",
    "dashv": "⊣",
    "dbkarow": "⤏",
    "dblac": "˝",
    "dcaron": "ď",
    "dcy": "д",
    "dd": "ⅆ",
    "ddagger": "‡",
    "ddarr": "⇊",
    "ddotseq": "⩷",
    "deg": "°",
    "delta": "δ",
    "demptyv": "⦱",
    "dfisht": "⥿",
    "dfr": "𝔡",
    "dharl": "⇃",
    "dharr": "⇂",
    "diam": "⋄",
    "diamond": "⋄",
    "diamondsuit": "♦",
    "diams": "♦",
    "die": "¨",
    "digamma": "ϝ",
    "disin": "⋲",
    "div": "÷",
    "divide": "÷",
    "divideontimes": "⋇",
    "divonx": "⋇",
    "djcy": "ђ",
    "dlcorn": "⌞",
    "dlcrop": "⌍",
    "dollar": "$",
    "dopf": "𝕕",
    "dot": "˙",
    "doteq": "≐",
    "doteqdot": "≑",
    "dotminus": "∸",
    "dotplus": "∔",
    "dotsquare": "⊡",
    "doublebarwedge": "⌆",
    "downarrow": "↓",
    "downdownarrows": "⇊",
    "downharpoonleft": "⇃",
    "downharpoonright": "⇂",
    "drbkarow": "⤐",
    "drcorn": "⌟",
    "drcrop": "⌌",
    "dscr": "𝒹",
    "dscy": "ѕ",
    "dsol": "⧶",
    "dstrok": "đ",
    "dtdot": "⋱",
    "dtri": "▿",
    "dtrif": "▾",
    "duarr": "⇵",
    "duhar": "⥯",
    "dwangle": "⦦",
    "dzcy": "џ",
    "dzigrarr": "⟿",
    "eDDot": "⩷",
    "eDot": "≑",
    "eacute": "é",
    "easter": "⩮",
    "ecaron": "ě",
    "ecir": "≖",
    "ecirc": "ê",
    "ecolon": "≕",
    "ecy": "э",
    "edot": "ė",
    "ee": "ⅇ",
    "efDot": "≒",
    "efr": "𝔢",
    "eg": "⪚",
    "egrave": "è",
    "egs": "⪖",
    "egsdot": "⪘",
    "el": "⪙",
    "elinters": "⏧",
    "ell": "ℓ",
    "els": "⪕",
    "elsdot": "⪗",
    "emacr": "ē",
    "empty": "∅",
    "emptyset": "∅",
    "emptyv": "∅",
    "emsp13": " ",
    "emsp14": " ",
    "emsp": " ",
    "eng": "ŋ",
    "ensp": " ",
    "eogon": "ę",
    "eopf": "𝕖",
    "epar": "⋕",
    "eparsl": "⧣",
    "eplus": "⩱",
    "epsi": "ε",
    "epsilon": "ε",
    "epsiv": "ϵ",
    "eqcirc": "≖",
    "eqcolon": "≕",
    "eqsim": "≂",
    "eqslantgtr": "⪖",
    "eqslantless": "⪕",
    "equals": "=",
    "equest": "≟",
    "equiv": "≡",
    "equivDD": "⩸",
    "eqvparsl": "⧥",
    "erDot": "≓",
    "erarr": "⥱",
    "escr": "ℯ",
    "esdot": "≐",
    "esim": "≂",
    "eta": "η",
    "eth": "ð",
    "euml": "ë",
    "euro": "€",
    "excl": "!",
    "exist": "∃",
    "expectation": "ℰ",
    "exponentiale": "ⅇ",
    "fallingdotseq": "≒",
    "fcy": "ф",
    "female": "♀",
    "ffilig": "ﬃ",
    "fflig": "ﬀ",
    "ffllig": "ﬄ",
    "ffr": "𝔣",
    "filig": "ﬁ",
    "fjlig": "fj",
    "flat": "♭",
    "fllig": "ﬂ",
    "fltns": "▱",
    "fnof": "ƒ",
    "fopf": "𝕗",
    "forall": "∀",
    "fork": "⋔",
    "forkv": "⫙",
    "fpartint": "⨍",
    "frac12": "½",
    "frac13": "⅓",
    "frac14": "¼",
    "frac15": "⅕",
    "frac16": "⅙",
    "frac18": "⅛",
    "frac23": "⅔",
    "frac25": "⅖",
    "frac34": "¾",
    "frac35": "⅗",
    "frac38": "⅜",
    "frac45": "⅘",
    "frac56": "⅚",
    "frac58": "⅝",
    "frac78": "⅞",
    "frasl": "⁄",
    "frown": "⌢",
    "fscr": "𝒻",
    "gE": "≧",
    "gEl": "⪌",
    "gacute": "ǵ",
    "gamma": "γ",
    "gammad": "ϝ",
    "gap": "⪆",
    "gbreve": "ğ",
    "gcirc": "ĝ",
    "gcy": "г",
    "gdot": "ġ",
    "ge": "≥",
    "gel": "⋛",
    "geq": "≥",
    "geqq": "≧",
    "geqslant": "⩾",
    "ges": "⩾",
    "gescc": "⪩",
    "gesdot": "⪀",
    "gesdoto": "⪂",
    "gesdotol": "⪄",
    "gesl": "⋛︀",
    "gesles": "⪔",
    "gfr": "𝔤",
    "gg": "≫",
    "ggg": "⋙",
    "gimel": "ℷ",
    "gjcy": "ѓ",
    "gl": "≷",
    "glE": "⪒",
    "gla": "⪥",
    "glj": "⪤",
    "gnE": "≩",
    "gnap": "⪊",
    "gnapprox": "⪊",
    "gne": "⪈",
    "gneq": "⪈",
    "gneqq": "≩",
    "gnsim": "⋧",
    "gopf": "𝕘",
    "grave": "`",
    "gscr": "ℊ",
    "gsim": "≳",
    "gsime": "⪎",
    "gsiml": "⪐",
    "gt": ">",
    "gtcc": "⪧",
    "gtcir": "⩺",
    "gtdot": "⋗",
    "gtlPar": "⦕",
    "gtquest": "⩼",
    "gtrapprox": "⪆",
    "gtrarr": "⥸",
    "gtrdot": "⋗",
    "gtreqless": "⋛",
    "gtreqqless": "⪌",
    "gtrless": "≷",
    "gtrsim": "≳",
    "gvertneqq": "≩︀",
    "gvnE": "≩︀",
    "hArr": "⇔",
    "hairsp": " ",
    "half": "½",
    "hamilt": "ℋ",
    "hardcy": "ъ",
    "harr": "↔",
    "harrcir": "⥈",
    "harrw": "↭",
    "hbar": "ℏ",
    "hcirc": "ĥ",
    "hearts": "♥",
    "heartsuit": "♥",
    "hellip": "…",
    "hercon": "⊹",
    "hfr": "𝔥",
    "hksearow": "⤥",
    "hkswarow": "⤦",
    "hoarr": "⇿",
    "homtht": "∻",
    "hookleftarrow": "↩",
    "hookrightarrow": "↪",
    "hopf": "𝕙",
    "horbar": "―",
    "hscr": "𝒽",
    "hslash": "ℏ",
    "hstrok": "ħ",
    "hybull": "⁃",
    "hyphen": "‐",
    "iacute": "í",
    "ic": "⁣",
    "icirc": "î",
    "icy": "и",
    "iecy": "е",
    "iexcl": "¡",
    "iff": "⇔",
    "ifr": "𝔦",
    "igrave": "ì",
    "ii": "ⅈ",
    "iiiint": "⨌",
    "iiint": "∭",
    "iinfin": "⧜",
    "iiota": "℩",
    "ijlig": "ĳ",
    "imacr": "ī",
    "image": "ℑ",
    "imagline": "ℐ",
    "imagpart": "ℑ",
    "imath": "ı",
    "imof": "⊷",
    "imped": "Ƶ",
    "in": "∈",
    "incare": "℅",
    "infin": "∞",
    "infintie": "⧝",
    "inodot": "ı",
    "int": "∫",
    "intcal": "⊺",
    "integers": "ℤ",
    "intercal": "⊺",
    "intlarhk": "⨗",
    "intprod": "⨼",
    "iocy": "ё",
    "iogon": "į",
    "iopf": "𝕚",
    "iota": "ι",
    "iprod": "⨼",
    "iquest": "¿",
    "iscr": "𝒾",
    "isin": "∈",
    "isinE": "⋹",
    "isindot": "⋵",
    "isins": "⋴",
    "isinsv": "⋳",
    "isinv": "∈",
    "it": "⁢",
    "itilde": "ĩ",
    "iukcy": "і",
    "iuml": "ï",
    "jcirc": "ĵ",
    "jcy": "й",
    "jfr": "𝔧",
    "jmath": "ȷ",
    "jopf": "𝕛",
    "jscr": "𝒿",
    "jsercy": "ј",
    "jukcy": "є",
    "kappa": "κ",
    "kappav": "ϰ",
    "kcedil": "ķ",
    "kcy": "к",
    "kfr": "𝔨",
    "kgreen": "ĸ",
    "khcy": "х",
    "kjcy": "ќ",
    "kopf": "𝕜",
    "kscr": "𝓀",
    "lAarr": "⇚",
    "lArr": "⇐",
    "lAtail": "⤛",
    "lBarr": "⤎",
    "lE": "≦",
    "lEg": "⪋",
    "lHar": "⥢",
    "lacute": "ĺ",
    "laemptyv": "⦴",
    "lagran": "ℒ",
    "lambda": "λ",
    "lang": "⟨",
    "langd": "⦑",
    "langle": "⟨",
    "lap": "⪅",
    "laquo": "«",
    "larr": "←",
    "larrb": "⇤",
    "larrbfs": "⤟",
    "larrfs": "⤝",
    "larrhk": "↩",
    "larrlp": "↫",
    "larrpl": "⤹",
    "larrsim": "⥳",
    "larrtl": "↢",
    "lat": "⪫",
    "latail": "⤙",
    "late": "⪭",
    "lates": "⪭︀",
    "lbarr": "⤌",
    "lbbrk": "❲",
    "lbrace": "{",
    "lbrack": "[",
    "lbrke": "⦋",
    "lbrksld": "⦏",
    "lbrkslu": "⦍",
    "lcaron": "ľ",
    "lcedil": "ļ",
    "lceil": "⌈",
    "lcub": "{",
    "lcy": "л",
    "ldca": "⤶",
    "ldquo": "“",
    "ldquor": "„",
    "ldrdhar": "⥧",
    "ldrushar": "⥋",
    "ldsh": "↲",
    "le": "≤",
    "leftarrow": "←",
    "leftarrowtail": "↢",
    "leftharpoondown": "↽",
    "leftharpoonup": "↼",
    "leftleftarrows": "⇇",
    "leftrightarrow": "↔",
    "leftrightarrows": "⇆",
    "leftrightharpoons": "⇋",
    "leftrightsquigarrow": "↭",
    "leftthreetimes": "⋋",
    "leg": "⋚",
    "leq": "≤",
    "leqq": "≦",
    "leqslant": "⩽",
    "les": "⩽",
    "lescc": "⪨",
    "lesdot": "⩿",
    "lesdoto": "⪁",
    "lesdotor": "⪃",
    "lesg": "⋚︀",
    "lesges": "⪓",
    "lessapprox": "⪅",
    "lessdot": "⋖",
    "lesseqgtr": "⋚",
    "lesseqqgtr": "⪋",
    "lessgtr": "≶",
    "lesssim": "≲",
    "lfisht": "⥼",
    "lfloor": "⌊",
    "lfr": "𝔩",
    "lg": "≶",
    "lgE": "⪑",
    "lhard": "↽",
    "lharu": "↼",
    "lharul": "⥪",
    "lhblk": "▄",
    "ljcy": "љ",
    "ll": "≪",
    "llarr": "⇇",
    "llcorner": "⌞",
    "llhard": "⥫",
    "lltri": "◺",
    "lmidot": "ŀ",
    "lmoust": "⎰",
    "lmoustache": "⎰",
    "lnE": "≨",
    "lnap": "⪉",
    "lnapprox": "⪉",
    "lne": "⪇",
    "lneq": "⪇",
    "lneqq": "≨",
    "lnsim": "⋦",
    "loang": "⟬",
    "loarr": "⇽",
    "lobrk": "⟦",
    "longleftarrow": "⟵",
    "longleftrightarrow": "⟷",
    "longmapsto": "⟼",
    "longrightarrow": "⟶",
    "looparrowleft": "↫",
    "looparrowright": "↬",
    "lopar": "⦅",
    "lopf": "𝕝",
    "loplus": "⨭",
    "lotimes": "⨴",
    "lowast": "∗",
    "lowbar": "_",
    "loz": "◊",
    "lozenge": "◊",
    "lozf": "⧫",
    "lpar": "(",
    "lparlt": "⦓",
    "lrarr": "⇆",
    "lrcorner": "⌟",
    "lrhar": "⇋",
    "lrhard": "⥭",
    "lrm": "‎",
    "lrtri": "⊿",
    "lsaquo": "‹",
    "lscr": "𝓁",
    "lsh": "↰",
    "lsim": "≲",
    "lsime": "⪍",
    "lsimg": "⪏",
    "lsqb": "[",
    "lsquo": "‘",
    "lsquor": "‚",
    "lstrok": "ł",
    "lt": "<",
    "ltcc": "⪦",
    "ltcir": "⩹",
    "ltdot": "⋖",
    "lthree": "⋋",
    "ltimes": "⋉",
    "ltlarr": "⥶",
    "ltquest": "⩻",
    "ltrPar": "⦖",
    "ltri": "◃",
    "ltrie": "⊴",
    "ltrif": "◂",
    "lurdshar": "⥊",
    "luruhar": "⥦",
    "lvertneqq": "≨︀",
    "lvnE": "≨︀",
    "mDDot": "∺",
    "macr": "¯",
    "male": "♂",
    "malt": "✠",
    "maltese": "✠",
    "map": "↦",
    "mapsto": "↦",
    "mapstodown": "↧",
    "mapstoleft": "↤",
    "mapstoup": "↥",
    "marker": "▮",
    "mcomma": "⨩",
    "mcy": "м",
    "mdash": "—",
    "measuredangle": "∡",
    "mfr": "𝔪",
    "mho": "℧",
    "micro": "µ",
    "mid": "∣",
    "midast": "*",
    "midcir": "⫰",
    "middot": "·",
    "minus": "−",
    "minusb": "⊟",
    "minusd": "∸",
    "minusdu": "⨪",
    "mlcp": "⫛",
    "mldr": "…",
    "mnplus": "∓",
    "models": "⊧",
    "mopf": "𝕞",
    "mp": "∓",
    "mscr": "𝓂",
    "mstpos": "∾",
    "mu": "μ",
    "multimap": "⊸",
    "mumap": "⊸",
    "nGg": "⋙̸",
    "nGt": "≫⃒",
    "nGtv": "≫̸",
    "nLeftarrow": "⇍",
    "nLeftrightarrow": "⇎",
    "nLl": "⋘̸",
    "nLt": "≪⃒",
    "nLtv": "≪̸",
    "nRightarrow": "⇏",
    "nVDash": "⊯",
    "nVdash": "⊮",
    "nabla": "∇",
    "nacute": "ń",
    "nang": "∠⃒",
    "nap": "≉",
    "napE": "⩰̸",
    "napid": "≋̸",
    "napos": "ŉ",
    "napprox": "≉",
    "natur": "♮",
    "natural": "♮",
    "naturals": "ℕ",
    "nbsp": " ",
    "nbump": "≎̸",
    "nbumpe": "≏̸",
    "ncap": "⩃",
    "ncaron": "ň",
    "ncedil": "ņ",
    "ncong": "≇",
    "ncongdot": "⩭̸",
    "ncup": "⩂",
    "ncy": "н",
    "ndash": "–",
    "ne": "≠",
    "neArr": "⇗",
    "nearhk": "⤤",
    "nearr": "↗",
    "nearrow": "↗",
    "nedot": "≐̸",
    "nequiv": "≢",
    "nesear": "⤨",
    "nesim": "≂̸",
    "nexist": "∄",
    "nexists": "∄",
    "nfr": "𝔫",
    "ngE": "≧̸",
    "nge": "≱",
    "ngeq": "≱",
    "ngeqq": "≧̸",
    "ngeqslant": "⩾̸",
    "nges": "⩾̸",
    "ngsim": "≵",
    "ngt": "≯",
    "ngtr": "≯",
    "nhArr": "⇎",
    "nharr": "↮",
    "nhpar": "⫲",
    "ni": "∋",
    "nis": "⋼",
    "nisd": "⋺",
    "niv": "∋",
    "njcy": "њ",
    "nlArr": "⇍",
    "nlE": "≦̸",
    "nlarr": "↚",
    "nldr": "‥",
    "nle": "≰",
    "nleftarrow": "↚",
    "nleftrightarrow": "↮",
    "nleq": "≰",
    "nleqq": "≦̸",
    "nleqslant": "⩽̸",
    "nles": "⩽̸",
    "nless": "≮",
    "nlsim": "≴",
    "nlt": "≮",
    "nltri": "⋪",
    "nltrie": "⋬",
    "nmid": "∤",
    "nopf": "𝕟",
    "not": "¬",
    "notin": "∉",
    "notinE": "⋹̸",
    "notindot": "⋵̸",
    "notinva": "∉",
    "notinvb": "⋷",
    "notinvc": "⋶",
    "notni": "∌",
    "notniva": "∌",
    "notnivb": "⋾",
    "notnivc": "⋽",
    "npar": "∦",
    "nparallel": "∦",
    "nparsl": "⫽⃥",
    "npart": "∂̸",
    "npolint": "⨔",
    "npr": "⊀",
    "nprcue": "⋠",
    "npre": "⪯̸",
    "nprec": "⊀",
    "npreceq": "⪯̸",
    "nrArr": "⇏",
    "nrarr": "↛",
    "nrarrc": "⤳̸",
    "nrarrw": "↝̸",
    "nrightarrow": "↛",
    "nrtri": "⋫",
    "nrtrie": "⋭",
    "nsc": "⊁",
    "nsccue": "⋡",
    "nsce": "⪰̸",
    "nscr": "𝓃",
    "nshortmid": "∤",
    "nshortparallel": "∦",
    "nsim": "≁",
    "nsime": "≄",
    "nsimeq": "≄",
    "nsmid": "∤",
    "nspar": "∦",
    "nsqsube": "⋢",
    "nsqsupe": "⋣",
    "nsub": "⊄",
    "nsubE": "⫅̸",
    "nsube": "⊈",
    "nsubset": "⊂⃒",
    "nsubseteq": "⊈",
    "nsubseteqq": "⫅̸",
    "nsucc": "⊁",
    "nsucceq": "⪰̸",
    "nsup": "⊅",
    "nsupE": "⫆̸",
    "nsupe": "⊉",
    "nsupset": "⊃⃒",
    "nsupseteq": "⊉",
    "nsupseteqq": "⫆̸",
    "ntgl": "≹",
    "ntilde": "ñ",
    "ntlg": "≸",
    "ntriangleleft": "⋪",
    "ntrianglelefteq": "⋬",
    "ntriangleright": "⋫",
    "ntrianglerighteq": "⋭",
    "nu": "ν",
    "num": "#",
    "numero": "№",
    "numsp": " ",
    "nvDash": "⊭",
    "nvHarr": "⤄",
    "nvap": "≍⃒",
    "nvdash": "⊬",
    "nvge": "≥⃒",
    "nvgt": ">⃒",
    "nvinfin": "⧞",
    "nvlArr": "⤂",
    "nvle": "≤⃒",
    "nvlt": "<⃒",
    "nvltrie": "⊴⃒",
    "nvrArr": "⤃",
    "nvrtrie": "⊵⃒",
    "nvsim": "∼⃒",
    "nwArr": "⇖",
    "nwarhk": "⤣",
    "nwarr": "↖",
    "nwarrow": "↖",
    "nwnear": "⤧",
    "oS": "Ⓢ",
    "oacute": "ó",
    "oast": "⊛",
    "ocir": "⊚",
    "ocirc": "ô",
    "ocy": "о",
    "odash": "⊝",
    "odblac": "ő",
    "odiv": "⨸",
    "odot": "⊙",
    "odsold": "⦼",
    "oelig": "œ",
    "ofcir": "⦿",
    "ofr": "𝔬",
    "ogon": "˛",
    "ograve": "ò",
    "ogt": "⧁",
    "ohbar": "⦵",
    "ohm": "Ω",
    "oint": "∮",
    "olarr": "↺",
    "olcir": "⦾",
    "olcross": "⦻",
    "oline": "‾",
    "olt": "⧀",
    "omacr": "ō",
    "omega": "ω",
    "omicron": "ο",
    "omid": "⦶",
    "ominus": "⊖",
    "oopf": "𝕠",
    "opar": "⦷",
    "operp": "⦹",
    "oplus": "⊕",
    "or": "∨",
    "orarr": "↻",
    "ord": "⩝",
    "order": "ℴ",
    "orderof": "ℴ",
    "ordf": "ª",
    "ordm": "º",
    "origof": "⊶",
    "oror": "⩖",
    "orslope": "⩗",
    "orv": "⩛",
    "oscr": "ℴ",
    "oslash": "ø",
    "osol": "⊘",
    "otilde": "õ",
    "otimes": "⊗",
    "otimesas": "⨶",
    "ouml": "ö",
    "ovbar": "⌽",
    "par": "∥",
    "para": "¶",
    "parallel": "∥",
    "parsim": "⫳",
    "parsl": "⫽",
    "part": "∂",
    "pcy": "п",
    "percnt": "%",
    "period": ".",
    "permil": "‰",
    "perp": "⊥",
    "pertenk": "‱",
    "pfr": "𝔭",
    "phi": "φ",
    "phiv": "ϕ",
    "phmmat": "ℳ",
    "phone": "☎",
    "pi": "π",
    "pitchfork": "⋔",
    "piv": "ϖ",
    "planck": "ℏ",
    "planckh": "ℎ",
    "plankv": "ℏ",
    "plus": "+",
    "plusacir": "⨣",
    "plusb": "⊞",
    "pluscir": "⨢",
    "plusdo": "∔",
    "plusdu": "⨥",
    "pluse": "⩲",
    "plusmn": "±",
    "plussim": "⨦",
    "plustwo": "⨧",
    "pm": "±",
    "pointint": "⨕",
    "popf": "𝕡",
    "pound": "£",
    "pr": "≺",
    "prE": "⪳",
    "prap": "⪷",
    "prcue": "≼",
    "pre": "⪯",
    "prec": "≺",
    "precapprox": "⪷",
    "preccurlyeq": "≼",
    "preceq": "⪯",
    "precnapprox": "⪹",
    "precneqq": "⪵",
    "precnsim": "⋨",
    "precsim": "≾",
    "prime": "′",
    "primes": "ℙ",
    "prnE": "⪵",
    "prnap": "⪹",
    "prnsim": "⋨",
    "prod": "∏",
    "profalar": "⌮",
    "profline": "⌒",
    "profsurf": "⌓",
    "prop": "∝",
    "propto": "∝",
    "prsim": "≾",
    "prurel": "⊰",
    "pscr": "𝓅",
    "psi": "ψ",
    "puncsp": " ",
    "qfr": "𝔮",
    "qint": "⨌",
    "qopf": "𝕢",
    "qprime": "⁗",
    "qscr": "𝓆",
    "quaternions": "ℍ",
    "quatint": "⨖",
    "quest": "?",
    "questeq": "≟",
    "quot": "\"",
    "rAarr": "⇛",
    "rArr": "⇒",
    "rAtail": "⤜",
    "rBarr": "⤏",
    "rHar": "⥤",
    "race": "∽̱",
    "racute": "ŕ",
    "radic": "√",
    "raemptyv": "⦳",
    "rang": "⟩",
    "rangd": "⦒",
    "range": "⦥",
    "rangle": "⟩",
    "raquo": "»",
    "rarr": "→",
    "rarrap": "⥵",
    "rarrb": "⇥",
    "rarrbfs": "⤠",
    "rarrc": "⤳",
    "rarrfs": "⤞",
    "rarrhk": "↪",
    "rarrlp": "↬",
    "rarrpl": "⥅",
    "rarrsim": "⥴",
    "rarrtl": "↣",
    "rarrw": "↝",
    "ratail": "⤚",
    "ratio": "∶",
    "rationals": "ℚ",
    "rbarr": "⤍",
    "rbbrk": "❳",
    "rbrace": "}",
    "rbrack": "]",
    "rbrke": "⦌",
    "rbrksld": "⦎",
    "rbrkslu": "⦐",
    "rcaron": "ř",
    "rcedil": "ŗ",
    "rceil": "⌉",
    "rcub": "}",
    "rcy": "р",
    "rdca": "⤷",
    "rdldhar": "⥩",
    "rdquo": "”",
    "rdquor": "”",
    "rdsh": "↳",
    "real": "ℜ",
    "realine": "ℛ",
    "realpart": "ℜ",
    "reals": "ℝ",
    "rect": "▭",
    "reg": "®",
    "rfisht": "⥽",
    "rfloor": "⌋",
    "rfr": "𝔯",
    "rhard": "⇁",
    "rharu": "⇀",
    "rharul": "⥬",
    "rho": "ρ",
    "rhov": "ϱ",
    "rightarrow": "→",
    "rightarrowtail": "↣",
    "rightharpoondown": "⇁",
    "rightharpoonup": "⇀",
    "rightleftarrows": "⇄",
    "rightleftharpoons": "⇌",
    "rightrightarrows": "⇉",
    "rightsquigarrow": "↝",
    "rightthreetimes": "⋌",
    "ring": "˚",
    "risingdotseq": "≓",
    "rlarr": "⇄",
    "rlhar": "⇌",
    "rlm": "‏",
    "rmoust": "⎱",
    "rmoustache": "⎱",
    "rnmid": "⫮",
    "roang": "⟭",
    "roarr": "⇾",
    "robrk": "⟧",
    "ropar": "⦆",
    "ropf": "𝕣",
    "roplus": "⨮",
    "rotimes": "⨵",
    "rpar": ")",
    "rpargt": "⦔",
    "rppolint": "⨒",
    "rrarr": "⇉",
    "rsaquo": "›",
    "rscr": "𝓇",
    "rsh": "↱",
    "rsqb": "]",
    "rsquo": "’",
    "rsquor": "’",
    "rthree": "⋌",
    "rtimes": "⋊",
    "rtri": "▹",
    "rtrie": "⊵",
    "rtrif": "▸",
    "rtriltri": "⧎",
    "ruluhar": "⥨",
    "rx": "℞",
    "sacute": "ś",
    "sbquo": "‚",
    "sc": "≻",
    "scE": "⪴",
    "scap": "⪸",
    "scaron": "š",
    "sccue": "≽",
    "sce": "⪰",
    "scedil": "ş",
    "scirc": "ŝ",
    "scnE": "⪶",
    "scnap": "⪺",
    "scnsim": "⋩",
    "scpolint": "⨓",
    "scsim": "≿",
    "scy": "с",
    "sdot": "⋅",
    "sdotb": "⊡",
    "sdote": "⩦",
    "seArr": "⇘",
    "searhk": "⤥",
    "searr": "↘",
    "searrow": "↘",
    "sect": "§",
    "semi": ";",
    "seswar": "⤩",
    "setminus": "∖",
    "setmn": "∖",
    "sext": "✶",
    "sfr": "𝔰",
    "sfrown": "⌢",
    "sharp": "♯",
    "shchcy": "щ",
    "shcy": "ш",
    "shortmid": "∣",
    "shortparallel": "∥",
    "shy": "­",
    "sigma": "σ",
    "sigmaf": "ς",
    "sigmav": "ς",
    "sim": "∼",
    "simdot": "⩪",
    "sime": "≃",
    "simeq": "≃",
    "simg": "⪞",
    "simgE": "⪠",
    "siml": "⪝",
    "simlE": "⪟",
    "simne": "≆",
    "simplus": "⨤",
    "simrarr": "⥲",
    "slarr": "←",
    "smallsetminus": "∖",
    "smashp": "⨳",
    "smeparsl": "⧤",
    "smid": "∣",
    "smile": "⌣",
    "smt": "⪪",
    "smte": "⪬",
    "smtes": "⪬︀",
    "softcy": "ь",
    "sol": "/",
    "solb": "⧄",
    "solbar": "⌿",
    "sopf": "𝕤",
    "spades": "♠",
    "spadesuit": "♠",
    "spar": "∥",
    "sqcap": "⊓",
    "sqcaps": "⊓︀",
    "sqcup": "⊔",
    "sqcups": "⊔︀",
    "sqsub": "⊏",
    "sqsube": "⊑",
    "sqsubset": "⊏",
    "sqsubseteq": "⊑",
    "sqsup": "⊐",
    "sqsupe": "⊒",
    "sqsupset": "⊐",
    "sqsupseteq": "⊒",
    "squ": "□",
    "square": "□",
    "squarf": "▪",
    "squf": "▪",
    "srarr": "→",
    "sscr": "𝓈",
    "ssetmn": "∖",
    "ssmile": "⌣",
    "sstarf": "⋆",
    "star": "☆",
    "starf": "★",
    "straightepsilon": "ϵ",
    "straightphi": "ϕ",
    "strns": "¯",
    "sub": "⊂",
    "subE": "⫅",
    "subdot": "⪽",
    "sube": "⊆",
    "subedot": "⫃",
    "submult": "⫁",
    "subnE": "⫋",
    "subne": "⊊",
    "subplus": "⪿",
    "subrarr": "⥹",
    "subset": "⊂",
    "subseteq": "⊆",
    "subseteqq": "⫅",
    "subsetneq": "⊊",
    "subsetneqq": "⫋",
    "subsim": "⫇",
    "subsub": "⫕",
    "subsup": "⫓",
    "succ": "≻",
    "succapprox": "⪸",
    "succcurlyeq": "≽",
    "succeq": "⪰",
    "succnapprox": "⪺",
    "succneqq": "⪶",
    "succnsim": "⋩",
    "succsim": "≿",
    "sum": "∑",
    "sung": "♪",
    "sup1": "¹",
    "sup2": "²",
    "sup3": "³",
    "sup": "⊃",
    "supE": "⫆",
    "supdot": "⪾",
    "supdsub": "⫘",
    "supe": "⊇",
    "supedot": "⫄",
    "suphsol": "⟉",
    "suphsub": "⫗",
    "suplarr": "⥻",
    "supmult": "⫂",
    "supnE": "⫌",
    "supne": "⊋",
    "supplus": "⫀",
    "supset": "⊃",
    "supseteq": "⊇",
    "supseteqq": "⫆",
    "supsetneq": "⊋",
    "supsetneqq": "⫌",
    "supsim": "⫈",
    "supsub": "⫔",
    "supsup": "⫖",
    "swArr": "⇙",
    "swarhk": "⤦",
    "swarr": "↙",
    "swarrow": "↙",
    "swnwar": "⤪",
    "szlig": "ß",
    "target": "⌖",
    "tau": "τ",
    "tbrk": "⎴",
    "tcaron": "ť",
    "tcedil": "ţ",
    "tcy": "т",
    "tdot": "⃛",
    "telrec": "⌕",
    "tfr": "𝔱",
    "there4": "∴",
    "therefore": "∴",
    "theta": "θ",
    "thetasym": "ϑ",
    "thetav": "ϑ",
    "thickapprox": "≈",
    "thicksim": "∼",
    "thinsp": " ",
    "thkap": "≈",
    "thksim": "∼",
    "thorn": "þ",
    "tilde": "˜",
    "times": "×",
    "timesb": "⊠",
    "timesbar": "⨱",
    "timesd": "⨰",
    "tint": "∭",
    "toea": "⤨",
    "top": "⊤",
    "topbot": "⌶",
    "topcir": "⫱",
    "topf": "𝕥",
    "topfork": "⫚",
    "tosa": "⤩",
    "tprime": "‴",
    "trade": "™",
    "triangle": "▵",
    "triangledown": "▿",
    "triangleleft": "◃",
    "trianglelefteq": "⊴",
    "triangleq": "≜",
    "triangleright": "▹",
    "trianglerighteq": "⊵",
    "tridot": "◬",
    "trie": "≜",
    "triminus": "⨺",
    "triplus": "⨹",
    "trisb": "⧍",
    "tritime": "⨻",
    "trpezium": "⏢",
    "tscr": "𝓉",
    "tscy": "ц",
    "tshcy": "ћ",
    "tstrok": "ŧ",
    "twixt": "≬",
    "twoheadleftarrow": "↞",
    "twoheadrightarrow": "↠",
    "uArr": "⇑",
    "uHar": "⥣",
    "uacute": "ú",
    "uarr": "↑",
    "ubrcy": "ў",
    "ubreve": "ŭ",
    "ucirc": "û",
    "ucy": "у",
    "udarr": "⇅",
    "udblac": "ű",
    "udhar": "⥮",
    "ufisht": "⥾",
    "ufr": "𝔲",
    "ugrave": "ù",
    "uharl": "↿",
    "uharr": "↾",
    "uhblk": "▀",
    "ulcorn": "⌜",
    "ulcorner": "⌜",
    "ulcrop": "⌏",
    "ultri": "◸",
    "umacr": "ū",
    "uml": "¨",
    "uogon": "ų",
    "uopf": "𝕦",
    "uparrow": "↑",
    "updownarrow": "↕",
    "upharpoonleft": "↿",
    "upharpoonright": "↾",
    "uplus": "⊎",
    "upsi": "υ",
    "upsih": "ϒ",
    "upsilon": "υ",
    "upuparrows": "⇈",
    "urcorn": "⌝",
    "urcorner": "⌝",
    "urcrop": "⌎",
    "uring": "ů",
    "urtri": "◹",
    "uscr": "𝓊",
    "utdot": "⋰",
    "utilde": "ũ",
    "utri": "▵",
    "utrif": "▴",
    "uuarr": "⇈",
    "uuml": "ü",
    "uwangle": "⦧",
    "vArr": "⇕",
    "vBar": "⫨",
    "vBarv": "⫩",
    "vDash": "⊨",
    "vangrt": "⦜",
    "varepsilon": "ϵ",
    "varkappa": "ϰ",
    "varnothing": "∅",
    "varphi": "ϕ",
    "varpi": "ϖ",
    "varpropto": "∝",
    "varr": "↕",
    "varrho": "ϱ",
    "varsigma": "ς",
    "varsubsetneq": "⊊︀",
    "varsubsetneqq": "⫋︀",
    "varsupsetneq": "⊋︀",
    "varsupsetneqq": "⫌︀",
    "vartheta": "ϑ",
    "vartriangleleft": "⊲",
    "vartriangleright": "⊳",
    "vcy": "в",
    "vdash": "⊢",
    "vee": "∨",
    "veebar": "⊻",
    "veeeq": "≚",
    "vellip": "⋮",
    "verbar": "|",
    "vert": "|",
    "vfr": "𝔳",
    "vltri": "⊲",
    "vnsub": "⊂⃒",
    "vnsup": "⊃⃒",
    "vopf": "𝕧",
    "vprop": "∝",
    "vrtri": "⊳",
    "vscr": "𝓋",
    "vsubnE": "⫋︀",
    "vsubne": "⊊︀",
    "vsupnE": "⫌︀",
    "vsupne": "⊋︀",
    "vzigzag": "⦚",
    "wcirc": "ŵ",
    "wedbar": "⩟",
    "wedge": "∧",
    "wedgeq": "≙",
    "weierp": "℘",
    "wfr": "𝔴",
    "wopf": "𝕨",
    "wp": "℘",
    "wr": "≀",
    "wreath": "≀",
    "wscr": "𝓌",
    "xcap": "⋂",
    "xcirc": "◯",
    "xcup": "⋃",
    "xdtri": "▽",
    "xfr": "𝔵",
    "xhArr": "⟺",
    "xharr": "⟷",
    "xi": "ξ",
    "xlArr": "⟸",
    "xlarr": "⟵",
    "xmap": "⟼",
    "xnis": "⋻",
    "xodot": "⨀",
    "xopf": "𝕩",
    "xoplus": "⨁",
    "xotime": "⨂",
    "xrArr": "⟹",
    "xrarr": "⟶",
    "xscr": "𝓍",
    "xsqcup": "⨆",
    "xuplus": "⨄",
    "xutri": "△",
    "xvee": "⋁",
    "xwedge": "⋀",
    "yacute": "ý",
    "yacy": "я",
    "ycirc": "ŷ",
    "ycy": "ы",
    "yen": "¥",
    "yfr": "𝔶",
    "yicy": "ї",
    "yopf": "𝕪",
    "yscr": "𝓎",
    "yucy": "ю",
    "yuml": "ÿ",
    "zacute": "ź",
    "zcaron": "ž",
    "zcy": "з",
    "zdot": "ż",
    "zeetrf": "ℨ",
    "zeta": "ζ",
    "zfr": "𝔷",
    "zhcy": "ж",
    "zigrarr": "⇝",
    "zopf": "𝕫",
    "zscr": "𝓏",
    "zwj": "‍",
    "zwnj": "‌"
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:character-entities@1.0.0/index", ["npm:character-entities@1.0.0/index.json!github:systemjs/plugin-json@0.1.0"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:character-entities@1.0.0/index.json!github:systemjs/plugin-json@0.1.0');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:character-entities@1.0.0", ["npm:character-entities@1.0.0/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:character-entities@1.0.0/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:character-entities-legacy@1.0.0/index.json!github:systemjs/plugin-json@0.1.0", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "AElig": "Æ",
    "AMP": "&",
    "Aacute": "Á",
    "Acirc": "Â",
    "Agrave": "À",
    "Aring": "Å",
    "Atilde": "Ã",
    "Auml": "Ä",
    "COPY": "©",
    "Ccedil": "Ç",
    "ETH": "Ð",
    "Eacute": "É",
    "Ecirc": "Ê",
    "Egrave": "È",
    "Euml": "Ë",
    "GT": ">",
    "Iacute": "Í",
    "Icirc": "Î",
    "Igrave": "Ì",
    "Iuml": "Ï",
    "LT": "<",
    "Ntilde": "Ñ",
    "Oacute": "Ó",
    "Ocirc": "Ô",
    "Ograve": "Ò",
    "Oslash": "Ø",
    "Otilde": "Õ",
    "Ouml": "Ö",
    "QUOT": "\"",
    "REG": "®",
    "THORN": "Þ",
    "Uacute": "Ú",
    "Ucirc": "Û",
    "Ugrave": "Ù",
    "Uuml": "Ü",
    "Yacute": "Ý",
    "aacute": "á",
    "acirc": "â",
    "acute": "´",
    "aelig": "æ",
    "agrave": "à",
    "amp": "&",
    "aring": "å",
    "atilde": "ã",
    "auml": "ä",
    "brvbar": "¦",
    "ccedil": "ç",
    "cedil": "¸",
    "cent": "¢",
    "copy": "©",
    "curren": "¤",
    "deg": "°",
    "divide": "÷",
    "eacute": "é",
    "ecirc": "ê",
    "egrave": "è",
    "eth": "ð",
    "euml": "ë",
    "frac12": "½",
    "frac14": "¼",
    "frac34": "¾",
    "gt": ">",
    "iacute": "í",
    "icirc": "î",
    "iexcl": "¡",
    "igrave": "ì",
    "iquest": "¿",
    "iuml": "ï",
    "laquo": "«",
    "lt": "<",
    "macr": "¯",
    "micro": "µ",
    "middot": "·",
    "nbsp": " ",
    "not": "¬",
    "ntilde": "ñ",
    "oacute": "ó",
    "ocirc": "ô",
    "ograve": "ò",
    "ordf": "ª",
    "ordm": "º",
    "oslash": "ø",
    "otilde": "õ",
    "ouml": "ö",
    "para": "¶",
    "plusmn": "±",
    "pound": "£",
    "quot": "\"",
    "raquo": "»",
    "reg": "®",
    "sect": "§",
    "shy": "­",
    "sup1": "¹",
    "sup2": "²",
    "sup3": "³",
    "szlig": "ß",
    "thorn": "þ",
    "times": "×",
    "uacute": "ú",
    "ucirc": "û",
    "ugrave": "ù",
    "uml": "¨",
    "uuml": "ü",
    "yacute": "ý",
    "yen": "¥",
    "yuml": "ÿ"
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:character-entities-legacy@1.0.0/index", ["npm:character-entities-legacy@1.0.0/index.json!github:systemjs/plugin-json@0.1.0"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:character-entities-legacy@1.0.0/index.json!github:systemjs/plugin-json@0.1.0');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:character-entities-legacy@1.0.0", ["npm:character-entities-legacy@1.0.0/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:character-entities-legacy@1.0.0/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:character-reference-invalid@1.0.0/index.json!github:systemjs/plugin-json@0.1.0", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "0": "�",
    "128": "€",
    "130": "‚",
    "131": "ƒ",
    "132": "„",
    "133": "…",
    "134": "†",
    "135": "‡",
    "136": "ˆ",
    "137": "‰",
    "138": "Š",
    "139": "‹",
    "140": "Œ",
    "142": "Ž",
    "145": "‘",
    "146": "’",
    "147": "“",
    "148": "”",
    "149": "•",
    "150": "–",
    "151": "—",
    "152": "˜",
    "153": "™",
    "154": "š",
    "155": "›",
    "156": "œ",
    "158": "ž",
    "159": "Ÿ"
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:character-reference-invalid@1.0.0/index", ["npm:character-reference-invalid@1.0.0/index.json!github:systemjs/plugin-json@0.1.0"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:character-reference-invalid@1.0.0/index.json!github:systemjs/plugin-json@0.1.0');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:character-reference-invalid@1.0.0", ["npm:character-reference-invalid@1.0.0/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:character-reference-invalid@1.0.0/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:parse-entities@1.0.2/index", ["npm:character-entities@1.0.0", "npm:character-entities-legacy@1.0.0", "npm:character-reference-invalid@1.0.0"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var characterEntities = $__require('npm:character-entities@1.0.0');
  var legacy = $__require('npm:character-entities-legacy@1.0.0');
  var invalid = $__require('npm:character-reference-invalid@1.0.0');
  var fromCharCode = String.fromCharCode;
  var has = Object.prototype.hasOwnProperty;
  var noop = Function.prototype;
  var NAMED = 'named';
  var HEXADECIMAL = 'hexadecimal';
  var DECIMAL = 'decimal';
  var BASE = {};
  BASE[HEXADECIMAL] = 16;
  BASE[DECIMAL] = 10;
  var NUMERIC_REFERENCE = 'Numeric character references';
  var NAMED_REFERENCE = 'Named character references';
  var TERMINATED = ' must be terminated by a semicolon';
  var VOID = ' cannot be empty';
  var NAMED_NOT_TERMINATED = 1;
  var NUMERIC_NOT_TERMINATED = 2;
  var NAMED_EMPTY = 3;
  var NUMERIC_EMPTY = 4;
  var NAMED_UNKNOWN = 5;
  var NUMERIC_DISALLOWED = 6;
  var NUMERIC_PROHIBITED = 7;
  var MESSAGES = {};
  MESSAGES[NAMED_NOT_TERMINATED] = NAMED_REFERENCE + TERMINATED;
  MESSAGES[NUMERIC_NOT_TERMINATED] = NUMERIC_REFERENCE + TERMINATED;
  MESSAGES[NAMED_EMPTY] = NAMED_REFERENCE + VOID;
  MESSAGES[NUMERIC_EMPTY] = NUMERIC_REFERENCE + VOID;
  MESSAGES[NAMED_UNKNOWN] = NAMED_REFERENCE + ' must be known';
  MESSAGES[NUMERIC_DISALLOWED] = NUMERIC_REFERENCE + ' cannot be disallowed';
  MESSAGES[NUMERIC_PROHIBITED] = NUMERIC_REFERENCE + ' cannot be outside the ' + 'permissible Unicode range';
  var REPLACEMENT = '\uFFFD';
  var FORM_FEED = '\f';
  var AMPERSAND = '&';
  var OCTOTHORP = '#';
  var SEMICOLON = ';';
  var NEWLINE = '\n';
  var X_LOWER = 'x';
  var X_UPPER = 'X';
  var SPACE = ' ';
  var LESS_THAN = '<';
  var EQUAL = '=';
  var EMPTY = '';
  var TAB = '\t';
  function charCode(character) {
    return character.charCodeAt(0);
  }
  function isDecimal(character) {
    var code = charCode(character);
    return code >= 48 && code <= 57;
  }
  function isHexadecimal(character) {
    var code = charCode(character);
    return (code >= 48 && code <= 57) || (code >= 65 && code <= 70) || (code >= 97 && code <= 102);
  }
  function isAlphanumeric(character) {
    var code = charCode(character);
    return (code >= 48 && code <= 57) || (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
  }
  function isProhibited(characterCode) {
    return (characterCode >= 0xD800 && characterCode <= 0xDFFF) || (characterCode > 0x10FFFF);
  }
  function isWarning(characterCode) {
    return (characterCode >= 0x0001 && characterCode <= 0x0008) || (characterCode >= 0x000D && characterCode <= 0x001F) || (characterCode >= 0x007F && characterCode <= 0x009F) || (characterCode >= 0xFDD0 && characterCode <= 0xFDEF) || characterCode === 0x000B || characterCode === 0xFFFE || characterCode === 0xFFFF || characterCode === 0x1FFFE || characterCode === 0x1FFFF || characterCode === 0x2FFFE || characterCode === 0x2FFFF || characterCode === 0x3FFFE || characterCode === 0x3FFFF || characterCode === 0x4FFFE || characterCode === 0x4FFFF || characterCode === 0x5FFFE || characterCode === 0x5FFFF || characterCode === 0x6FFFE || characterCode === 0x6FFFF || characterCode === 0x7FFFE || characterCode === 0x7FFFF || characterCode === 0x8FFFE || characterCode === 0x8FFFF || characterCode === 0x9FFFE || characterCode === 0x9FFFF || characterCode === 0xAFFFE || characterCode === 0xAFFFF || characterCode === 0xBFFFE || characterCode === 0xBFFFF || characterCode === 0xCFFFE || characterCode === 0xCFFFF || characterCode === 0xDFFFE || characterCode === 0xDFFFF || characterCode === 0xEFFFE || characterCode === 0xEFFFF || characterCode === 0xFFFFE || characterCode === 0xFFFFF || characterCode === 0x10FFFE || characterCode === 0x10FFFF;
  }
  var TESTS = {};
  TESTS[NAMED] = isAlphanumeric;
  TESTS[DECIMAL] = isDecimal;
  TESTS[HEXADECIMAL] = isHexadecimal;
  function parse(value, settings) {
    var additional = settings.additional;
    var handleText = settings.text;
    var handleReference = settings.reference;
    var handleWarning = settings.warning;
    var textContext = settings.textContext;
    var referenceContext = settings.referenceContext;
    var warningContext = settings.warningContext;
    var pos = settings.position;
    var indent = settings.indent || [];
    var length = value.length;
    var index = 0;
    var lines = -1;
    var column = pos.column || 1;
    var line = pos.line || 1;
    var queue = EMPTY;
    var result = [];
    var entityCharacters;
    var terminated;
    var characters;
    var character;
    var reference;
    var following;
    var warning;
    var reason;
    var output;
    var entity;
    var begin;
    var start;
    var type;
    var test;
    var prev;
    var next;
    var diff;
    var end;
    function now() {
      return {
        'line': line,
        'column': column,
        'offset': index + (pos.offset || 0)
      };
    }
    function parseError(code, offset) {
      var position = now();
      position.column += offset;
      position.offset += offset;
      handleWarning.call(warningContext, MESSAGES[code], position, code);
    }
    function at(position) {
      return value.charAt(position);
    }
    function flush() {
      if (queue) {
        result.push(queue);
        if (handleText) {
          handleText.call(textContext, queue, {
            'start': prev,
            'end': now()
          });
        }
        queue = EMPTY;
      }
    }
    prev = now();
    warning = handleWarning ? parseError : noop;
    index--;
    length++;
    while (++index < length) {
      if (character === NEWLINE) {
        column = indent[lines] || 1;
      }
      character = at(index);
      if (character !== AMPERSAND) {
        if (character === NEWLINE) {
          line++;
          lines++;
          column = 0;
        }
        if (character) {
          queue += character;
          column++;
        } else {
          flush();
        }
      } else {
        following = at(index + 1);
        if (following === TAB || following === NEWLINE || following === FORM_FEED || following === SPACE || following === LESS_THAN || following === AMPERSAND || following === EMPTY || (additional && following === additional)) {
          queue += character;
          column++;
          continue;
        }
        start = begin = end = index + 1;
        if (following !== OCTOTHORP) {
          type = NAMED;
        } else {
          end = ++begin;
          following = at(end);
          if (following === X_LOWER || following === X_UPPER) {
            type = HEXADECIMAL;
            end = ++begin;
          } else {
            type = DECIMAL;
          }
        }
        entityCharacters = entity = characters = EMPTY;
        test = TESTS[type];
        end--;
        while (++end < length) {
          following = at(end);
          if (!test(following)) {
            break;
          }
          characters += following;
          if (type === NAMED && has.call(legacy, characters)) {
            entityCharacters = characters;
            entity = legacy[characters];
          }
        }
        terminated = at(end) === SEMICOLON;
        if (terminated) {
          end++;
          if (type === NAMED && has.call(characterEntities, characters)) {
            entityCharacters = characters;
            entity = characterEntities[characters];
          }
        }
        diff = 1 + end - start;
        if (!characters) {
          if (type !== NAMED) {
            warning(NUMERIC_EMPTY, diff);
          }
        } else if (type === NAMED) {
          if (terminated && !entity) {
            warning(NAMED_UNKNOWN, 1);
          } else {
            if (entityCharacters !== characters) {
              end = begin + entityCharacters.length;
              diff = 1 + end - begin;
              terminated = false;
            }
            if (!terminated) {
              reason = entityCharacters ? NAMED_NOT_TERMINATED : NAMED_EMPTY;
              if (!settings.attribute) {
                warning(reason, diff);
              } else {
                following = at(end);
                if (following === EQUAL) {
                  warning(reason, diff);
                  entity = null;
                } else if (isAlphanumeric(following)) {
                  entity = null;
                } else {
                  warning(reason, diff);
                }
              }
            }
          }
          reference = entity;
        } else {
          if (!terminated) {
            warning(NUMERIC_NOT_TERMINATED, diff);
          }
          reference = parseInt(characters, BASE[type]);
          if (isProhibited(reference)) {
            warning(NUMERIC_PROHIBITED, diff);
            reference = REPLACEMENT;
          } else if (reference in invalid) {
            warning(NUMERIC_DISALLOWED, diff);
            reference = invalid[reference];
          } else {
            output = EMPTY;
            if (isWarning(reference)) {
              warning(NUMERIC_DISALLOWED, diff);
            }
            if (reference > 0xFFFF) {
              reference -= 0x10000;
              output += fromCharCode(reference >>> 10 & 0x3FF | 0xD800);
              reference = 0xDC00 | reference & 0x3FF;
            }
            reference = output + fromCharCode(reference);
          }
        }
        if (!reference) {
          characters = value.slice(start - 1, end);
          queue += characters;
          column += characters.length;
          index = end - 1;
        } else {
          flush();
          prev = now();
          index = end - 1;
          column += end - start + 1;
          result.push(reference);
          next = now();
          next.offset++;
          if (handleReference) {
            handleReference.call(referenceContext, reference, {
              'start': prev,
              'end': next
            }, value.slice(start - 1, end));
          }
          prev = next;
        }
      }
    }
    return result.join(EMPTY);
  }
  var defaults = {
    'warning': null,
    'reference': null,
    'text': null,
    'warningContext': null,
    'referenceContext': null,
    'textContext': null,
    'position': {},
    'additional': null,
    'attribute': false
  };
  function wrapper(value, options) {
    var settings = {};
    var key;
    if (!options) {
      options = {};
    }
    for (key in defaults) {
      settings[key] = options[key] || defaults[key];
    }
    if (settings.position.indent || settings.position.start) {
      settings.indent = settings.position.indent || [];
      settings.position = settings.position.start;
    }
    return parse(value, settings);
  }
  module.exports = wrapper;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:parse-entities@1.0.2", ["npm:parse-entities@1.0.2/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:parse-entities@1.0.2/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:character-entities-html4@1.0.0/index.json!github:systemjs/plugin-json@0.1.0", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "nbsp": " ",
    "iexcl": "¡",
    "cent": "¢",
    "pound": "£",
    "curren": "¤",
    "yen": "¥",
    "brvbar": "¦",
    "sect": "§",
    "uml": "¨",
    "copy": "©",
    "ordf": "ª",
    "laquo": "«",
    "not": "¬",
    "shy": "­",
    "reg": "®",
    "macr": "¯",
    "deg": "°",
    "plusmn": "±",
    "sup2": "²",
    "sup3": "³",
    "acute": "´",
    "micro": "µ",
    "para": "¶",
    "middot": "·",
    "cedil": "¸",
    "sup1": "¹",
    "ordm": "º",
    "raquo": "»",
    "frac14": "¼",
    "frac12": "½",
    "frac34": "¾",
    "iquest": "¿",
    "Agrave": "À",
    "Aacute": "Á",
    "Acirc": "Â",
    "Atilde": "Ã",
    "Auml": "Ä",
    "Aring": "Å",
    "AElig": "Æ",
    "Ccedil": "Ç",
    "Egrave": "È",
    "Eacute": "É",
    "Ecirc": "Ê",
    "Euml": "Ë",
    "Igrave": "Ì",
    "Iacute": "Í",
    "Icirc": "Î",
    "Iuml": "Ï",
    "ETH": "Ð",
    "Ntilde": "Ñ",
    "Ograve": "Ò",
    "Oacute": "Ó",
    "Ocirc": "Ô",
    "Otilde": "Õ",
    "Ouml": "Ö",
    "times": "×",
    "Oslash": "Ø",
    "Ugrave": "Ù",
    "Uacute": "Ú",
    "Ucirc": "Û",
    "Uuml": "Ü",
    "Yacute": "Ý",
    "THORN": "Þ",
    "szlig": "ß",
    "agrave": "à",
    "aacute": "á",
    "acirc": "â",
    "atilde": "ã",
    "auml": "ä",
    "aring": "å",
    "aelig": "æ",
    "ccedil": "ç",
    "egrave": "è",
    "eacute": "é",
    "ecirc": "ê",
    "euml": "ë",
    "igrave": "ì",
    "iacute": "í",
    "icirc": "î",
    "iuml": "ï",
    "eth": "ð",
    "ntilde": "ñ",
    "ograve": "ò",
    "oacute": "ó",
    "ocirc": "ô",
    "otilde": "õ",
    "ouml": "ö",
    "divide": "÷",
    "oslash": "ø",
    "ugrave": "ù",
    "uacute": "ú",
    "ucirc": "û",
    "uuml": "ü",
    "yacute": "ý",
    "thorn": "þ",
    "yuml": "ÿ",
    "fnof": "ƒ",
    "Alpha": "Α",
    "Beta": "Β",
    "Gamma": "Γ",
    "Delta": "Δ",
    "Epsilon": "Ε",
    "Zeta": "Ζ",
    "Eta": "Η",
    "Theta": "Θ",
    "Iota": "Ι",
    "Kappa": "Κ",
    "Lambda": "Λ",
    "Mu": "Μ",
    "Nu": "Ν",
    "Xi": "Ξ",
    "Omicron": "Ο",
    "Pi": "Π",
    "Rho": "Ρ",
    "Sigma": "Σ",
    "Tau": "Τ",
    "Upsilon": "Υ",
    "Phi": "Φ",
    "Chi": "Χ",
    "Psi": "Ψ",
    "Omega": "Ω",
    "alpha": "α",
    "beta": "β",
    "gamma": "γ",
    "delta": "δ",
    "epsilon": "ε",
    "zeta": "ζ",
    "eta": "η",
    "theta": "θ",
    "iota": "ι",
    "kappa": "κ",
    "lambda": "λ",
    "mu": "μ",
    "nu": "ν",
    "xi": "ξ",
    "omicron": "ο",
    "pi": "π",
    "rho": "ρ",
    "sigmaf": "ς",
    "sigma": "σ",
    "tau": "τ",
    "upsilon": "υ",
    "phi": "φ",
    "chi": "χ",
    "psi": "ψ",
    "omega": "ω",
    "thetasym": "ϑ",
    "upsih": "ϒ",
    "piv": "ϖ",
    "bull": "•",
    "hellip": "…",
    "prime": "′",
    "Prime": "″",
    "oline": "‾",
    "frasl": "⁄",
    "weierp": "℘",
    "image": "ℑ",
    "real": "ℜ",
    "trade": "™",
    "alefsym": "ℵ",
    "larr": "←",
    "uarr": "↑",
    "rarr": "→",
    "darr": "↓",
    "harr": "↔",
    "crarr": "↵",
    "lArr": "⇐",
    "uArr": "⇑",
    "rArr": "⇒",
    "dArr": "⇓",
    "hArr": "⇔",
    "forall": "∀",
    "part": "∂",
    "exist": "∃",
    "empty": "∅",
    "nabla": "∇",
    "isin": "∈",
    "notin": "∉",
    "ni": "∋",
    "prod": "∏",
    "sum": "∑",
    "minus": "−",
    "lowast": "∗",
    "radic": "√",
    "prop": "∝",
    "infin": "∞",
    "ang": "∠",
    "and": "∧",
    "or": "∨",
    "cap": "∩",
    "cup": "∪",
    "int": "∫",
    "there4": "∴",
    "sim": "∼",
    "cong": "≅",
    "asymp": "≈",
    "ne": "≠",
    "equiv": "≡",
    "le": "≤",
    "ge": "≥",
    "sub": "⊂",
    "sup": "⊃",
    "nsub": "⊄",
    "sube": "⊆",
    "supe": "⊇",
    "oplus": "⊕",
    "otimes": "⊗",
    "perp": "⊥",
    "sdot": "⋅",
    "lceil": "⌈",
    "rceil": "⌉",
    "lfloor": "⌊",
    "rfloor": "⌋",
    "lang": "〈",
    "rang": "〉",
    "loz": "◊",
    "spades": "♠",
    "clubs": "♣",
    "hearts": "♥",
    "diams": "♦",
    "quot": "\"",
    "amp": "&",
    "lt": "<",
    "gt": ">",
    "OElig": "Œ",
    "oelig": "œ",
    "Scaron": "Š",
    "scaron": "š",
    "Yuml": "Ÿ",
    "circ": "ˆ",
    "tilde": "˜",
    "ensp": " ",
    "emsp": " ",
    "thinsp": " ",
    "zwnj": "‌",
    "zwj": "‍",
    "lrm": "‎",
    "rlm": "‏",
    "ndash": "–",
    "mdash": "—",
    "lsquo": "‘",
    "rsquo": "’",
    "sbquo": "‚",
    "ldquo": "“",
    "rdquo": "”",
    "bdquo": "„",
    "dagger": "†",
    "Dagger": "‡",
    "permil": "‰",
    "lsaquo": "‹",
    "rsaquo": "›",
    "euro": "€"
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:character-entities-html4@1.0.0/index", ["npm:character-entities-html4@1.0.0/index.json!github:systemjs/plugin-json@0.1.0"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:character-entities-html4@1.0.0/index.json!github:systemjs/plugin-json@0.1.0');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:character-entities-html4@1.0.0", ["npm:character-entities-html4@1.0.0/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:character-entities-html4@1.0.0/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:stringify-entities@1.0.1/lib/expression", [], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = /[ ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿƒΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρςστυφχψωϑϒϖ•…′″‾⁄℘ℑℜ™ℵ←↑→↓↔↵⇐⇑⇒⇓⇔∀∂∃∅∇∈∉∋∏∑−∗√∝∞∠∧∨∩∪∫∴∼≅≈≠≡≤≥⊂⊃⊄⊆⊇⊕⊗⊥⋅⌈⌉⌊⌋〈〉◊♠♣♥♦ŒœŠšŸˆ˜   ‌‍‎‏–—‘’‚“”„†‡‰‹›€]/g;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:stringify-entities@1.0.1/index", ["npm:character-entities-html4@1.0.0", "npm:stringify-entities@1.0.1/lib/expression"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var entities = $__require('npm:character-entities-html4@1.0.0');
  var EXPRESSION_NAMED = $__require('npm:stringify-entities@1.0.1/lib/expression');
  var has = {}.hasOwnProperty;
  var escapes = ['"', '\'', '<', '>', '&', '`'];
  var characters = {};
  (function() {
    var name;
    for (name in entities) {
      characters[entities[name]] = name;
    }
  })();
  var EXPRESSION_ESCAPE = new RegExp('[' + escapes.join('') + ']', 'g');
  var EXPRESSION_SURROGATE_PAIR = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
  var EXPRESSION_BMP = /[\x01-\t\x0B\f\x0E-\x1F\x7F\x81\x8D\x8F\x90\x9D\xA0-\uFFFF]/g;
  function characterCodeToHexadecimalReference(code) {
    return '&#x' + code.toString(16).toUpperCase() + ';';
  }
  function characterToHexadecimalReference(character) {
    return characterCodeToHexadecimalReference(character.charCodeAt(0));
  }
  function toNamedEntity(name) {
    return '&' + name + ';';
  }
  function characterToNamedEntity(character) {
    return toNamedEntity(characters[character]);
  }
  function encode(value, options) {
    var settings = options || {};
    var escapeOnly = settings.escapeOnly;
    var named = settings.useNamedReferences;
    var map = named ? characters : null;
    value = value.replace(EXPRESSION_ESCAPE, function(character) {
      return map && has.call(map, character) ? toNamedEntity(map[character]) : characterToHexadecimalReference(character);
    });
    if (escapeOnly) {
      return value;
    }
    if (named) {
      value = value.replace(EXPRESSION_NAMED, characterToNamedEntity);
    }
    return value.replace(EXPRESSION_SURROGATE_PAIR, function(pair) {
      return characterCodeToHexadecimalReference((pair.charCodeAt(0) - 0xD800) * 0x400 + pair.charCodeAt(1) - 0xDC00 + 0x10000);
    }).replace(EXPRESSION_BMP, characterToHexadecimalReference);
  }
  function escape(value) {
    return encode(value, {
      'escapeOnly': true,
      'useNamedReferences': true
    });
  }
  encode.escape = escape;
  module.exports = encode;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:stringify-entities@1.0.1", ["npm:stringify-entities@1.0.1/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:stringify-entities@1.0.1/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:markdown-table@0.4.0/index", [], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var EXPRESSION_DOT = /\./;
  var EXPRESSION_LAST_DOT = /\.[^.]*$/;
  var LEFT = 'l';
  var RIGHT = 'r';
  var CENTER = 'c';
  var DOT = '.';
  var NULL = '';
  var ALLIGNMENT = [LEFT, RIGHT, CENTER, DOT, NULL];
  var COLON = ':';
  var DASH = '-';
  var PIPE = '|';
  var SPACE = ' ';
  var NEW_LINE = '\n';
  function lengthNoop(value) {
    return String(value).length;
  }
  function pad(length, character) {
    return Array(length + 1).join(character || SPACE);
  }
  function dotindex(value) {
    var match = EXPRESSION_LAST_DOT.exec(value);
    return match ? match.index + 1 : value.length;
  }
  function markdownTable(table, options) {
    var settings = options || {};
    var delimiter = settings.delimiter;
    var start = settings.start;
    var end = settings.end;
    var alignment = settings.align;
    var calculateStringLength = settings.stringLength || lengthNoop;
    var cellCount = 0;
    var rowIndex = -1;
    var rowLength = table.length;
    var sizes = [];
    var align;
    var rule;
    var rows;
    var row;
    var cells;
    var index;
    var position;
    var size;
    var value;
    var spacing;
    var before;
    var after;
    alignment = alignment ? alignment.concat() : [];
    if (delimiter === null || delimiter === undefined) {
      delimiter = SPACE + PIPE + SPACE;
    }
    if (start === null || start === undefined) {
      start = PIPE + SPACE;
    }
    if (end === null || end === undefined) {
      end = SPACE + PIPE;
    }
    while (++rowIndex < rowLength) {
      row = table[rowIndex];
      index = -1;
      if (row.length > cellCount) {
        cellCount = row.length;
      }
      while (++index < cellCount) {
        position = row[index] ? dotindex(row[index]) : null;
        if (!sizes[index]) {
          sizes[index] = 3;
        }
        if (position > sizes[index]) {
          sizes[index] = position;
        }
      }
    }
    if (typeof alignment === 'string') {
      alignment = pad(cellCount, alignment).split('');
    }
    index = -1;
    while (++index < cellCount) {
      align = alignment[index];
      if (typeof align === 'string') {
        align = align.charAt(0).toLowerCase();
      }
      if (ALLIGNMENT.indexOf(align) === -1) {
        align = NULL;
      }
      alignment[index] = align;
    }
    rowIndex = -1;
    rows = [];
    while (++rowIndex < rowLength) {
      row = table[rowIndex];
      index = -1;
      cells = [];
      while (++index < cellCount) {
        value = row[index];
        if (value === null || value === undefined) {
          value = '';
        } else {
          value = String(value);
        }
        if (alignment[index] !== DOT) {
          cells[index] = value;
        } else {
          position = dotindex(value);
          size = sizes[index] + (EXPRESSION_DOT.test(value) ? 0 : 1) - (calculateStringLength(value) - position);
          cells[index] = value + pad(size - 1);
        }
      }
      rows[rowIndex] = cells;
    }
    sizes = [];
    rowIndex = -1;
    while (++rowIndex < rowLength) {
      cells = rows[rowIndex];
      index = -1;
      while (++index < cellCount) {
        value = cells[index];
        if (!sizes[index]) {
          sizes[index] = 3;
        }
        size = calculateStringLength(value);
        if (size > sizes[index]) {
          sizes[index] = size;
        }
      }
    }
    rowIndex = -1;
    while (++rowIndex < rowLength) {
      cells = rows[rowIndex];
      index = -1;
      while (++index < cellCount) {
        value = cells[index];
        position = sizes[index] - (calculateStringLength(value) || 0);
        spacing = pad(position);
        if (alignment[index] === RIGHT || alignment[index] === DOT) {
          value = spacing + value;
        } else if (alignment[index] !== CENTER) {
          value = value + spacing;
        } else {
          position = position / 2;
          if (position % 1 === 0) {
            before = position;
            after = position;
          } else {
            before = position + 0.5;
            after = position - 0.5;
          }
          value = pad(before) + value + pad(after);
        }
        cells[index] = value;
      }
      rows[rowIndex] = cells.join(delimiter);
    }
    if (settings.rule !== false) {
      index = -1;
      rule = [];
      while (++index < cellCount) {
        align = alignment[index];
        value = align === RIGHT || align === NULL ? DASH : COLON;
        value += pad(sizes[index] - 2, DASH);
        value += align !== LEFT && align !== NULL ? COLON : DASH;
        rule[index] = value;
      }
      rows.splice(1, 0, rule.join(delimiter));
    }
    return start + rows.join(end + NEW_LINE + start) + end;
  }
  module.exports = markdownTable;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:markdown-table@0.4.0", ["npm:markdown-table@0.4.0/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:markdown-table@0.4.0/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:extend.js@0.0.2/index", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(src) {
    var objs = [].slice.call(arguments, 1),
        obj;
    for (var i = 0,
        len = objs.length; i < len; i++) {
      obj = objs[i];
      for (var prop in obj) {
        src[prop] = obj[prop];
      }
    }
    return src;
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:extend.js@0.0.2", ["npm:extend.js@0.0.2/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:extend.js@0.0.2/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:ccount@1.0.0/index", [], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  function ccount(value, character) {
    var index = -1;
    var count = 0;
    var length;
    value = String(value);
    length = value.length;
    if (typeof character !== 'string' || character.length !== 1) {
      throw new Error('Expected character');
    }
    while (++index < length) {
      if (value.charAt(index) === character) {
        count++;
      }
    }
    return count;
  }
  module.exports = ccount;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:ccount@1.0.0", ["npm:ccount@1.0.0/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:ccount@1.0.0/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:longest-streak@1.0.0/index", [], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  function longestStreak(value, character) {
    var count = 0;
    var maximum = 0;
    var index = -1;
    var length;
    value = String(value);
    length = value.length;
    if (typeof character !== 'string' || character.length !== 1) {
      throw new Error('Expected character');
    }
    while (++index < length) {
      if (value.charAt(index) === character) {
        count++;
        if (count > maximum) {
          maximum = count;
        }
      } else {
        count = 0;
      }
    }
    return maximum;
  }
  module.exports = longestStreak;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:longest-streak@1.0.0", ["npm:longest-streak@1.0.0/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:longest-streak@1.0.0/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:remark@3.2.2/lib/utilities", ["npm:collapse-white-space@1.0.0"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var collapseWhiteSpace = $__require('npm:collapse-white-space@1.0.0');
  var EXPRESSION_LINE_BREAKS = /\r\n|\r/g;
  var EXPRESSION_SYMBOL_FOR_NEW_LINE = /\u2424/g;
  var EXPRESSION_BOM = /^\ufeff/;
  function raise(value, name) {
    throw new Error('Invalid value `' + value + '` ' + 'for setting `' + name + '`');
  }
  function validateBoolean(context, name, def) {
    var value = context[name];
    if (value === null || value === undefined) {
      value = def;
    }
    if (typeof value !== 'boolean') {
      raise(value, 'options.' + name);
    }
    context[name] = value;
  }
  function validateNumber(context, name, def) {
    var value = context[name];
    if (value === null || value === undefined) {
      value = def;
    }
    if (typeof value !== 'number' || value !== value) {
      raise(value, 'options.' + name);
    }
    context[name] = value;
  }
  function validateString(context, name, def, map) {
    var value = context[name];
    if (value === null || value === undefined) {
      value = def;
    }
    if (!(value in map)) {
      raise(value, 'options.' + name);
    }
    context[name] = value;
  }
  function clean(value) {
    return String(value).replace(EXPRESSION_BOM, '').replace(EXPRESSION_LINE_BREAKS, '\n').replace(EXPRESSION_SYMBOL_FOR_NEW_LINE, '\n');
  }
  function normalizeIdentifier(value) {
    return collapseWhiteSpace(value).toLowerCase();
  }
  function stateToggler(key, state) {
    function enter() {
      var self = this;
      var current = self[key];
      self[key] = !state;
      function exit() {
        self[key] = current;
      }
      return exit;
    }
    return enter;
  }
  var MERGEABLE_NODES = {};
  function mergeable(node) {
    var start;
    var end;
    if (node.type !== 'text' || !node.position) {
      return true;
    }
    start = node.position.start;
    end = node.position.end;
    return start.line !== end.line || end.column - start.column === node.value.length;
  }
  MERGEABLE_NODES.text = function(prev, node) {
    prev.value += node.value;
    return prev;
  };
  MERGEABLE_NODES.blockquote = function(prev, node) {
    if (this.options.commonmark) {
      return node;
    }
    prev.children = prev.children.concat(node.children);
    return prev;
  };
  exports.validate = {
    'boolean': validateBoolean,
    'string': validateString,
    'number': validateNumber
  };
  exports.normalizeIdentifier = normalizeIdentifier;
  exports.clean = clean;
  exports.raise = raise;
  exports.stateToggler = stateToggler;
  exports.mergeable = mergeable;
  exports.MERGEABLE_NODES = MERGEABLE_NODES;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:remark@3.2.2/lib/defaults", [], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    'parse': {
      'position': true,
      'gfm': true,
      'yaml': true,
      'commonmark': false,
      'footnotes': false,
      'pedantic': false,
      'breaks': false
    },
    'stringify': {
      'gfm': true,
      'commonmark': false,
      'entities': 'false',
      'setext': false,
      'closeAtx': false,
      'looseTable': false,
      'spacedTable': true,
      'incrementListMarker': true,
      'fences': false,
      'fence': '`',
      'bullet': '-',
      'listItemIndent': 'tab',
      'rule': '*',
      'ruleSpaces': true,
      'ruleRepetition': 3,
      'strong': '*',
      'emphasis': '_'
    }
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:remark@3.2.2/lib/stringify", ["npm:parse-entities@1.0.2", "npm:stringify-entities@1.0.1", "npm:markdown-table@0.4.0", "npm:repeat-string@1.5.2", "npm:extend.js@0.0.2", "npm:ccount@1.0.0", "npm:longest-streak@1.0.0", "npm:remark@3.2.2/lib/utilities", "npm:remark@3.2.2/lib/defaults"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var decode = $__require('npm:parse-entities@1.0.2');
  var encode = $__require('npm:stringify-entities@1.0.1');
  var table = $__require('npm:markdown-table@0.4.0');
  var repeat = $__require('npm:repeat-string@1.5.2');
  var extend = $__require('npm:extend.js@0.0.2');
  var ccount = $__require('npm:ccount@1.0.0');
  var longestStreak = $__require('npm:longest-streak@1.0.0');
  var utilities = $__require('npm:remark@3.2.2/lib/utilities');
  var defaultOptions = $__require('npm:remark@3.2.2/lib/defaults').stringify;
  var raise = utilities.raise;
  var validate = utilities.validate;
  var stateToggler = utilities.stateToggler;
  var mergeable = utilities.mergeable;
  var MERGEABLE_NODES = utilities.MERGEABLE_NODES;
  var INDENT = 4;
  var MINIMUM_CODE_FENCE_LENGTH = 3;
  var YAML_FENCE_LENGTH = 3;
  var MINIMUM_RULE_LENGTH = 3;
  var MAILTO = 'mailto:';
  var ERROR_LIST_ITEM_INDENT = 'Cannot indent code properly. See ' + 'http://git.io/mdast-lii';
  var EXPRESSIONS_WHITE_SPACE = /\s/;
  var FENCE = /([`~])\1{2}/;
  var PROTOCOL = /^[a-z][a-z+.-]+:\/?/i;
  var PUNCTUATION = /[-!"#$%&'()*+,.\/:;<=>?@\[\\\]^`{|}~_]/;
  var ANGLE_BRACKET_CLOSE = '>';
  var ANGLE_BRACKET_OPEN = '<';
  var ASTERISK = '*';
  var BACKSLASH = '\\';
  var CARET = '^';
  var COLON = ':';
  var SEMICOLON = ';';
  var DASH = '-';
  var DOT = '.';
  var EMPTY = '';
  var EQUALS = '=';
  var EXCLAMATION_MARK = '!';
  var HASH = '#';
  var AMPERSAND = '&';
  var LINE = '\n';
  var CARRIAGE = '\r';
  var FORM_FEED = '\f';
  var PARENTHESIS_OPEN = '(';
  var PARENTHESIS_CLOSE = ')';
  var PIPE = '|';
  var PLUS = '+';
  var QUOTE_DOUBLE = '"';
  var QUOTE_SINGLE = '\'';
  var SPACE = ' ';
  var TAB = '\t';
  var VERTICAL_TAB = '\u000B';
  var SQUARE_BRACKET_OPEN = '[';
  var SQUARE_BRACKET_CLOSE = ']';
  var TICK = '`';
  var TILDE = '~';
  var UNDERSCORE = '_';
  var ENTITY_AMPERSAND = AMPERSAND + 'amp' + SEMICOLON;
  var ENTITY_ANGLE_BRACKET_OPEN = AMPERSAND + 'lt' + SEMICOLON;
  var ENTITY_COLON = AMPERSAND + '#x3A' + SEMICOLON;
  var BREAK = LINE + LINE;
  var GAP = BREAK + LINE;
  var DOUBLE_TILDE = TILDE + TILDE;
  var ENTITY_OPTIONS = {};
  ENTITY_OPTIONS.true = true;
  ENTITY_OPTIONS.false = true;
  ENTITY_OPTIONS.numbers = true;
  ENTITY_OPTIONS.escape = true;
  var LIST_BULLETS = {};
  LIST_BULLETS[ASTERISK] = true;
  LIST_BULLETS[DASH] = true;
  LIST_BULLETS[PLUS] = true;
  var HORIZONTAL_RULE_BULLETS = {};
  HORIZONTAL_RULE_BULLETS[ASTERISK] = true;
  HORIZONTAL_RULE_BULLETS[DASH] = true;
  HORIZONTAL_RULE_BULLETS[UNDERSCORE] = true;
  var EMPHASIS_MARKERS = {};
  EMPHASIS_MARKERS[UNDERSCORE] = true;
  EMPHASIS_MARKERS[ASTERISK] = true;
  var FENCE_MARKERS = {};
  FENCE_MARKERS[TICK] = true;
  FENCE_MARKERS[TILDE] = true;
  var ORDERED_MAP = {};
  ORDERED_MAP.true = 'visitOrderedItems';
  ORDERED_MAP.false = 'visitUnorderedItems';
  var LIST_ITEM_INDENTS = {};
  var LIST_ITEM_TAB = 'tab';
  var LIST_ITEM_ONE = '1';
  var LIST_ITEM_MIXED = 'mixed';
  LIST_ITEM_INDENTS[LIST_ITEM_ONE] = true;
  LIST_ITEM_INDENTS[LIST_ITEM_TAB] = true;
  LIST_ITEM_INDENTS[LIST_ITEM_MIXED] = true;
  var CHECKBOX_MAP = {};
  CHECKBOX_MAP.null = EMPTY;
  CHECKBOX_MAP.undefined = EMPTY;
  CHECKBOX_MAP.true = SQUARE_BRACKET_OPEN + 'x' + SQUARE_BRACKET_CLOSE + SPACE;
  CHECKBOX_MAP.false = SQUARE_BRACKET_OPEN + SPACE + SQUARE_BRACKET_CLOSE + SPACE;
  function encodeNoop(value) {
    return value;
  }
  function encodeFactory(type) {
    var options = {};
    if (type === 'false') {
      return encodeNoop;
    }
    if (type === 'true') {
      options.useNamedReferences = true;
    }
    if (type === 'escape') {
      options.escapeOnly = options.useNamedReferences = true;
    }
    function encoder(value) {
      return encode(value, options);
    }
    return encoder;
  }
  function startsWithEntity(value) {
    var prefix;
    if (value.charAt(0) !== AMPERSAND) {
      return false;
    }
    prefix = value.split(AMPERSAND, 2).join(AMPERSAND);
    return decode(prefix).length !== prefix.length;
  }
  function isAlignmentRowCharacter(character) {
    return character === COLON || character === DASH || character === SPACE || character === PIPE;
  }
  function isInAlignmentRow(value, index) {
    var length = value.length;
    var start = index;
    var character;
    while (++index < length) {
      character = value.charAt(index);
      if (character === LINE) {
        break;
      }
      if (!isAlignmentRowCharacter(character)) {
        return false;
      }
    }
    index = start;
    while (--index > -1) {
      character = value.charAt(index);
      if (character === LINE) {
        break;
      }
      if (!isAlignmentRowCharacter(character)) {
        return false;
      }
    }
    return true;
  }
  function escapeFactory(options) {
    return function escape(value, node, parent) {
      var self = this;
      var gfm = options.gfm;
      var commonmark = options.commonmark;
      var siblings = parent && parent.children;
      var index = siblings && siblings.indexOf(node);
      var prev = siblings && siblings[index - 1];
      var next = siblings && siblings[index + 1];
      var length = value.length;
      var position = -1;
      var queue = [];
      var escaped = queue;
      var afterNewLine;
      var character;
      if (prev) {
        afterNewLine = prev.type === 'text' && /\n\s*$/.test(prev.value);
      } else if (parent) {
        afterNewLine = parent.type === 'paragraph';
      }
      while (++position < length) {
        character = value.charAt(position);
        if (character === BACKSLASH || character === TICK || character === ASTERISK || character === SQUARE_BRACKET_OPEN || character === UNDERSCORE || (self.inLink && character === SQUARE_BRACKET_CLOSE) || (gfm && character === PIPE && (self.inTable || isInAlignmentRow(value, position)))) {
          afterNewLine = false;
          queue.push(BACKSLASH);
        } else if (character === ANGLE_BRACKET_OPEN) {
          afterNewLine = false;
          if (commonmark) {
            queue.push(BACKSLASH);
          } else {
            queue.push(ENTITY_ANGLE_BRACKET_OPEN);
            continue;
          }
        } else if (gfm && !self.inLink && character === COLON && (queue.slice(-6).join(EMPTY) === 'mailto' || queue.slice(-5).join(EMPTY) === 'https' || queue.slice(-4).join(EMPTY) === 'http')) {
          afterNewLine = false;
          if (commonmark) {
            queue.push(BACKSLASH);
          } else {
            queue.push(ENTITY_COLON);
            continue;
          }
        } else if (character === AMPERSAND && startsWithEntity(value.slice(position))) {
          afterNewLine = false;
          if (commonmark) {
            queue.push(BACKSLASH);
          } else {
            queue.push(ENTITY_AMPERSAND);
            continue;
          }
        } else if (gfm && character === TILDE && value.charAt(position + 1) === TILDE) {
          queue.push(BACKSLASH, TILDE);
          afterNewLine = false;
          position += 1;
        } else if (character === LINE) {
          afterNewLine = true;
        } else if (afterNewLine) {
          if (character === ANGLE_BRACKET_CLOSE || character === HASH || LIST_BULLETS[character]) {
            queue.push(BACKSLASH);
            afterNewLine = false;
          } else if (character !== SPACE && character !== TAB && character !== CARRIAGE && character !== VERTICAL_TAB && character !== FORM_FEED) {
            afterNewLine = false;
          }
        }
        queue.push(character);
      }
      if (siblings && node.type === 'text') {
        if (prev && prev.referenceType === 'shortcut') {
          position = -1;
          length = escaped.length;
          while (++position < length) {
            character = escaped[position];
            if (character === SPACE || character === TAB) {
              continue;
            }
            if (character === PARENTHESIS_OPEN) {
              escaped[position] = BACKSLASH + character;
            }
            if (character === COLON) {
              if (commonmark) {
                escaped[position] = BACKSLASH + character;
              } else {
                escaped[position] = ENTITY_COLON;
              }
            }
            break;
          }
        }
        if (gfm && !self.inLink && prev && prev.type === 'text' && value.charAt(0) === COLON) {
          queue = prev.value.slice(-6);
          if (queue === 'mailto' || queue.slice(-5) === 'https' || queue.slice(-4) === 'http') {
            if (commonmark) {
              escaped.unshift(BACKSLASH);
            } else {
              escaped.splice(0, 1, ENTITY_COLON);
            }
          }
        }
        if (next && next.type === 'text' && value.slice(-1) === AMPERSAND && startsWithEntity(AMPERSAND + next.value)) {
          if (commonmark) {
            escaped.splice(escaped.length - 1, 0, BACKSLASH);
          } else {
            escaped.push('amp', SEMICOLON);
          }
        }
        if (gfm && next && next.type === 'text' && value.slice(-1) === TILDE && next.value.charAt(0) === TILDE) {
          escaped.splice(escaped.length - 1, 0, BACKSLASH);
        }
      }
      return escaped.join(EMPTY);
    };
  }
  function encloseURI(uri, always) {
    if (always || !uri.length || EXPRESSIONS_WHITE_SPACE.test(uri) || ccount(uri, PARENTHESIS_OPEN) !== ccount(uri, PARENTHESIS_CLOSE)) {
      return ANGLE_BRACKET_OPEN + uri + ANGLE_BRACKET_CLOSE;
    }
    return uri;
  }
  function encloseTitle(title) {
    var delimiter = QUOTE_DOUBLE;
    if (title.indexOf(delimiter) !== -1) {
      delimiter = QUOTE_SINGLE;
    }
    return delimiter + title + delimiter;
  }
  function pad(value, level) {
    var index;
    var padding;
    value = value.split(LINE);
    index = value.length;
    padding = repeat(SPACE, level * INDENT);
    while (index--) {
      if (value[index].length !== 0) {
        value[index] = padding + value[index];
      }
    }
    return value.join(LINE);
  }
  function Compiler(file, options) {
    var self = this;
    self.file = file;
    self.options = extend({}, self.options);
    self.setOptions(options);
  }
  var compilerPrototype = Compiler.prototype;
  compilerPrototype.options = defaultOptions;
  var maps = {
    'entities': ENTITY_OPTIONS,
    'bullet': LIST_BULLETS,
    'rule': HORIZONTAL_RULE_BULLETS,
    'listItemIndent': LIST_ITEM_INDENTS,
    'emphasis': EMPHASIS_MARKERS,
    'strong': EMPHASIS_MARKERS,
    'fence': FENCE_MARKERS
  };
  compilerPrototype.setOptions = function(options) {
    var self = this;
    var current = self.options;
    var ruleRepetition;
    var key;
    if (options === null || options === undefined) {
      options = {};
    } else if (typeof options === 'object') {
      options = extend({}, options);
    } else {
      raise(options, 'options');
    }
    for (key in defaultOptions) {
      validate[typeof current[key]](options, key, current[key], maps[key]);
    }
    ruleRepetition = options.ruleRepetition;
    if (ruleRepetition && ruleRepetition < MINIMUM_RULE_LENGTH) {
      raise(ruleRepetition, 'options.ruleRepetition');
    }
    self.encode = encodeFactory(String(options.entities));
    self.escape = escapeFactory(options);
    self.options = options;
    return self;
  };
  compilerPrototype.enterLink = stateToggler('inLink', false);
  compilerPrototype.enterTable = stateToggler('inTable', false);
  compilerPrototype.visit = function(node, parent) {
    var self = this;
    if (typeof self[node.type] !== 'function') {
      self.file.fail('Missing compiler for node of type `' + node.type + '`: `' + node + '`', node);
    }
    return self[node.type](node, parent);
  };
  compilerPrototype.all = function(parent) {
    var self = this;
    var children = parent.children;
    var values = [];
    var index = 0;
    var length = children.length;
    var node = children[0];
    var next;
    if (length === 0) {
      return values;
    }
    while (++index < length) {
      next = children[index];
      if (node.type === next.type && node.type in MERGEABLE_NODES && mergeable(node) && mergeable(next)) {
        node = MERGEABLE_NODES[node.type].call(self, node, next);
      } else {
        values.push(self.visit(node, parent));
        node = next;
      }
    }
    values.push(self.visit(node, parent));
    return values;
  };
  compilerPrototype.visitOrderedItems = function(node) {
    var self = this;
    var increment = self.options.incrementListMarker;
    var values = [];
    var start = node.start;
    var children = node.children;
    var length = children.length;
    var index = -1;
    var bullet;
    while (++index < length) {
      bullet = (increment ? start + index : start) + DOT;
      values[index] = self.listItem(children[index], node, index, bullet);
    }
    return values.join(LINE);
  };
  compilerPrototype.visitUnorderedItems = function(node) {
    var self = this;
    var values = [];
    var children = node.children;
    var length = children.length;
    var index = -1;
    var bullet = self.options.bullet;
    while (++index < length) {
      values[index] = self.listItem(children[index], node, index, bullet);
    }
    return values.join(LINE);
  };
  compilerPrototype.block = function(node) {
    var self = this;
    var values = [];
    var children = node.children;
    var length = children.length;
    var index = -1;
    var child;
    var prev;
    while (++index < length) {
      child = children[index];
      if (prev) {
        if (child.type === prev.type && prev.type === 'list') {
          values.push(prev.ordered === child.ordered ? GAP : BREAK);
        } else if (prev.type === 'list' && child.type === 'code' && !child.lang) {
          values.push(GAP);
        } else {
          values.push(BREAK);
        }
      }
      values.push(self.visit(child, node));
      prev = child;
    }
    return values.join(EMPTY);
  };
  compilerPrototype.root = function(node) {
    return this.block(node) + LINE;
  };
  compilerPrototype.heading = function(node) {
    var self = this;
    var setext = self.options.setext;
    var closeAtx = self.options.closeAtx;
    var depth = node.depth;
    var content = self.all(node).join(EMPTY);
    var prefix;
    if (setext && depth < 3) {
      return content + LINE + repeat(depth === 1 ? EQUALS : DASH, content.length);
    }
    prefix = repeat(HASH, node.depth);
    content = prefix + SPACE + content;
    if (closeAtx) {
      content += SPACE + prefix;
    }
    return content;
  };
  compilerPrototype.text = function(node, parent) {
    return this.encode(this.escape(node.value, node, parent), node);
  };
  compilerPrototype.paragraph = function(node) {
    return this.all(node).join(EMPTY);
  };
  compilerPrototype.blockquote = function(node) {
    var values = this.block(node).split(LINE);
    var result = [];
    var length = values.length;
    var index = -1;
    var value;
    while (++index < length) {
      value = values[index];
      result[index] = (value ? SPACE : EMPTY) + value;
    }
    return ANGLE_BRACKET_CLOSE + result.join(LINE + ANGLE_BRACKET_CLOSE);
  };
  compilerPrototype.list = function(node) {
    return this[ORDERED_MAP[node.ordered]](node);
  };
  compilerPrototype.listItem = function(node, parent, position, bullet) {
    var self = this;
    var style = self.options.listItemIndent;
    var children = node.children;
    var values = [];
    var index = -1;
    var length = children.length;
    var loose = node.loose;
    var value;
    var indent;
    var spacing;
    while (++index < length) {
      values[index] = self.visit(children[index], node);
    }
    value = CHECKBOX_MAP[node.checked] + values.join(loose ? BREAK : LINE);
    if (style === LIST_ITEM_ONE || (style === LIST_ITEM_MIXED && value.indexOf(LINE) === -1)) {
      indent = bullet.length + 1;
      spacing = SPACE;
    } else {
      indent = Math.ceil((bullet.length + 1) / INDENT) * INDENT;
      spacing = repeat(SPACE, indent - bullet.length);
    }
    value = bullet + spacing + pad(value, indent / INDENT).slice(indent);
    if (loose && parent.children.length - 1 !== position) {
      value += LINE;
    }
    return value;
  };
  compilerPrototype.inlineCode = function(node) {
    var value = node.value;
    var ticks = repeat(TICK, longestStreak(value, TICK) + 1);
    var start = ticks;
    var end = ticks;
    if (value.charAt(0) === TICK) {
      start += SPACE;
    }
    if (value.charAt(value.length - 1) === TICK) {
      end = SPACE + end;
    }
    return start + node.value + end;
  };
  compilerPrototype.yaml = function(node) {
    var delimiter = repeat(DASH, YAML_FENCE_LENGTH);
    var value = node.value ? LINE + node.value : EMPTY;
    return delimiter + value + LINE + delimiter;
  };
  compilerPrototype.code = function(node, parent) {
    var self = this;
    var value = node.value;
    var options = self.options;
    var marker = options.fence;
    var language = self.encode(node.lang || EMPTY, node);
    var fence;
    if (!language && !options.fences && value) {
      if (parent && parent.type === 'listItem' && options.listItemIndent !== LIST_ITEM_TAB && options.pedantic) {
        self.file.fail(ERROR_LIST_ITEM_INDENT, node.position);
      }
      return pad(value, 1);
    }
    fence = longestStreak(value, marker) + 1;
    if (FENCE.test(value)) {
      value = pad(value, 1);
    }
    fence = repeat(marker, Math.max(fence, MINIMUM_CODE_FENCE_LENGTH));
    return fence + language + LINE + value + LINE + fence;
  };
  compilerPrototype.html = function(node) {
    return node.value;
  };
  compilerPrototype.horizontalRule = function() {
    var options = this.options;
    var rule = repeat(options.rule, options.ruleRepetition);
    if (options.ruleSpaces) {
      rule = rule.split(EMPTY).join(SPACE);
    }
    return rule;
  };
  compilerPrototype.strong = function(node) {
    var marker = this.options.strong;
    marker = marker + marker;
    return marker + this.all(node).join(EMPTY) + marker;
  };
  compilerPrototype.emphasis = function(node) {
    var marker = this.options.emphasis;
    return marker + this.all(node).join(EMPTY) + marker;
  };
  compilerPrototype.break = function() {
    return this.options.commonmark ? BACKSLASH + LINE : SPACE + SPACE + LINE;
  };
  compilerPrototype.delete = function(node) {
    return DOUBLE_TILDE + this.all(node).join(EMPTY) + DOUBLE_TILDE;
  };
  compilerPrototype.link = function(node) {
    var self = this;
    var url = self.encode(node.href, node);
    var exit = self.enterLink();
    var escapedURL = self.encode(self.escape(node.href, node));
    var value = self.all(node).join(EMPTY);
    exit();
    if (node.title === null && PROTOCOL.test(url) && (escapedURL === value || escapedURL === MAILTO + value)) {
      return encloseURI(self.encode(node.href), true);
    }
    url = encloseURI(url);
    if (node.title) {
      url += SPACE + encloseTitle(self.encode(self.escape(node.title, node), node));
    }
    value = SQUARE_BRACKET_OPEN + value + SQUARE_BRACKET_CLOSE;
    value += PARENTHESIS_OPEN + url + PARENTHESIS_CLOSE;
    return value;
  };
  function label(node) {
    var value = EMPTY;
    var type = node.referenceType;
    if (type === 'full') {
      value = node.identifier;
    }
    if (type !== 'shortcut') {
      value = SQUARE_BRACKET_OPEN + value + SQUARE_BRACKET_CLOSE;
    }
    return value;
  }
  function unescapeShortcutLinkReference(value, identifier) {
    var index = 0;
    var position = 0;
    var length = value.length;
    var count = identifier.length;
    var result = [];
    var start;
    while (index < length) {
      start = index;
      while (index < length && !PUNCTUATION.test(value.charAt(index))) {
        index += 1;
      }
      result.push(value.slice(start, index));
      while (position < count && !PUNCTUATION.test(identifier.charAt(position))) {
        position += 1;
      }
      start = position;
      while (position < count && PUNCTUATION.test(identifier.charAt(position))) {
        position += 1;
      }
      result.push(identifier.slice(start, position));
      while (index < length && PUNCTUATION.test(value.charAt(index))) {
        index += 1;
      }
    }
    return result.join(EMPTY);
  }
  compilerPrototype.linkReference = function(node) {
    var self = this;
    var exitLink = self.enterLink();
    var value = self.all(node).join(EMPTY);
    exitLink();
    if (node.referenceType == 'shortcut') {
      value = unescapeShortcutLinkReference(value, node.identifier);
    }
    return SQUARE_BRACKET_OPEN + value + SQUARE_BRACKET_CLOSE + label(node);
  };
  compilerPrototype.imageReference = function(node) {
    var alt = this.encode(node.alt, node) || EMPTY;
    return EXCLAMATION_MARK + SQUARE_BRACKET_OPEN + alt + SQUARE_BRACKET_CLOSE + label(node);
  };
  compilerPrototype.footnoteReference = function(node) {
    return SQUARE_BRACKET_OPEN + CARET + node.identifier + SQUARE_BRACKET_CLOSE;
  };
  compilerPrototype.definition = function(node) {
    var value = SQUARE_BRACKET_OPEN + node.identifier + SQUARE_BRACKET_CLOSE;
    var url = encloseURI(node.link);
    if (node.title) {
      url += SPACE + encloseTitle(node.title);
    }
    return value + COLON + SPACE + url;
  };
  compilerPrototype.image = function(node) {
    var url = encloseURI(this.encode(node.src, node));
    var value;
    if (node.title) {
      url += SPACE + encloseTitle(this.encode(node.title, node));
    }
    value = EXCLAMATION_MARK + SQUARE_BRACKET_OPEN + this.encode(node.alt || EMPTY, node) + SQUARE_BRACKET_CLOSE;
    value += PARENTHESIS_OPEN + url + PARENTHESIS_CLOSE;
    return value;
  };
  compilerPrototype.footnote = function(node) {
    return SQUARE_BRACKET_OPEN + CARET + this.all(node).join(EMPTY) + SQUARE_BRACKET_CLOSE;
  };
  compilerPrototype.footnoteDefinition = function(node) {
    var id = node.identifier.toLowerCase();
    return SQUARE_BRACKET_OPEN + CARET + id + SQUARE_BRACKET_CLOSE + COLON + SPACE + this.all(node).join(BREAK + repeat(SPACE, INDENT));
  };
  compilerPrototype.table = function(node) {
    var self = this;
    var loose = self.options.looseTable;
    var spaced = self.options.spacedTable;
    var rows = node.children;
    var index = rows.length;
    var exit = self.enterTable();
    var result = [];
    var start;
    while (index--) {
      result[index] = self.all(rows[index]);
    }
    exit();
    start = loose ? EMPTY : spaced ? PIPE + SPACE : PIPE;
    return table(result, {
      'align': node.align,
      'start': start,
      'end': start.split(EMPTY).reverse().join(EMPTY),
      'delimiter': spaced ? SPACE + PIPE + SPACE : PIPE
    });
  };
  compilerPrototype.tableCell = function(node) {
    return this.all(node).join(EMPTY);
  };
  compilerPrototype.compile = function() {
    return this.visit(this.file.namespace('mdast').tree);
  };
  module.exports = Compiler;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:remark@3.2.2/lib/escape.json!github:systemjs/plugin-json@0.1.0", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": ["\\", "`", "*", "{", "}", "[", "]", "(", ")", "#", "+", "-", ".", "!", "_", ">"],
    "gfm": ["\\", "`", "*", "{", "}", "[", "]", "(", ")", "#", "+", "-", ".", "!", "_", ">", "~", "|"],
    "commonmark": ["\\", "`", "*", "{", "}", "[", "]", "(", ")", "#", "+", "-", ".", "!", "_", ">", "~", "|", "\n", "\"", "$", "%", "&", "'", ",", "/", ":", ";", "<", "=", "?", "@", "^"]
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:process@0.11.2/browser", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var process = module.exports = {};
  var queue = [];
  var draining = false;
  var currentQueue;
  var queueIndex = -1;
  function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
      queue = currentQueue.concat(queue);
    } else {
      queueIndex = -1;
    }
    if (queue.length) {
      drainQueue();
    }
  }
  function drainQueue() {
    if (draining) {
      return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;
    var len = queue.length;
    while (len) {
      currentQueue = queue;
      queue = [];
      while (++queueIndex < len) {
        if (currentQueue) {
          currentQueue[queueIndex].run();
        }
      }
      queueIndex = -1;
      len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
  }
  process.nextTick = function(fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
      for (var i = 1; i < arguments.length; i++) {
        args[i - 1] = arguments[i];
      }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
      setTimeout(drainQueue, 0);
    }
  };
  function Item(fun, array) {
    this.fun = fun;
    this.array = array;
  }
  Item.prototype.run = function() {
    this.fun.apply(null, this.array);
  };
  process.title = 'browser';
  process.browser = true;
  process.env = {};
  process.argv = [];
  process.version = '';
  process.versions = {};
  function noop() {}
  process.on = noop;
  process.addListener = noop;
  process.once = noop;
  process.off = noop;
  process.removeListener = noop;
  process.removeAllListeners = noop;
  process.emit = noop;
  process.binding = function(name) {
    throw new Error('process.binding is not supported');
  };
  process.cwd = function() {
    return '/';
  };
  process.chdir = function(dir) {
    throw new Error('process.chdir is not supported');
  };
  process.umask = function() {
    return 0;
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:process@0.11.2", ["npm:process@0.11.2/browser"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:process@0.11.2/browser');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("github:jspm/nodelibs-process@0.1.2/index", ["npm:process@0.11.2"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = System._nodeRequire ? process : $__require('npm:process@0.11.2');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("github:jspm/nodelibs-process@0.1.2", ["github:jspm/nodelibs-process@0.1.2/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('github:jspm/nodelibs-process@0.1.2/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:remark@3.2.2/index", ["npm:unified@2.1.4", "npm:remark@3.2.2/lib/parse", "npm:remark@3.2.2/lib/stringify", "npm:remark@3.2.2/lib/escape.json!github:systemjs/plugin-json@0.1.0", "github:jspm/nodelibs-process@0.1.2"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var unified = $__require('npm:unified@2.1.4');
    var Parser = $__require('npm:remark@3.2.2/lib/parse');
    var Compiler = $__require('npm:remark@3.2.2/lib/stringify');
    var escape = $__require('npm:remark@3.2.2/lib/escape.json!github:systemjs/plugin-json@0.1.0');
    module.exports = unified({
      'name': 'mdast',
      'Parser': Parser,
      'Compiler': Compiler,
      'data': {'escape': escape}
    });
  })($__require('github:jspm/nodelibs-process@0.1.2'));
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:remark@3.2.2", ["npm:remark@3.2.2/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:remark@3.2.2/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:trim@0.0.1/index", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  exports = module.exports = trim;
  function trim(str) {
    return str.replace(/^\s*|\s*$/g, '');
  }
  exports.left = function(str) {
    return str.replace(/^\s*/, '');
  };
  exports.right = function(str) {
    return str.replace(/\s*$/, '');
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:trim@0.0.1", ["npm:trim@0.0.1/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:trim@0.0.1/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:repeat-string@1.5.2/index", [], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = repeat;
  function repeat(str, num) {
    if (typeof str !== 'string') {
      throw new TypeError('repeat-string expects a string.');
    }
    if (num === 1)
      return str;
    if (num === 2)
      return str + str;
    var max = str.length * num;
    if (cache !== str || typeof cache === 'undefined') {
      cache = str;
      res = '';
    }
    while (max > res.length && num > 0) {
      if (num & 1) {
        res += str;
      }
      num >>= 1;
      if (!num)
        break;
      str += str;
    }
    return res.substr(0, max);
  }
  var res = '';
  var cache;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:repeat-string@1.5.2", ["npm:repeat-string@1.5.2/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:repeat-string@1.5.2/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:detab@1.0.2/index", ["npm:repeat-string@1.5.2"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var repeat = $__require('npm:repeat-string@1.5.2');
  var TAB = '\t';
  var NEWLINE = '\n';
  var SPACE = ' ';
  function detab(value, size) {
    var string = typeof value === 'string';
    var length = string && value.length;
    var index = -1;
    var column = -1;
    var tabSize = size || 4;
    var result = '';
    var character;
    var add;
    if (!string) {
      throw new Error('detab expected string');
    }
    while (++index < length) {
      character = value.charAt(index);
      if (character === TAB) {
        add = tabSize - ((column + 1) % tabSize);
        result += repeat(SPACE, add);
        column += add;
        continue;
      }
      if (character === NEWLINE) {
        column = -1;
      } else {
        column++;
      }
      result += character;
    }
    return result;
  }
  module.exports = detab;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:detab@1.0.2", ["npm:detab@1.0.2/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:detab@1.0.2/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:collapse-white-space@1.0.0/index", [], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var WHITE_SPACE_COLLAPSABLE = /\s+/g;
  var SPACE = ' ';
  function collapse(value) {
    return String(value).replace(WHITE_SPACE_COLLAPSABLE, SPACE);
  }
  module.exports = collapse;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:collapse-white-space@1.0.0", ["npm:collapse-white-space@1.0.0/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:collapse-white-space@1.0.0/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:normalize-uri@1.0.0/index", [], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  function normalizeURI(uri) {
    try {
      uri = encodeURI(decodeURI(uri));
    } catch (exception) {}
    return uri;
  }
  module.exports = normalizeURI;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:normalize-uri@1.0.0", ["npm:normalize-uri@1.0.0/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:normalize-uri@1.0.0/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:trim-lines@1.0.0/index", [], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var WHITE_SPACE_COLLAPSABLE_LINE = /[ \t]*\n+[ \t]*/g;
  var LINE = '\n';
  function trimLines(value) {
    return String(value).replace(WHITE_SPACE_COLLAPSABLE_LINE, LINE);
  }
  module.exports = trimLines;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:trim-lines@1.0.0", ["npm:trim-lines@1.0.0/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:trim-lines@1.0.0/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:object-assign@4.0.1/index", [], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var propIsEnumerable = Object.prototype.propertyIsEnumerable;
  function toObject(val) {
    if (val === null || val === undefined) {
      throw new TypeError('Object.assign cannot be called with null or undefined');
    }
    return Object(val);
  }
  module.exports = Object.assign || function(target, source) {
    var from;
    var to = toObject(target);
    var symbols;
    for (var s = 1; s < arguments.length; s++) {
      from = Object(arguments[s]);
      for (var key in from) {
        if (hasOwnProperty.call(from, key)) {
          to[key] = from[key];
        }
      }
      if (Object.getOwnPropertySymbols) {
        symbols = Object.getOwnPropertySymbols(from);
        for (var i = 0; i < symbols.length; i++) {
          if (propIsEnumerable.call(from, symbols[i])) {
            to[symbols[i]] = from[symbols[i]];
          }
        }
      }
    }
    return to;
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:object-assign@4.0.1", ["npm:object-assign@4.0.1/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:object-assign@4.0.1/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:remark-html@2.0.2/lib/h", ["npm:object-assign@4.0.1"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var assign = $__require('npm:object-assign@4.0.1');
  var LINE = '\n';
  var EMPTY = '';
  var SPACE = ' ';
  var GT = '>';
  var LT = '<';
  var SLASH = '/';
  var QUOTE = '"';
  var EQUALS = '=';
  var CLOSING = ['hr', 'img', 'br'];
  function toAttributes(attributes, encode, node) {
    var parameters = [];
    var key;
    var value;
    for (key in attributes) {
      value = attributes[key];
      if (value !== null && value !== undefined) {
        value = encode(String(value || EMPTY), node);
        parameters.push(key + EQUALS + QUOTE + value + QUOTE);
      }
    }
    return parameters.length ? parameters.join(SPACE) : EMPTY;
  }
  function h(context, node, defaults, data, loose) {
    var name;
    var value;
    var parameters;
    var content;
    if (!data) {
      data = {};
    }
    name = context.encode(data.htmlName || defaults.name);
    if (data.htmlContent && !context.options.sanitize) {
      content = data.htmlContent;
    } else {
      content = defaults.content || EMPTY;
    }
    parameters = toAttributes(assign({}, defaults.attributes, data.htmlAttributes), context.encode, node);
    value = LT + name + (parameters ? SPACE + parameters : EMPTY);
    if (CLOSING.indexOf(name) !== -1) {
      return value + (context.options.xhtml ? SPACE + SLASH : EMPTY) + GT;
    }
    return value + GT + (loose ? LINE : EMPTY) + content + (loose && content ? LINE : EMPTY) + LT + SLASH + name + GT;
  }
  module.exports = h;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:remark-html@2.0.2/lib/compilers", ["npm:trim@0.0.1", "npm:detab@1.0.2", "npm:collapse-white-space@1.0.0", "npm:normalize-uri@1.0.0", "npm:trim-lines@1.0.0", "npm:unist-util-visit@1.0.0", "npm:remark-html@2.0.2/lib/h"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var trim = $__require('npm:trim@0.0.1');
  var detab = $__require('npm:detab@1.0.2');
  var collapse = $__require('npm:collapse-white-space@1.0.0');
  var normalizeURI = $__require('npm:normalize-uri@1.0.0');
  var trimLines = $__require('npm:trim-lines@1.0.0');
  var visit = $__require('npm:unist-util-visit@1.0.0');
  var h = $__require('npm:remark-html@2.0.2/lib/h');
  var visitors = {};
  function failsafe(node, definition, context) {
    var result;
    if (node.referenceType === 'shortcut' && !definition.link) {
      result = node.children ? context.all(node).join('') : node.alt;
      return (node.type === 'imageReference' ? '!' : '') + '[' + result + ']';
    }
    return '';
  }
  function generateFootnotes() {
    var self = this;
    var definitions = self.footnotes;
    var length = definitions.length;
    var index = -1;
    var results = [];
    var def;
    if (!length) {
      return '';
    }
    while (++index < length) {
      def = definitions[index];
      results[index] = self.listItem({
        'type': 'listItem',
        'data': {'htmlAttributes': {'id': 'fn-' + def.identifier}},
        'children': def.children.concat({
          'type': 'link',
          'href': '#fnref-' + def.identifier,
          'data': {'htmlAttributes': {'class': 'footnote-backref'}},
          'children': [{
            'type': 'text',
            'value': '↩'
          }]
        }),
        'position': def.position
      }, {});
    }
    return h(self, null, {
      'name': 'div',
      'attributes': {'class': 'footnotes'},
      'content': h(self, null, {'name': 'hr'}) + '\n' + h(self, null, {
        'name': 'ol',
        'content': results.join('\n')
      }, null, true)
    }, null, true) + '\n';
  }
  function unknown(node) {
    var content = 'children' in node ? this.all(node).join('') : node.value;
    return h(this, node, {
      'name': 'div',
      'content': content || ''
    }, node.data);
  }
  function one(node, parent) {
    var self = this;
    var type = node && node.type;
    var fn = typeof self[type] === 'function' ? type : 'unknown';
    if (!type) {
      self.file.fail('Expected node `' + node + '`');
    }
    return self[fn](node, parent);
  }
  function all(parent) {
    var self = this;
    var nodes = parent.children;
    var values = [];
    var index = -1;
    var length = nodes.length;
    var value;
    var prev;
    while (++index < length) {
      value = self.visit(nodes[index], parent);
      if (value) {
        if (prev && prev.type === 'break') {
          value = trim.left(value);
        }
        values.push(value);
      }
      prev = nodes[index];
    }
    return values;
  }
  function root(node) {
    var self = this;
    var definitions = {};
    var footnotes = [];
    var result;
    self.definitions = definitions;
    self.footnotes = footnotes;
    visit(node, 'definition', function(definition) {
      definitions[definition.identifier.toUpperCase()] = definition;
    });
    visit(node, 'footnoteDefinition', function(definition) {
      footnotes.push(definition);
    });
    result = self.all(node).join('\n');
    return (result ? result + '\n' : '') + self.generateFootnotes();
  }
  function blockquote(node) {
    return h(this, node, {
      'name': 'blockquote',
      'content': this.all(node).join('\n')
    }, node.data, true);
  }
  function footnote(node) {
    var self = this;
    var definitions = self.footnotes;
    var index = -1;
    var length = definitions.length;
    var identifiers = [];
    var identifier;
    while (++index < length) {
      identifiers[index] = definitions[index].identifier;
    }
    index = -1;
    identifier = 1;
    while (identifiers.indexOf(String(identifier)) !== -1) {
      identifier++;
    }
    identifier = String(identifier);
    self.footnotes.push({
      'type': 'footnoteDefinition',
      'identifier': identifier,
      'children': node.children,
      'position': node.position
    });
    return self.footnoteReference({
      'type': 'footnoteReference',
      'identifier': identifier,
      'position': node.position
    });
  }
  function list(node) {
    return h(this, node, {
      'name': node.ordered ? 'ol' : 'ul',
      'attributes': {'start': node.start !== 1 ? node.start : null},
      'content': this.all(node).join('\n')
    }, node.data, true);
  }
  function listItem(node, parent) {
    var single;
    var result;
    single = !parent.loose && node.children.length === 1 && node.children[0].children;
    result = this.all(single ? node.children[0] : node).join(single ? '' : '\n');
    return h(this, node, {
      'name': 'li',
      'content': result
    }, node.data, !single);
  }
  function heading(node) {
    return h(this, node, {
      'name': 'h' + node.depth,
      'content': this.all(node).join('')
    }, node.data);
  }
  function paragraph(node) {
    return h(this, node, {
      'name': 'p',
      'content': trim(detab(this.all(node).join('')))
    }, node.data);
  }
  function code(node) {
    var self = this;
    var value = node.value ? detab(node.value + '\n') : '';
    return h(self, node, {
      'name': 'pre',
      'content': h(self, node, {
        'name': 'code',
        'content': self.encode(value)
      }, node.data)
    });
  }
  function table(node) {
    var self = this;
    var rows = node.children;
    var index = rows.length;
    var align = node.align;
    var alignLength = align.length;
    var pos;
    var result = [];
    var row;
    var out;
    var name;
    var cell;
    while (index--) {
      pos = alignLength;
      row = rows[index].children;
      out = [];
      name = index === 0 ? 'th' : 'td';
      while (pos--) {
        cell = row[pos];
        out[pos] = h(self, cell, {
          'name': name,
          'attributes': {'align': align[pos]},
          'content': cell ? self.all(cell).join('\n') : ''
        }, cell && cell.data);
      }
      result[index] = h(self, rows[index], {
        'name': 'tr',
        'content': out.join('\n')
      }, rows[index], true);
    }
    return h(self, node, {
      'name': 'table',
      'content': h(self, node, {
        'name': 'thead',
        'content': result[0]
      }, null, true) + '\n' + h(self, node, {
        'name': 'tbody',
        'content': result.slice(1).join('\n')
      }, null, true)
    }, node.data, true);
  }
  function html(node) {
    return this.options.sanitize ? this.encode(node.value) : node.value;
  }
  function rule(node) {
    return h(this, node, {'name': 'hr'}, node.data);
  }
  function inlineCode(node) {
    return h(this, node, {
      'name': 'code',
      'content': collapse(this.encode(node.value))
    }, node.data);
  }
  function strong(node) {
    return h(this, node, {
      'name': 'strong',
      'content': this.all(node).join('')
    }, node.data);
  }
  function emphasis(node) {
    return h(this, node, {
      'name': 'em',
      'content': this.all(node).join('')
    }, node.data);
  }
  function hardBreak(node) {
    return h(this, node, {'name': 'br'}, node.data) + '\n';
  }
  function link(node) {
    return h(this, node, {
      'name': 'a',
      'attributes': {
        'href': normalizeURI(node.href),
        'title': node.title
      },
      'content': this.all(node).join('')
    }, node.data);
  }
  function footnoteReference(node) {
    var identifier = node.identifier;
    return h(this, node, {
      'name': 'sup',
      'attributes': {'id': 'fnref-' + identifier},
      'content': h(this, node, {
        'name': 'a',
        'attributes': {
          'href': '#fn-' + identifier,
          'class': 'footnote-ref'
        },
        'content': identifier
      })
    }, node.data);
  }
  function linkReference(node) {
    var self = this;
    var def = self.definitions[node.identifier.toUpperCase()] || {};
    return failsafe(node, def, self) || h(self, node, {
      'name': 'a',
      'attributes': {
        'href': normalizeURI(def.link || ''),
        'title': def.title
      },
      'content': self.all(node).join('')
    }, node.data);
  }
  function imageReference(node) {
    var self = this;
    var def = self.definitions[node.identifier.toUpperCase()] || {};
    return failsafe(node, def, self) || h(self, node, {
      'name': 'img',
      'attributes': {
        'src': normalizeURI(def.link || ''),
        'alt': node.alt || '',
        'title': def.title
      }
    }, node.data);
  }
  function image(node) {
    return h(this, node, {
      'name': 'img',
      'attributes': {
        'src': normalizeURI(node.src),
        'alt': node.alt || '',
        'title': node.title
      }
    }, node.data);
  }
  function strikethrough(node) {
    return h(this, node, {
      'name': 'del',
      'content': this.all(node).join('')
    }, node.data);
  }
  function text(node) {
    return trimLines(this.encode(node.value));
  }
  function ignore() {
    return '';
  }
  visitors.visit = one;
  visitors.all = all;
  visitors.unknown = unknown;
  visitors.generateFootnotes = generateFootnotes;
  visitors.yaml = ignore;
  visitors.definition = ignore;
  visitors.footnoteDefinition = ignore;
  visitors.footnote = footnote;
  visitors.root = root;
  visitors.blockquote = blockquote;
  visitors.list = list;
  visitors.listItem = listItem;
  visitors.paragraph = paragraph;
  visitors.heading = heading;
  visitors.table = table;
  visitors.code = code;
  visitors.html = html;
  visitors.horizontalRule = rule;
  visitors.inlineCode = inlineCode;
  visitors.strong = strong;
  visitors.emphasis = emphasis;
  visitors.break = hardBreak;
  visitors.link = link;
  visitors.image = image;
  visitors.footnoteReference = footnoteReference;
  visitors.linkReference = linkReference;
  visitors.imageReference = imageReference;
  visitors.delete = strikethrough;
  visitors.text = text;
  visitors.escape = escape;
  module.exports = visitors;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:remark-html@2.0.2/lib/transformer", ["npm:unist-util-visit@1.0.0"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var visit = $__require('npm:unist-util-visit@1.0.0');
  var FIRST_WORD = /^[^\ \t]+(?=[\ \t]|$)/;
  function getAttributes(node) {
    var data = node.data || (node.data = {});
    return data.htmlAttributes || (data.htmlAttributes = {});
  }
  function code(node) {
    var lang = node.lang && node.lang.match(FIRST_WORD);
    var attrs;
    if (!lang) {
      return;
    }
    attrs = getAttributes(node);
    attrs.class = (attrs.class ? attrs.class + ' ' : '') + 'language-' + lang;
  }
  var handlers = {};
  handlers.code = code;
  function transformer(ast) {
    visit(ast, function(node) {
      if (node.type in handlers) {
        handlers[node.type](node);
      }
    });
  }
  module.exports = transformer;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:remark-html@2.0.2/index", ["npm:remark-html@2.0.2/lib/compilers", "npm:remark-html@2.0.2/lib/transformer"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var compilers = $__require('npm:remark-html@2.0.2/lib/compilers');
  var transformer = $__require('npm:remark-html@2.0.2/lib/transformer');
  function plugin(remark, options) {
    var MarkdownCompiler = remark.Compiler;
    var ancestor = MarkdownCompiler.prototype;
    var proto;
    var key;
    function HTMLCompilerPrototype() {}
    HTMLCompilerPrototype.prototype = ancestor;
    proto = new HTMLCompilerPrototype();
    proto.options.xhtml = false;
    proto.options.sanitize = false;
    proto.options.entities = 'true';
    function HTMLCompiler(file) {
      if (file.extension) {
        file.move({'extension': 'html'});
      }
      MarkdownCompiler.apply(this, [file, options]);
    }
    HTMLCompiler.prototype = proto;
    for (key in compilers) {
      proto[key] = compilers[key];
    }
    remark.Compiler = HTMLCompiler;
    return transformer;
  }
  module.exports = plugin;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:remark-html@2.0.2", ["npm:remark-html@2.0.2/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:remark-html@2.0.2/index');
  global.define = __define;
  return module.exports;
});

System.register('plugins/haraway.js', ['npm:unist-util-visit@1.0.0'], function (_export) {
	'use strict';

	var visit;

	_export('transformer', transformer);

	function transformer(ast, file) {
		visit(ast, 'image', function (node) {
			if (node.src.includes('asset://')) {
				node.src = '//c.assets.sh/' + node.src.replace('asset://', '');
			}
		});
	}

	function attacher() {
		return transformer;
	}

	return {
		setters: [function (_npmUnistUtilVisit100) {
			visit = _npmUnistUtilVisit100['default'];
		}],
		execute: function () {
			_export('default', attacher);
		}
	};
});
System.register('plugins/youtube.js', ['npm:unist-util-visit@1.0.0'], function (_export) {
	'use strict';

	var visit;

	_export('transformer', transformer);

	function transformer(ast, file) {
		visit(ast, 'image', function (node) {
			if (node.src.includes('youtube://')) {
				node.type = 'html';
				node.value = '<iframe width="420" height="235" src="https://www.youtube.com/embed/' + node.src.replace('youtube://', '') + '" frameborder="0" allowfullscreen></iframe>';
			}
		});
	}

	function attacher() {
		return transformer;
	}

	return {
		setters: [function (_npmUnistUtilVisit100) {
			visit = _npmUnistUtilVisit100['default'];
		}],
		execute: function () {
			_export('default', attacher);
		}
	};
});
System.registerDynamic("npm:unist-util-visit@1.0.0/index", [], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  function forwards(values, callback) {
    var index = -1;
    var length = values.length;
    while (++index < length) {
      if (callback(values[index], index) === false) {
        return false;
      }
    }
    return true;
  }
  function backwards(values, callback) {
    var index = values.length;
    var length = -1;
    while (--index > length) {
      if (callback(values[index], index) === false) {
        return false;
      }
    }
    return true;
  }
  function visit(tree, type, callback, reverse) {
    var iterate;
    var one;
    var all;
    if (typeof type === 'function') {
      reverse = callback;
      callback = type;
      type = null;
    }
    iterate = reverse ? backwards : forwards;
    all = function(children, parent) {
      return iterate(children, function(child, index) {
        return child && one(child, index, parent);
      });
    };
    one = function(node, index, parent) {
      var result;
      index = index || (parent ? 0 : null);
      if (!type || node.type === type) {
        result = callback(node, index, parent || null);
      }
      if (node.children && result !== false) {
        return all(node.children, node);
      }
      return result;
    };
    one(tree);
  }
  module.exports = visit;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:unist-util-visit@1.0.0", ["npm:unist-util-visit@1.0.0/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:unist-util-visit@1.0.0/index');
  global.define = __define;
  return module.exports;
});

System.register('plugins/vimeo.js', ['npm:unist-util-visit@1.0.0'], function (_export) {
	'use strict';

	var visit;

	_export('transformer', transformer);

	function transformer(ast, file) {
		visit(ast, 'image', function (node) {
			if (node.src.includes('vimeo://')) {
				node.type = 'html';
				node.value = '<iframe width="420" height="235" src="https://player.vimeo.com/video/' + node.src.replace('vimeo://', '') + '?title=0&byline=0&portrait=0" frameborder="0" allowfullscreen></iframe>';
			}
		});
	}

	function attacher() {
		return transformer;
	}

	return {
		setters: [function (_npmUnistUtilVisit100) {
			visit = _npmUnistUtilVisit100['default'];
		}],
		execute: function () {
			_export('default', attacher);
		}
	};
});
System.register('index.js', ['npm:remark@3.2.2', 'npm:remark-html@2.0.2', 'plugins/haraway.js', 'plugins/youtube.js', 'plugins/vimeo.js'], function (_export) {
	'use strict';

	var remark, html, haraway, youtube, vimeo, parser;

	_export('main', main);

	function main() {
		window.onload = function () {
			var source = document.getElementById('source'),
			    preview = document.getElementById('preview');

			preview.innerHTML = parse(source.value);

			source.onkeyup = function (e) {
				preview.innerHTML = parse(source.value);
			};
		};
	}

	function parse(md) {
		return parser.process(md);
	}
	return {
		setters: [function (_npmRemark322) {
			remark = _npmRemark322['default'];
		}, function (_npmRemarkHtml202) {
			html = _npmRemarkHtml202['default'];
		}, function (_pluginsHarawayJs) {
			haraway = _pluginsHarawayJs['default'];
		}, function (_pluginsYoutubeJs) {
			youtube = _pluginsYoutubeJs['default'];
		}, function (_pluginsVimeoJs) {
			vimeo = _pluginsVimeoJs['default'];
		}],
		execute: function () {
			parser = remark().use(haraway).use(youtube).use(vimeo).use(html);
		}
	};
});
//# sourceMappingURL=build.js.map