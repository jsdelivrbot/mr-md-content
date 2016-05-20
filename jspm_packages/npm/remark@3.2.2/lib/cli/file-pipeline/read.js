/* */ 
'use strict';
var fs = require('fs');
var debug = require('debug')('remark:cli:file-pipeline:read');
var readFile = fs.readFile;
var ENCODING = 'utf-8';
function read(context, done) {
  var file = context.file;
  var filePath = file.filePath();
  if (file.contents || file.hasFailed()) {
    done();
  } else {
    debug('Reading `%s` in `%s`', filePath, ENCODING);
    readFile(filePath, ENCODING, function(err, contents) {
      debug('Read `%s` (err: %s)', filePath, err);
      file.contents = contents || '';
      done(err);
    });
  }
}
module.exports = read;
