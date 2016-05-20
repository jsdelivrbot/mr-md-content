/* */ 
(function(process) {
  'use strict';
  var debug = require('debug')('remark:cli:file-pipeline:stringify');
  function stringify(context) {
    var cli = context.fileSet.cli;
    var file = context.file;
    var value;
    if (!context.processor || context.ast) {
      debug('Not compiling failed document');
      return;
    }
    debug('Compiling document');
    if (cli.ast) {
      file.move({'extension': 'json'});
      value = JSON.stringify(file.namespace('mdast').tree, null, 2);
    } else {
      value = context.processor.stringify(file, context.settings);
    }
    file.contents = value;
    debug('Compiled document to %s', file.extension || 'markdown');
  }
  module.exports = stringify;
})(require('process'));
