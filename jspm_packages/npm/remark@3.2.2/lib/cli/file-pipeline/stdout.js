/* */ 
(function(process) {
  'use strict';
  var debug = require('debug')('remark:cli:file-pipeline:stdout');
  function stdout(context) {
    var fileSet = context.fileSet;
    var file = context.file;
    if (!fileSet.cli.watch && fileSet.cli.out && fileSet.length === 1 && (!context.output || !file.filePath())) {
      if (!file.namespace('remark:cli').given) {
        debug('Ignoring programmatically added file');
        return;
      }
      debug('Writing document to standard out');
      fileSet.cli.stdout.write(context.file.toString());
    } else {
      debug('Ignoring writing to standard out');
    }
  }
  module.exports = stdout;
})(require('process'));
