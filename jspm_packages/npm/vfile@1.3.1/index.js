/* */ 
(function(process) {
  'use strict';
  var SEPARATOR = '/';
  try {
    SEPARATOR = require('pa' + 'th').sep;
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
})(require('process'));
