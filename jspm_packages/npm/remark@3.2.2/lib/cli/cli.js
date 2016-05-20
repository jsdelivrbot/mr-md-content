/* */ 
(function(process) {
  'use strict';
  var util = require('util');
  var events = require('events');
  var commander = require('commander');
  var camelcase = require('camelcase');
  var pack = require('../../package.json!systemjs-json');
  var Cache = require('./watch-output-cache');
  var Spinner = require('./spinner');
  var Emitter = events.EventEmitter;
  var Command = commander.Command;
  var SPLITTER = / *[,;] */g;
  var EXTENSIONS = ['md', 'markdown', 'mkd', 'mkdn', 'mkdown', 'ron'];
  var COMMAND = Object.keys(pack.bin)[0];
  function parseJSON(value) {
    value = value.replace(/([a-zA-Z0-9\-\/]+)(?=\s*:)/g, '\"$&\"');
    return JSON.parse('{' + value + '}');
  }
  function toCamelCase(object) {
    var result = {};
    var value;
    var key;
    for (key in object) {
      value = object[key];
      if (value && typeof value === 'object' && !('length' in value)) {
        value = toCamelCase(value);
      }
      result[camelcase(key)] = value;
    }
    return result;
  }
  function options(flags, cache) {
    var flag;
    try {
      flags = toCamelCase(parseJSON(flags));
    } catch (exception) {
      exception.message = 'Cannot parse CLI settings: \nError: ' + exception.message;
      throw exception;
    }
    for (flag in flags) {
      cache[flag] = flags[flag];
    }
    return cache;
  }
  function parsePlugin(plugin) {
    var index = plugin.indexOf('=');
    var name;
    var value;
    if (index === -1) {
      name = plugin;
      value = null;
    } else {
      name = plugin.slice(0, index);
      value = options(plugin.slice(index + 1), {});
    }
    return {
      'name': name,
      'value': value
    };
  }
  function plugins(plugin, cache) {
    plugin = parsePlugin(plugin);
    cache[plugin.name] = plugin.value;
    return cache;
  }
  function extensions(extension, cache) {
    return cache.concat(extension.split(SPLITTER));
  }
  function help() {
    console.log(['  See also: man 1 remark, man 3 remark,', '    man 3 remarkplugin, man 5 remarkrc,', '    man 5 remarkignore, man 7 remarksetting,', '    man 7 remarkconfig, man 7 remarkplugin.', '', '  Examples:', '', '    # Process `readme.md`', '    $ ' + COMMAND + ' readme.md -o readme-new.md', '', '    # Pass stdin(4) through remark, with settings, to stdout(4)', '    $ ' + COMMAND + ' --setting "setext: true, bullet: \\"*\\""' + ' < readme.md > readme-new.md', '', '    # Use a plugin (with options)', '    $ npm install remark-toc', '    $ ' + COMMAND + ' readme.md --use "toc=heading:\\"contents\\""' + ' -o', '', '    # Rewrite markdown in a directory', '    $ ' + COMMAND + ' . -o'].join('\n'));
  }
  var program = new Command(pack.name).version(pack.version).description(pack.description).usage('[options] <pathspec...>').option('-o, --output [path]', 'specify output location').option('-c, --config-path <path>', 'specify configuration location').option('-i, --ignore-path <path>', 'specify ignore location').option('-s, --setting <settings>', 'specify settings', options, {}).option('-u, --use <plugins>', 'use transform plugin(s)', plugins, {}).option('-e, --ext <extensions>', 'specify extensions', extensions, []).option('-w, --watch', 'watch for changes and reprocess', false).option('-a, --ast', 'output AST information', false).option('-q, --quiet', 'output only warnings and errors', false).option('-S, --silent', 'output only errors', false).option('-f, --frail', 'exit with 1 on warnings', false).option('--file-path <path>', 'specify file path to process as', false).option('--no-stdout', 'disable writing to stdout', true).option('--no-color', 'disable color in output', false).option('--no-rc', 'disable configuration from .remarkrc', false).option('--no-ignore', 'disable ignore from .remarkignore', false);
  program.on('--help', help);
  function CLI(argv) {
    var self = this;
    var config = argv;
    if (argv instanceof CLI) {
      return argv;
    }
    self.cache = new Cache();
    self.spinner = new Spinner();
    self.injectedPlugins = [];
    if ('length' in config) {
      program.parse(argv);
      self.globs = program.args;
      self.extensions = [].concat(program.ext, EXTENSIONS);
      self.output = program.output;
      self.settings = program.setting;
      self.plugins = program.use;
      self.color = program.color;
      self.out = program.stdout;
      self.ast = program.ast;
      self.detectRC = program.rc;
      self.detectIgnore = program.ignore;
      self.quiet = program.quiet;
      self.silent = program.silent;
      self.frail = program.frail;
      self.filePath = program.filePath;
      self.configPath = program.configPath;
      self.ignorePath = program.ignorePath;
      self.watch = program.watch;
    } else {
      self.globs = [].concat(config.files || []);
      self.extensions = [].concat(config.extensions || [], EXTENSIONS);
      self.output = config.output;
      self.settings = config.settings;
      self.plugins = config.plugins;
      self.color = config.color;
      self.out = config.stdout;
      self.ast = config.ast;
      self.detectRC = config.detectRC;
      self.detectIgnore = config.detectIgnore;
      self.quiet = config.quiet;
      self.silent = config.silent;
      self.frail = config.frail;
      self.filePath = config.filePath;
      self.configPath = config.configPath;
      self.ignorePath = config.ignorePath;
      self.watch = config.watch;
    }
    self.cwd = config.cwd || process.cwd();
    Emitter.call(self);
  }
  function log() {
    var self = this;
    var stdout = self.stdout;
    if (!self.silent && !self.quiet) {
      stdout.write.apply(stdout, arguments);
    }
  }
  function usage() {
    return program.outputHelp();
  }
  function use(plugin, options) {
    this.injectedPlugins.push([plugin, options]);
    return this;
  }
  util.inherits(CLI, Emitter);
  CLI.prototype.stdout = process.stdout;
  CLI.prototype.stderr = process.stderr;
  CLI.prototype.log = log;
  CLI.prototype.usage = usage;
  CLI.prototype.use = use;
  module.exports = CLI;
})(require('process'));
