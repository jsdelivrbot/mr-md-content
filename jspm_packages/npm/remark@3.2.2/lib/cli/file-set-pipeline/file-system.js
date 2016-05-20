/* */ 
'use strict';
var Ignore = require('../ignore');
var Finder = require('../finder');
function traverse(context, done) {
  var ignore;
  function next() {
    if (context.files && !context.globs.length) {
      done();
      return;
    }
    context.traverser.find(context.globs, function(err, files) {
      context.files = files || [];
      done(err);
    });
  }
  if (context.traverser) {
    next();
  } else {
    ignore = new Ignore({
      'file': context.ignorePath,
      'detectIgnore': context.detectIgnore
    });
    context.traverser = new Finder({
      'extensions': context.extensions,
      'ignore': ignore
    });
    ignore.loadPatterns(next);
  }
}
module.exports = traverse;
