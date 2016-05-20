/* */ 
'use strict';
var path = require('path');
var VFile = require('vfile');
var extname = path.extname;
var basename = path.basename;
var dirname = path.dirname;
function toFile(filePath) {
  var extension = extname(filePath);
  return new VFile({
    'directory': dirname(filePath),
    'filename': basename(filePath, extension),
    'extension': extension.slice(1)
  });
}
module.exports = toFile;
