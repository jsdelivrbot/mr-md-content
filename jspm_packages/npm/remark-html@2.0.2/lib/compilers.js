/* */ 
'use strict';
var trim = require('trim');
var detab = require('detab');
var collapse = require('collapse-white-space');
var normalizeURI = require('normalize-uri');
var trimLines = require('trim-lines');
var visit = require('unist-util-visit');
var h = require('./h');
var visitors = {};
function failsafe(node, definition, context) {
  var result;
  if (node.referenceType === 'shortcut' && !definition.link) {
    result = node.children ? context.all(node).join('') : node.alt;
    return (node.type === 'imageReference' ? '!' : '') + '[' + result + ']';
  }
  return '';
}
function generateFootnotes() {
  var self = this;
  var definitions = self.footnotes;
  var length = definitions.length;
  var index = -1;
  var results = [];
  var def;
  if (!length) {
    return '';
  }
  while (++index < length) {
    def = definitions[index];
    results[index] = self.listItem({
      'type': 'listItem',
      'data': {'htmlAttributes': {'id': 'fn-' + def.identifier}},
      'children': def.children.concat({
        'type': 'link',
        'href': '#fnref-' + def.identifier,
        'data': {'htmlAttributes': {'class': 'footnote-backref'}},
        'children': [{
          'type': 'text',
          'value': '↩'
        }]
      }),
      'position': def.position
    }, {});
  }
  return h(self, null, {
    'name': 'div',
    'attributes': {'class': 'footnotes'},
    'content': h(self, null, {'name': 'hr'}) + '\n' + h(self, null, {
      'name': 'ol',
      'content': results.join('\n')
    }, null, true)
  }, null, true) + '\n';
}
function unknown(node) {
  var content = 'children' in node ? this.all(node).join('') : node.value;
  return h(this, node, {
    'name': 'div',
    'content': content || ''
  }, node.data);
}
function one(node, parent) {
  var self = this;
  var type = node && node.type;
  var fn = typeof self[type] === 'function' ? type : 'unknown';
  if (!type) {
    self.file.fail('Expected node `' + node + '`');
  }
  return self[fn](node, parent);
}
function all(parent) {
  var self = this;
  var nodes = parent.children;
  var values = [];
  var index = -1;
  var length = nodes.length;
  var value;
  var prev;
  while (++index < length) {
    value = self.visit(nodes[index], parent);
    if (value) {
      if (prev && prev.type === 'break') {
        value = trim.left(value);
      }
      values.push(value);
    }
    prev = nodes[index];
  }
  return values;
}
function root(node) {
  var self = this;
  var definitions = {};
  var footnotes = [];
  var result;
  self.definitions = definitions;
  self.footnotes = footnotes;
  visit(node, 'definition', function(definition) {
    definitions[definition.identifier.toUpperCase()] = definition;
  });
  visit(node, 'footnoteDefinition', function(definition) {
    footnotes.push(definition);
  });
  result = self.all(node).join('\n');
  return (result ? result + '\n' : '') + self.generateFootnotes();
}
function blockquote(node) {
  return h(this, node, {
    'name': 'blockquote',
    'content': this.all(node).join('\n')
  }, node.data, true);
}
function footnote(node) {
  var self = this;
  var definitions = self.footnotes;
  var index = -1;
  var length = definitions.length;
  var identifiers = [];
  var identifier;
  while (++index < length) {
    identifiers[index] = definitions[index].identifier;
  }
  index = -1;
  identifier = 1;
  while (identifiers.indexOf(String(identifier)) !== -1) {
    identifier++;
  }
  identifier = String(identifier);
  self.footnotes.push({
    'type': 'footnoteDefinition',
    'identifier': identifier,
    'children': node.children,
    'position': node.position
  });
  return self.footnoteReference({
    'type': 'footnoteReference',
    'identifier': identifier,
    'position': node.position
  });
}
function list(node) {
  return h(this, node, {
    'name': node.ordered ? 'ol' : 'ul',
    'attributes': {'start': node.start !== 1 ? node.start : null},
    'content': this.all(node).join('\n')
  }, node.data, true);
}
function listItem(node, parent) {
  var single;
  var result;
  single = !parent.loose && node.children.length === 1 && node.children[0].children;
  result = this.all(single ? node.children[0] : node).join(single ? '' : '\n');
  return h(this, node, {
    'name': 'li',
    'content': result
  }, node.data, !single);
}
function heading(node) {
  return h(this, node, {
    'name': 'h' + node.depth,
    'content': this.all(node).join('')
  }, node.data);
}
function paragraph(node) {
  return h(this, node, {
    'name': 'p',
    'content': trim(detab(this.all(node).join('')))
  }, node.data);
}
function code(node) {
  var self = this;
  var value = node.value ? detab(node.value + '\n') : '';
  return h(self, node, {
    'name': 'pre',
    'content': h(self, node, {
      'name': 'code',
      'content': self.encode(value)
    }, node.data)
  });
}
function table(node) {
  var self = this;
  var rows = node.children;
  var index = rows.length;
  var align = node.align;
  var alignLength = align.length;
  var pos;
  var result = [];
  var row;
  var out;
  var name;
  var cell;
  while (index--) {
    pos = alignLength;
    row = rows[index].children;
    out = [];
    name = index === 0 ? 'th' : 'td';
    while (pos--) {
      cell = row[pos];
      out[pos] = h(self, cell, {
        'name': name,
        'attributes': {'align': align[pos]},
        'content': cell ? self.all(cell).join('\n') : ''
      }, cell && cell.data);
    }
    result[index] = h(self, rows[index], {
      'name': 'tr',
      'content': out.join('\n')
    }, rows[index], true);
  }
  return h(self, node, {
    'name': 'table',
    'content': h(self, node, {
      'name': 'thead',
      'content': result[0]
    }, null, true) + '\n' + h(self, node, {
      'name': 'tbody',
      'content': result.slice(1).join('\n')
    }, null, true)
  }, node.data, true);
}
function html(node) {
  return this.options.sanitize ? this.encode(node.value) : node.value;
}
function rule(node) {
  return h(this, node, {'name': 'hr'}, node.data);
}
function inlineCode(node) {
  return h(this, node, {
    'name': 'code',
    'content': collapse(this.encode(node.value))
  }, node.data);
}
function strong(node) {
  return h(this, node, {
    'name': 'strong',
    'content': this.all(node).join('')
  }, node.data);
}
function emphasis(node) {
  return h(this, node, {
    'name': 'em',
    'content': this.all(node).join('')
  }, node.data);
}
function hardBreak(node) {
  return h(this, node, {'name': 'br'}, node.data) + '\n';
}
function link(node) {
  return h(this, node, {
    'name': 'a',
    'attributes': {
      'href': normalizeURI(node.href),
      'title': node.title
    },
    'content': this.all(node).join('')
  }, node.data);
}
function footnoteReference(node) {
  var identifier = node.identifier;
  return h(this, node, {
    'name': 'sup',
    'attributes': {'id': 'fnref-' + identifier},
    'content': h(this, node, {
      'name': 'a',
      'attributes': {
        'href': '#fn-' + identifier,
        'class': 'footnote-ref'
      },
      'content': identifier
    })
  }, node.data);
}
function linkReference(node) {
  var self = this;
  var def = self.definitions[node.identifier.toUpperCase()] || {};
  return failsafe(node, def, self) || h(self, node, {
    'name': 'a',
    'attributes': {
      'href': normalizeURI(def.link || ''),
      'title': def.title
    },
    'content': self.all(node).join('')
  }, node.data);
}
function imageReference(node) {
  var self = this;
  var def = self.definitions[node.identifier.toUpperCase()] || {};
  return failsafe(node, def, self) || h(self, node, {
    'name': 'img',
    'attributes': {
      'src': normalizeURI(def.link || ''),
      'alt': node.alt || '',
      'title': def.title
    }
  }, node.data);
}
function image(node) {
  return h(this, node, {
    'name': 'img',
    'attributes': {
      'src': normalizeURI(node.src),
      'alt': node.alt || '',
      'title': node.title
    }
  }, node.data);
}
function strikethrough(node) {
  return h(this, node, {
    'name': 'del',
    'content': this.all(node).join('')
  }, node.data);
}
function text(node) {
  return trimLines(this.encode(node.value));
}
function ignore() {
  return '';
}
visitors.visit = one;
visitors.all = all;
visitors.unknown = unknown;
visitors.generateFootnotes = generateFootnotes;
visitors.yaml = ignore;
visitors.definition = ignore;
visitors.footnoteDefinition = ignore;
visitors.footnote = footnote;
visitors.root = root;
visitors.blockquote = blockquote;
visitors.list = list;
visitors.listItem = listItem;
visitors.paragraph = paragraph;
visitors.heading = heading;
visitors.table = table;
visitors.code = code;
visitors.html = html;
visitors.horizontalRule = rule;
visitors.inlineCode = inlineCode;
visitors.strong = strong;
visitors.emphasis = emphasis;
visitors.break = hardBreak;
visitors.link = link;
visitors.image = image;
visitors.footnoteReference = footnoteReference;
visitors.linkReference = linkReference;
visitors.imageReference = imageReference;
visitors.delete = strikethrough;
visitors.text = text;
visitors.escape = escape;
module.exports = visitors;
