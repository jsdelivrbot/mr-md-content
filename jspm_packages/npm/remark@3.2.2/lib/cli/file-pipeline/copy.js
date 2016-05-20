/* */ 
'use strict';
var fs = require('fs');
var path = require('path');
var debug = require('debug')('remark:cli:file-pipeline:copy');
var stat = fs.statSync;
var basename = path.basename;
var extname = path.extname;
var dirname = path.dirname;
var resolve = path.resolve;
var SEPERATOR = path.sep;
function copy(context) {
  var fileSet = context.fileSet;
  var file = context.file;
  var outpath = context.output;
  var multi = fileSet.length > 1;
  var currentPath = file.filePath();
  var isDir;
  var extension;
  if (typeof outpath !== 'string') {
    debug('Not copying');
    return;
  }
  debug('Copying `%s`', currentPath);
  try {
    isDir = stat(resolve(outpath)).isDirectory();
  } catch (err) {
    if (err.code !== 'ENOENT' || outpath.charAt(outpath.length - 1) === SEPERATOR) {
      err.message = 'Cannot read output directory. Error:\n' + err.message;
      throw err;
    }
    stat(resolve(dirname(outpath))).isDirectory();
    isDir = false;
  }
  if (!isDir && multi) {
    throw new Error('Cannot write multiple files to single output: ' + outpath);
  }
  extension = extname(outpath);
  file.move({
    'extension': isDir ? '' : extension ? extension.slice(1) : '',
    'filename': isDir ? '' : basename(outpath, extension),
    'directory': isDir ? outpath : dirname(outpath)
  });
  debug('Copying document from %s to %s', currentPath, file.filePath());
}
module.exports = copy;
