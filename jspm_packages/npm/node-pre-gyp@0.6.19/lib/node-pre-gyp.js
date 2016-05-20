/* */ 
(function(process) {
  "use strict";
  module.exports = exports;
  var path = require('path');
  var nopt = require('nopt');
  var log = require('npmlog');
  var EE = require('events').EventEmitter;
  var inherits = require('util').inherits;
  var commands = ['clean', 'install', 'reinstall', 'build', 'rebuild', 'package', 'testpackage', 'publish', 'unpublish', 'info', 'testbinary', 'reveal', 'configure'];
  var aliases = {};
  log.heading = 'node-pre-gyp';
  exports.find = require('./pre-binding').find;
  function Run() {
    var self = this;
    this.commands = {};
    commands.forEach(function(command) {
      self.commands[command] = function(argv, callback) {
        log.verbose('command', command, argv);
        return require('./' + command)(self, argv, callback);
      };
    });
  }
  inherits(Run, EE);
  exports.Run = Run;
  var proto = Run.prototype;
  proto.package = require('../package.json!systemjs-json');
  proto.configDefs = {
    help: Boolean,
    arch: String,
    debug: Boolean,
    directory: String,
    proxy: String,
    loglevel: String
  };
  proto.shorthands = {
    release: '--no-debug',
    C: '--directory',
    debug: '--debug',
    j: '--jobs',
    silent: '--loglevel=silent',
    silly: '--loglevel=silly',
    verbose: '--loglevel=verbose'
  };
  proto.aliases = aliases;
  proto.parseArgv = function parseOpts(argv) {
    this.opts = nopt(this.configDefs, this.shorthands, argv);
    this.argv = this.opts.argv.remain.slice();
    var commands = this.todo = [];
    argv = this.argv.map(function(arg) {
      if (arg in this.aliases) {
        arg = this.aliases[arg];
      }
      return arg;
    }, this);
    argv.slice().forEach(function(arg) {
      if (arg in this.commands) {
        var args = argv.splice(0, argv.indexOf(arg));
        argv.shift();
        if (commands.length > 0) {
          commands[commands.length - 1].args = args;
        }
        commands.push({
          name: arg,
          args: []
        });
      }
    }, this);
    if (commands.length > 0) {
      commands[commands.length - 1].args = argv.splice(0);
    }
    var npm_config_prefix = 'npm_config_';
    Object.keys(process.env).forEach(function(name) {
      if (name.indexOf(npm_config_prefix) !== 0)
        return;
      var val = process.env[name];
      if (name === npm_config_prefix + 'loglevel') {
        log.level = val;
      } else {
        name = name.substring(npm_config_prefix.length);
        if (name === 'argv') {
          if (this.opts.argv && this.opts.argv.remain && this.opts.argv.remain.length) {} else {
            this.opts[name] = val;
          }
        } else {
          this.opts[name] = val;
        }
      }
    }, this);
    if (this.opts.loglevel) {
      log.level = this.opts.loglevel;
    }
    log.resume();
  };
  proto.usage = function usage() {
    var str = ['', '  Usage: node-pre-gyp <command> [options]', '', '  where <command> is one of:', commands.map(function(c) {
      return '    - ' + c + ' - ' + require('./' + c).usage;
    }).join('\n'), '', 'node-pre-gyp@' + this.version + '  ' + path.resolve(__dirname, '..'), 'node@' + process.versions.node].join('\n');
    return str;
  };
  Object.defineProperty(proto, 'version', {
    get: function() {
      return this.package.version;
    },
    enumerable: true
  });
})(require('process'));
