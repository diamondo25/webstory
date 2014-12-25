var libxmljs = require('libxmljs');
var fs = require('fs');
var util = require('util');

var objectStorage = {};

var Node = module.exports.Node = function Node(name, parent) {
  this['name'] = name;
  this['_keys'] = [];
}

Node.prototype.forEach = function(callback) {
  for (var i = 0; i < this._keys.length; i++) {
    var key = this._keys[i];
    callback(this[key], key, i);
  }
};

var UOL = module.exports.UOL = function UOL(name, parent, path) {
  this['name'] = name;
  this['path'] = path;
  this['type'] = 'uol';
}

UOL.prototype.getPath = Node.prototype.getPath = function() {
  var cur = this;
  var path = '';
  do {
    path = cur.name + '/' + path;
    cur = cur['..'];
  } while (cur !== null)

  return path;
};

module.exports.isReservedDataObject = function(name) {
  return [ 'name', 'ITEMID', '..', '_image', 'path', '_keys' ].indexOf(name) != -1;
};

module.exports.resolveUOL = function(curnode) {
  var cur = curnode['..'];
  var elements = curnode.path.split('/');
  while (elements.length > 0) {
    if (cur[elements[0]] === null) {
      debugger;
      return null;
    }
    cur = cur[elements[0]];
    elements = elements.slice(1);
  }

  return cur;
};

function parseNodeType(node, prevNode, name) {
  var ret = new Node(name === null ? node.attr("name").value() : name, prevNode);

  function parseSubprops() {
    var children = node.childNodes();
    for (var i = 0; i < children.length; i++) {
      var subnode = children[i];
      if (subnode.type() !== 'element') {
        continue;
      }
      var subnodeName = subnode.attr("name").value();
      ret[subnodeName] = parseNodeType(subnode, ret, subnodeName);
      ret['_keys'].push(subnodeName);
    }
  }

  var value = node.attr('value');
  if (value !== null) {
    value = value.value();
  }
  switch (node.name()) {
    case "int":
    case "short":
      return parseInt(value, 10);
    case "string":
      return value;
    case "null":
      return ret;
    case "vector":
      ret['type'] = 'vector';
      delete ret['_keys'];
      ret['X'] = parseInt(node.attr('x').value(), 10);
      ret['Y'] = parseInt(node.attr('y').value(), 10);
      return ret;
    case "canvas":
      ret['type'] = 'canvas';
      ret['_image'] = {
        width : parseInt(node.attr('width').value(), 10),
        height : parseInt(node.attr('height').value(), 10),
        uri : node.attr('basedata').value()
      };
      parseSubprops();
      return ret;

    case 'imgdir':
      parseSubprops();
      return ret;

    case 'uol':
      return new UOL(ret.name, prevNode, value);
  }
}

module.exports.getJson = function(file, callback, returnText) {
  fs.readFile(file, {
    encoding : 'utf8'
  }, function(err, data) {
    var xmlDoc = libxmljs.parseXml(data.trim());

    var root = xmlDoc.root();
    var nodes = parseNodeType(root, null, root.attr('name').value());

    var text = JSON.stringify(nodes, null, 0);
    fs.writeFile(file + '.json', text, function(err) {
      if (err) {
        throw err;
      }

      if (callback) {
        callback(returnText ? text : nodes);
      }
    });
  });
}
