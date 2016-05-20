/* */ 
var mkdirp = require('mkdirp');
var path = require('path');
var i = 0;
var tap = require('tap');
var fs = require('fs');
var rimraf = require('rimraf');
var fixtures = path.resolve(__dirname, "fixtures");
var chars = ['a', 'b', 'c'];
var dirs = [];
for (var i = 0; i < 3; i++) {
  for (var j = 0; j < 3; j++) {
    for (var k = 0; k < 3; k++) {
      dirs.push(chars[i] + '/' + chars[j] + '/' + chars[k]);
    }
  }
}
var files = [];
for (var i = 0; i < 3; i++) {
  for (var j = 0; j < 3; j++) {
    for (var k = 0; k < 3; k++) {
      files.push(chars[i] + chars[j] + chars[k]);
      files.push('.' + chars[i] + chars[j] + chars[k]);
    }
  }
}
tap.test("remove fixtures", function(t) {
  rimraf(path.resolve(__dirname, "fixtures"), function(er) {
    t.ifError(er, "remove fixtures");
    t.end();
  });
});
tap.test("create fixtures", function(t) {
  dirs.forEach(function(dir) {
    dir = path.resolve(fixtures, dir);
    t.test("mkdir " + dir, function(t) {
      mkdirp(dir, function(er) {
        t.ifError(er, "mkdir " + dir);
        if (er)
          return t.end();
        files.forEach(function(file) {
          file = path.resolve(dir, file);
          t.test("writeFile " + file, function(t) {
            fs.writeFile(file, path.basename(file), function(er) {
              t.ifError(er, "writing " + file);
              t.end();
            });
          });
        });
        t.end();
      });
    });
  });
  t.end();
});
