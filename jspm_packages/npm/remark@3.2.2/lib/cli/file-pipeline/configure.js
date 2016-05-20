/* */ 
(function(process) {
  'use strict';
  var fs = require('fs');
  var path = require('path');
  var debug = require('debug')('remark:cli:file-pipeline:configure');
  var npmPrefix = require('npm-prefix')();
  var remark = require('../../../index');
  var exists = fs.existsSync;
  var join = path.join;
  var resolve = path.resolve;
  var SEPERATOR = path.sep;
  var MODULES = 'node_modules';
  var isWindows = process.platform === 'win32';
  var isGlobal = process.argv[1].indexOf(npmPrefix) === 0;
  var globals = resolve(npmPrefix, isWindows ? '' : 'lib', MODULES);
  function findRoot(base) {
    var location = base;
    var parts = base.split(SEPERATOR);
    while (!exists(join(location, 'package.json')) && parts.length > 1) {
      parts.pop();
      location = parts.join(SEPERATOR);
    }
    return parts.length ? location : base;
  }
  function findPlugin(pathlike, cwd) {
    var root = findRoot(cwd);
    var pluginlike = 'remark-' + pathlike;
    var index = -1;
    var plugin = pathlike;
    var length;
    var paths = [resolve(root, pathlike), resolve(root, pathlike + '.js'), resolve(root, MODULES, pluginlike), resolve(root, MODULES, pathlike), resolve(cwd, MODULES, pluginlike), resolve(cwd, MODULES, pathlike)];
    if (isGlobal) {
      paths.push(resolve(globals, pathlike), resolve(globals, pluginlike));
    }
    length = paths.length;
    while (++index < length) {
      if (exists(paths[index])) {
        plugin = paths[index];
        break;
      }
    }
    debug('Using plug-in `%s` at `%s`', pathlike, plugin);
    return require(plugin);
  }
  function configure(context, next) {
    var file = context.file;
    var cli = context.fileSet.cli;
    var config = cli.configuration;
    var processor = remark();
    var plugins;
    if (file.hasFailed()) {
      next();
      return;
    }
    config.getConfiguration(file.filePath(), function(err, options) {
      var option;
      var plugin;
      var length;
      var index;
      var name;
      debug('Setting output `%s`', options.output);
      debug('Using settings `%j`', options.settings);
      plugins = Object.keys(options.plugins);
      length = plugins.length;
      index = -1;
      debug('Using plug-ins `%j`', plugins);
      while (++index < length) {
        name = plugins[index];
        option = options.plugins[name];
        if (option === false) {
          debug('Ignoring plug-in `%s`', name);
          continue;
        }
        if (option === null) {
          option = undefined;
        }
        try {
          plugin = findPlugin(name, cli.cwd);
          debug('Applying options `%j` to `%s`', option, name);
          processor.use(plugin, option, context.fileSet);
        } catch (err) {
          next(err);
          return;
        }
      }
      plugins = cli.injectedPlugins;
      length = plugins.length;
      index = -1;
      debug('Using `%d` injected plugins', length);
      while (++index < length) {
        plugin = plugins[index][0];
        option = plugins[index][1];
        name = plugin.displayName || plugin.name || '';
        try {
          debug('Applying options `%j` to `%s`', option, name);
          processor.use(plugin, option, context.fileSet);
        } catch (err) {
          next(err);
          return;
        }
      }
      context.output = options.output;
      context.settings = options.settings;
      context.processor = processor;
      next();
    });
  }
  module.exports = configure;
})(require('process'));
