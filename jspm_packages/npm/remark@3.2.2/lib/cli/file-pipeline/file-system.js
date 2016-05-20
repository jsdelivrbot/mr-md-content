/* */ 
'use strict';
var fs = require('fs');
var debug = require('debug')('remark:cli:file-pipeline:file-system');
var writeFile = fs.writeFile;
function fileSystem(context, done) {
  var file = context.file;
  var fileSet = context.fileSet;
  var cli = fileSet.cli;
  var sourcePaths = fileSet.sourcePaths;
  var destinationPath;
  if (!context.output) {
    debug('Ignoring writing to file-system');
    done();
    return;
  }
  if (!file.namespace('remark:cli').given) {
    debug('Ignoring programmatically added file');
    done();
    return;
  }
  destinationPath = file.filePath();
  if (!destinationPath) {
    debug('Ignoring file without output location');
    done();
    return;
  }
  if (cli.watch && (sourcePaths.indexOf(destinationPath) !== -1)) {
    debug('Caching document as `%s` is watched', destinationPath);
    cli.cache.add(file);
    done();
  } else {
    debug('Writing document to `%s`', destinationPath);
    file.stored = true;
    writeFile(destinationPath, file.toString(), done);
  }
}
module.exports = fileSystem;
