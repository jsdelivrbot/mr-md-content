/* */ 
'use strict';
var FileSet = require('../file-set');
function transform(context, done) {
  var fileSet = new FileSet(context);
  fileSet.done = done;
  context.files.forEach(fileSet.add, fileSet);
  context.fileSet = fileSet;
}
module.exports = transform;
