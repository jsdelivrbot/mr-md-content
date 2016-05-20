/* */ 
'use strict';
var fs = require('fs');
var toVFile = require('./lib/to-vfile');
var read = fs.readFile;
var readSync = fs.readFileSync;
function async(filePath, callback) {
  var file = toVFile(filePath);
  read(filePath, 'utf-8', function(err, res) {
    if (err) {
      callback(err);
    } else {
      file.contents = res;
      callback(null, file);
    }
  });
}
function sync(filePath) {
  var file = toVFile(filePath);
  file.contents = readSync(filePath, 'utf-8');
  return file;
}
toVFile.read = async;
toVFile.readSync = sync;
module.exports = toVFile;
