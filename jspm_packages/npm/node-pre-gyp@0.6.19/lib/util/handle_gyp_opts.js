/* */ 
(function(process) {
  "use strict";
  module.exports = exports = handle_gyp_opts;
  var fs = require('fs');
  var versioning = require('./versioning');
  var share_with_node_gyp = ['module', 'module_name', 'module_path'];
  function handle_gyp_opts(gyp, argv, callback) {
    var node_pre_gyp_options = [];
    var opts = versioning.evaluate(JSON.parse(fs.readFileSync('./package.json')), gyp.opts);
    share_with_node_gyp.forEach(function(key) {
      var val = opts[key];
      if (val) {
        node_pre_gyp_options.push('--' + key + '=' + val);
      } else {
        return callback(new Error("Option " + key + " required but not found by node-pre-gyp"));
      }
    });
    var unparsed_options = [];
    var double_hyphen_found = false;
    gyp.opts.argv.original.forEach(function(opt) {
      if (double_hyphen_found) {
        unparsed_options.push(opt);
      }
      if (opt == '--') {
        double_hyphen_found = true;
      }
    });
    var cooked = gyp.opts.argv.cooked;
    var node_gyp_options = [];
    cooked.forEach(function(value) {
      if (value.length > 2 && value.slice(0, 2) == '--') {
        var key = value.slice(2);
        var val = cooked[cooked.indexOf(value) + 1];
        if (val && val.indexOf('--') === -1) {
          node_gyp_options.push('--' + key + '=' + val);
        } else {
          node_gyp_options.push(value);
        }
      }
    });
    var result = {
      'opts': opts,
      'gyp': node_gyp_options,
      'pre': node_pre_gyp_options,
      'unparsed': unparsed_options
    };
    return callback(null, result);
  }
})(require('process'));
