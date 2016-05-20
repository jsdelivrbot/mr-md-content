/* */ 
(function(process) {
  'use strict';
  var unified = require('unified');
  var Parser = require('./lib/parse');
  var Compiler = require('./lib/stringify');
  var escape = require('./lib/escape.json!systemjs-json');
  module.exports = unified({
    'name': 'mdast',
    'Parser': Parser,
    'Compiler': Compiler,
    'data': {'escape': escape}
  });
})(require('process'));
