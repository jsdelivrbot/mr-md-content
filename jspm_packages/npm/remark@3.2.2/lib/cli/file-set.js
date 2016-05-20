/* */ 
(function(process) {
  'use strict';
  var ware = require('ware');
  var toVFile = require('to-vfile');
  var filePipeline = require('./file-pipeline/index');
  function locked() {
    return this;
  }
  function one(fileSet) {
    fileSet.count++;
    if (fileSet.count >= fileSet.length && fileSet.done) {
      fileSet.done();
      fileSet.done = null;
    }
  }
  function FileSet(cli) {
    var self = this;
    self.contents = [];
    self.length = 0;
    self.count = 0;
    self.sourcePaths = [];
    self.cli = cli;
    self.pipeline = ware();
  }
  function valueOf() {
    return this.contents;
  }
  function use(plugin) {
    var self = this;
    var pipeline = self.pipeline;
    var duplicate = false;
    if (plugin && plugin.pluginId) {
      duplicate = pipeline.fns.some(function(fn) {
        return fn.pluginId === plugin.pluginId;
      });
    }
    if (!duplicate && pipeline.fns.indexOf(plugin) !== -1) {
      duplicate = true;
    }
    if (!duplicate) {
      pipeline.use(plugin);
    }
    return this;
  }
  function add(file) {
    var self = this;
    var paths = self.sourcePaths;
    var sourcePath;
    var context;
    if (typeof file === 'string') {
      file = toVFile(file);
    }
    sourcePath = file.filePath();
    if (paths.indexOf(sourcePath) !== -1) {
      return self;
    }
    paths.push(sourcePath);
    file.sourcePath = sourcePath;
    if (!file.namespace('remark:cli').given) {
      file.move = locked;
    }
    self.length++;
    self.valueOf().push(file);
    context = {
      'file': file,
      'fileSet': self
    };
    setImmediate(function() {
      filePipeline.run(context, function(err) {
        if (err) {
          file.fail(err);
        }
        one(self);
      });
    });
    return self;
  }
  FileSet.prototype.valueOf = valueOf;
  FileSet.prototype.toJSON = valueOf;
  FileSet.prototype.use = use;
  FileSet.prototype.add = add;
  module.exports = FileSet;
})(require('process'));
