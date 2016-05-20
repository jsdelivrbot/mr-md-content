/* */ 
"use strict";
module.exports = exports = build;
exports.usage = 'Attempts to compile the module by dispatching to node-gyp or nw-gyp';
var compile = require('./util/compile');
var handle_gyp_opts = require('./util/handle_gyp_opts');
var configure = require('./configure');
function do_build(gyp, argv, callback) {
  handle_gyp_opts(gyp, argv, function(err, result) {
    var final_args = ['build'].concat(result.gyp).concat(result.pre);
    if (result.unparsed.length > 0) {
      final_args = final_args.concat(['--']).concat(result.unparsed);
    }
    compile.run_gyp(final_args, result.opts, function(err) {
      return callback(err);
    });
  });
}
function build(gyp, argv, callback) {
  if (argv.length && (argv.indexOf('rebuild') > -1)) {
    compile.run_gyp(['clean'], {}, function(err) {
      if (err)
        return callback(err);
      configure(gyp, argv, function(err) {
        if (err)
          return callback(err);
        return do_build(gyp, argv, callback);
      });
    });
  } else {
    return do_build(gyp, argv, callback);
  }
}
