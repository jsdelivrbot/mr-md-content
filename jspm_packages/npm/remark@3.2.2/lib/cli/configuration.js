/* */ 
(function(process) {
  'use strict';
  var fs = require('fs');
  var path = require('path');
  var debug = require('debug')('remark:cli:configuration');
  var home = require('user-home');
  var findUp = require('vfile-find-up');
  var extend = require('extend.js');
  var defaults = require('../defaults');
  var RC_NAME = '.remarkrc';
  var PLUGIN_KEY = 'plugins';
  var PACKAGE_NAME = 'package';
  var PACKAGE_EXTENSION = 'json';
  var PACKAGE_FILENAME = [PACKAGE_NAME, PACKAGE_EXTENSION].join('.');
  var PACKAGE_FIELD = 'remarkConfig';
  var PERSONAL_CONFIGURATION = home ? path.join(home, RC_NAME) : null;
  var read = fs.readFileSync;
  var exists = fs.existsSync;
  var has = Object.prototype.hasOwnProperty;
  var concat = Array.prototype.concat;
  var base = {'settings': {}};
  extend(base.settings, defaults.parse);
  extend(base.settings, defaults.stringify);
  function merge(target, configuration, recursive) {
    var key;
    var value;
    var index;
    var length;
    var result;
    for (key in configuration) {
      if (has.call(configuration, key)) {
        value = configuration[key];
        result = target[key];
        if (key === PLUGIN_KEY && !recursive) {
          if (!result) {
            result = {};
            target[key] = result;
          }
          if ('length' in value) {
            index = -1;
            length = value.length;
            while (++index < length) {
              if (!(value[index] in result)) {
                result[value[index]] = null;
              }
            }
          } else {
            target[key] = merge(result, value, true);
          }
        } else if (typeof value === 'object' && value !== null) {
          if ('length' in value) {
            target[key] = concat.apply(value);
          } else {
            target[key] = merge(result || {}, value, true);
          }
        } else if (value !== undefined) {
          target[key] = value;
        }
      }
    }
    return target;
  }
  function load(filePath) {
    var configuration = {};
    if (filePath) {
      try {
        configuration = JSON.parse(read(filePath, 'utf8')) || {};
      } catch (exception) {
        exception.message = 'Cannot read configuration file: ' + filePath + '\n' + exception.message;
        throw exception;
      }
    }
    return configuration;
  }
  function getUserConfiguration() {
    var configuration = {};
    if (PERSONAL_CONFIGURATION && exists(PERSONAL_CONFIGURATION)) {
      configuration = load(PERSONAL_CONFIGURATION);
    }
    return configuration;
  }
  function getLocalConfiguration(context, directory, callback) {
    findUp.all([RC_NAME, PACKAGE_FILENAME], directory, function(err, files) {
      var configuration = {};
      var index = files && files.length;
      var file;
      var local;
      var found;
      while (index--) {
        file = files[index];
        local = load(file.filePath());
        if (file.filename === PACKAGE_NAME && file.extension === PACKAGE_EXTENSION) {
          local = local[PACKAGE_FIELD] || {};
        }
        found = true;
        debug('Using ' + file.filePath());
        merge(configuration, local);
      }
      if (!found) {
        debug('Using personal configuration');
        merge(configuration, getUserConfiguration());
      }
      callback(err, configuration);
    });
  }
  function Configuration(options) {
    var self = this;
    var settings = options || {};
    var file = settings.file;
    var cliConfiguration = {};
    self.cache = {};
    self.cwd = settings.cwd || process.cwd();
    self.settings = settings.settings || {};
    self.plugins = settings.plugins || {};
    self.output = settings.output;
    self.detectRC = settings.detectRC;
    if (file) {
      debug('Using command line configuration `' + file + '`');
      cliConfiguration = load(path.resolve(self.cwd, file));
    }
    self.cliConfiguration = cliConfiguration;
  }
  Configuration.prototype.base = base;
  Configuration.prototype.getConfiguration = function(filePath, callback) {
    var self = this;
    var directory = filePath ? path.dirname(filePath) : self.cwd;
    var configuration = self.cache[directory];
    debug('Constructing configuration for `' + (filePath || self.cwd) + '`');
    function handleLocalConfiguration(err, localConfiguration) {
      if (localConfiguration) {
        merge(configuration, localConfiguration);
      }
      merge(configuration, self.cliConfiguration);
      merge(configuration, {
        'settings': self.settings,
        'plugins': self.plugins,
        'output': self.output
      });
      self.cache[directory] = configuration;
      callback(err, configuration);
    }
    if (configuration) {
      debug('Using configuration from cache');
      callback(null, configuration);
    } else {
      configuration = {};
      merge(configuration, self.base);
      if (!self.detectRC) {
        debug('Ignoring .rc files');
        handleLocalConfiguration();
      } else {
        getLocalConfiguration(self, directory, handleLocalConfiguration);
      }
    }
  };
  module.exports = Configuration;
})(require('process'));
