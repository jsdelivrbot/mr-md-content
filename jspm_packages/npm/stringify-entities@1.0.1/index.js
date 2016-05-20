/* */ 
'use strict';
var entities = require('character-entities-html4');
var EXPRESSION_NAMED = require('./lib/expression');
var has = {}.hasOwnProperty;
var escapes = ['"', '\'', '<', '>', '&', '`'];
var characters = {};
(function() {
  var name;
  for (name in entities) {
    characters[entities[name]] = name;
  }
})();
var EXPRESSION_ESCAPE = new RegExp('[' + escapes.join('') + ']', 'g');
var EXPRESSION_SURROGATE_PAIR = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
var EXPRESSION_BMP = /[\x01-\t\x0B\f\x0E-\x1F\x7F\x81\x8D\x8F\x90\x9D\xA0-\uFFFF]/g;
function characterCodeToHexadecimalReference(code) {
  return '&#x' + code.toString(16).toUpperCase() + ';';
}
function characterToHexadecimalReference(character) {
  return characterCodeToHexadecimalReference(character.charCodeAt(0));
}
function toNamedEntity(name) {
  return '&' + name + ';';
}
function characterToNamedEntity(character) {
  return toNamedEntity(characters[character]);
}
function encode(value, options) {
  var settings = options || {};
  var escapeOnly = settings.escapeOnly;
  var named = settings.useNamedReferences;
  var map = named ? characters : null;
  value = value.replace(EXPRESSION_ESCAPE, function(character) {
    return map && has.call(map, character) ? toNamedEntity(map[character]) : characterToHexadecimalReference(character);
  });
  if (escapeOnly) {
    return value;
  }
  if (named) {
    value = value.replace(EXPRESSION_NAMED, characterToNamedEntity);
  }
  return value.replace(EXPRESSION_SURROGATE_PAIR, function(pair) {
    return characterCodeToHexadecimalReference((pair.charCodeAt(0) - 0xD800) * 0x400 + pair.charCodeAt(1) - 0xDC00 + 0x10000);
  }).replace(EXPRESSION_BMP, characterToHexadecimalReference);
}
function escape(value) {
  return encode(value, {
    'escapeOnly': true,
    'useNamedReferences': true
  });
}
encode.escape = escape;
module.exports = encode;
