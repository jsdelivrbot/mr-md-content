/* */ 
(function(process) {
  'use strict';
  var fs = require('fs');
  var path = require('path');
  var toVFile = require('to-vfile');
  var readdir = fs.readdir;
  var stat = fs.stat;
  var resolve = path.resolve;
  var join = path.join;
  var has = Object.prototype.hasOwnProperty;
  var NODE_MODULES = 'node_modules';
  var EMPTY = '';
  var DOT = '.';
  var INCLUDE = 1;
  var SKIP = 4;
  var BREAK = 8;
  function mask(value, bitmask) {
    return (value & bitmask) === bitmask;
  }
  function filePathFactory(filePath) {
    var isExtensionLike = filePath.charAt(0) === DOT;
    var extension = isExtensionLike && filePath.slice(1);
    return function(file) {
      var filename = file.filename;
      var parts = [filename];
      if (file.extension) {
        parts.push(file.extension);
      }
      if (filePath === parts.join(DOT) || (isExtensionLike && extension === file.extension)) {
        return true;
      }
      if (filename.charAt(0) === DOT || filename === NODE_MODULES) {
        return SKIP;
      }
    };
  }
  function augment(test) {
    var index;
    var length;
    var tests;
    if (typeof test === 'string') {
      return filePathFactory(test);
    }
    if (typeof test === 'function') {
      return test;
    }
    length = test.length;
    index = -1;
    tests = [];
    while (++index < length) {
      tests[index] = augment(test[index]);
    }
    return function(file) {
      var result;
      index = -1;
      while (++index < length) {
        result = tests[index](file);
        if (result) {
          return result;
        }
      }
      return false;
    };
  }
  function visit(state, filePath, one, done) {
    var file;
    if (has.call(state.checked, filePath)) {
      done([]);
      return;
    }
    state.checked[filePath] = true;
    file = toVFile(filePath);
    file.quiet = true;
    stat(resolve(filePath), function(err, stats) {
      var real = Boolean(stats);
      var results = [];
      var result;
      if (state.broken || !real) {
        done([]);
      } else {
        result = state.test(file);
        if (mask(result, INCLUDE)) {
          results.push(file);
          if (one) {
            state.broken = true;
            return done(results);
          }
        }
        if (mask(result, BREAK)) {
          state.broken = true;
        }
        if (state.broken || !stats.isDirectory() || mask(result, SKIP)) {
          return done(results);
        }
        readdir(filePath, function(err, entries) {
          visitAll(state, entries, filePath, one, function(files) {
            done(results.concat(files));
          });
        });
      }
    });
  }
  function visitAll(state, paths, directory, one, done) {
    var result = [];
    var length = paths.length;
    var count = -1;
    function next() {
      count++;
      if (count === length) {
        done(result);
      }
    }
    paths.forEach(function(filePath) {
      visit(state, join(directory || EMPTY, filePath), one, function(files) {
        result = result.concat(files);
        next();
      });
    });
    next();
  }
  function find(test, paths, callback, one) {
    var state = {
      'broken': false,
      'checked': [],
      'test': augment(test)
    };
    if (!callback) {
      callback = paths;
      paths = [process.cwd()];
    } else if (typeof paths === 'string') {
      paths = [paths];
    }
    return visitAll(state, paths, null, one, function(result) {
      callback(null, one ? result[0] || null : result);
    });
  }
  function one(test, paths, callback) {
    return find(test, paths, callback, true);
  }
  function all(test, paths, callback) {
    return find(test, paths, callback);
  }
  var findDown = {};
  findDown.INCLUDE = INCLUDE;
  findDown.SKIP = SKIP;
  findDown.BREAK = BREAK;
  findDown.all = all;
  findDown.one = one;
  module.exports = findDown;
})(require('process'));
