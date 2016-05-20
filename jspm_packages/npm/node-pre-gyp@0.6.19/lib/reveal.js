/* */ 
"use strict";
module.exports = exports = reveal;
exports.usage = 'Reveals data on the versioned binary';
var fs = require('fs');
var versioning = require('./util/versioning');
function unix_paths(key, val) {
  return val && val.replace ? val.replace(/\\/g, '/') : val;
}
function reveal(gyp, argv, callback) {
  var package_json = JSON.parse(fs.readFileSync('./package.json'));
  var opts = versioning.evaluate(package_json, gyp.opts);
  var hit = false;
  var remain = gyp.opts.argv.remain.pop();
  if (remain && opts.hasOwnProperty(remain)) {
    console.log(opts[remain].replace(/\\/g, '/'));
    hit = true;
  }
  if (!hit) {
    console.log(JSON.stringify(opts, unix_paths, 2));
  }
  return callback();
}
