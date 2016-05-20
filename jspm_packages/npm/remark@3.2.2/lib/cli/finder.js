/* */ 
(function(process) {
  'use strict';
  var fs = require('fs');
  var globby = require('globby');
  var hasMagic = require('glob').hasMagic;
  var minimatch = require('minimatch');
  var toVFile = require('to-vfile');
  var findDown = require('vfile-find-down');
  var stat = fs.statSync;
  function match(filePath, pattern) {
    return minimatch(filePath, pattern) || minimatch(filePath, pattern + '/**');
  }
  function Finder(options) {
    var self = this;
    var settings = options || {};
    self.ignore = settings.ignore;
    self.extensions = settings.extensions || [];
  }
  function find(globs, callback) {
    var self = this;
    var ignore = self.ignore;
    var extensions = self.extensions;
    var given = [];
    var failed = [];
    globs.forEach(function(glob) {
      var file;
      if (hasMagic(glob)) {
        return;
      }
      given.push(glob);
      try {
        stat(glob);
      } catch (err) {
        file = toVFile(glob);
        file.quiet = true;
        file.fail('No such file or directory');
        failed.push(file);
      }
    });
    globby(globs).then(function(filePaths) {
      findDown.all(function(file) {
        var filePath = file.filePath();
        var extension = file.extension;
        var mask;
        if (ignore.shouldIgnore(filePath)) {
          mask = findDown.SKIP;
          if (given.indexOf(filePath) !== -1) {
            mask = mask | findDown.INCLUDE;
            file.fail('Ignoring file specified on CLI as it is ' + 'ignored by `.remarkignore`');
          }
          return mask;
        }
        if (extension && extensions.indexOf(extension) !== -1) {
          return true;
        }
        return globs.some(function(glob) {
          return match(filePath, glob) && stat(filePath).isFile();
        });
      }, filePaths, function(err, files) {
        callback(err, failed.concat(files).map(function(file) {
          file.namespace('remark:cli').given = true;
          return file;
        }));
      });
    }, callback);
  }
  Finder.prototype.find = find;
  module.exports = Finder;
})(require('process'));
