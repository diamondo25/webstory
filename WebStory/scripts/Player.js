(function(context) {

  var itemdata = context.itemdata = {};
  var playerCounter = 0;

  var Player = function Player(mainPlayer) {
    playerCounter++;
    var player = this;
    this.name = 'MapleDummy';
    this.emotion = 'default';
    this.emotion_frame = 0;
    this.stance = 'walk';
    this.stance_frame = 0;
    this.stance_max_frames = 0;
    this.stance_walk_type = 1;
    this.stance_stand_type = 1;
    this.elven_ears = false;
    this.weapongroup = -1;


    var itemset = this.itemset = [];
    itemset.push(1002357);
    itemset.push(1102169);
    itemset.push(1032019);
    itemset.push(1070003);
    

    this.x = 0;
    this.y = 0;

    this.skin = 0;
    this.hair = 0;
    this.face = 0;
    this.data_buffer = {};

    this.setStance(this.stance);
    this.reassignItems();

    var drawGroup = this.drawGroup = context.frame.game.add.group();
    drawGroup.pivot.x = 0;
    drawGroup.pivot.y = 0;
    drawGroup.enableBody = true;
    
    this.loadData();
    this.addWeapon(1332076);
    this.repositionYourself();

    var back = false;

    var cntr = 0;
    var stanceCounter = 0;//playerCounter;
    var keys = ["walk1", "walk2", "stand1", "stand2", "alert", "swingO1", "swingO2", "swingO3", "swingOF", "swingT1", "swingT2", "swingT3", "swingTF", "swingP1", "swingP2", "swingPF", "stabO1", "stabO2", "stabOF", "stabT1", "stabT2", "stabTF", "shoot1", "shoot2", "shootF", "proneStab", "prone", "heal", "fly", "jump", "sit", "ladder", "rope", "dead", "ghostwalk", "ghoststand", "ghostjump", "ghostproneStab", "ghostladder", "ghostrope", "ghostfly", "ghostsit"];
    context.frame.registerUpdateCallback(function(timer) {
      cntr++;
      if ((cntr % 10) == 0) {
        stanceCounter++;
        stanceCounter %= keys.length;
        player.setStance(keys[stanceCounter]);
        
        
        /*
        
        if (back && player.stance_frame == 0) {
          back = false;
        } else if (!back && player.stance_frame == player.stance_max_frames) {
          back = true;
        }
        player.stance_frame += back ? -1 : 1;
        */

        player.repositionYourself();
      }

      player.drawGroup.x = player.x;
      player.drawGroup.y = player.y;
    });
  };

  Player.prototype.addWeapon = function(itemid) {
    parseItem(this, itemid);
    if (this.itemset.indexOf(itemid) === -1) {
      this.itemset.push(itemid);
    }
    this.stance_walk_type = itemdata[itemid].info.walk || 1;
    this.stance_stand_type = itemdata[itemid].info.stand || 1;

  };

  Player.prototype.setStance = function(stance) {
    this.stance_frame = 0;
    this.stance = this.stance_name = stance;

    if (stance == 'stand') {
      this.stance = this.stance_name + this.stance_stand_type;
    } else if (stance == 'walk') {
      this.stance = this.stance_name + this.stance_walk_type;
    }
  };

  Player.prototype.reassignItems = function() {
    var player = this;

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
            // delete player.itemset[cntr--];
          }
        }, true);
      }

      cntr++;
    }

    this.skin = 2000 + (this.skin % 1000);
  };

  Player.prototype.loadData = function() {
    var player = this;

    this.data_buffer.body_map = {};
    this.data_buffer.body_map.navel = [];
    this.data_buffer.hasHidingCap = false;

    context.getItemDataNode(this.skin, this.stance, function(navelobj) {
      if (navelobj === null) {
        throw new 'Navel not found xd?';
      }

      for (var i = 0;; i++) {
        if (!navelobj[i])
          break;
        player.stance_max_frames = i;
        var bodymap = navelobj[i]['body']['map'];

        player.data_buffer.body_map.navel[i] = {
          0 : bodymap['navel']['X'],
          1 : bodymap['navel']['Y']
        };
      }
    }, true);

    parseItem(this, this.skin);
    parseItem(this, 10000 + this.skin);
    parseItem(this, 20000 + this.face);
    parseItem(this, 30000 + this.hair);

    for (var i = 0; i < this.itemset.length; i++)
      parseItem(this, this.itemset[i]);
  };

  Player.prototype.repositionYourself = function() {
    var player = this;

    this.drawGroup.removeAll();

    function drawItem(itemid) {
      var frame = itemdata[itemid][player.stance];
      if (!frame) {
        // console.error('Anim ' + player.stance + ' not found in itemid: ' +
        // itemid);
        return;
      }
      if ('' in frame) {
        frame = frame[''];
      } else {
        frame = frame[player.stance_frame];
      }

      if (!frame) {
        // console.error('Frame ' + player.stance_frame + ' not found in itemid:
        // ' + itemid);
        return;
      }

      for ( var drawableCategory in frame) {
        var drawable = frame[drawableCategory];

        var bodyObject = player.drawGroup.create(drawable.x - drawable.image.originX, drawable.y
            - drawable.image.originY, drawable.image.cacheKey);
        bodyObject.z = drawable.z
      }
    }

    function drawFace(faceid) {
      var frame = itemdata[faceid][player.emotion];
      if (!frame) {
        // console.error('Anim ' + player.stance + ' not found in faceid: ' +
        // itemid);
        return;
      }
      if ('' in frame) {
        frame = frame[''];
      } else {
        frame = frame[player.emotion_frame];
      }

      if (!frame) {
        // console.error('Frame ' + player.stance_frame + ' not found in faceid:
        // ' + itemid);
        return;
      }

      for ( var drawableCategory in frame) {
        var drawable = frame[drawableCategory];

        var mapping = drawable['info']['map'];
        var xy = calculateXYFromMapping(player, mapping, player.stance, player.stance_frame);

        var bodyObject = player.drawGroup.create(xy[0] - drawable.image.originX, xy[1] - drawable.image.originY,
            drawable.image.cacheKey);
        bodyObject.z = drawable.z
      }
    }

    drawItem(this.skin);
    drawItem(10000 + this.skin);
    drawItem(30000 + this.hair);

    for (var i = 0; i < this.itemset.length; i++)
      drawItem(this.itemset[i]);

    drawFace(20000 + this.face);
    this.drawGroup.sort();
  };

  function parseItem(player, itemid) {

    if (itemdata[itemid]) {
      console.warn('Already loaded ' + itemid);
      return;
    }

    itemdata[itemid] = {};

    var iteminfo = null;
    context.getItemDataNode(itemid, null, function(obj) {
      iteminfo = obj;
    }, true);

    itemdata[itemid].info = iteminfo['info'];

    var o = {
      iteminfo : iteminfo,
      itemtype : context.getItemType(itemid),
      item_raw_type : Math.floor(itemid / 1000),
      foundinfo : false
    }

    if (o.iteminfo[player.weapongroup]) {
      o.iteminfo = o.iteminfo[player.weapongroup];
      o.iteminfo['ITEMID'] = itemid;
    }

    o.isface = o.item_raw_type === 20;
    console.log(itemid + ' is faic ' + o.isface)

    o.iteminfo.forEach(function(stanceNode, stanceName) {
      if (typeof stanceNode !== 'object') {
        return;
      }

      /*if (stanceName != (o.isface ? player.emotion : player.stance)) {
        return;
      }*/

      if (typeof stanceNode === 'undefined') {
        console.warn('No info found for key ' + stanceName);
        return;
      }

      if (stanceNode instanceof context.UOL) {
        console.warn('Probably UOL: ' + stanceNode.getPath());
        stanceNode = context.resolveUOL(stanceNode);
      }

      if (stanceNode === null) {
        console.warn('(2) No info found for key ' + stanceName);
        return;
      }

      stanceNode['frames'] = {};
      if (stanceNode['0']) {
        stanceNode.forEach(function(frame, frameName) {
          if (!(frame instanceof context.Node)) {
            return;
          }

          stanceNode['frames'][frameName] = {};
          frame.forEach(function(categoryNode, categoryName) {
            var obj = parseItemFrame(itemid, player, o, categoryNode, categoryName, stanceNode, stanceName, frameName);
            if (obj) {
              stanceNode['frames'][frameName][categoryName] = obj.image;
            }
          });
        });

      } else {
        stanceNode['frames']['0'] = {};
        stanceNode.forEach(function(categoryNode, categoryName) {
          if (!(categoryNode instanceof context.Node)) {
            return;
          }

          var obj = parseItemFrame(itemid, player, o, categoryNode, categoryName, stanceNode, stanceName, "");
          if (obj) {
            stanceNode['frames']['0'][categoryName] = obj.image;
          }
        });
      }
    });
  }

  function parseItemFrame(itemid, player, o, categoryNode, categoryName, prevNode, stanceName, frameName) {
    if (typeof categoryNode !== 'object') {
      return;
    }

    if (categoryNode instanceof context.UOL) {
      console.warn('Probably UOL: ' + categoryNode.getPath());
      categoryNode = context.resolveUOL(categoryNode);
      prevNode[categoryName] = categoryNode;
    }

    if (!categoryNode['map']) {
      console.warn('No mapping info? ' + categoryNode.getPath());
      // console.warn(categoryNode['map']);
      return;
    }

    if (o.itemtype == 2 && stanceName != player.emotion && player.stance != 'rope') {
      return;
    }
    if (o.itemtype == 1 && categoryName == 'ear' && !player.elven_ears) {
      return;
    }

    if (o.itemtype == 121 && categoryName != 'weapon') {
      return;
    }
    if (o.itemtype == 190) {
      return;
    }
    var zval = 0;
    if (!categoryNode['z'] || !context.zmap[categoryNode['z']]) {
      if (o.item_raw_type == 21) {
        zval = context.zmap['face'];
      } else {
        return;
      }
    } else {
      zval = context.zmap[categoryNode['z']];
    }

    if (o.item_raw_type !== 21)
      zval = 1000 - zval;

    var tmptmp = categoryNode;
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
      'info' : categoryNode,
      'type' : o.itemtype,
      'itemid' : o.iteminfo['ITEMID'],
      'frame' : frameName,
      'stance' : blockname,
      'category' : categoryName,
      'vslot' : !!o.iteminfo['info']['vslot'] ? o.iteminfo['info']['vslot'] : [],
      'islot' : !!o.iteminfo['info']['islot'] ? o.iteminfo['info']['islot'] : 'characterStart'
    };

    if (objectdata.islot.indexOf('Cp') !== -1 && objectdata.vslot.indexOf('H1') !== -1) {
      player.data_buffer.hasHidingCap = true;
    }

    var mapping = categoryNode['map'];

    var xy = calculateXYFromMapping(player, mapping, stanceName, frameName);

    objectdata['x'] = xy[0];
    objectdata['y'] = xy[1];
    objectdata['z'] = zval;

    objectdata['image'] = context.getOrCreateSprite(categoryNode);

    if (!itemdata[itemid][stanceName]) {
      itemdata[itemid][stanceName] = {};
    }
    if (!itemdata[itemid][stanceName][frameName]) {
      itemdata[itemid][stanceName][frameName] = {};
    }
    if (!itemdata[itemid][stanceName][frameName][categoryName]) {
      itemdata[itemid][stanceName][frameName][categoryName] = objectdata;
    }

    return objectdata;
  }

  function calculateXYFromMapping(player, mapping, stanceName, frameName) {
    var bodymap = player.data_buffer.body_map;
    var x = 0, y = 0;

    mapping.forEach(function(map, mapname) {

      if (!bodymap[mapname] || !bodymap[mapname][frameName]) {
        // Add bodymap if it is not there
        if (!bodymap[mapname]) {
          bodymap[mapname] = {};
        }

        var positions = bodymap[mapname][frameName];
        if (!positions) {
          positions = bodymap[mapname][frameName] = [];
        }

        positions.push(x + map['X']);
        positions.push(y + map['Y']);
      } else {
        x = bodymap[mapname][frameName][0] - map['X'];
        y = bodymap[mapname][frameName][1] - map['Y'];
      }
    });

    return [ x, y ];
  }

  context.Player = Player;
})(window);
