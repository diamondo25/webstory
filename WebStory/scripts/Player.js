(function(context) {

  var Player = function Player(mainPlayer) {
    var player = this;
    this.name = 'MapleDummy';
    this.face = 'default';
    this.stance = 'alert';
    this.stance_frame = 0;
    this.stance_type = 1;
    this.elven_ears = false;
    this.weapongroup = -1;

    var itemset = this.itemset = [];
    itemset.push(1002357);
    itemset.push(1042003);
    // itemset.push(1062007);
    itemset.push(1322013);
    itemset.push(1432038);
    // itemset.push(1462027);

    this.x = 0;
    this.y = 0;
    
    
    this.skin = 0;
    this.hair = 0;
    this.face = 0;
    this.data_buffer = {};
    this.data_buffer.zlayers = {};

    this.setStance(this.stance, this.stance_type);
    this.reassignItems();
    this.repositionYourself();
    
    var cntr = 0, back = false;
    
    context.frame.registerDrawCallback(100 + (mainPlayer ? 20 : 0), function() {
      cntr++;
      if ((cntr % 10) == 0) {
        player.data_buffer.zlayers = {};
        if (back && player.stance_frame == 0) {
          back = false;
        } else if (!back && player.stance_frame == 2) {
          back = true;
        }
        player.stance_frame += back ? -1 : 1;
        player.repositionYourself();
      }
      
      
      for ( var layer in player.data_buffer.zlayers) {
        var drawables = player.data_buffer.zlayers[layer];
        for (var i = 0; i < drawables.length; i++) {
          var drawable = drawables[i];
          
          if (drawable.category === 'hairOverHead' && player.data_buffer.hasHidingCap) {
            continue;
          }
          
          drawable.image.drawAt(drawable.x + player.x, drawable.y + player.y);
        }
      }
    });
  };

  Player.prototype.setStance = function(stance, stance_type) {
    this.stance_frame = 0;
    this.stance = stance;
    this.stance_type = stance_type;
    if (this.stance == 'stand' || this.stance == 'walk') {
      this.stance += this.stance_type;
    }
  };

  Player.prototype.reassignItems = function() {
    var plyr = this;

    var copiedItems = this.itemset.slice(0);
    var cntr = 0;
    for (var i = 0; i < copiedItems.length; i++) {
      var itemid = copiedItems[i];
      var absgroup = Math.floor(itemid / 1000);

      if (absgroup == 2) {
        console.log('Found body: ' + itemid);
        this.skin = itemid % 1000;
        delete this.itemset[cntr--];
      } else if (absgroup == 12) {
        console.log('found head: ' + itemid);
        this.skin = itemid % 1000;
        delete this.itemset[cntr--];
      } else if (absgroup == 20 || absgroup == 21) {
        console.log('found face: ' + itemid);
        this.skin = itemid % 1000;
        delete this.itemset[cntr--];
      } else if (absgroup >= 30 && absgroup <= 40) {
        console.log('found hair: ' + itemid);
        this.hair = itemid % 1000;
        delete this.itemset[cntr--];
      } else {
        // get data

        context.getItemDataNode(itemid, null, function(obj) {
          if (obj === null) {
            console.log('Couldnt find ' + itemid);
            // delete plyr.itemset[cntr--];
          }
        }, true);
      }

      cntr++;
    }

    this.skin = 2000 + (this.skin % 1000);
  };

  Player.prototype.repositionYourself = function() {
    var plyr = this;

    this.data_buffer.body_map = {};
    this.data_buffer.hasHidingCap = false;

    context.getItemDataNode(this.skin, this.stance, function(navelobj) {
      if (navelobj === null) {
        throw new 'Navel not found xd?';
      }

      var bodymap = navelobj[plyr.stance_frame]['body']['map'];

      plyr.data_buffer.body_map.navel = {
        0 : bodymap['navel']['X'],
        1 : bodymap['navel']['Y']
      };
    }, true);

    parseItem(this, this.skin);
    parseItem(this, 10000 + this.skin);
    parseItem(this, 20000 + this.face);
    parseItem(this, 30000 + this.hair);

    for (var i = 0; i < this.itemset.length; i++)
      parseItem(this, this.itemset[i]);

    // console.warn(this.data_buffer.zlayers);
  };

  function parseItem(player, id) {
    var iteminfo = null;
    context.getItemDataNode(id, null, function(obj) {
      iteminfo = obj;
    }, true);
    
    var o = {
      iteminfo: iteminfo,
      itemtype: context.getItemType(id),
      item_raw_type: Math.floor(id / 1000),
      foundinfo: false
    }

    if (o.iteminfo[player.weapongroup]) {
      o.iteminfo = o.iteminfo[player.weapongroup];
      o.iteminfo['ITEMID'] = id;
    }

    o.isface = typeof o.iteminfo[player.face] !== 'undefined';

    for (var i = 0; i < o.iteminfo._keys.length; i++) {
      var stanceName = o.iteminfo._keys[i];
      
      var stanceNode = o.iteminfo[stanceName];
      if (stanceName === 'ITEMID' || stanceName === 'info' || typeof stanceNode !== 'object') {
        continue;
      }

      var tmp = null;
      if (o.isface) {
        if (stanceName === 'default') {
          tmp = stanceNode;
        } else {
          tmp = stanceNode['0'];
        }
      } else {
        tmp = stanceNode[player.stance_frame];
      }
      
      stanceNode = tmp;

      if (typeof stanceNode === 'undefined') {
        // console.warn('No info found for key ' + stanceName);
        continue;
      }

      if (stanceNode instanceof context.UOL) {
        console.warn('Probably UOL: ' + stanceNode);
        stanceNode = context.resolveUOL(stanceNode);
      }

      if (stanceNode === null) {
        console.warn('(2) No info found for key ' + stanceName);
        continue;
      }

      for (var j = 0; j < stanceNode._keys.length; j++) {
        var frameName = stanceNode._keys[j];
        parseItemFrame(player, o, stanceNode[frameName], frameName, stanceNode, stanceName);
      }
    }
  }
  
  function parseItemFrame(player, o, block, category, prevNode, stanceName) {
    if (category === 'delay') {
      return;
    }

    if (block instanceof context.UOL) {
      console.warn('Probably UOL: ' + block);
      block = context.resolveUOL(block);
      prevNode[category] = block;
    }

    if (!block['map']) {
      // console.warn('No mapping info?');
      // console.warn(block['map']);
      return;
    }

    if (o.itemtype == 2 && stanceName != player.face && player.stance != 'rope') {
      return;
    }
    if (o.itemtype == 1 && category == 'ear' && !player.elven_ears) {
      return;
    }
    if (o.itemtype != 2 && stanceName != player.stance && stanceName != player.face) {
      return;
    }

    if (o.itemtype == 121 && category != 'weapon') {
      return;
    }
    if (o.itemtype == 190) {
      return;
    }
    var zval = 0;
    if (!block['z'] || !context.zmap[block['z']]) {
      if (o.item_raw_type == 21) {
        zval = context.zmap['face'];
      } else {
        return;
      }
    } else {
      zval = context.zmap[block['z']];
    }

    zval = 1000 - zval;

    var tmptmp = block;
    var imgkey = '';
    var blockname = '';
    while (true) {
      imgkey = tmptmp.name + (imgkey == '' ? '' : '/' + imgkey);
      blockname = tmptmp.name;
      if (tmptmp['..'] === null)
        break;
      if (tmptmp['..']['..'] === null)
        break;
      tmptmp = tmptmp['..'];
    }

    var objectdata = {
      'info' : block,
      'type' : o.itemtype,
      'itemid' : o.iteminfo['ITEMID'],
      'stance' : blockname,
      'category' : category,
      'vslot' : !!o.iteminfo['info']['vslot'] ? o.iteminfo['info']['vslot'] : [],
      'islot' : !!o.iteminfo['info']['islot'] ? o.iteminfo['info']['islot'] : 'characterStart'
    };
    
    if (objectdata.islot.indexOf('Cp') !== -1 &&objectdata.vslot.indexOf('H1') !== -1) {
      player.data_buffer.hasHidingCap = true;
    }

    var mapping = block['map'];

    var x = 0, y = 0;
    for ( var mapname in mapping) {
      if (context.isReservedDataObject(mapname)) {
        continue;
      }

      if (!player.data_buffer.body_map[mapname]) {
        player.data_buffer.body_map[mapname] = {
          0 : x + mapping[mapname]['X'],
          1 : y + mapping[mapname]['Y']
        };
        // console.warn('adding')
      } else {
        x = player.data_buffer.body_map[mapname][0] - mapping[mapname]['X'];
        y = player.data_buffer.body_map[mapname][1] - mapping[mapname]['Y'];
      }
    }

    objectdata['x'] = x;
    objectdata['y'] = y;

    objectdata['image'] = context.getOrCreateSprite(block);

    // console.warn(objectdata);

    if (!player.data_buffer.zlayers[zval]) {
      player.data_buffer.zlayers[zval] = [];
    }
    player.data_buffer.zlayers[zval].push(objectdata);
  }

  context.Player = Player;
})(window);
