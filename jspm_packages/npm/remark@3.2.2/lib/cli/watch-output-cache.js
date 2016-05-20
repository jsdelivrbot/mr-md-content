/* */ 
(function(process) {
  'use strict';
  var debug = require('debug')('remark:cli:watch-output-cache');
  var fs = require('fs');
  function Cache() {
    this.cache = {};
    this.length = 0;
  }
  function add(file) {
    var filePath = file.filePath();
    this.cache[filePath] = file;
    this.length++;
    debug('Add document at %s to cache', filePath);
  }
  function writeAll() {
    var self = this;
    var cache = self.cache;
    Object.keys(cache).forEach(function(path) {
      var file = cache[path];
      var destinationPath = file.filePath();
      debug('Writing document to `%s`', destinationPath);
      file.stored = true;
      fs.writeFileSync(destinationPath, file.toString());
    });
    self.length = 0;
    self.cache = {};
    debug('Written all cached documents');
  }
  var proto = Cache.prototype;
  proto.add = add;
  proto.writeAll = writeAll;
  module.exports = Cache;
})(require('process'));
