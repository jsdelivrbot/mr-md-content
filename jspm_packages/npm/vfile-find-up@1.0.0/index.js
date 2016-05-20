/* */ 
(function(process) {
  'use strict';
  var fs = require('fs');
  var path = require('path');
  var toVFile = require('to-vfile');
  var readdir = fs.readdir;
  var resolve = path.resolve;
  var dirname = path.dirname;
  var basename = path.basename;
  var DOT = '.';
  var INCLUDE = 1;
  var BREAK = 4;
  function mask(value, bitmask) {
    return (value & bitmask) === bitmask;
  }
  function filePathFactory(filePath) {
    var isExtensionLike = filePath.charAt(0) === DOT;
    var extension = isExtensionLike && filePath.slice(1);
    return function(file) {
      var name = file.filename + (file.extension ? DOT + file.extension : '');
      return filePath === name || (isExtensionLike && extension === file.extension);
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
      index = -1;
      while (++index < length) {
        if (tests[index](file)) {
          return true;
        }
      }
      return false;
    };
  }
  function find(test, directory, callback, one) {
    var results = [];
    var currentDirectory;
    test = augment(test);
    if (!callback) {
      callback = directory;
      directory = null;
    }
    currentDirectory = directory ? resolve(directory) : process.cwd();
    function handle(filePath) {
      var file = toVFile(filePath);
      var result = test(file);
      if (mask(result, INCLUDE)) {
        if (one) {
          callback(null, file);
          return true;
        }
        results.push(file);
      }
      if (mask(result, BREAK)) {
        callback(null, one ? null : results);
        return true;
      }
    }
    function once(childDirectory) {
      if (handle(currentDirectory) === true) {
        return;
      }
      readdir(currentDirectory, function(err, entries) {
        var length = entries ? entries.length : 0;
        var index = -1;
        var entry;
        if (err) {
          entries = [];
        }
        while (++index < length) {
          entry = entries[index];
          if (entry !== childDirectory) {
            if (handle(resolve(currentDirectory, entry)) === true) {
              return;
            }
          }
        }
        childDirectory = currentDirectory;
        currentDirectory = dirname(currentDirectory);
        if (currentDirectory === childDirectory) {
          callback(null, one ? null : results);
          return;
        }
        once(basename(childDirectory));
      });
    }
    once();
  }
  function findOne(test, directory, callback) {
    return find(test, directory, callback, true);
  }
  function findAll(test, directory, callback) {
    return find(test, directory, callback);
  }
  var findUp = {};
  findUp.INCLUDE = INCLUDE;
  findUp.BREAK = BREAK;
  findUp.one = findOne;
  findUp.all = findAll;
  module.exports = findUp;
})(require('process'));
