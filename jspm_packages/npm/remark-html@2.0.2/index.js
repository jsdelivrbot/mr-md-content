/* */ 
'use strict';
var compilers = require('./lib/compilers');
var transformer = require('./lib/transformer');
function plugin(remark, options) {
  var MarkdownCompiler = remark.Compiler;
  var ancestor = MarkdownCompiler.prototype;
  var proto;
  var key;
  function HTMLCompilerPrototype() {}
  HTMLCompilerPrototype.prototype = ancestor;
  proto = new HTMLCompilerPrototype();
  proto.options.xhtml = false;
  proto.options.sanitize = false;
  proto.options.entities = 'true';
  function HTMLCompiler(file) {
    if (file.extension) {
      file.move({'extension': 'html'});
    }
    MarkdownCompiler.apply(this, [file, options]);
  }
  HTMLCompiler.prototype = proto;
  for (key in compilers) {
    proto[key] = compilers[key];
  }
  remark.Compiler = HTMLCompiler;
  return transformer;
}
module.exports = plugin;
