/* */ 
(function(process) {
  'use strict';
  var decode = require('parse-entities');
  var repeat = require('repeat-string');
  var trim = require('trim');
  var trimTrailingLines = require('trim-trailing-lines');
  var extend = require('extend.js');
  var utilities = require('./utilities');
  var defaultOptions = require('./defaults').parse;
  var blockElements = require('./block-elements.json!systemjs-json');
  var raise = utilities.raise;
  var clean = utilities.clean;
  var validate = utilities.validate;
  var normalize = utilities.normalizeIdentifier;
  var stateToggler = utilities.stateToggler;
  var mergeable = utilities.mergeable;
  var MERGEABLE_NODES = utilities.MERGEABLE_NODES;
  var has = {}.hasOwnProperty;
  var SPACE_SIZE = 1;
  var TAB_SIZE = 4;
  var CODE_INDENT_LENGTH = 4;
  var MIN_FENCE_COUNT = 3;
  var MAX_ATX_COUNT = 6;
  var MAX_LINE_HEADING_INDENT = 3;
  var HORIZONTAL_RULE_MARKER_COUNT = 3;
  var MIN_CLOSING_HTML_NEWLINE_COUNT = 2;
  var MIN_BREAK_LENGTH = 2;
  var MIN_TABLE_COLUMNS = 2;
  var MIN_TABLE_ROWS = 2;
  var ERR_INFINITE_LOOP = 'Infinite loop';
  var ERR_MISSING_LOCATOR = 'Missing locator: ';
  var ERR_INCORRECTLY_EATEN = 'Incorrectly eaten value: please report this ' + 'warning on http://git.io/vUYWz';
  var EXPRESSION_BULLET = /^([ \t]*)([*+-]|\d+[.)])( {1,4}(?! )| |\t|$|(?=\n))([^\n]*)/;
  var EXPRESSION_PEDANTIC_BULLET = /^([ \t]*)([*+-]|\d+[.)])([ \t]+)/;
  var EXPRESSION_INITIAL_INDENT = /^( {1,4}|\t)?/gm;
  var EXPRESSION_INITIAL_TAB = /^( {4}|\t)?/gm;
  var EXPRESSION_HTML_LINK_OPEN = /^<a /i;
  var EXPRESSION_HTML_LINK_CLOSE = /^<\/a>/i;
  var EXPRESSION_LOOSE_LIST_ITEM = /\n\n(?!\s*$)/;
  var EXPRESSION_TASK_ITEM = /^\[([\ \t]|x|X)\][\ \t]/;
  var C_BACKSLASH = '\\';
  var C_UNDERSCORE = '_';
  var C_ASTERISK = '*';
  var C_TICK = '`';
  var C_AT_SIGN = '@';
  var C_HASH = '#';
  var C_PLUS = '+';
  var C_DASH = '-';
  var C_DOT = '.';
  var C_PIPE = '|';
  var C_DOUBLE_QUOTE = '"';
  var C_SINGLE_QUOTE = '\'';
  var C_COMMA = ',';
  var C_SLASH = '/';
  var C_COLON = ':';
  var C_SEMI_COLON = ';';
  var C_QUESTION_MARK = '?';
  var C_CARET = '^';
  var C_EQUALS = '=';
  var C_EXCLAMATION_MARK = '!';
  var C_TILDE = '~';
  var C_LT = '<';
  var C_GT = '>';
  var C_BRACKET_OPEN = '[';
  var C_BRACKET_CLOSE = ']';
  var C_PAREN_OPEN = '(';
  var C_PAREN_CLOSE = ')';
  var C_SPACE = ' ';
  var C_FORM_FEED = '\f';
  var C_NEWLINE = '\n';
  var C_CARRIAGE_RETURN = '\r';
  var C_TAB = '\t';
  var C_VERTICAL_TAB = '\v';
  var C_NO_BREAK_SPACE = '\u00a0';
  var C_OGHAM_SPACE = '\u1680';
  var C_MONGOLIAN_VOWEL_SEPARATOR = '\u180e';
  var C_EN_QUAD = '\u2000';
  var C_EM_QUAD = '\u2001';
  var C_EN_SPACE = '\u2002';
  var C_EM_SPACE = '\u2003';
  var C_THREE_PER_EM_SPACE = '\u2004';
  var C_FOUR_PER_EM_SPACE = '\u2005';
  var C_SIX_PER_EM_SPACE = '\u2006';
  var C_FIGURE_SPACE = '\u2007';
  var C_PUNCTUATION_SPACE = '\u2008';
  var C_THIN_SPACE = '\u2009';
  var C_HAIR_SPACE = '\u200a';
  var C_LINE_SEPARATOR = '​\u2028';
  var C_PARAGRAPH_SEPARATOR = '​\u2029';
  var C_NARROW_NO_BREAK_SPACE = '\u202f';
  var C_IDEOGRAPHIC_SPACE = '\u3000';
  var C_ZERO_WIDTH_NO_BREAK_SPACE = '\ufeff';
  var C_X_LOWER = 'x';
  var CC_A_LOWER = 'a'.charCodeAt(0);
  var CC_A_UPPER = 'A'.charCodeAt(0);
  var CC_Z_LOWER = 'z'.charCodeAt(0);
  var CC_Z_UPPER = 'Z'.charCodeAt(0);
  var CC_0 = '0'.charCodeAt(0);
  var CC_9 = '9'.charCodeAt(0);
  var HTTP_PROTOCOL = 'http://';
  var HTTPS_PROTOCOL = 'https://';
  var MAILTO_PROTOCOL = 'mailto:';
  var PROTOCOLS = [HTTP_PROTOCOL, HTTPS_PROTOCOL, MAILTO_PROTOCOL];
  var PROTOCOLS_LENGTH = PROTOCOLS.length;
  var YAML_FENCE = repeat(C_DASH, 3);
  var CODE_INDENT = repeat(C_SPACE, CODE_INDENT_LENGTH);
  var EMPTY = '';
  var BLOCK = 'block';
  var INLINE = 'inline';
  var COMMENT_START = '<!--';
  var COMMENT_END = '-->';
  var CDATA_START = '<![CDATA[';
  var CDATA_END = ']]>';
  var COMMENT_END_CHAR = COMMENT_END.charAt(0);
  var CDATA_END_CHAR = CDATA_END.charAt(0);
  var COMMENT_START_LENGTH = COMMENT_START.length;
  var COMMENT_END_LENGTH = COMMENT_END.length;
  var CDATA_START_LENGTH = CDATA_START.length;
  var CDATA_END_LENGTH = CDATA_END.length;
  var T_HORIZONTAL_RULE = 'horizontalRule';
  var T_HTML = 'html';
  var T_YAML = 'yaml';
  var T_TABLE = 'table';
  var T_TABLE_CELL = 'tableCell';
  var T_TABLE_HEADER = 'tableHeader';
  var T_TABLE_ROW = 'tableRow';
  var T_PARAGRAPH = 'paragraph';
  var T_TEXT = 'text';
  var T_CODE = 'code';
  var T_LIST = 'list';
  var T_LIST_ITEM = 'listItem';
  var T_DEFINITION = 'definition';
  var T_FOOTNOTE_DEFINITION = 'footnoteDefinition';
  var T_HEADING = 'heading';
  var T_BLOCKQUOTE = 'blockquote';
  var T_LINK = 'link';
  var T_IMAGE = 'image';
  var T_FOOTNOTE = 'footnote';
  var T_STRONG = 'strong';
  var T_EMPHASIS = 'emphasis';
  var T_DELETE = 'delete';
  var T_INLINE_CODE = 'inlineCode';
  var T_BREAK = 'break';
  var T_ROOT = 'root';
  var TABLE_ALIGN_LEFT = 'left';
  var TABLE_ALIGN_CENTER = 'center';
  var TABLE_ALIGN_RIGHT = 'right';
  var TABLE_ALIGN_NONE = null;
  var REFERENCE_TYPE_SHORTCUT = 'shortcut';
  var REFERENCE_TYPE_COLLAPSED = 'collapsed';
  var REFERENCE_TYPE_FULL = 'full';
  var INDENTATION_CHARACTERS = {};
  INDENTATION_CHARACTERS[C_SPACE] = SPACE_SIZE;
  INDENTATION_CHARACTERS[C_TAB] = TAB_SIZE;
  var EMPHASIS_MARKERS = {};
  EMPHASIS_MARKERS[C_ASTERISK] = true;
  EMPHASIS_MARKERS[C_UNDERSCORE] = true;
  var RULE_MARKERS = {};
  RULE_MARKERS[C_ASTERISK] = true;
  RULE_MARKERS[C_UNDERSCORE] = true;
  RULE_MARKERS[C_DASH] = true;
  var LIST_UNORDERED_MARKERS = {};
  LIST_UNORDERED_MARKERS[C_ASTERISK] = true;
  LIST_UNORDERED_MARKERS[C_PLUS] = true;
  LIST_UNORDERED_MARKERS[C_DASH] = true;
  var LIST_ORDERED_MARKERS = {};
  LIST_ORDERED_MARKERS[C_DOT] = true;
  var LIST_ORDERED_COMMONMARK_MARKERS = {};
  LIST_ORDERED_COMMONMARK_MARKERS[C_DOT] = true;
  LIST_ORDERED_COMMONMARK_MARKERS[C_PAREN_CLOSE] = true;
  var LINK_TITLE_MARKERS = {};
  LINK_TITLE_MARKERS[C_DOUBLE_QUOTE] = C_DOUBLE_QUOTE;
  LINK_TITLE_MARKERS[C_SINGLE_QUOTE] = C_SINGLE_QUOTE;
  var COMMONMARK_LINK_TITLE_MARKERS = {};
  COMMONMARK_LINK_TITLE_MARKERS[C_DOUBLE_QUOTE] = C_DOUBLE_QUOTE;
  COMMONMARK_LINK_TITLE_MARKERS[C_SINGLE_QUOTE] = C_SINGLE_QUOTE;
  COMMONMARK_LINK_TITLE_MARKERS[C_PAREN_OPEN] = C_PAREN_CLOSE;
  var SETEXT_MARKERS = {};
  SETEXT_MARKERS[C_EQUALS] = 1;
  SETEXT_MARKERS[C_DASH] = 2;
  var LIST_ITEM_MAP = {};
  LIST_ITEM_MAP.true = renderPedanticListItem;
  LIST_ITEM_MAP.false = renderNormalListItem;
  function isAlphabetic(character) {
    var code = character.charCodeAt(0);
    return (code >= CC_A_LOWER && code <= CC_Z_LOWER) || (code >= CC_A_UPPER && code <= CC_Z_UPPER);
  }
  function isNumeric(character) {
    var code = character.charCodeAt(0);
    return code >= CC_0 && code <= CC_9;
  }
  function isWordCharacter(character) {
    return character === C_UNDERSCORE || isAlphabetic(character) || isNumeric(character);
  }
  function isWhiteSpace(character) {
    return character === C_SPACE || character === C_FORM_FEED || character === C_NEWLINE || character === C_CARRIAGE_RETURN || character === C_TAB || character === C_VERTICAL_TAB || character === C_NO_BREAK_SPACE || character === C_OGHAM_SPACE || character === C_MONGOLIAN_VOWEL_SEPARATOR || character === C_EN_QUAD || character === C_EM_QUAD || character === C_EN_SPACE || character === C_EM_SPACE || character === C_THREE_PER_EM_SPACE || character === C_FOUR_PER_EM_SPACE || character === C_SIX_PER_EM_SPACE || character === C_FIGURE_SPACE || character === C_PUNCTUATION_SPACE || character === C_THIN_SPACE || character === C_HAIR_SPACE || character === C_LINE_SEPARATOR || character === C_PARAGRAPH_SEPARATOR || character === C_NARROW_NO_BREAK_SPACE || character === C_IDEOGRAPHIC_SPACE || character === C_ZERO_WIDTH_NO_BREAK_SPACE;
  }
  function isUnquotedAttributeCharacter(character) {
    return character !== C_DOUBLE_QUOTE && character !== C_SINGLE_QUOTE && character !== C_EQUALS && character !== C_LT && character !== C_GT && character !== C_TICK;
  }
  function isDoubleQuotedAttributeCharacter(character) {
    return character !== C_DOUBLE_QUOTE;
  }
  isDoubleQuotedAttributeCharacter.delimiter = C_DOUBLE_QUOTE;
  function isSingleQuotedAttributeCharacter(character) {
    return character !== C_SINGLE_QUOTE;
  }
  isSingleQuotedAttributeCharacter.delimiter = C_SINGLE_QUOTE;
  function isEnclosedURLCharacter(character) {
    return character !== C_GT && character !== C_BRACKET_OPEN && character !== C_BRACKET_CLOSE;
  }
  isEnclosedURLCharacter.delimiter = C_GT;
  function isUnclosedURLCharacter(character) {
    return character !== C_BRACKET_OPEN && character !== C_BRACKET_CLOSE && !isWhiteSpace(character);
  }
  function decodeFactory(context) {
    function normalize(position) {
      return {
        'start': position,
        'indent': context.getIndent(position.line)
      };
    }
    function handleWarning(reason, position, code) {
      if (code === 3) {
        return;
      }
      context.file.warn(reason, position);
    }
    function decoder(value, position, handler) {
      var hasPosition = context.options.position;
      decode(value, {
        'position': position && normalize(position),
        'warning': hasPosition && handleWarning,
        'text': handler,
        'reference': handler,
        'textContext': context,
        'referenceContext': context
      });
    }
    function decodeRaw(value, position) {
      return decode(value, {
        'position': position && normalize(position),
        'warning': context.options.position && handleWarning
      });
    }
    decoder.raw = decodeRaw;
    return decoder;
  }
  function descapeFactory(scope, key) {
    function descape(value) {
      var prev = 0;
      var index = value.indexOf(C_BACKSLASH);
      var escape = scope[key];
      var queue = [];
      var character;
      while (index !== -1) {
        queue.push(value.slice(prev, index));
        prev = index + 1;
        character = value.charAt(prev);
        if (!character || escape.indexOf(character) === -1) {
          queue.push(C_BACKSLASH);
        }
        index = value.indexOf(C_BACKSLASH, prev);
      }
      queue.push(value.slice(prev));
      return queue.join(EMPTY);
    }
    return descape;
  }
  function getIndent(value) {
    var index = 0;
    var indent = 0;
    var character = value.charAt(index);
    var stops = {};
    var size;
    while (character in INDENTATION_CHARACTERS) {
      size = INDENTATION_CHARACTERS[character];
      indent += size;
      if (size > 1) {
        indent = Math.floor(indent / size) * size;
      }
      stops[indent] = index;
      character = value.charAt(++index);
    }
    return {
      'indent': indent,
      'stops': stops
    };
  }
  function removeIndentation(value, maximum) {
    var values = value.split(C_NEWLINE);
    var position = values.length + 1;
    var minIndent = Infinity;
    var matrix = [];
    var index;
    var indentation;
    var stops;
    var padding;
    values.unshift(repeat(C_SPACE, maximum) + C_EXCLAMATION_MARK);
    while (position--) {
      indentation = getIndent(values[position]);
      matrix[position] = indentation.stops;
      if (trim(values[position]).length === 0) {
        continue;
      }
      if (indentation.indent) {
        if (indentation.indent > 0 && indentation.indent < minIndent) {
          minIndent = indentation.indent;
        }
      } else {
        minIndent = Infinity;
        break;
      }
    }
    if (minIndent !== Infinity) {
      position = values.length;
      while (position--) {
        stops = matrix[position];
        index = minIndent;
        while (index && !(index in stops)) {
          index--;
        }
        if (trim(values[position]).length !== 0 && minIndent && index !== minIndent) {
          padding = C_TAB;
        } else {
          padding = EMPTY;
        }
        values[position] = padding + values[position].slice(index in stops ? stops[index] + 1 : 0);
      }
    }
    values.shift();
    return values.join(C_NEWLINE);
  }
  function tokenizeNewline(eat, value, silent) {
    var character = value.charAt(0);
    var length;
    var subvalue;
    var queue;
    var index;
    if (character !== C_NEWLINE) {
      return;
    }
    if (silent) {
      return true;
    }
    index = 1;
    length = value.length;
    subvalue = C_NEWLINE;
    queue = EMPTY;
    while (index < length) {
      character = value.charAt(index);
      if (!isWhiteSpace(character)) {
        break;
      }
      queue += character;
      if (character === C_NEWLINE) {
        subvalue += queue;
        queue = EMPTY;
      }
      index++;
    }
    eat(subvalue);
  }
  function tokenizeCode(eat, value, silent) {
    var self = this;
    var index = -1;
    var length = value.length;
    var character;
    var subvalue = EMPTY;
    var content = EMPTY;
    var subvalueQueue = EMPTY;
    var contentQueue = EMPTY;
    var blankQueue;
    var indent;
    while (++index < length) {
      character = value.charAt(index);
      if (indent) {
        indent = false;
        subvalue += subvalueQueue;
        content += contentQueue;
        subvalueQueue = contentQueue = EMPTY;
        if (character === C_NEWLINE) {
          subvalueQueue = contentQueue = character;
        } else {
          subvalue += character;
          content += character;
          while (++index < length) {
            character = value.charAt(index);
            if (!character || character === C_NEWLINE) {
              contentQueue = subvalueQueue = character;
              break;
            }
            subvalue += character;
            content += character;
          }
        }
      } else if (character === C_SPACE && value.charAt(index + 1) === C_SPACE && value.charAt(index + 2) === C_SPACE && value.charAt(index + 3) === C_SPACE) {
        subvalueQueue += CODE_INDENT;
        index += 3;
        indent = true;
      } else if (character === C_TAB) {
        subvalueQueue += character;
        indent = true;
      } else {
        blankQueue = EMPTY;
        while (character === C_TAB || character === C_SPACE) {
          blankQueue += character;
          character = value.charAt(++index);
        }
        if (character !== C_NEWLINE) {
          break;
        }
        subvalueQueue += blankQueue + character;
        contentQueue += character;
      }
    }
    if (content) {
      if (silent) {
        return true;
      }
      return eat(subvalue)(self.renderCodeBlock(content));
    }
  }
  function tokenizeFences(eat, value, silent) {
    var self = this;
    var settings = self.options;
    var length = value.length + 1;
    var index = 0;
    var subvalue = EMPTY;
    var fenceCount;
    var marker;
    var character;
    var flag;
    var queue;
    var content;
    var exdentedContent;
    var closing;
    var exdentedClosing;
    var indent;
    var now;
    if (!settings.gfm) {
      return;
    }
    while (index < length) {
      character = value.charAt(index);
      if (character !== C_SPACE && character !== C_TAB) {
        break;
      }
      subvalue += character;
      index++;
    }
    indent = index;
    character = value.charAt(index);
    if (character !== C_TILDE && character !== C_TICK) {
      return;
    }
    index++;
    marker = character;
    fenceCount = 1;
    subvalue += character;
    while (index < length) {
      character = value.charAt(index);
      if (character !== marker) {
        break;
      }
      subvalue += character;
      fenceCount++;
      index++;
    }
    if (fenceCount < MIN_FENCE_COUNT) {
      return;
    }
    while (index < length) {
      character = value.charAt(index);
      if (character !== C_SPACE && character !== C_TAB) {
        break;
      }
      subvalue += character;
      index++;
    }
    flag = queue = EMPTY;
    while (index < length) {
      character = value.charAt(index);
      if (character === C_NEWLINE || character === C_TILDE || character === C_TICK) {
        break;
      }
      if (character === C_SPACE || character === C_TAB) {
        queue += character;
      } else {
        flag += queue + character;
        queue = EMPTY;
      }
      index++;
    }
    character = value.charAt(index);
    if (character && character !== C_NEWLINE) {
      return;
    }
    if (silent) {
      return true;
    }
    now = eat.now();
    now.column += subvalue.length;
    subvalue += flag;
    flag = self.decode.raw(self.descape(flag), now);
    if (queue) {
      subvalue += queue;
    }
    queue = closing = exdentedClosing = content = exdentedContent = EMPTY;
    while (index < length) {
      character = value.charAt(index);
      content += closing;
      exdentedContent += exdentedClosing;
      closing = exdentedClosing = EMPTY;
      if (character !== C_NEWLINE) {
        content += character;
        exdentedClosing += character;
        index++;
        continue;
      }
      if (!content) {
        subvalue += character;
      } else {
        closing += character;
        exdentedClosing += character;
      }
      queue = EMPTY;
      index++;
      while (index < length) {
        character = value.charAt(index);
        if (character !== C_SPACE) {
          break;
        }
        queue += character;
        index++;
      }
      closing += queue;
      exdentedClosing += queue.slice(indent);
      if (queue.length >= CODE_INDENT_LENGTH) {
        continue;
      }
      queue = EMPTY;
      while (index < length) {
        character = value.charAt(index);
        if (character !== marker) {
          break;
        }
        queue += character;
        index++;
      }
      closing += queue;
      exdentedClosing += queue;
      if (queue.length < fenceCount) {
        continue;
      }
      queue = EMPTY;
      while (index < length) {
        character = value.charAt(index);
        if (character !== C_SPACE && character !== C_TAB) {
          break;
        }
        closing += character;
        exdentedClosing += character;
        index++;
      }
      if (!character || character === C_NEWLINE) {
        break;
      }
    }
    subvalue += content + closing;
    return eat(subvalue)(self.renderCodeBlock(exdentedContent, flag));
  }
  function tokenizeHeading(eat, value, silent) {
    var self = this;
    var settings = self.options;
    var length = value.length + 1;
    var index = -1;
    var now = eat.now();
    var subvalue = EMPTY;
    var content = EMPTY;
    var character;
    var queue;
    var depth;
    while (++index < length) {
      character = value.charAt(index);
      if (character !== C_SPACE && character !== C_TAB) {
        index--;
        break;
      }
      subvalue += character;
    }
    depth = 0;
    length = index + MAX_ATX_COUNT + 1;
    while (++index <= length) {
      character = value.charAt(index);
      if (character !== C_HASH) {
        index--;
        break;
      }
      subvalue += character;
      depth++;
    }
    if (!depth || (!settings.pedantic && value.charAt(index + 1) === C_HASH)) {
      return;
    }
    length = value.length + 1;
    queue = EMPTY;
    while (++index < length) {
      character = value.charAt(index);
      if (character !== C_SPACE && character !== C_TAB) {
        index--;
        break;
      }
      queue += character;
    }
    if (!settings.pedantic && !queue.length && character && character !== C_NEWLINE) {
      return;
    }
    if (silent) {
      return true;
    }
    subvalue += queue;
    queue = content = EMPTY;
    while (++index < length) {
      character = value.charAt(index);
      if (!character || character === C_NEWLINE) {
        break;
      }
      if (character !== C_SPACE && character !== C_TAB && character !== C_HASH) {
        content += queue + character;
        queue = EMPTY;
        continue;
      }
      while (character === C_SPACE || character === C_TAB) {
        queue += character;
        character = value.charAt(++index);
      }
      while (character === C_HASH) {
        queue += character;
        character = value.charAt(++index);
      }
      while (character === C_SPACE || character === C_TAB) {
        queue += character;
        character = value.charAt(++index);
      }
      index--;
    }
    now.column += subvalue.length;
    subvalue += content + queue;
    return eat(subvalue)(self.renderHeading(content, depth, now));
  }
  function tokenizeLineHeading(eat, value, silent) {
    var self = this;
    var now = eat.now();
    var length = value.length;
    var index = -1;
    var subvalue = EMPTY;
    var content;
    var queue;
    var character;
    var marker;
    var depth;
    while (++index < length) {
      character = value.charAt(index);
      if (character !== C_SPACE || index >= MAX_LINE_HEADING_INDENT) {
        index--;
        break;
      }
      subvalue += character;
    }
    content = queue = EMPTY;
    while (++index < length) {
      character = value.charAt(index);
      if (character === C_NEWLINE) {
        index--;
        break;
      }
      if (character === C_SPACE || character === C_TAB) {
        queue += character;
      } else {
        content += queue + character;
        queue = EMPTY;
      }
    }
    now.column += subvalue.length;
    subvalue += content + queue;
    character = value.charAt(++index);
    marker = value.charAt(++index);
    if (character !== C_NEWLINE || !SETEXT_MARKERS[marker]) {
      return;
    }
    if (silent) {
      return true;
    }
    subvalue += character;
    queue = marker;
    depth = SETEXT_MARKERS[marker];
    while (++index < length) {
      character = value.charAt(index);
      if (character !== marker) {
        if (character !== C_NEWLINE) {
          return;
        }
        index--;
        break;
      }
      queue += character;
    }
    return eat(subvalue + queue)(self.renderHeading(content, depth, now));
  }
  function tokenizeHorizontalRule(eat, value, silent) {
    var self = this;
    var index = -1;
    var length = value.length + 1;
    var subvalue = EMPTY;
    var character;
    var marker;
    var markerCount;
    var queue;
    while (++index < length) {
      character = value.charAt(index);
      if (character !== C_TAB && character !== C_SPACE) {
        break;
      }
      subvalue += character;
    }
    if (RULE_MARKERS[character] !== true) {
      return;
    }
    marker = character;
    subvalue += character;
    markerCount = 1;
    queue = EMPTY;
    while (++index < length) {
      character = value.charAt(index);
      if (character === marker) {
        markerCount++;
        subvalue += queue + marker;
        queue = EMPTY;
      } else if (character === C_SPACE) {
        queue += character;
      } else if (markerCount >= HORIZONTAL_RULE_MARKER_COUNT && (!character || character === C_NEWLINE)) {
        subvalue += queue;
        if (silent) {
          return true;
        }
        return eat(subvalue)(self.renderVoid(T_HORIZONTAL_RULE));
      } else {
        return;
      }
    }
  }
  function tokenizeBlockquote(eat, value, silent) {
    var self = this;
    var commonmark = self.options.commonmark;
    var now = eat.now();
    var indent = self.indent(now.line);
    var length = value.length;
    var values = [];
    var contents = [];
    var indents = [];
    var add;
    var tokenizers;
    var index = 0;
    var character;
    var rest;
    var nextIndex;
    var content;
    var line;
    var startIndex;
    var prefixed;
    while (index < length) {
      character = value.charAt(index);
      if (character !== C_SPACE && character !== C_TAB) {
        break;
      }
      index++;
    }
    if (value.charAt(index) !== C_GT) {
      return;
    }
    if (silent) {
      return true;
    }
    tokenizers = self.blockTokenizers;
    index = 0;
    while (index < length) {
      nextIndex = value.indexOf(C_NEWLINE, index);
      startIndex = index;
      prefixed = false;
      if (nextIndex === -1) {
        nextIndex = length;
      }
      while (index < length) {
        character = value.charAt(index);
        if (character !== C_SPACE && character !== C_TAB) {
          break;
        }
        index++;
      }
      if (value.charAt(index) === C_GT) {
        index++;
        prefixed = true;
        if (value.charAt(index) === C_SPACE) {
          index++;
        }
      } else {
        index = startIndex;
      }
      content = value.slice(index, nextIndex);
      if (!prefixed && !trim(content)) {
        index = startIndex;
        break;
      }
      if (!prefixed) {
        rest = value.slice(index);
        if (commonmark && (tokenizers.code.call(self, eat, rest, true) || tokenizers.fences.call(self, eat, rest, true) || tokenizers.heading.call(self, eat, rest, true) || tokenizers.lineHeading.call(self, eat, rest, true) || tokenizers.horizontalRule.call(self, eat, rest, true) || tokenizers.html.call(self, eat, rest, true) || tokenizers.list.call(self, eat, rest, true))) {
          break;
        }
        if (!commonmark && (tokenizers.definition.call(self, eat, rest, true) || tokenizers.footnoteDefinition.call(self, eat, rest, true))) {
          break;
        }
      }
      line = startIndex === index ? content : value.slice(startIndex, nextIndex);
      indents.push(index - startIndex);
      values.push(line);
      contents.push(content);
      index = nextIndex + 1;
    }
    index = -1;
    length = indents.length;
    add = eat(values.join(C_NEWLINE));
    while (++index < length) {
      indent(indents[index]);
    }
    return add(self.renderBlockquote(contents.join(C_NEWLINE), now));
  }
  function tokenizeList(eat, value, silent) {
    var self = this;
    var commonmark = self.options.commonmark;
    var pedantic = self.options.pedantic;
    var tokenizers = self.blockTokenizers;
    var markers;
    var index = 0;
    var length = value.length;
    var start = null;
    var queue;
    var ordered;
    var character;
    var marker;
    var nextIndex;
    var startIndex;
    var prefixed;
    var currentMarker;
    var content;
    var line;
    var prevEmpty;
    var empty;
    var items;
    var allLines;
    var emptyLines;
    var item;
    var enterTop;
    var exitBlockquote;
    var isLoose;
    var node;
    var now;
    var end;
    var indented;
    var size;
    while (index < length) {
      character = value.charAt(index);
      if (character !== C_SPACE && character !== C_TAB) {
        break;
      }
      index++;
    }
    character = value.charAt(index);
    markers = commonmark ? LIST_ORDERED_COMMONMARK_MARKERS : LIST_ORDERED_MARKERS;
    if (LIST_UNORDERED_MARKERS[character] === true) {
      marker = character;
      ordered = false;
    } else {
      ordered = true;
      queue = EMPTY;
      while (index < length) {
        character = value.charAt(index);
        if (!isNumeric(character)) {
          break;
        }
        queue += character;
        index++;
      }
      character = value.charAt(index);
      if (!queue || markers[character] !== true) {
        return;
      }
      start = parseInt(queue, 10);
      marker = character;
    }
    character = value.charAt(++index);
    if (character !== C_SPACE && character !== C_TAB) {
      return;
    }
    if (silent) {
      return true;
    }
    index = 0;
    items = [];
    allLines = [];
    emptyLines = [];
    while (index < length) {
      nextIndex = value.indexOf(C_NEWLINE, index);
      startIndex = index;
      prefixed = false;
      indented = false;
      if (nextIndex === -1) {
        nextIndex = length;
      }
      end = index + TAB_SIZE;
      size = 0;
      while (index < length) {
        character = value.charAt(index);
        if (character === C_TAB) {
          size += TAB_SIZE - size % TAB_SIZE;
        } else if (character === C_SPACE) {
          size++;
        } else {
          break;
        }
        index++;
      }
      if (size >= TAB_SIZE) {
        indented = true;
      }
      if (item && size >= item.indent) {
        indented = true;
      }
      character = value.charAt(index);
      currentMarker = null;
      if (!indented) {
        if (LIST_UNORDERED_MARKERS[character] === true) {
          currentMarker = character;
          index++;
          size++;
        } else {
          queue = EMPTY;
          while (index < length) {
            character = value.charAt(index);
            if (!isNumeric(character)) {
              break;
            }
            queue += character;
            index++;
          }
          character = value.charAt(index);
          index++;
          if (queue && markers[character] === true) {
            currentMarker = character;
            size += queue.length + 1;
          }
        }
        if (currentMarker) {
          character = value.charAt(index);
          if (character === C_TAB) {
            size += TAB_SIZE - size % TAB_SIZE;
            index++;
          } else if (character === C_SPACE) {
            end = index + TAB_SIZE;
            while (index < end) {
              if (value.charAt(index) !== C_SPACE) {
                break;
              }
              index++;
              size++;
            }
            if (index === end && value.charAt(index) === C_SPACE) {
              index -= TAB_SIZE - 1;
              size -= TAB_SIZE - 1;
            }
          } else if (character !== C_NEWLINE && character !== EMPTY) {
            currentMarker = null;
          }
        }
      }
      if (currentMarker) {
        if (commonmark && marker !== currentMarker) {
          break;
        }
        prefixed = true;
      } else {
        if (!commonmark && !indented && value.charAt(startIndex) === C_SPACE) {
          indented = true;
        } else if (commonmark && item) {
          indented = size >= item.indent || size > TAB_SIZE;
        }
        prefixed = false;
        index = startIndex;
      }
      line = value.slice(startIndex, nextIndex);
      content = startIndex === index ? line : value.slice(index, nextIndex);
      if (currentMarker && RULE_MARKERS[currentMarker] === true) {
        if (tokenizers.horizontalRule.call(self, eat, line, true)) {
          break;
        }
      }
      prevEmpty = empty;
      empty = !trim(content).length;
      if (indented && item) {
        item.value = item.value.concat(emptyLines, line);
        allLines = allLines.concat(emptyLines, line);
        emptyLines = [];
      } else if (prefixed) {
        if (emptyLines.length) {
          item.value.push(EMPTY);
          item.trail = emptyLines.concat();
        }
        item = {
          'value': [line],
          'indent': size,
          'trail': []
        };
        items.push(item);
        allLines = allLines.concat(emptyLines, line);
        emptyLines = [];
      } else if (empty) {
        if (prevEmpty) {
          break;
        }
        emptyLines.push(line);
      } else {
        if (prevEmpty) {
          break;
        }
        if (!pedantic && tokenizers.horizontalRule.call(self, eat, line, true)) {
          break;
        }
        if (!commonmark) {
          if (tokenizers.definition.call(self, eat, line, true) || tokenizers.footnoteDefinition.call(self, eat, line, true)) {
            break;
          }
        }
        item.value = item.value.concat(emptyLines, line);
        allLines = allLines.concat(emptyLines, line);
        emptyLines = [];
      }
      index = nextIndex + 1;
    }
    node = eat(allLines.join(C_NEWLINE)).reset({
      'type': T_LIST,
      'ordered': ordered,
      'start': start,
      'loose': null,
      'children': []
    });
    enterTop = self.exitTop();
    exitBlockquote = self.enterBlockquote();
    isLoose = false;
    index = -1;
    length = items.length;
    while (++index < length) {
      item = items[index].value.join(C_NEWLINE);
      now = eat.now();
      item = eat(item)(self.renderListItem(item, now), node);
      if (item.loose) {
        isLoose = true;
      }
      item = items[index].trail.join(C_NEWLINE);
      if (index !== length - 1) {
        item += C_NEWLINE;
      }
      eat(item);
    }
    enterTop();
    exitBlockquote();
    node.loose = isLoose;
    return node;
  }
  function eatHTMLComment(value, settings) {
    var index = COMMENT_START_LENGTH;
    var queue = COMMENT_START;
    var length = value.length;
    var commonmark = settings.commonmark;
    var character;
    var hasNonDash;
    if (value.slice(0, index) === queue) {
      while (index < length) {
        character = value.charAt(index);
        if (character === COMMENT_END_CHAR && value.slice(index, index + COMMENT_END_LENGTH) === COMMENT_END) {
          return queue + COMMENT_END;
        }
        if (commonmark) {
          if (character === C_GT && !hasNonDash) {
            return;
          }
          if (character === C_DASH) {
            if (value.charAt(index + 1) === C_DASH) {
              return;
            }
          } else {
            hasNonDash = true;
          }
        }
        queue += character;
        index++;
      }
    }
  }
  function eatHTMLCDATA(value) {
    var index = CDATA_START_LENGTH;
    var queue = value.slice(0, index);
    var length = value.length;
    var character;
    if (queue.toUpperCase() === CDATA_START) {
      while (index < length) {
        character = value.charAt(index);
        if (character === CDATA_END_CHAR && value.slice(index, index + CDATA_END_LENGTH) === CDATA_END) {
          return queue + CDATA_END;
        }
        queue += character;
        index++;
      }
    }
  }
  function eatHTMLProcessingInstruction(value) {
    var index = 0;
    var queue = EMPTY;
    var length = value.length;
    var character;
    if (value.charAt(index) === C_LT && value.charAt(++index) === C_QUESTION_MARK) {
      queue = C_LT + C_QUESTION_MARK;
      index++;
      while (index < length) {
        character = value.charAt(index);
        if (character === C_QUESTION_MARK && value.charAt(index + 1) === C_GT) {
          return queue + character + C_GT;
        }
        queue += character;
        index++;
      }
    }
  }
  function eatHTMLDeclaration(value) {
    var index = 0;
    var length = value.length;
    var queue = EMPTY;
    var subqueue = EMPTY;
    var character;
    if (value.charAt(index) === C_LT && value.charAt(++index) === C_EXCLAMATION_MARK) {
      queue = C_LT + C_EXCLAMATION_MARK;
      index++;
      while (index < length) {
        character = value.charAt(index);
        if (!isAlphabetic(character)) {
          break;
        }
        subqueue += character;
        index++;
      }
      character = value.charAt(index);
      if (!subqueue || !isWhiteSpace(character)) {
        return;
      }
      queue += subqueue + character;
      index++;
      while (index < length) {
        character = value.charAt(index);
        if (character === C_GT) {
          return queue;
        }
        queue += character;
        index++;
      }
    }
  }
  function eatHTMLClosingTag(value, isBlock) {
    var index = 0;
    var length = value.length;
    var queue = EMPTY;
    var subqueue = EMPTY;
    var character;
    if (value.charAt(index) === C_LT && value.charAt(++index) === C_SLASH) {
      queue = C_LT + C_SLASH;
      subqueue = character = value.charAt(++index);
      if (!isAlphabetic(character)) {
        return;
      }
      index++;
      while (index < length) {
        character = value.charAt(index);
        if (!isAlphabetic(character) && !isNumeric(character)) {
          break;
        }
        subqueue += character;
        index++;
      }
      if (isBlock && blockElements.indexOf(subqueue.toLowerCase()) === -1) {
        return;
      }
      queue += subqueue;
      while (index < length) {
        character = value.charAt(index);
        if (!isWhiteSpace(character)) {
          break;
        }
        queue += character;
        index++;
      }
      if (value.charAt(index) === C_GT) {
        return queue + C_GT;
      }
    }
  }
  function eatHTMLOpeningTag(value, isBlock) {
    var index = 0;
    var length = value.length;
    var queue = EMPTY;
    var subqueue = EMPTY;
    var character = value.charAt(index);
    var hasEquals;
    var test;
    if (character === C_LT) {
      queue = character;
      subqueue = character = value.charAt(++index);
      if (!isAlphabetic(character)) {
        return;
      }
      index++;
      while (index < length) {
        character = value.charAt(index);
        if (!isAlphabetic(character) && !isNumeric(character)) {
          break;
        }
        subqueue += character;
        index++;
      }
      if (isBlock && blockElements.indexOf(subqueue.toLowerCase()) === -1) {
        return;
      }
      queue += subqueue;
      subqueue = EMPTY;
      while (index < length) {
        while (index < length) {
          character = value.charAt(index);
          if (!isWhiteSpace(character)) {
            break;
          }
          subqueue += character;
          index++;
        }
        if (!subqueue) {
          break;
        }
        queue += subqueue;
        subqueue = EMPTY;
        character = value.charAt(index);
        if (isAlphabetic(character) || character === C_UNDERSCORE || character === C_COLON) {
          subqueue = character;
          index++;
          while (index < length) {
            character = value.charAt(index);
            if (!isAlphabetic(character) && !isNumeric(character) && character !== C_UNDERSCORE && character !== C_COLON && character !== C_DOT && character !== C_DASH) {
              break;
            }
            subqueue += character;
            index++;
          }
        }
        if (!subqueue) {
          break;
        }
        queue += subqueue;
        subqueue = EMPTY;
        hasEquals = false;
        while (index < length) {
          character = value.charAt(index);
          if (!isWhiteSpace(character)) {
            if (!hasEquals && character === C_EQUALS) {
              hasEquals = true;
            } else {
              break;
            }
          }
          subqueue += character;
          index++;
        }
        queue += subqueue;
        subqueue = EMPTY;
        if (!hasEquals) {
          queue += subqueue;
        } else {
          character = value.charAt(index);
          queue += subqueue;
          if (character === C_DOUBLE_QUOTE) {
            test = isDoubleQuotedAttributeCharacter;
            subqueue = character;
            index++;
          } else if (character === C_SINGLE_QUOTE) {
            test = isSingleQuotedAttributeCharacter;
            subqueue = character;
            index++;
          } else {
            test = isUnquotedAttributeCharacter;
            subqueue = EMPTY;
          }
          while (index < length) {
            character = value.charAt(index);
            if (!test(character)) {
              break;
            }
            subqueue += character;
            index++;
          }
          character = value.charAt(index);
          index++;
          if (!test.delimiter) {
            if (!subqueue.length) {
              return;
            }
            index--;
          } else if (character === test.delimiter) {
            subqueue += character;
          } else {
            return;
          }
          queue += subqueue;
          subqueue = EMPTY;
        }
      }
      character = value.charAt(index);
      if (character === C_SLASH) {
        queue += character;
        character = value.charAt(++index);
      }
      return character === C_GT ? queue + character : null;
    }
  }
  function tokenizeHTML(eat, value, silent) {
    var self = this;
    var index = 0;
    var length = value.length;
    var subvalue = EMPTY;
    var offset;
    var lineCount;
    var character;
    var queue;
    while (index < length) {
      character = value.charAt(index);
      if (character !== C_TAB && character !== C_SPACE) {
        break;
      }
      subvalue += character;
      index++;
    }
    offset = index;
    value = value.slice(offset);
    queue = eatHTMLComment(value, self.options) || eatHTMLCDATA(value) || eatHTMLProcessingInstruction(value) || eatHTMLDeclaration(value) || eatHTMLClosingTag(value, true) || eatHTMLOpeningTag(value, true);
    if (!queue) {
      return;
    }
    if (silent) {
      return true;
    }
    subvalue += queue;
    index = subvalue.length - offset;
    queue = EMPTY;
    while (index < length) {
      character = value.charAt(index);
      if (character === C_NEWLINE) {
        queue += character;
        lineCount++;
      } else if (queue.length < MIN_CLOSING_HTML_NEWLINE_COUNT) {
        subvalue += queue + character;
        queue = EMPTY;
      } else {
        break;
      }
      index++;
    }
    return eat(subvalue)(self.renderRaw(T_HTML, subvalue));
  }
  function tokenizeDefinition(eat, value, silent) {
    var self = this;
    var commonmark = self.options.commonmark;
    var index = 0;
    var length = value.length;
    var subvalue = EMPTY;
    var beforeURL;
    var beforeTitle;
    var queue;
    var character;
    var test;
    var identifier;
    var url;
    var title;
    while (index < length) {
      character = value.charAt(index);
      if (character !== C_SPACE && character !== C_TAB) {
        break;
      }
      subvalue += character;
      index++;
    }
    character = value.charAt(index);
    if (character !== C_BRACKET_OPEN) {
      return;
    }
    index++;
    subvalue += character;
    queue = EMPTY;
    while (index < length) {
      character = value.charAt(index);
      if (character === C_BRACKET_CLOSE) {
        break;
      } else if (character === C_BACKSLASH) {
        queue += character;
        index++;
        character = value.charAt(index);
      }
      queue += character;
      index++;
    }
    if (!queue || value.charAt(index) !== C_BRACKET_CLOSE || value.charAt(index + 1) !== C_COLON) {
      return;
    }
    identifier = queue;
    subvalue += queue + C_BRACKET_CLOSE + C_COLON;
    index = subvalue.length;
    queue = EMPTY;
    while (index < length) {
      character = value.charAt(index);
      if (character !== C_TAB && character !== C_SPACE && character !== C_NEWLINE) {
        break;
      }
      subvalue += character;
      index++;
    }
    character = value.charAt(index);
    queue = EMPTY;
    beforeURL = subvalue;
    if (character === C_LT) {
      index++;
      while (index < length) {
        character = value.charAt(index);
        if (!isEnclosedURLCharacter(character)) {
          break;
        }
        queue += character;
        index++;
      }
      character = value.charAt(index);
      if (character !== isEnclosedURLCharacter.delimiter) {
        if (commonmark) {
          return;
        }
        index -= queue.length + 1;
        queue = EMPTY;
      } else {
        subvalue += C_LT + queue + character;
        index++;
      }
    }
    if (!queue) {
      while (index < length) {
        character = value.charAt(index);
        if (!isUnclosedURLCharacter(character)) {
          break;
        }
        queue += character;
        index++;
      }
      subvalue += queue;
    }
    if (!queue) {
      return;
    }
    url = queue;
    queue = EMPTY;
    while (index < length) {
      character = value.charAt(index);
      if (character !== C_TAB && character !== C_SPACE && character !== C_NEWLINE) {
        break;
      }
      queue += character;
      index++;
    }
    character = value.charAt(index);
    test = null;
    if (character === C_DOUBLE_QUOTE) {
      test = C_DOUBLE_QUOTE;
    } else if (character === C_SINGLE_QUOTE) {
      test = C_SINGLE_QUOTE;
    } else if (character === C_PAREN_OPEN) {
      test = C_PAREN_CLOSE;
    }
    if (!test) {
      queue = EMPTY;
      index = subvalue.length;
    } else if (!queue) {
      return;
    } else {
      subvalue += queue + character;
      index = subvalue.length;
      queue = EMPTY;
      while (index < length) {
        character = value.charAt(index);
        if (character === test) {
          break;
        }
        if (character === C_NEWLINE) {
          index++;
          character = value.charAt(index);
          if (character === C_NEWLINE || character === test) {
            return;
          }
          queue += C_NEWLINE;
        }
        queue += character;
        index++;
      }
      character = value.charAt(index);
      if (character !== test) {
        return;
      }
      beforeTitle = subvalue;
      subvalue += queue + character;
      index++;
      title = queue;
      queue = EMPTY;
    }
    while (index < length) {
      character = value.charAt(index);
      if (character !== C_TAB && character !== C_SPACE) {
        break;
      }
      subvalue += character;
      index++;
    }
    character = value.charAt(index);
    if (!character || character === C_NEWLINE) {
      if (silent) {
        return true;
      }
      beforeURL = eat(beforeURL).test().end;
      url = self.decode.raw(self.descape(url), beforeURL);
      if (title) {
        beforeTitle = eat(beforeTitle).test().end;
        title = self.decode.raw(self.descape(title), beforeTitle);
      }
      return eat(subvalue)({
        'type': T_DEFINITION,
        'identifier': normalize(identifier),
        'title': title || null,
        'link': url
      });
    }
  }
  tokenizeDefinition.onlyAtTop = true;
  tokenizeDefinition.notInBlockquote = true;
  function tokenizeYAMLFrontMatter(eat, value, silent) {
    var self = this;
    var subvalue;
    var content;
    var index;
    var length;
    var character;
    var queue;
    if (!self.options.yaml || value.charAt(0) !== C_DASH || value.charAt(1) !== C_DASH || value.charAt(2) !== C_DASH || value.charAt(3) !== C_NEWLINE) {
      return;
    }
    subvalue = YAML_FENCE + C_NEWLINE;
    content = queue = EMPTY;
    index = 3;
    length = value.length;
    while (++index < length) {
      character = value.charAt(index);
      if (character === C_DASH && (queue || !content) && value.charAt(index + 1) === C_DASH && value.charAt(index + 2) === C_DASH) {
        if (silent) {
          return true;
        }
        subvalue += queue + YAML_FENCE;
        return eat(subvalue)(self.renderRaw(T_YAML, content));
      }
      if (character === C_NEWLINE) {
        queue += character;
      } else {
        subvalue += queue + character;
        content += queue + character;
        queue = EMPTY;
      }
    }
  }
  tokenizeYAMLFrontMatter.onlyAtStart = true;
  function tokenizeFootnoteDefinition(eat, value, silent) {
    var self = this;
    var index;
    var length;
    var subvalue;
    var now;
    var indent;
    var content;
    var queue;
    var subqueue;
    var character;
    var identifier;
    if (!self.options.footnotes) {
      return;
    }
    index = 0;
    length = value.length;
    subvalue = EMPTY;
    now = eat.now();
    indent = self.indent(now.line);
    while (index < length) {
      character = value.charAt(index);
      if (!isWhiteSpace(character)) {
        break;
      }
      subvalue += character;
      index++;
    }
    if (value.charAt(index) !== C_BRACKET_OPEN || value.charAt(index + 1) !== C_CARET) {
      return;
    }
    subvalue += C_BRACKET_OPEN + C_CARET;
    index = subvalue.length;
    queue = EMPTY;
    while (index < length) {
      character = value.charAt(index);
      if (character === C_BRACKET_CLOSE) {
        break;
      } else if (character === C_BACKSLASH) {
        queue += character;
        index++;
        character = value.charAt(index);
      }
      queue += character;
      index++;
    }
    if (!queue || value.charAt(index) !== C_BRACKET_CLOSE || value.charAt(index + 1) !== C_COLON) {
      return;
    }
    if (silent) {
      return true;
    }
    identifier = normalize(queue);
    subvalue += queue + C_BRACKET_CLOSE + C_COLON;
    index = subvalue.length;
    while (index < length) {
      character = value.charAt(index);
      if (character !== C_TAB && character !== C_SPACE) {
        break;
      }
      subvalue += character;
      index++;
    }
    now.column += subvalue.length;
    queue = content = subqueue = EMPTY;
    while (index < length) {
      character = value.charAt(index);
      if (character === C_NEWLINE) {
        subqueue = character;
        index++;
        while (index < length) {
          character = value.charAt(index);
          if (character !== C_NEWLINE) {
            break;
          }
          subqueue += character;
          index++;
        }
        queue += subqueue;
        subqueue = EMPTY;
        while (index < length) {
          character = value.charAt(index);
          if (character !== C_SPACE) {
            break;
          }
          subqueue += character;
          index++;
        }
        if (!subqueue.length) {
          break;
        }
        queue += subqueue;
      }
      if (queue) {
        content += queue;
        queue = EMPTY;
      }
      content += character;
      index++;
    }
    subvalue += content;
    content = content.replace(EXPRESSION_INITIAL_TAB, function(line) {
      indent(line.length);
      return EMPTY;
    });
    return eat(subvalue)(self.renderFootnoteDefinition(identifier, content, now));
  }
  tokenizeFootnoteDefinition.onlyAtTop = true;
  tokenizeFootnoteDefinition.notInBlockquote = true;
  function tokenizeTable(eat, value, silent) {
    var self = this;
    var index;
    var alignments;
    var alignment;
    var subvalue;
    var row;
    var length;
    var lines;
    var queue;
    var character;
    var hasDash;
    var align;
    var cell;
    var preamble;
    var count;
    var opening;
    var now;
    var position;
    var lineCount;
    var line;
    var rows;
    var table;
    var lineIndex;
    var pipeIndex;
    var first;
    if (!self.options.gfm) {
      return;
    }
    index = lineCount = 0;
    length = value.length + 1;
    lines = [];
    while (index < length) {
      lineIndex = value.indexOf(C_NEWLINE, index);
      pipeIndex = value.indexOf(C_PIPE, index + 1);
      if (lineIndex === -1) {
        lineIndex = value.length;
      }
      if (pipeIndex === -1 || pipeIndex > lineIndex) {
        if (lineCount < MIN_TABLE_ROWS) {
          return;
        }
        break;
      }
      lines.push(value.slice(index, lineIndex));
      lineCount++;
      index = lineIndex + 1;
    }
    subvalue = lines.join(C_NEWLINE);
    alignments = lines.splice(1, 1)[0];
    index = 0;
    length = alignments.length;
    lineCount--;
    alignment = false;
    align = [];
    while (index < length) {
      character = alignments.charAt(index);
      if (character === C_PIPE) {
        hasDash = null;
        if (alignment === false) {
          if (first === false) {
            return;
          }
        } else {
          align.push(alignment);
          alignment = false;
        }
        first = false;
      } else if (character === C_DASH) {
        hasDash = true;
        alignment = alignment || TABLE_ALIGN_NONE;
      } else if (character === C_COLON) {
        if (alignment === TABLE_ALIGN_LEFT) {
          alignment = TABLE_ALIGN_CENTER;
        } else if (hasDash && alignment === TABLE_ALIGN_NONE) {
          alignment = TABLE_ALIGN_RIGHT;
        } else {
          alignment = TABLE_ALIGN_LEFT;
        }
      } else if (!isWhiteSpace(character)) {
        return;
      }
      index++;
    }
    if (alignment !== false) {
      align.push(alignment);
    }
    if (align.length < MIN_TABLE_COLUMNS) {
      return;
    }
    if (silent) {
      return true;
    }
    position = -1;
    rows = [];
    table = eat(subvalue).reset({
      'type': T_TABLE,
      'align': align,
      'children': rows
    });
    while (++position < lineCount) {
      line = lines[position];
      row = self.renderParent(position ? T_TABLE_ROW : T_TABLE_HEADER, []);
      if (position) {
        eat(C_NEWLINE);
      }
      eat(line).reset(row, table);
      length = line.length + 1;
      index = 0;
      queue = EMPTY;
      cell = EMPTY;
      preamble = true;
      count = opening = null;
      while (index < length) {
        character = line.charAt(index);
        if (character === C_TAB || character === C_SPACE) {
          if (cell) {
            queue += character;
          } else {
            eat(character);
          }
          index++;
          continue;
        }
        if (character === EMPTY || character === C_PIPE) {
          if (preamble) {
            eat(character);
          } else {
            if (character && opening) {
              queue += character;
              index++;
              continue;
            }
            if ((cell || character) && !preamble) {
              subvalue = cell;
              if (queue.length > 1) {
                if (character) {
                  subvalue += queue.slice(0, queue.length - 1);
                  queue = queue.charAt(queue.length - 1);
                } else {
                  subvalue += queue;
                  queue = EMPTY;
                }
              }
              now = eat.now();
              eat(subvalue)(self.renderInline(T_TABLE_CELL, cell, now), row);
            }
            eat(queue + character);
            queue = EMPTY;
            cell = EMPTY;
          }
        } else {
          if (queue) {
            cell += queue;
            queue = EMPTY;
          }
          cell += character;
          if (character === C_BACKSLASH && index !== length - 2) {
            cell += line.charAt(index + 1);
            index++;
          }
          if (character === C_TICK) {
            count = 1;
            while (line.charAt(index + 1) === character) {
              cell += character;
              index++;
              count++;
            }
            if (!opening) {
              opening = count;
            } else if (count >= opening) {
              opening = 0;
            }
          }
        }
        preamble = false;
        index++;
      }
      if (!position) {
        eat(C_NEWLINE + alignments);
      }
    }
    return table;
  }
  tokenizeTable.onlyAtTop = true;
  function tokenizeParagraph(eat, value, silent) {
    var self = this;
    var settings = self.options;
    var commonmark = settings.commonmark;
    var gfm = settings.gfm;
    var tokenizers = self.blockTokenizers;
    var index = value.indexOf(C_NEWLINE);
    var length = value.length;
    var position;
    var subvalue;
    var character;
    var size;
    var now;
    while (index < length) {
      if (index === -1) {
        index = length;
        break;
      }
      if (value.charAt(index + 1) === C_NEWLINE) {
        break;
      }
      if (commonmark) {
        size = 0;
        position = index + 1;
        while (position < length) {
          character = value.charAt(position);
          if (character === C_TAB) {
            size = TAB_SIZE;
            break;
          } else if (character === C_SPACE) {
            size++;
          } else {
            break;
          }
          position++;
        }
        if (size >= TAB_SIZE) {
          index = value.indexOf(C_NEWLINE, index + 1);
          continue;
        }
      }
      subvalue = value.slice(index + 1);
      if (tokenizers.horizontalRule.call(self, eat, subvalue, true) || tokenizers.heading.call(self, eat, subvalue, true) || tokenizers.fences.call(self, eat, subvalue, true) || tokenizers.blockquote.call(self, eat, subvalue, true) || tokenizers.html.call(self, eat, subvalue, true)) {
        break;
      }
      if (gfm && tokenizers.list.call(self, eat, subvalue, true)) {
        break;
      }
      if (!commonmark && (tokenizers.lineHeading.call(self, eat, subvalue, true) || tokenizers.definition.call(self, eat, subvalue, true) || tokenizers.footnoteDefinition.call(self, eat, subvalue, true))) {
        break;
      }
      index = value.indexOf(C_NEWLINE, index + 1);
    }
    subvalue = value.slice(0, index);
    if (trim(subvalue) === EMPTY) {
      eat(subvalue);
      return null;
    }
    if (silent) {
      return true;
    }
    now = eat.now();
    subvalue = trimTrailingLines(subvalue);
    return eat(subvalue)(self.renderInline(T_PARAGRAPH, subvalue, now));
  }
  function tokenizeText(eat, value, silent) {
    var self = this;
    var methods;
    var tokenizers;
    var index;
    var length;
    var subvalue;
    var position;
    var tokenizer;
    var name;
    var min;
    var now;
    if (silent) {
      return true;
    }
    methods = self.inlineMethods;
    length = methods.length;
    tokenizers = self.inlineTokenizers;
    index = -1;
    min = value.length;
    while (++index < length) {
      name = methods[index];
      if (name === 'inlineText' || !tokenizers[name]) {
        continue;
      }
      tokenizer = tokenizers[name].locator;
      if (!tokenizer) {
        eat.file.fail(ERR_MISSING_LOCATOR + C_TICK + name + C_TICK);
        continue;
      }
      position = tokenizer.call(self, value, 1);
      if (position !== -1 && position < min) {
        min = position;
      }
    }
    subvalue = value.slice(0, min);
    now = eat.now();
    self.decode(subvalue, now, function(content, position, source) {
      eat(source || content)(self.renderRaw(T_TEXT, content));
    });
  }
  function renderCodeBlock(value, language) {
    return {
      'type': T_CODE,
      'lang': language || null,
      'value': trimTrailingLines(value || EMPTY)
    };
  }
  function renderPedanticListItem(value, position) {
    var self = this;
    var indent = self.indent(position.line);
    function replacer($0) {
      indent($0.length);
      return EMPTY;
    }
    value = value.replace(EXPRESSION_PEDANTIC_BULLET, replacer);
    indent = self.indent(position.line);
    return value.replace(EXPRESSION_INITIAL_INDENT, replacer);
  }
  function renderNormalListItem(value, position) {
    var self = this;
    var indent = self.indent(position.line);
    var max;
    var bullet;
    var rest;
    var lines;
    var trimmedLines;
    var index;
    var length;
    value = value.replace(EXPRESSION_BULLET, function($0, $1, $2, $3, $4) {
      bullet = $1 + $2 + $3;
      rest = $4;
      if (Number($2) < 10 && bullet.length % 2 === 1) {
        $2 = C_SPACE + $2;
      }
      max = $1 + repeat(C_SPACE, $2.length) + $3;
      return max + rest;
    });
    lines = value.split(C_NEWLINE);
    trimmedLines = removeIndentation(value, getIndent(max).indent).split(C_NEWLINE);
    trimmedLines[0] = rest;
    indent(bullet.length);
    index = 0;
    length = lines.length;
    while (++index < length) {
      indent(lines[index].length - trimmedLines[index].length);
    }
    return trimmedLines.join(C_NEWLINE);
  }
  function renderListItem(value, position) {
    var self = this;
    var checked = null;
    var node;
    var task;
    var indent;
    value = LIST_ITEM_MAP[self.options.pedantic].apply(self, arguments);
    if (self.options.gfm) {
      task = value.match(EXPRESSION_TASK_ITEM);
      if (task) {
        indent = task[0].length;
        checked = task[1].toLowerCase() === C_X_LOWER;
        self.indent(position.line)(indent);
        value = value.slice(indent);
      }
    }
    node = {
      'type': T_LIST_ITEM,
      'loose': EXPRESSION_LOOSE_LIST_ITEM.test(value) || value.charAt(value.length - 1) === C_NEWLINE
    };
    if (self.options.gfm) {
      node.checked = checked;
    }
    node.children = self.tokenizeBlock(value, position);
    return node;
  }
  function renderFootnoteDefinition(identifier, value, position) {
    var self = this;
    var exitBlockquote = self.enterBlockquote();
    var node;
    node = {
      'type': T_FOOTNOTE_DEFINITION,
      'identifier': identifier,
      'children': self.tokenizeBlock(value, position)
    };
    exitBlockquote();
    return node;
  }
  function renderHeading(value, depth, position) {
    return {
      'type': T_HEADING,
      'depth': depth,
      'children': this.tokenizeInline(value, position)
    };
  }
  function renderBlockquote(value, now) {
    var self = this;
    var exitBlockquote = self.enterBlockquote();
    var node = {
      'type': T_BLOCKQUOTE,
      'children': self.tokenizeBlock(value, now)
    };
    exitBlockquote();
    return node;
  }
  function renderVoid(type) {
    return {'type': type};
  }
  function renderParent(type, children) {
    return {
      'type': type,
      'children': children
    };
  }
  function renderRaw(type, value) {
    return {
      'type': type,
      'value': value
    };
  }
  function renderLink(isLink, href, text, title, position) {
    var self = this;
    var exitLink = self.enterLink();
    var node;
    node = {
      'type': isLink ? T_LINK : T_IMAGE,
      'title': title || null
    };
    if (isLink) {
      node.href = href;
      node.children = self.tokenizeInline(text, position);
    } else {
      node.src = href;
      node.alt = text ? self.decode.raw(self.descape(text), position) : null;
    }
    exitLink();
    return node;
  }
  function renderFootnote(value, position) {
    return this.renderInline(T_FOOTNOTE, value, position);
  }
  function renderInline(type, value, position) {
    return this.renderParent(type, this.tokenizeInline(value, position));
  }
  function renderBlock(type, value, position) {
    return this.renderParent(type, this.tokenizeBlock(value, position));
  }
  function locateEscape(value, fromIndex) {
    return value.indexOf(C_BACKSLASH, fromIndex);
  }
  function tokenizeEscape(eat, value, silent) {
    var self = this;
    var character;
    if (value.charAt(0) === C_BACKSLASH) {
      character = value.charAt(1);
      if (self.escape.indexOf(character) !== -1) {
        if (silent) {
          return true;
        }
        return eat(C_BACKSLASH + character)(character === C_NEWLINE ? self.renderVoid(T_BREAK) : self.renderRaw(T_TEXT, character));
      }
    }
  }
  tokenizeEscape.locator = locateEscape;
  function locateAutoLink(value, fromIndex) {
    return value.indexOf(C_LT, fromIndex);
  }
  function tokenizeAutoLink(eat, value, silent) {
    var self;
    var subvalue;
    var length;
    var index;
    var queue;
    var character;
    var hasAtCharacter;
    var link;
    var now;
    var content;
    var tokenize;
    var node;
    if (value.charAt(0) !== C_LT) {
      return;
    }
    self = this;
    subvalue = EMPTY;
    length = value.length;
    index = 0;
    queue = EMPTY;
    hasAtCharacter = false;
    link = EMPTY;
    index++;
    subvalue = C_LT;
    while (index < length) {
      character = value.charAt(index);
      if (character === C_SPACE || character === C_GT || character === C_AT_SIGN || (character === C_COLON && value.charAt(index + 1) === C_SLASH)) {
        break;
      }
      queue += character;
      index++;
    }
    if (!queue) {
      return;
    }
    link += queue;
    queue = EMPTY;
    character = value.charAt(index);
    link += character;
    index++;
    if (character === C_AT_SIGN) {
      hasAtCharacter = true;
    } else {
      if (character !== C_COLON || value.charAt(index + 1) !== C_SLASH) {
        return;
      }
      link += C_SLASH;
      index++;
    }
    while (index < length) {
      character = value.charAt(index);
      if (character === C_SPACE || character === C_GT) {
        break;
      }
      queue += character;
      index++;
    }
    character = value.charAt(index);
    if (!queue || character !== C_GT) {
      return;
    }
    if (silent) {
      return true;
    }
    link += queue;
    content = link;
    subvalue += link + character;
    now = eat.now();
    now.column++;
    if (hasAtCharacter) {
      if (link.substr(0, MAILTO_PROTOCOL.length).toLowerCase() !== MAILTO_PROTOCOL) {
        link = MAILTO_PROTOCOL + link;
      } else {
        content = content.substr(MAILTO_PROTOCOL.length);
        now.column += MAILTO_PROTOCOL.length;
      }
    }
    tokenize = self.inlineTokenizers.escape;
    self.inlineTokenizers.escape = null;
    node = eat(subvalue)(self.renderLink(true, decode(link), content, null, now, eat));
    self.inlineTokenizers.escape = tokenize;
    return node;
  }
  tokenizeAutoLink.notInLink = true;
  tokenizeAutoLink.locator = locateAutoLink;
  function locateURL(value, fromIndex) {
    var index = -1;
    var min = -1;
    var position;
    if (!this.options.gfm) {
      return -1;
    }
    while (++index < PROTOCOLS_LENGTH) {
      position = value.indexOf(PROTOCOLS[index], fromIndex);
      if (position !== -1 && (position < min || min === -1)) {
        min = position;
      }
    }
    return min;
  }
  function tokenizeURL(eat, value, silent) {
    var self = this;
    var subvalue;
    var content;
    var character;
    var index;
    var position;
    var protocol;
    var match;
    var length;
    var queue;
    var once;
    var now;
    if (!self.options.gfm) {
      return;
    }
    subvalue = EMPTY;
    index = -1;
    length = PROTOCOLS_LENGTH;
    while (++index < length) {
      protocol = PROTOCOLS[index];
      match = value.slice(0, protocol.length);
      if (match.toLowerCase() === protocol) {
        subvalue = match;
        break;
      }
    }
    if (!subvalue) {
      return;
    }
    index = subvalue.length;
    length = value.length;
    queue = EMPTY;
    while (index < length) {
      character = value.charAt(index);
      if (isWhiteSpace(character) || character === C_LT) {
        break;
      }
      if (character === C_DOT || character === C_COMMA || character === C_COLON || character === C_SEMI_COLON || character === C_DOUBLE_QUOTE || character === C_SINGLE_QUOTE || character === C_PAREN_CLOSE || character === C_BRACKET_CLOSE) {
        if (once) {
          break;
        }
        once = true;
      }
      queue += character;
      index++;
    }
    if (!queue) {
      return;
    }
    subvalue += queue;
    content = subvalue;
    if (protocol === MAILTO_PROTOCOL) {
      position = queue.indexOf(C_AT_SIGN);
      if (position === -1 || position === length - 1) {
        return;
      }
      content = content.substr(MAILTO_PROTOCOL.length);
    }
    if (silent) {
      return true;
    }
    now = eat.now();
    return eat(subvalue)(self.renderLink(true, decode(subvalue), content, null, now, eat));
  }
  tokenizeURL.notInLink = true;
  tokenizeURL.locator = locateURL;
  function locateTag(value, fromIndex) {
    return value.indexOf(C_LT, fromIndex);
  }
  function tokenizeTag(eat, value, silent) {
    var self = this;
    var subvalue = eatHTMLComment(value, self.options) || eatHTMLCDATA(value) || eatHTMLProcessingInstruction(value) || eatHTMLDeclaration(value) || eatHTMLClosingTag(value) || eatHTMLOpeningTag(value);
    if (!subvalue) {
      return;
    }
    if (silent) {
      return true;
    }
    if (!self.inLink && EXPRESSION_HTML_LINK_OPEN.test(subvalue)) {
      self.inLink = true;
    } else if (self.inLink && EXPRESSION_HTML_LINK_CLOSE.test(subvalue)) {
      self.inLink = false;
    }
    return eat(subvalue)(self.renderRaw(T_HTML, subvalue));
  }
  tokenizeTag.locator = locateTag;
  function locateLink(value, fromIndex) {
    var link = value.indexOf(C_BRACKET_OPEN, fromIndex);
    var image = value.indexOf(C_EXCLAMATION_MARK + C_BRACKET_OPEN, fromIndex);
    if (image === -1) {
      return link;
    }
    return link < image ? link : image;
  }
  function tokenizeLink(eat, value, silent) {
    var self = this;
    var subvalue = EMPTY;
    var index = 0;
    var character = value.charAt(0);
    var beforeURL;
    var beforeTitle;
    var whiteSpaceQueue;
    var commonmark;
    var openCount;
    var hasMarker;
    var markers;
    var isImage;
    var content;
    var marker;
    var length;
    var title;
    var depth;
    var queue;
    var url;
    var now;
    if (character === C_EXCLAMATION_MARK) {
      isImage = true;
      subvalue = character;
      character = value.charAt(++index);
    }
    if (character !== C_BRACKET_OPEN) {
      return;
    }
    if (!isImage && self.inLink) {
      return;
    }
    subvalue += character;
    queue = EMPTY;
    index++;
    commonmark = self.options.commonmark;
    length = value.length;
    now = eat.now();
    depth = 0;
    now.column += index;
    while (index < length) {
      character = value.charAt(index);
      if (character === C_BRACKET_OPEN) {
        depth++;
      } else if (character === C_BRACKET_CLOSE) {
        if (!commonmark && !depth) {
          if (value.charAt(index + 1) === C_PAREN_OPEN) {
            break;
          }
          depth++;
        }
        if (depth === 0) {
          break;
        }
        depth--;
      }
      queue += character;
      index++;
    }
    if (value.charAt(index) !== C_BRACKET_CLOSE || value.charAt(++index) !== C_PAREN_OPEN) {
      return;
    }
    subvalue += queue + C_BRACKET_CLOSE + C_PAREN_OPEN;
    index++;
    content = queue;
    while (index < length) {
      character = value.charAt(index);
      if (!isWhiteSpace(character)) {
        break;
      }
      subvalue += character;
      index++;
    }
    character = value.charAt(index);
    markers = commonmark ? COMMONMARK_LINK_TITLE_MARKERS : LINK_TITLE_MARKERS;
    openCount = 0;
    queue = EMPTY;
    beforeURL = subvalue;
    if (character === C_LT) {
      index++;
      beforeURL += C_LT;
      while (index < length) {
        character = value.charAt(index);
        if (character === C_GT) {
          break;
        }
        if (commonmark && character === C_NEWLINE) {
          return;
        }
        queue += character;
        index++;
      }
      if (value.charAt(index) !== C_GT) {
        return;
      }
      subvalue += C_LT + queue + C_GT;
      url = queue;
      index++;
    } else {
      character = null;
      whiteSpaceQueue = EMPTY;
      while (index < length) {
        character = value.charAt(index);
        if (whiteSpaceQueue && has.call(markers, character)) {
          break;
        }
        if (isWhiteSpace(character)) {
          if (commonmark) {
            break;
          }
          whiteSpaceQueue += character;
        } else {
          if (character === C_PAREN_OPEN) {
            depth++;
            openCount++;
          } else if (character === C_PAREN_CLOSE) {
            if (depth === 0) {
              break;
            }
            depth--;
          }
          queue += whiteSpaceQueue;
          whiteSpaceQueue = EMPTY;
          if (character === C_BACKSLASH) {
            queue += C_BACKSLASH;
            character = value.charAt(++index);
          }
          queue += character;
        }
        index++;
      }
      queue = queue;
      subvalue += queue;
      url = queue;
      index = subvalue.length;
    }
    queue = EMPTY;
    while (index < length) {
      character = value.charAt(index);
      if (!isWhiteSpace(character)) {
        break;
      }
      queue += character;
      index++;
    }
    character = value.charAt(index);
    subvalue += queue;
    if (queue && has.call(markers, character)) {
      index++;
      subvalue += character;
      queue = EMPTY;
      marker = markers[character];
      beforeTitle = subvalue;
      if (commonmark) {
        while (index < length) {
          character = value.charAt(index);
          if (character === marker) {
            break;
          }
          if (character === C_BACKSLASH) {
            queue += C_BACKSLASH;
            character = value.charAt(++index);
          }
          index++;
          queue += character;
        }
        character = value.charAt(index);
        if (character !== marker) {
          return;
        }
        title = queue;
        subvalue += queue + character;
        index++;
        while (index < length) {
          character = value.charAt(index);
          if (!isWhiteSpace(character)) {
            break;
          }
          subvalue += character;
          index++;
        }
      } else {
        whiteSpaceQueue = EMPTY;
        while (index < length) {
          character = value.charAt(index);
          if (character === marker) {
            if (hasMarker) {
              queue += marker + whiteSpaceQueue;
              whiteSpaceQueue = EMPTY;
            }
            hasMarker = true;
          } else if (!hasMarker) {
            queue += character;
          } else if (character === C_PAREN_CLOSE) {
            subvalue += queue + marker + whiteSpaceQueue;
            title = queue;
            break;
          } else if (isWhiteSpace(character)) {
            whiteSpaceQueue += character;
          } else {
            queue += marker + whiteSpaceQueue + character;
            whiteSpaceQueue = EMPTY;
            hasMarker = false;
          }
          index++;
        }
      }
    }
    if (value.charAt(index) !== C_PAREN_CLOSE) {
      return;
    }
    if (silent) {
      return true;
    }
    subvalue += C_PAREN_CLOSE;
    url = self.decode.raw(self.descape(url), eat(beforeURL).test().end);
    if (title) {
      beforeTitle = eat(beforeTitle).test().end;
      title = self.decode.raw(self.descape(title), beforeTitle);
    }
    return eat(subvalue)(self.renderLink(!isImage, url, content, title, now, eat));
  }
  tokenizeLink.locator = locateLink;
  function tokenizeReference(eat, value, silent) {
    var self = this;
    var character = value.charAt(0);
    var index = 0;
    var length = value.length;
    var subvalue = EMPTY;
    var intro = EMPTY;
    var type = T_LINK;
    var referenceType = REFERENCE_TYPE_SHORTCUT;
    var text;
    var identifier;
    var now;
    var node;
    var exitLink;
    var queue;
    var bracketed;
    var depth;
    if (character === C_EXCLAMATION_MARK) {
      type = T_IMAGE;
      intro = character;
      character = value.charAt(++index);
    }
    if (character !== C_BRACKET_OPEN) {
      return;
    }
    index++;
    intro += character;
    queue = EMPTY;
    if (self.options.footnotes && type === T_LINK && value.charAt(index) === C_CARET) {
      intro += C_CARET;
      index++;
      type = T_FOOTNOTE;
    }
    depth = 0;
    while (index < length) {
      character = value.charAt(index);
      if (character === C_BRACKET_OPEN) {
        bracketed = true;
        depth++;
      } else if (character === C_BRACKET_CLOSE) {
        if (!depth) {
          break;
        }
        depth--;
      }
      if (character === C_BACKSLASH) {
        queue += C_BACKSLASH;
        character = value.charAt(++index);
      }
      queue += character;
      index++;
    }
    subvalue = text = queue;
    character = value.charAt(index);
    if (character !== C_BRACKET_CLOSE) {
      return;
    }
    index++;
    subvalue += character;
    queue = EMPTY;
    while (index < length) {
      character = value.charAt(index);
      if (!isWhiteSpace(character)) {
        break;
      }
      queue += character;
      index++;
    }
    character = value.charAt(index);
    if (character !== C_BRACKET_OPEN) {
      if (!text) {
        return;
      }
      identifier = text;
    } else {
      identifier = EMPTY;
      queue += character;
      index++;
      while (index < length) {
        character = value.charAt(index);
        if (character === C_BRACKET_OPEN || character === C_BRACKET_CLOSE) {
          break;
        }
        if (character === C_BACKSLASH) {
          identifier += C_BACKSLASH;
          character = value.charAt(++index);
        }
        identifier += character;
        index++;
      }
      character = value.charAt(index);
      if (character === C_BRACKET_CLOSE) {
        queue += identifier + character;
        index++;
        referenceType = identifier ? REFERENCE_TYPE_FULL : REFERENCE_TYPE_COLLAPSED;
      } else {
        identifier = EMPTY;
      }
      subvalue += queue;
      queue = EMPTY;
    }
    if (referenceType !== REFERENCE_TYPE_FULL && bracketed) {
      return;
    }
    if (type === T_FOOTNOTE && referenceType !== REFERENCE_TYPE_SHORTCUT) {
      type = T_LINK;
      intro = C_BRACKET_OPEN + C_CARET;
      text = C_CARET + text;
    }
    subvalue = intro + subvalue;
    if (type === T_LINK && self.inLink) {
      return null;
    }
    if (silent) {
      return true;
    }
    if (type === T_FOOTNOTE && text.indexOf(C_SPACE) !== -1) {
      return eat(subvalue)(self.renderFootnote(text, eat.now()));
    }
    now = eat.now();
    now.column += intro.length;
    identifier = referenceType === REFERENCE_TYPE_FULL ? identifier : text;
    node = {
      'type': type + 'Reference',
      'identifier': normalize(identifier)
    };
    if (type === T_LINK || type === T_IMAGE) {
      node.referenceType = referenceType;
    }
    if (type === T_LINK) {
      exitLink = self.enterLink();
      node.children = self.tokenizeInline(text, now);
      exitLink();
    } else if (type === T_IMAGE) {
      node.alt = self.decode.raw(self.descape(text), now) || null;
    }
    return eat(subvalue)(node);
  }
  tokenizeReference.locator = locateLink;
  function locateStrong(value, fromIndex) {
    var asterisk = value.indexOf(C_ASTERISK + C_ASTERISK, fromIndex);
    var underscore = value.indexOf(C_UNDERSCORE + C_UNDERSCORE, fromIndex);
    if (underscore === -1) {
      return asterisk;
    }
    if (asterisk === -1) {
      return underscore;
    }
    return underscore < asterisk ? underscore : asterisk;
  }
  function tokenizeStrong(eat, value, silent) {
    var self = this;
    var index = 0;
    var character = value.charAt(index);
    var now;
    var pedantic;
    var marker;
    var queue;
    var subvalue;
    var length;
    var prev;
    if (EMPHASIS_MARKERS[character] !== true || value.charAt(++index) !== character) {
      return;
    }
    pedantic = self.options.pedantic;
    marker = character;
    subvalue = marker + marker;
    length = value.length;
    index++;
    queue = character = EMPTY;
    if (pedantic && isWhiteSpace(value.charAt(index))) {
      return;
    }
    while (index < length) {
      prev = character;
      character = value.charAt(index);
      if (character === marker && value.charAt(index + 1) === marker && (!pedantic || !isWhiteSpace(prev))) {
        character = value.charAt(index + 2);
        if (character !== marker) {
          if (!trim(queue)) {
            return;
          }
          if (silent) {
            return true;
          }
          now = eat.now();
          now.column += 2;
          return eat(subvalue + queue + subvalue)(self.renderInline(T_STRONG, queue, now));
        }
      }
      if (!pedantic && character === C_BACKSLASH) {
        queue += character;
        character = value.charAt(++index);
      }
      queue += character;
      index++;
    }
  }
  tokenizeStrong.locator = locateStrong;
  function locateEmphasis(value, fromIndex) {
    var asterisk = value.indexOf(C_ASTERISK, fromIndex);
    var underscore = value.indexOf(C_UNDERSCORE, fromIndex);
    if (underscore === -1) {
      return asterisk;
    }
    if (asterisk === -1) {
      return underscore;
    }
    return underscore < asterisk ? underscore : asterisk;
  }
  function tokenizeEmphasis(eat, value, silent) {
    var self = this;
    var index = 0;
    var character = value.charAt(index);
    var now;
    var pedantic;
    var marker;
    var queue;
    var subvalue;
    var length;
    var prev;
    if (EMPHASIS_MARKERS[character] !== true) {
      return;
    }
    pedantic = self.options.pedantic;
    subvalue = marker = character;
    length = value.length;
    index++;
    queue = character = EMPTY;
    if (pedantic && isWhiteSpace(value.charAt(index))) {
      return;
    }
    while (index < length) {
      prev = character;
      character = value.charAt(index);
      if (character === marker && (!pedantic || !isWhiteSpace(prev))) {
        character = value.charAt(++index);
        if (character !== marker) {
          if (!trim(queue) || prev === marker) {
            return;
          }
          if (pedantic || marker !== C_UNDERSCORE || !isWordCharacter(character)) {
            if (silent) {
              return true;
            }
            now = eat.now();
            now.column++;
            return eat(subvalue + queue + marker)(self.renderInline(T_EMPHASIS, queue, now));
          }
        }
        queue += marker;
      }
      if (!pedantic && character === C_BACKSLASH) {
        queue += character;
        character = value.charAt(++index);
      }
      queue += character;
      index++;
    }
  }
  tokenizeEmphasis.locator = locateEmphasis;
  function locateDeletion(value, fromIndex) {
    return value.indexOf(C_TILDE + C_TILDE, fromIndex);
  }
  function tokenizeDeletion(eat, value, silent) {
    var self = this;
    var character = EMPTY;
    var previous = EMPTY;
    var preceding = EMPTY;
    var subvalue = EMPTY;
    var index;
    var length;
    var now;
    if (!self.options.gfm || value.charAt(0) !== C_TILDE || value.charAt(1) !== C_TILDE || isWhiteSpace(value.charAt(2))) {
      return;
    }
    index = 1;
    length = value.length;
    now = eat.now();
    now.column += 2;
    while (++index < length) {
      character = value.charAt(index);
      if (character === C_TILDE && previous === C_TILDE && (!preceding || !isWhiteSpace(preceding))) {
        if (silent) {
          return true;
        }
        return eat(C_TILDE + C_TILDE + subvalue + C_TILDE + C_TILDE)(self.renderInline(T_DELETE, subvalue, now));
      }
      subvalue += previous;
      preceding = previous;
      previous = character;
    }
  }
  tokenizeDeletion.locator = locateDeletion;
  function locateInlineCode(value, fromIndex) {
    return value.indexOf(C_TICK, fromIndex);
  }
  function tokenizeInlineCode(eat, value, silent) {
    var self = this;
    var length = value.length;
    var index = 0;
    var queue = EMPTY;
    var tickQueue = EMPTY;
    var contentQueue;
    var whiteSpaceQueue;
    var count;
    var openingCount;
    var subvalue;
    var character;
    var found;
    var next;
    while (index < length) {
      if (value.charAt(index) !== C_TICK) {
        break;
      }
      queue += C_TICK;
      index++;
    }
    if (!queue) {
      return;
    }
    subvalue = queue;
    openingCount = index;
    queue = EMPTY;
    next = value.charAt(index);
    count = 0;
    while (index < length) {
      character = next;
      next = value.charAt(index + 1);
      if (character === C_TICK) {
        count++;
        tickQueue += character;
      } else {
        count = 0;
        queue += character;
      }
      if (count && next !== C_TICK) {
        if (count === openingCount) {
          subvalue += queue + tickQueue;
          found = true;
          break;
        }
        queue += tickQueue;
        tickQueue = EMPTY;
      }
      index++;
    }
    if (!found) {
      if (openingCount % 2 !== 0) {
        return;
      }
      queue = EMPTY;
    }
    if (silent) {
      return true;
    }
    contentQueue = whiteSpaceQueue = EMPTY;
    length = queue.length;
    index = -1;
    while (++index < length) {
      character = queue.charAt(index);
      if (isWhiteSpace(character)) {
        whiteSpaceQueue += character;
        continue;
      }
      if (whiteSpaceQueue) {
        if (contentQueue) {
          contentQueue += whiteSpaceQueue;
        }
        whiteSpaceQueue = EMPTY;
      }
      contentQueue += character;
    }
    return eat(subvalue)(self.renderRaw(T_INLINE_CODE, contentQueue));
  }
  tokenizeInlineCode.locator = locateInlineCode;
  function locateBreak(value, fromIndex) {
    var index = value.indexOf(C_NEWLINE, fromIndex);
    while (index > fromIndex) {
      if (value.charAt(index - 1) !== C_SPACE) {
        break;
      }
      index--;
    }
    return index;
  }
  function tokenizeBreak(eat, value, silent) {
    var self = this;
    var breaks = self.options.breaks;
    var length = value.length;
    var index = -1;
    var queue = EMPTY;
    var character;
    while (++index < length) {
      character = value.charAt(index);
      if (character === C_NEWLINE) {
        if (!breaks && index < MIN_BREAK_LENGTH) {
          return;
        }
        if (silent) {
          return true;
        }
        queue += character;
        return eat(queue)(self.renderVoid(T_BREAK));
      }
      if (character !== C_SPACE) {
        return;
      }
      queue += character;
    }
  }
  tokenizeBreak.locator = locateBreak;
  function Parser(file, options, processor) {
    var self = this;
    self.file = file;
    self.inLink = false;
    self.atTop = true;
    self.atStart = true;
    self.inBlockquote = false;
    self.data = processor.data;
    self.descape = descapeFactory(self, 'escape');
    self.decode = decodeFactory(self);
    self.options = extend({}, self.options);
    self.setOptions(options);
  }
  Parser.prototype.setOptions = function(options) {
    var self = this;
    var escape = self.data.escape;
    var current = self.options;
    var key;
    if (options === null || options === undefined) {
      options = {};
    } else if (typeof options === 'object') {
      options = extend({}, options);
    } else {
      raise(options, 'options');
    }
    for (key in defaultOptions) {
      validate.boolean(options, key, current[key]);
    }
    self.options = options;
    if (options.commonmark) {
      self.escape = escape.commonmark;
    } else if (options.gfm) {
      self.escape = escape.gfm;
    } else {
      self.escape = escape.default;
    }
    return self;
  };
  Parser.prototype.options = defaultOptions;
  Parser.prototype.indent = function(start) {
    var self = this;
    var line = start;
    function indenter(offset) {
      self.offset[line] = (self.offset[line] || 0) + offset;
      line++;
    }
    return indenter;
  };
  Parser.prototype.getIndent = function(start) {
    var offset = this.offset;
    var result = [];
    while (++start) {
      if (!(start in offset)) {
        break;
      }
      result.push((offset[start] || 0) + 1);
    }
    return result;
  };
  Parser.prototype.parse = function() {
    var self = this;
    var value = clean(String(self.file));
    var node;
    self.offset = {};
    node = self.renderBlock(T_ROOT, value);
    if (self.options.position) {
      node.position = {'start': {
          'line': 1,
          'column': 1
        }};
      node.position.end = self.eof || node.position.start;
    }
    return node;
  };
  Parser.prototype.enterLink = stateToggler('inLink', false);
  Parser.prototype.exitTop = stateToggler('atTop', true);
  Parser.prototype.exitStart = stateToggler('atStart', true);
  Parser.prototype.enterBlockquote = stateToggler('inBlockquote', false);
  Parser.prototype.renderRaw = renderRaw;
  Parser.prototype.renderVoid = renderVoid;
  Parser.prototype.renderParent = renderParent;
  Parser.prototype.renderInline = renderInline;
  Parser.prototype.renderBlock = renderBlock;
  Parser.prototype.renderLink = renderLink;
  Parser.prototype.renderCodeBlock = renderCodeBlock;
  Parser.prototype.renderBlockquote = renderBlockquote;
  Parser.prototype.renderListItem = renderListItem;
  Parser.prototype.renderFootnoteDefinition = renderFootnoteDefinition;
  Parser.prototype.renderHeading = renderHeading;
  Parser.prototype.renderFootnote = renderFootnote;
  function tokenizeFactory(type) {
    function tokenize(value, location) {
      var self = this;
      var offset = self.offset;
      var tokens = [];
      var methods = self[type + 'Methods'];
      var tokenizers = self[type + 'Tokenizers'];
      var line = location ? location.line : 1;
      var column = location ? location.column : 1;
      var patchPosition = self.options.position;
      var add;
      var index;
      var length;
      var method;
      var name;
      var matched;
      var valueLength;
      var eater;
      if (!value) {
        return tokens;
      }
      function updatePosition(subvalue) {
        var lastIndex = -1;
        var index = subvalue.indexOf(C_NEWLINE);
        while (index !== -1) {
          line++;
          lastIndex = index;
          index = subvalue.indexOf(C_NEWLINE, index + 1);
        }
        if (lastIndex === -1) {
          column = column + subvalue.length;
        } else {
          column = subvalue.length - lastIndex;
        }
        if (line in offset) {
          if (lastIndex !== -1) {
            column += offset[line];
          } else if (column <= offset[line]) {
            column = offset[line] + 1;
          }
        }
      }
      function getOffset() {
        var indentation = [];
        var pos = line + 1;
        function done() {
          var last = line + 1;
          while (pos < last) {
            indentation.push((offset[pos] || 0) + 1);
            pos++;
          }
          return indentation;
        }
        return done;
      }
      function now() {
        return {
          'line': line,
          'column': column
        };
      }
      function Position(start) {
        this.start = start;
        this.end = now();
      }
      function validateEat(subvalue) {
        if (value.substring(0, subvalue.length) !== subvalue) {
          self.file.fail(ERR_INCORRECTLY_EATEN, now());
        }
      }
      function position() {
        var before = now();
        function update(node, indent) {
          var prev = node.position;
          var start = prev ? prev.start : before;
          var combined = [];
          var n = prev && prev.end.line;
          var l = before.line;
          node.position = new Position(start);
          if (prev && indent && prev.indent) {
            combined = prev.indent;
            if (n < l) {
              while (++n < l) {
                combined.push((offset[n] || 0) + 1);
              }
              combined.push(before.column);
            }
            indent = combined.concat(indent);
          }
          node.position.indent = indent || [];
          return node;
        }
        return update;
      }
      add = function(node, parent) {
        var prev;
        var children;
        if (!parent) {
          children = tokens;
        } else {
          children = parent.children;
        }
        prev = children[children.length - 1];
        if (prev && node.type === prev.type && node.type in MERGEABLE_NODES && mergeable(prev) && mergeable(node)) {
          node = MERGEABLE_NODES[node.type].call(self, prev, node);
        }
        if (node !== prev) {
          children.push(node);
        }
        if (self.atStart && tokens.length) {
          self.exitStart();
        }
        return node;
      };
      function eat(subvalue) {
        var indent = getOffset();
        var pos = position();
        var current = now();
        validateEat(subvalue);
        function apply(node, parent) {
          return pos(add(pos(node), parent), indent);
        }
        function reset() {
          var node = apply.apply(null, arguments);
          line = current.line;
          column = current.column;
          value = subvalue + value;
          return node;
        }
        function test() {
          var result = pos({});
          line = current.line;
          column = current.column;
          value = subvalue + value;
          return result.position;
        }
        apply.reset = reset;
        apply.test = reset.test = test;
        value = value.substring(subvalue.length);
        updatePosition(subvalue);
        indent = indent();
        return apply;
      }
      function noEat(subvalue) {
        validateEat(subvalue);
        function apply() {
          return add.apply(null, arguments);
        }
        function reset() {
          var node = apply.apply(null, arguments);
          value = subvalue + value;
          return node;
        }
        function test() {
          value = subvalue + value;
          return {};
        }
        apply.reset = reset;
        apply.test = reset.test = test;
        value = value.substring(subvalue.length);
        return apply;
      }
      eater = patchPosition ? eat : noEat;
      eater.now = now;
      eater.file = self.file;
      updatePosition(EMPTY);
      while (value) {
        index = -1;
        length = methods.length;
        matched = false;
        while (++index < length) {
          name = methods[index];
          method = tokenizers[name];
          if (method && (!method.onlyAtStart || self.atStart) && (!method.onlyAtTop || self.atTop) && (!method.notInBlockquote || !self.inBlockquote) && (!method.notInLink || !self.inLink)) {
            valueLength = value.length;
            method.apply(self, [eater, value]);
            matched = valueLength !== value.length;
            if (matched) {
              break;
            }
          }
        }
        if (!matched) {
          self.file.fail(ERR_INFINITE_LOOP, eater.now());
          break;
        }
      }
      self.eof = now();
      return tokens;
    }
    return tokenize;
  }
  Parser.prototype.blockTokenizers = {
    'yamlFrontMatter': tokenizeYAMLFrontMatter,
    'newline': tokenizeNewline,
    'code': tokenizeCode,
    'fences': tokenizeFences,
    'heading': tokenizeHeading,
    'lineHeading': tokenizeLineHeading,
    'horizontalRule': tokenizeHorizontalRule,
    'blockquote': tokenizeBlockquote,
    'list': tokenizeList,
    'html': tokenizeHTML,
    'definition': tokenizeDefinition,
    'footnoteDefinition': tokenizeFootnoteDefinition,
    'table': tokenizeTable,
    'paragraph': tokenizeParagraph
  };
  Parser.prototype.blockMethods = ['yamlFrontMatter', 'newline', 'code', 'fences', 'blockquote', 'heading', 'horizontalRule', 'list', 'lineHeading', 'html', 'footnoteDefinition', 'definition', 'looseTable', 'table', 'paragraph'];
  Parser.prototype.tokenizeBlock = tokenizeFactory(BLOCK);
  Parser.prototype.inlineTokenizers = {
    'escape': tokenizeEscape,
    'autoLink': tokenizeAutoLink,
    'url': tokenizeURL,
    'tag': tokenizeTag,
    'link': tokenizeLink,
    'reference': tokenizeReference,
    'strong': tokenizeStrong,
    'emphasis': tokenizeEmphasis,
    'deletion': tokenizeDeletion,
    'inlineCode': tokenizeInlineCode,
    'break': tokenizeBreak,
    'inlineText': tokenizeText
  };
  Parser.prototype.inlineMethods = ['escape', 'autoLink', 'url', 'tag', 'link', 'reference', 'shortcutReference', 'strong', 'emphasis', 'deletion', 'inlineCode', 'break', 'inlineText'];
  Parser.prototype.tokenizeInline = tokenizeFactory(INLINE);
  Parser.prototype.tokenizeFactory = tokenizeFactory;
  module.exports = Parser;
})(require('process'));
