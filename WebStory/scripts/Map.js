(function(context) {
  function Obj(node) {
    this.x = node.x;
    this.y = node.y;
    this.z = node.z;
    this.zm = node.zM;
    this.zid = parseInt(node.name, 10);
    this.rx = node.rx;
    this.ry = node.ry;
    this.cx = node.cx;
    this.cy = node.cy;
    this.flow = node.flow;
    this.flip = node.f === 1;
    this.sprite = null;

    if ((this.flow & 1) != 0 && !this.cx) {
      this.cx = 1000;
    }

    if ((this.flow & 2) != 0 && !this.cy) {
      this.cy = 1000;
    }

    var that = this;
    context.getDataNode("Map.wz/Obj/" + node.oS + ".img/" + node.l0 + "/" + node.l1 + "/" + node.l2, function(obj) {
      if (obj === null) {
        console.warn('Object not found!!!');
        return;
      }

      if (obj[0]) {
        obj = obj[0]; // First frame...
      }

      that.sprite = context.getOrCreateSprite(obj);
    }, true);
  }

  function Tile(node, tileSetNode) {
    this.x = node.x;
    this.y = node.y;

    var spriteNode = tileSetNode[node.u][node.no];

    this.z = spriteNode.z;

    if (spriteNode[0]) {
      spriteNode = spriteNode[0]; // First frame...
    }

    this.sprite = context.getOrCreateSprite(spriteNode);
  }

  function Portal(node) {
    this.name = node.pn;
    this.type = node.pt;
    this.toMap = node.tm;
    this.toName = node.tn;
    this.x = node.x;
    this.y = node.y;
  }

  function FootholdNode(node, id, group, layer) {
    this.id = id;
    this.group = group;
    this.layer = layer;
    
    this.x1 = node.x1;
    this.x2 = node.x2;
    this.y1 = node.y1;
    this.y2 = node.y2;

    this.force = node.force || 0;
    this.piece = node.piece || 0;
    this.cant_trough = node.cantTrough === 1;
    this.forbidFallDown = node.forbidFallDown === 1;
    this.next = node.next || 0;
    this.prev = node.prev || 0;
  }

  var Map = function Map(mapid) {
    var map = this;
    this.loaded = false;

    this.baseInfo = null;
    this.layers = new Array(8);
    this.playerLayers = new Array(8);
    this.portals = [];
    this.allFootholds = [];

    var category = Math.floor(mapid / 100000000);
    context.getDataNode("Map.wz/Map/Map" + category + "/" + context.padLeft(mapid, 9, '0') + ".img/null",
        function(obj) {
          map.load(obj);
        });
  };

  Map.prototype.load = function(mapdata) {
    this.baseInfo = mapdata;
    this.info = {
      fs : this.baseInfo['info']['fs'] || 1.0,
      swim : this.baseInfo['info']['swim'] === 1,
    };
    
    this.loadSprites();
    this.loadFootholds();
    this.loadPortals();

    console.log(this.portals);

    this.addPlayer(context.thisPlayer, 7);
    var portal = this.portals[context.frame.game.rnd.integerInRange(0, this.portals.length - 1)];
    context.thisPlayer.x = portal.x;
    context.thisPlayer.y = portal.y;

    var bounds = context.frame.game.mapLayer.getBounds();
    bounds.y -= 300;
    bounds.height += 400;
    context.frame.game.world.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
    
    this.loaded = true;
  };

  Map.prototype.loadSprites = function() {
    for (var i = 0; i < 8; i++) {
      var output = this.layers[i] = {};
      var input = this.baseInfo[i];
      var tileSet = input['info']['tS'];

      output.drawGroup = context.frame.game.add.group(context.frame.game.mapLayer);
      this.playerLayers[i] = context.frame.game.add.group(context.frame.game.mapLayer);

      output.objects = [];
      input['obj'].forEach(function(node) {
        output.objects.push(new Obj(node));
      });

      output.objects.sort(function(a, b) {
        if (a.z == b.z) {
          return a.zid - b.zid;
        } else {
          return a.z - b.z;
        }
      });

      output.objects.forEach(function(elem) {
        var draw = output.drawGroup.create(elem.x - elem.sprite.originX, elem.y - elem.sprite.originY,
            elem.sprite.cacheKey);
        draw.z = elem.z;
        if (elem.flip) {
          draw.width *= -1;
          draw.x += elem.sprite.originX * 2;
        }
      });

      output.tiles = [];
      if (tileSet) {
        var tileSetNode = null;

        context.getDataNode("Map.wz/Tile/" + tileSet + ".img/null", function(obj) {
          tileSetNode = obj;
        }, true);

        input['tile'].forEach(function(node) {
          output.tiles.push(new Tile(node, tileSetNode));
        });

        output.tiles.sort(function(a, b) {
          return a.z - b.z;
        });

        output.tiles.forEach(function(elem) {
          var draw = output.drawGroup.create(elem.x - elem.sprite.originX, elem.y - elem.sprite.originY,
              elem.sprite.cacheKey);
          draw.z = elem.z;
        });
      }
    }
  };

  Map.prototype.loadPortals = function() {
    var map = this;
    this.baseInfo['portal'].forEach(function(node) {
      map.portals.push(new Portal(node));
    });
  };

  Map.prototype.loadFootholds = function() {
    var map = this;
    this.footholds = {};

    var bounds = this.bounds = {
      left : 2147483647,
      top : 2147483647,
      right : -2147483648,
      bottom : -2147483648
    };

    this.baseInfo['foothold'].forEach(function(layerNode, layerId) {
      var layer = {};
      layerNode.forEach(function(groupNode, groupId) {

        var group = {};

        groupNode.forEach(function(elementNode, elementId) {
          var fh = group[elementId] = new FootholdNode(elementNode, elementId, groupId, layerId);

          var maxX = fh.x1 > fh.x2 ? fh.x1 : fh.x2;
          var minX = fh.x1 < fh.x2 ? fh.x1 : fh.x2;
          var maxY = fh.y1 > fh.y2 ? fh.y1 : fh.y2;
          var minY = fh.y1 < fh.y2 ? fh.y1 : fh.y2;

          if (bounds.left > maxX + 30)
            bounds.left = maxX + 30;
          if (bounds.right < minX - 30)
            bounds.right = minX - 30;
          if (bounds.top > maxY + 300)
            bounds.top = maxY + 300;
          if (bounds.bottom < minY - 300)
            bounds.bottom = minY - 300;

          
          map.allFootholds.push(fh);
        });

        layer[groupId] = group;
      });

      map.footholds[layerId] = layer;
    });
    
    if (true) {
      var dl = this.footholdDrawLayer = context.frame.game.add.graphics(0, 0, context.frame.game.mapLayer);
      
      for ( var a in this.footholds) {
        for ( var b in this.footholds[a]) {
          dl.lineStyle(7, context.frame.game.rnd.integer(), 1);
          for ( var c in this.footholds[a][b]) {
            var node = this.footholds[a][b][c];

            dl.moveTo(node.x1, node.y1);
            dl.lineTo(node.x2, node.y2);
          }
        }
      }
    }
  };

  Map.prototype.addPlayer = function(player, layer) {
    player.layer = layer;
    this.playerLayers[layer].add(player);
  };

  Map.prototype.setPlayerLayer = function(player, newLayer) {
    this.playerLayers[player.layer].remove(player.drawLayer);
    player.layer = newLayer;
    this.playerLayers[newLayer].add(player);
  };

  context.Map = Map;
  context.currentMap = null;

  context.runOnInitialization(function(context) {
    // context.currentMap = new context.Map(120000000);
    context.currentMap = new context.Map(0);
  });
})(window);
