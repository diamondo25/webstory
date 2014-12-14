(function(context) {
  var objectStorage = {};

  var Node = context.Node = function Node(name, parent) {
    this['name'] = name;
    this['..'] = parent;
    this['_keys'] = [];
  }
  
  Node.prototype.forEach = function (callback) {
    for (var i = 0; i < this._keys.length; i++) {
      var key = this._keys[i];
      callback(this[key], key, i);
    }
  };


  context.UOL = function UOL(name, parent, path) {
    this['name'] = name;
    this['..'] = parent;
    this['path'] = path;
  }
  
  context.UOL.prototype.getPath = Node.prototype.getPath = function () {
    var cur = this;
    var path = '';
    do {
      path = cur.name + '/' + path;
      cur = cur['..'];
    } while (cur !== null)
    
    return path;
  };

  context.isReservedDataObject = function(name) {
    return [ 'name', 'ITEMID', '..', '_image', 'path', '_keys' ].indexOf(name) != -1;
  };

  context.resolveUOL = function(curnode) {
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
    var ret = new Node(name === null ? node.getAttribute("name") : name, prevNode);

    function parseSubprops() {
      for (var i = 0; i < node.children.length; i++) {
        var subnode = node.children[i];
        var subnodeName = subnode.getAttribute("name");
        ret[subnodeName] = parseNodeType(subnode, ret, subnodeName);
        ret['_keys'].push(subnodeName);
      }
    }

    var value = node.getAttribute('value');
    switch (node.tagName) {
      case "int":
      case "short":
        return parseInt(value, 10);
      case "string":
        return value;
      case "null":
        return ret;
      case "vector":
        ret['X'] = parseInt(node.getAttribute('x'), 10);
        ret['Y'] = parseInt(node.getAttribute('y'), 10);
        return ret;
      case "canvas":
        ret['_image'] = {
          width : parseInt(node.getAttribute('width'), 10),
          height : parseInt(node.getAttribute('height'), 10),
          uri : 'data:image/png;base64,' + node.getAttribute('basedata')
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

  function getElementFromXML(xml, path) {
    if (!xml.parsed_data) {
      xml.parsed_data = {};
    } else if (path in xml.parsed_data) {
      return xml.parsed_data[path];
    }

    var node = null;
    if (path !== "null") {
      var nodes = path.split('/');

      var innerDepth = 0;
      function findRecursiveNode(curnode, nextnodes) {
        if (nextnodes.length === 0) {
          return curnode;
        }
        for (var i = 0; i < curnode.children.length; i++) {
          var node = curnode.children[i];
          if (node.getAttribute('name') === nextnodes[0]) {
            innerDepth++;
            return findRecursiveNode(node, nextnodes.splice(1));
          }
        }

        return null;
      }

      node = findRecursiveNode(xml.documentElement, nodes);
    } else {
      node = xml.documentElement;
    }

    if (node !== null) {
      var parsed = parseNodeType(node, null, xml.documentElement.getAttribute('name'));
      
      xml.parsed_data[path] = parsed;
      return parsed;
    }
    return null;
  }

  context.getDataNode = function getDataNode(key, callback, sync) {
    var imgpos = key.indexOf('.img');
    if (imgpos == -1) {
      throw 'No img found in ' + key;
    }

    var path = key.substr(0, imgpos + 4);
    var subelements = key.substr(imgpos + 5);

    if (path in objectStorage) {
      var info = objectStorage[path];
      if (!info.loaded) {
        info.callbacks.push([ callback, subelements ]);
      } else {
        callback(getElementFromXML(info.data, subelements));
      }
    } else {
      objectStorage[path] = {
        callbacks : [ [ callback, subelements ] ],
        loaded : false
      };

      var xhttp = new XMLHttpRequest();
      var url = 'http://127.0.0.1:8081/' + path + '.xml';
      console.log(url);
      xhttp.open("GET", url, sync !== true);
      xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4) {
          var info = objectStorage[path];
          info.data = xhttp.responseXML;
          info.loaded = true;

          for (var i = 0; i < info.callbacks.length; i++) {
            var callback = info.callbacks[i][0];
            var subelement = info.callbacks[i][1];

            callback(getElementFromXML(info.data, subelement));
          }
        }
      }
      xhttp.send();
      return xhttp.responseXML;
    }
  };

  context.getItemDataNode = function(itemid, subelement, callback, sync) {
    var path = context.getItemDataLocation(itemid);
    return context.getDataNode(path + subelement, function(obj) {
      if (obj !== null) {
        obj['ITEMID'] = itemid;
      }
      callback(obj);
    }, sync);
  };

})(window);
