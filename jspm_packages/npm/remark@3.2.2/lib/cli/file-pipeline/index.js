/* */ 
'use strict';
var ware = require('ware');
var read = require('./read');
var configure = require('./configure');
var parse = require('./parse');
var transform = require('./transform');
var queue = require('./queue');
var stringify = require('./stringify');
var copy = require('./copy');
var stdout = require('./stdout');
var fileSystem = require('./file-system');
function runFactory(pipe) {
  function run(context, next) {
    pipe.run(context, function(err) {
      if (err) {
        context.file.quiet = true;
        context.file.fail(err);
      }
      next();
    });
  }
  return run;
}
var pipe = ware().use(runFactory(ware().use(read).use(configure).use(parse).use(transform))).use(runFactory(ware().use(queue))).use(runFactory(ware().use(stringify).use(copy).use(stdout).use(fileSystem)));
module.exports = pipe;
