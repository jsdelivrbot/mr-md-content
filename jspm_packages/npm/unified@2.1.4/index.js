/* */ 
(function(process) {
  'use strict';
  var bail = require('bail');
  var ware = require('ware');
  var AttachWare = require('attach-ware')(ware);
  var VFile = require('vfile');
  var unherit = require('unherit');
  var extend;
  try {
    extend = require('extend');
  } catch (e) {
    extend = require('extend');
  }
  var pipeline = ware().use(function(ctx) {
    ctx.tree = ctx.context.parse(ctx.file, ctx.settings);
  }).use(function(ctx, next) {
    ctx.context.run(ctx.tree, ctx.file, next);
  }).use(function(ctx) {
    ctx.result = ctx.context.stringify(ctx.tree, ctx.file, ctx.settings);
  });
  function unified(options) {
    var name = options.name;
    var Parser = options.Parser;
    var Compiler = options.Compiler;
    var data = options.data;
    function Processor(processor) {
      var self = this;
      if (!(self instanceof Processor)) {
        return new Processor(processor);
      }
      self.ware = new AttachWare(processor && processor.ware);
      self.ware.context = self;
      self.Parser = unherit(Parser);
      self.Compiler = unherit(Compiler);
      if (self.data) {
        self.data = extend(true, {}, self.data);
      }
    }
    function instance(context) {
      return context instanceof Processor ? context : new Processor();
    }
    function use() {
      var self = instance(this);
      self.ware.use.apply(self.ware, arguments);
      return self;
    }
    function run(node, file, done) {
      var self = this;
      var space;
      if (typeof file === 'function') {
        done = file;
        file = null;
      }
      if (!file && node && !node.type) {
        file = node;
        node = null;
      }
      file = new VFile(file);
      space = file.namespace(name);
      if (!node) {
        node = space.tree || node;
      } else if (!space.tree) {
        space.tree = node;
      }
      if (!node) {
        throw new Error('Expected node, got ' + node);
      }
      done = typeof done === 'function' ? done : bail;
      if (self.ware && self.ware.fns) {
        self.ware.run(node, file, done);
      } else {
        done(null, node, file);
      }
      return node;
    }
    function parse(value, settings) {
      var file = new VFile(value);
      var CustomParser = (this && this.Parser) || Parser;
      var node = new CustomParser(file, settings, instance(this)).parse();
      file.namespace(name).tree = node;
      return node;
    }
    function stringify(node, file, settings) {
      var CustomCompiler = (this && this.Compiler) || Compiler;
      var space;
      if (settings === null || settings === undefined) {
        settings = file;
        file = null;
      }
      if (!file && node && !node.type) {
        file = node;
        node = null;
      }
      file = new VFile(file);
      space = file.namespace(name);
      if (!node) {
        node = space.tree || node;
      } else if (!space.tree) {
        space.tree = node;
      }
      if (!node) {
        throw new Error('Expected node, got ' + node);
      }
      return new CustomCompiler(file, settings, instance(this)).compile();
    }
    function process(value, settings, done) {
      var self = instance(this);
      var file = new VFile(value);
      var result = null;
      if (typeof settings === 'function') {
        done = settings;
        settings = null;
      }
      pipeline.run({
        'context': self,
        'file': file,
        'settings': settings || {}
      }, function(err, res) {
        result = res && res.result;
        if (done) {
          done(err, file, result);
        } else if (err) {
          bail(err);
        }
      });
      return result;
    }
    var proto = Processor.prototype;
    Processor.use = proto.use = use;
    Processor.parse = proto.parse = parse;
    Processor.run = proto.run = run;
    Processor.stringify = proto.stringify = stringify;
    Processor.process = proto.process = process;
    Processor.data = proto.data = data || null;
    return Processor;
  }
  module.exports = unified;
})(require('process'));
