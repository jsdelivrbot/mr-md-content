/* */ 
(function(process) {
  var repeat = require('lodash.repeat');
  var INFINITY = 1 / 0,
      MAX_INTEGER = 1.7976931348623157e+308,
      NAN = 0 / 0;
  var funcTag = '[object Function]',
      genTag = '[object GeneratorFunction]',
      symbolTag = '[object Symbol]';
  var reTrim = /^\s+|\s+$/g;
  var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
  var reIsBinary = /^0b[01]+$/i;
  var reIsOctal = /^0o[0-7]+$/i;
  var rsAstralRange = '\\ud800-\\udfff',
      rsComboRange = '\\u0300-\\u036f\\ufe20-\\ufe23',
      rsVarRange = '\\ufe0e\\ufe0f';
  var rsAstral = '[' + rsAstralRange + ']',
      rsCombo = '[' + rsComboRange + ']',
      rsModifier = '(?:\\ud83c[\\udffb-\\udfff])',
      rsNonAstral = '[^' + rsAstralRange + ']',
      rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}',
      rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]',
      rsZWJ = '\\u200d';
  var reOptMod = rsModifier + '?',
      rsOptVar = '[' + rsVarRange + ']?',
      rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
      rsSeq = rsOptVar + reOptMod + rsOptJoin,
      rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';
  var reComplexSymbol = RegExp(rsSymbol + rsSeq, 'g');
  var reHasComplexSymbol = RegExp('[' + rsZWJ + rsAstralRange + rsComboRange + rsVarRange + ']');
  var freeParseInt = parseInt;
  function stringSize(string) {
    if (!(string && reHasComplexSymbol.test(string))) {
      return string.length;
    }
    var result = reComplexSymbol.lastIndex = 0;
    while (reComplexSymbol.test(string)) {
      result++;
    }
    return result;
  }
  function stringToArray(string) {
    return string.match(reComplexSymbol);
  }
  var objectProto = global.Object.prototype;
  var objectToString = objectProto.toString;
  var _Symbol = global.Symbol;
  var nativeCeil = Math.ceil,
      nativeFloor = Math.floor;
  var symbolProto = _Symbol ? _Symbol.prototype : undefined,
      symbolToString = _Symbol ? symbolProto.toString : undefined;
  function createPadding(string, length, chars) {
    length = toInteger(length);
    var strLength = stringSize(string);
    if (!length || strLength >= length) {
      return '';
    }
    var padLength = length - strLength;
    chars = chars === undefined ? ' ' : (chars + '');
    var result = repeat(chars, nativeCeil(padLength / stringSize(chars)));
    return reHasComplexSymbol.test(chars) ? stringToArray(result).slice(0, padLength).join('') : result.slice(0, padLength);
  }
  function isFunction(value) {
    var tag = isObject(value) ? objectToString.call(value) : '';
    return tag == funcTag || tag == genTag;
  }
  function isObject(value) {
    var type = typeof value;
    return !!value && (type == 'object' || type == 'function');
  }
  function isObjectLike(value) {
    return !!value && typeof value == 'object';
  }
  function isSymbol(value) {
    return typeof value == 'symbol' || (isObjectLike(value) && objectToString.call(value) == symbolTag);
  }
  function toInteger(value) {
    if (!value) {
      return value === 0 ? value : 0;
    }
    value = toNumber(value);
    if (value === INFINITY || value === -INFINITY) {
      var sign = (value < 0 ? -1 : 1);
      return sign * MAX_INTEGER;
    }
    var remainder = value % 1;
    return value === value ? (remainder ? value - remainder : value) : 0;
  }
  function toNumber(value) {
    if (isObject(value)) {
      var other = isFunction(value.valueOf) ? value.valueOf() : value;
      value = isObject(other) ? (other + '') : other;
    }
    if (typeof value != 'string') {
      return value === 0 ? value : +value;
    }
    value = value.replace(reTrim, '');
    var isBinary = reIsBinary.test(value);
    return (isBinary || reIsOctal.test(value)) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : (reIsBadHex.test(value) ? NAN : +value);
  }
  function toString(value) {
    if (typeof value == 'string') {
      return value;
    }
    if (value == null) {
      return '';
    }
    if (isSymbol(value)) {
      return _Symbol ? symbolToString.call(value) : '';
    }
    var result = (value + '');
    return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
  }
  function pad(string, length, chars) {
    string = toString(string);
    length = toInteger(length);
    var strLength = stringSize(string);
    if (!length || strLength >= length) {
      return string;
    }
    var mid = (length - strLength) / 2,
        leftLength = nativeFloor(mid),
        rightLength = nativeCeil(mid);
    return createPadding('', leftLength, chars) + string + createPadding('', rightLength, chars);
  }
  module.exports = pad;
})(require('process'));
