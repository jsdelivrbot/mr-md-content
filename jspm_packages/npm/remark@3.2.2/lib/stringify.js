/* */ 
'use strict';
var decode = require('parse-entities');
var encode = require('stringify-entities');
var table = require('markdown-table');
var repeat = require('repeat-string');
var extend = require('extend.js');
var ccount = require('ccount');
var longestStreak = require('longest-streak');
var utilities = require('./utilities');
var defaultOptions = require('./defaults').stringify;
var raise = utilities.raise;
var validate = utilities.validate;
var stateToggler = utilities.stateToggler;
var mergeable = utilities.mergeable;
var MERGEABLE_NODES = utilities.MERGEABLE_NODES;
var INDENT = 4;
var MINIMUM_CODE_FENCE_LENGTH = 3;
var YAML_FENCE_LENGTH = 3;
var MINIMUM_RULE_LENGTH = 3;
var MAILTO = 'mailto:';
var ERROR_LIST_ITEM_INDENT = 'Cannot indent code properly. See ' + 'http://git.io/mdast-lii';
var EXPRESSIONS_WHITE_SPACE = /\s/;
var FENCE = /([`~])\1{2}/;
var PROTOCOL = /^[a-z][a-z+.-]+:\/?/i;
var PUNCTUATION = /[-!"#$%&'()*+,.\/:;<=>?@\[\\\]^`{|}~_]/;
var ANGLE_BRACKET_CLOSE = '>';
var ANGLE_BRACKET_OPEN = '<';
var ASTERISK = '*';
var BACKSLASH = '\\';
var CARET = '^';
var COLON = ':';
var SEMICOLON = ';';
var DASH = '-';
var DOT = '.';
var EMPTY = '';
var EQUALS = '=';
var EXCLAMATION_MARK = '!';
var HASH = '#';
var AMPERSAND = '&';
var LINE = '\n';
var CARRIAGE = '\r';
var FORM_FEED = '\f';
var PARENTHESIS_OPEN = '(';
var PARENTHESIS_CLOSE = ')';
var PIPE = '|';
var PLUS = '+';
var QUOTE_DOUBLE = '"';
var QUOTE_SINGLE = '\'';
var SPACE = ' ';
var TAB = '\t';
var VERTICAL_TAB = '\u000B';
var SQUARE_BRACKET_OPEN = '[';
var SQUARE_BRACKET_CLOSE = ']';
var TICK = '`';
var TILDE = '~';
var UNDERSCORE = '_';
var ENTITY_AMPERSAND = AMPERSAND + 'amp' + SEMICOLON;
var ENTITY_ANGLE_BRACKET_OPEN = AMPERSAND + 'lt' + SEMICOLON;
var ENTITY_COLON = AMPERSAND + '#x3A' + SEMICOLON;
var BREAK = LINE + LINE;
var GAP = BREAK + LINE;
var DOUBLE_TILDE = TILDE + TILDE;
var ENTITY_OPTIONS = {};
ENTITY_OPTIONS.true = true;
ENTITY_OPTIONS.false = true;
ENTITY_OPTIONS.numbers = true;
ENTITY_OPTIONS.escape = true;
var LIST_BULLETS = {};
LIST_BULLETS[ASTERISK] = true;
LIST_BULLETS[DASH] = true;
LIST_BULLETS[PLUS] = true;
var HORIZONTAL_RULE_BULLETS = {};
HORIZONTAL_RULE_BULLETS[ASTERISK] = true;
HORIZONTAL_RULE_BULLETS[DASH] = true;
HORIZONTAL_RULE_BULLETS[UNDERSCORE] = true;
var EMPHASIS_MARKERS = {};
EMPHASIS_MARKERS[UNDERSCORE] = true;
EMPHASIS_MARKERS[ASTERISK] = true;
var FENCE_MARKERS = {};
FENCE_MARKERS[TICK] = true;
FENCE_MARKERS[TILDE] = true;
var ORDERED_MAP = {};
ORDERED_MAP.true = 'visitOrderedItems';
ORDERED_MAP.false = 'visitUnorderedItems';
var LIST_ITEM_INDENTS = {};
var LIST_ITEM_TAB = 'tab';
var LIST_ITEM_ONE = '1';
var LIST_ITEM_MIXED = 'mixed';
LIST_ITEM_INDENTS[LIST_ITEM_ONE] = true;
LIST_ITEM_INDENTS[LIST_ITEM_TAB] = true;
LIST_ITEM_INDENTS[LIST_ITEM_MIXED] = true;
var CHECKBOX_MAP = {};
CHECKBOX_MAP.null = EMPTY;
CHECKBOX_MAP.undefined = EMPTY;
CHECKBOX_MAP.true = SQUARE_BRACKET_OPEN + 'x' + SQUARE_BRACKET_CLOSE + SPACE;
CHECKBOX_MAP.false = SQUARE_BRACKET_OPEN + SPACE + SQUARE_BRACKET_CLOSE + SPACE;
function encodeNoop(value) {
  return value;
}
function encodeFactory(type) {
  var options = {};
  if (type === 'false') {
    return encodeNoop;
  }
  if (type === 'true') {
    options.useNamedReferences = true;
  }
  if (type === 'escape') {
    options.escapeOnly = options.useNamedReferences = true;
  }
  function encoder(value) {
    return encode(value, options);
  }
  return encoder;
}
function startsWithEntity(value) {
  var prefix;
  if (value.charAt(0) !== AMPERSAND) {
    return false;
  }
  prefix = value.split(AMPERSAND, 2).join(AMPERSAND);
  return decode(prefix).length !== prefix.length;
}
function isAlignmentRowCharacter(character) {
  return character === COLON || character === DASH || character === SPACE || character === PIPE;
}
function isInAlignmentRow(value, index) {
  var length = value.length;
  var start = index;
  var character;
  while (++index < length) {
    character = value.charAt(index);
    if (character === LINE) {
      break;
    }
    if (!isAlignmentRowCharacter(character)) {
      return false;
    }
  }
  index = start;
  while (--index > -1) {
    character = value.charAt(index);
    if (character === LINE) {
      break;
    }
    if (!isAlignmentRowCharacter(character)) {
      return false;
    }
  }
  return true;
}
function escapeFactory(options) {
  return function escape(value, node, parent) {
    var self = this;
    var gfm = options.gfm;
    var commonmark = options.commonmark;
    var siblings = parent && parent.children;
    var index = siblings && siblings.indexOf(node);
    var prev = siblings && siblings[index - 1];
    var next = siblings && siblings[index + 1];
    var length = value.length;
    var position = -1;
    var queue = [];
    var escaped = queue;
    var afterNewLine;
    var character;
    if (prev) {
      afterNewLine = prev.type === 'text' && /\n\s*$/.test(prev.value);
    } else if (parent) {
      afterNewLine = parent.type === 'paragraph';
    }
    while (++position < length) {
      character = value.charAt(position);
      if (character === BACKSLASH || character === TICK || character === ASTERISK || character === SQUARE_BRACKET_OPEN || character === UNDERSCORE || (self.inLink && character === SQUARE_BRACKET_CLOSE) || (gfm && character === PIPE && (self.inTable || isInAlignmentRow(value, position)))) {
        afterNewLine = false;
        queue.push(BACKSLASH);
      } else if (character === ANGLE_BRACKET_OPEN) {
        afterNewLine = false;
        if (commonmark) {
          queue.push(BACKSLASH);
        } else {
          queue.push(ENTITY_ANGLE_BRACKET_OPEN);
          continue;
        }
      } else if (gfm && !self.inLink && character === COLON && (queue.slice(-6).join(EMPTY) === 'mailto' || queue.slice(-5).join(EMPTY) === 'https' || queue.slice(-4).join(EMPTY) === 'http')) {
        afterNewLine = false;
        if (commonmark) {
          queue.push(BACKSLASH);
        } else {
          queue.push(ENTITY_COLON);
          continue;
        }
      } else if (character === AMPERSAND && startsWithEntity(value.slice(position))) {
        afterNewLine = false;
        if (commonmark) {
          queue.push(BACKSLASH);
        } else {
          queue.push(ENTITY_AMPERSAND);
          continue;
        }
      } else if (gfm && character === TILDE && value.charAt(position + 1) === TILDE) {
        queue.push(BACKSLASH, TILDE);
        afterNewLine = false;
        position += 1;
      } else if (character === LINE) {
        afterNewLine = true;
      } else if (afterNewLine) {
        if (character === ANGLE_BRACKET_CLOSE || character === HASH || LIST_BULLETS[character]) {
          queue.push(BACKSLASH);
          afterNewLine = false;
        } else if (character !== SPACE && character !== TAB && character !== CARRIAGE && character !== VERTICAL_TAB && character !== FORM_FEED) {
          afterNewLine = false;
        }
      }
      queue.push(character);
    }
    if (siblings && node.type === 'text') {
      if (prev && prev.referenceType === 'shortcut') {
        position = -1;
        length = escaped.length;
        while (++position < length) {
          character = escaped[position];
          if (character === SPACE || character === TAB) {
            continue;
          }
          if (character === PARENTHESIS_OPEN) {
            escaped[position] = BACKSLASH + character;
          }
          if (character === COLON) {
            if (commonmark) {
              escaped[position] = BACKSLASH + character;
            } else {
              escaped[position] = ENTITY_COLON;
            }
          }
          break;
        }
      }
      if (gfm && !self.inLink && prev && prev.type === 'text' && value.charAt(0) === COLON) {
        queue = prev.value.slice(-6);
        if (queue === 'mailto' || queue.slice(-5) === 'https' || queue.slice(-4) === 'http') {
          if (commonmark) {
            escaped.unshift(BACKSLASH);
          } else {
            escaped.splice(0, 1, ENTITY_COLON);
          }
        }
      }
      if (next && next.type === 'text' && value.slice(-1) === AMPERSAND && startsWithEntity(AMPERSAND + next.value)) {
        if (commonmark) {
          escaped.splice(escaped.length - 1, 0, BACKSLASH);
        } else {
          escaped.push('amp', SEMICOLON);
        }
      }
      if (gfm && next && next.type === 'text' && value.slice(-1) === TILDE && next.value.charAt(0) === TILDE) {
        escaped.splice(escaped.length - 1, 0, BACKSLASH);
      }
    }
    return escaped.join(EMPTY);
  };
}
function encloseURI(uri, always) {
  if (always || !uri.length || EXPRESSIONS_WHITE_SPACE.test(uri) || ccount(uri, PARENTHESIS_OPEN) !== ccount(uri, PARENTHESIS_CLOSE)) {
    return ANGLE_BRACKET_OPEN + uri + ANGLE_BRACKET_CLOSE;
  }
  return uri;
}
function encloseTitle(title) {
  var delimiter = QUOTE_DOUBLE;
  if (title.indexOf(delimiter) !== -1) {
    delimiter = QUOTE_SINGLE;
  }
  return delimiter + title + delimiter;
}
function pad(value, level) {
  var index;
  var padding;
  value = value.split(LINE);
  index = value.length;
  padding = repeat(SPACE, level * INDENT);
  while (index--) {
    if (value[index].length !== 0) {
      value[index] = padding + value[index];
    }
  }
  return value.join(LINE);
}
function Compiler(file, options) {
  var self = this;
  self.file = file;
  self.options = extend({}, self.options);
  self.setOptions(options);
}
var compilerPrototype = Compiler.prototype;
compilerPrototype.options = defaultOptions;
var maps = {
  'entities': ENTITY_OPTIONS,
  'bullet': LIST_BULLETS,
  'rule': HORIZONTAL_RULE_BULLETS,
  'listItemIndent': LIST_ITEM_INDENTS,
  'emphasis': EMPHASIS_MARKERS,
  'strong': EMPHASIS_MARKERS,
  'fence': FENCE_MARKERS
};
compilerPrototype.setOptions = function(options) {
  var self = this;
  var current = self.options;
  var ruleRepetition;
  var key;
  if (options === null || options === undefined) {
    options = {};
  } else if (typeof options === 'object') {
    options = extend({}, options);
  } else {
    raise(options, 'options');
  }
  for (key in defaultOptions) {
    validate[typeof current[key]](options, key, current[key], maps[key]);
  }
  ruleRepetition = options.ruleRepetition;
  if (ruleRepetition && ruleRepetition < MINIMUM_RULE_LENGTH) {
    raise(ruleRepetition, 'options.ruleRepetition');
  }
  self.encode = encodeFactory(String(options.entities));
  self.escape = escapeFactory(options);
  self.options = options;
  return self;
};
compilerPrototype.enterLink = stateToggler('inLink', false);
compilerPrototype.enterTable = stateToggler('inTable', false);
compilerPrototype.visit = function(node, parent) {
  var self = this;
  if (typeof self[node.type] !== 'function') {
    self.file.fail('Missing compiler for node of type `' + node.type + '`: `' + node + '`', node);
  }
  return self[node.type](node, parent);
};
compilerPrototype.all = function(parent) {
  var self = this;
  var children = parent.children;
  var values = [];
  var index = 0;
  var length = children.length;
  var node = children[0];
  var next;
  if (length === 0) {
    return values;
  }
  while (++index < length) {
    next = children[index];
    if (node.type === next.type && node.type in MERGEABLE_NODES && mergeable(node) && mergeable(next)) {
      node = MERGEABLE_NODES[node.type].call(self, node, next);
    } else {
      values.push(self.visit(node, parent));
      node = next;
    }
  }
  values.push(self.visit(node, parent));
  return values;
};
compilerPrototype.visitOrderedItems = function(node) {
  var self = this;
  var increment = self.options.incrementListMarker;
  var values = [];
  var start = node.start;
  var children = node.children;
  var length = children.length;
  var index = -1;
  var bullet;
  while (++index < length) {
    bullet = (increment ? start + index : start) + DOT;
    values[index] = self.listItem(children[index], node, index, bullet);
  }
  return values.join(LINE);
};
compilerPrototype.visitUnorderedItems = function(node) {
  var self = this;
  var values = [];
  var children = node.children;
  var length = children.length;
  var index = -1;
  var bullet = self.options.bullet;
  while (++index < length) {
    values[index] = self.listItem(children[index], node, index, bullet);
  }
  return values.join(LINE);
};
compilerPrototype.block = function(node) {
  var self = this;
  var values = [];
  var children = node.children;
  var length = children.length;
  var index = -1;
  var child;
  var prev;
  while (++index < length) {
    child = children[index];
    if (prev) {
      if (child.type === prev.type && prev.type === 'list') {
        values.push(prev.ordered === child.ordered ? GAP : BREAK);
      } else if (prev.type === 'list' && child.type === 'code' && !child.lang) {
        values.push(GAP);
      } else {
        values.push(BREAK);
      }
    }
    values.push(self.visit(child, node));
    prev = child;
  }
  return values.join(EMPTY);
};
compilerPrototype.root = function(node) {
  return this.block(node) + LINE;
};
compilerPrototype.heading = function(node) {
  var self = this;
  var setext = self.options.setext;
  var closeAtx = self.options.closeAtx;
  var depth = node.depth;
  var content = self.all(node).join(EMPTY);
  var prefix;
  if (setext && depth < 3) {
    return content + LINE + repeat(depth === 1 ? EQUALS : DASH, content.length);
  }
  prefix = repeat(HASH, node.depth);
  content = prefix + SPACE + content;
  if (closeAtx) {
    content += SPACE + prefix;
  }
  return content;
};
compilerPrototype.text = function(node, parent) {
  return this.encode(this.escape(node.value, node, parent), node);
};
compilerPrototype.paragraph = function(node) {
  return this.all(node).join(EMPTY);
};
compilerPrototype.blockquote = function(node) {
  var values = this.block(node).split(LINE);
  var result = [];
  var length = values.length;
  var index = -1;
  var value;
  while (++index < length) {
    value = values[index];
    result[index] = (value ? SPACE : EMPTY) + value;
  }
  return ANGLE_BRACKET_CLOSE + result.join(LINE + ANGLE_BRACKET_CLOSE);
};
compilerPrototype.list = function(node) {
  return this[ORDERED_MAP[node.ordered]](node);
};
compilerPrototype.listItem = function(node, parent, position, bullet) {
  var self = this;
  var style = self.options.listItemIndent;
  var children = node.children;
  var values = [];
  var index = -1;
  var length = children.length;
  var loose = node.loose;
  var value;
  var indent;
  var spacing;
  while (++index < length) {
    values[index] = self.visit(children[index], node);
  }
  value = CHECKBOX_MAP[node.checked] + values.join(loose ? BREAK : LINE);
  if (style === LIST_ITEM_ONE || (style === LIST_ITEM_MIXED && value.indexOf(LINE) === -1)) {
    indent = bullet.length + 1;
    spacing = SPACE;
  } else {
    indent = Math.ceil((bullet.length + 1) / INDENT) * INDENT;
    spacing = repeat(SPACE, indent - bullet.length);
  }
  value = bullet + spacing + pad(value, indent / INDENT).slice(indent);
  if (loose && parent.children.length - 1 !== position) {
    value += LINE;
  }
  return value;
};
compilerPrototype.inlineCode = function(node) {
  var value = node.value;
  var ticks = repeat(TICK, longestStreak(value, TICK) + 1);
  var start = ticks;
  var end = ticks;
  if (value.charAt(0) === TICK) {
    start += SPACE;
  }
  if (value.charAt(value.length - 1) === TICK) {
    end = SPACE + end;
  }
  return start + node.value + end;
};
compilerPrototype.yaml = function(node) {
  var delimiter = repeat(DASH, YAML_FENCE_LENGTH);
  var value = node.value ? LINE + node.value : EMPTY;
  return delimiter + value + LINE + delimiter;
};
compilerPrototype.code = function(node, parent) {
  var self = this;
  var value = node.value;
  var options = self.options;
  var marker = options.fence;
  var language = self.encode(node.lang || EMPTY, node);
  var fence;
  if (!language && !options.fences && value) {
    if (parent && parent.type === 'listItem' && options.listItemIndent !== LIST_ITEM_TAB && options.pedantic) {
      self.file.fail(ERROR_LIST_ITEM_INDENT, node.position);
    }
    return pad(value, 1);
  }
  fence = longestStreak(value, marker) + 1;
  if (FENCE.test(value)) {
    value = pad(value, 1);
  }
  fence = repeat(marker, Math.max(fence, MINIMUM_CODE_FENCE_LENGTH));
  return fence + language + LINE + value + LINE + fence;
};
compilerPrototype.html = function(node) {
  return node.value;
};
compilerPrototype.horizontalRule = function() {
  var options = this.options;
  var rule = repeat(options.rule, options.ruleRepetition);
  if (options.ruleSpaces) {
    rule = rule.split(EMPTY).join(SPACE);
  }
  return rule;
};
compilerPrototype.strong = function(node) {
  var marker = this.options.strong;
  marker = marker + marker;
  return marker + this.all(node).join(EMPTY) + marker;
};
compilerPrototype.emphasis = function(node) {
  var marker = this.options.emphasis;
  return marker + this.all(node).join(EMPTY) + marker;
};
compilerPrototype.break = function() {
  return this.options.commonmark ? BACKSLASH + LINE : SPACE + SPACE + LINE;
};
compilerPrototype.delete = function(node) {
  return DOUBLE_TILDE + this.all(node).join(EMPTY) + DOUBLE_TILDE;
};
compilerPrototype.link = function(node) {
  var self = this;
  var url = self.encode(node.href, node);
  var exit = self.enterLink();
  var escapedURL = self.encode(self.escape(node.href, node));
  var value = self.all(node).join(EMPTY);
  exit();
  if (node.title === null && PROTOCOL.test(url) && (escapedURL === value || escapedURL === MAILTO + value)) {
    return encloseURI(self.encode(node.href), true);
  }
  url = encloseURI(url);
  if (node.title) {
    url += SPACE + encloseTitle(self.encode(self.escape(node.title, node), node));
  }
  value = SQUARE_BRACKET_OPEN + value + SQUARE_BRACKET_CLOSE;
  value += PARENTHESIS_OPEN + url + PARENTHESIS_CLOSE;
  return value;
};
function label(node) {
  var value = EMPTY;
  var type = node.referenceType;
  if (type === 'full') {
    value = node.identifier;
  }
  if (type !== 'shortcut') {
    value = SQUARE_BRACKET_OPEN + value + SQUARE_BRACKET_CLOSE;
  }
  return value;
}
function unescapeShortcutLinkReference(value, identifier) {
  var index = 0;
  var position = 0;
  var length = value.length;
  var count = identifier.length;
  var result = [];
  var start;
  while (index < length) {
    start = index;
    while (index < length && !PUNCTUATION.test(value.charAt(index))) {
      index += 1;
    }
    result.push(value.slice(start, index));
    while (position < count && !PUNCTUATION.test(identifier.charAt(position))) {
      position += 1;
    }
    start = position;
    while (position < count && PUNCTUATION.test(identifier.charAt(position))) {
      position += 1;
    }
    result.push(identifier.slice(start, position));
    while (index < length && PUNCTUATION.test(value.charAt(index))) {
      index += 1;
    }
  }
  return result.join(EMPTY);
}
compilerPrototype.linkReference = function(node) {
  var self = this;
  var exitLink = self.enterLink();
  var value = self.all(node).join(EMPTY);
  exitLink();
  if (node.referenceType == 'shortcut') {
    value = unescapeShortcutLinkReference(value, node.identifier);
  }
  return SQUARE_BRACKET_OPEN + value + SQUARE_BRACKET_CLOSE + label(node);
};
compilerPrototype.imageReference = function(node) {
  var alt = this.encode(node.alt, node) || EMPTY;
  return EXCLAMATION_MARK + SQUARE_BRACKET_OPEN + alt + SQUARE_BRACKET_CLOSE + label(node);
};
compilerPrototype.footnoteReference = function(node) {
  return SQUARE_BRACKET_OPEN + CARET + node.identifier + SQUARE_BRACKET_CLOSE;
};
compilerPrototype.definition = function(node) {
  var value = SQUARE_BRACKET_OPEN + node.identifier + SQUARE_BRACKET_CLOSE;
  var url = encloseURI(node.link);
  if (node.title) {
    url += SPACE + encloseTitle(node.title);
  }
  return value + COLON + SPACE + url;
};
compilerPrototype.image = function(node) {
  var url = encloseURI(this.encode(node.src, node));
  var value;
  if (node.title) {
    url += SPACE + encloseTitle(this.encode(node.title, node));
  }
  value = EXCLAMATION_MARK + SQUARE_BRACKET_OPEN + this.encode(node.alt || EMPTY, node) + SQUARE_BRACKET_CLOSE;
  value += PARENTHESIS_OPEN + url + PARENTHESIS_CLOSE;
  return value;
};
compilerPrototype.footnote = function(node) {
  return SQUARE_BRACKET_OPEN + CARET + this.all(node).join(EMPTY) + SQUARE_BRACKET_CLOSE;
};
compilerPrototype.footnoteDefinition = function(node) {
  var id = node.identifier.toLowerCase();
  return SQUARE_BRACKET_OPEN + CARET + id + SQUARE_BRACKET_CLOSE + COLON + SPACE + this.all(node).join(BREAK + repeat(SPACE, INDENT));
};
compilerPrototype.table = function(node) {
  var self = this;
  var loose = self.options.looseTable;
  var spaced = self.options.spacedTable;
  var rows = node.children;
  var index = rows.length;
  var exit = self.enterTable();
  var result = [];
  var start;
  while (index--) {
    result[index] = self.all(rows[index]);
  }
  exit();
  start = loose ? EMPTY : spaced ? PIPE + SPACE : PIPE;
  return table(result, {
    'align': node.align,
    'start': start,
    'end': start.split(EMPTY).reverse().join(EMPTY),
    'delimiter': spaced ? SPACE + PIPE + SPACE : PIPE
  });
};
compilerPrototype.tableCell = function(node) {
  return this.all(node).join(EMPTY);
};
compilerPrototype.compile = function() {
  return this.visit(this.file.namespace('mdast').tree);
};
module.exports = Compiler;
