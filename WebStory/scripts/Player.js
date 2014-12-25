(function(context) {

  var itemdata = context.itemdata = {};
  var playerCounter = 0;

  var Player = function Player(mainPlayer) {
    Phaser.Group.call(this, context.frame.game);

    playerCounter++;
    var player = this;
    this.name = 'MapleDummy';
    this.emotion = 'hot';
    this.emotion_frame = 0;
    this.stance = 'walk';
    this.stance_frame = 0;
    this.stance_delay = 0;
    this.stance_max_frames = 3;
    this.stance_walk_type = 1;
    this.stance_stand_type = 1;
    this.elven_ears = false;
    this.weapongroup = -1;
    this.showface = true;

    var itemset = this.itemset = [];
    itemset.push(1002357);
    itemset.push(1102169);
    itemset.push(1032019);
    itemset.push(1050010);
    itemset.push(1070003);

    this.x = 0;
    this.y = 0;
    this.flip = false;

    this.skin = 0;
    this.hair = 0;
    this.face = 0;
    this.data_buffer = {};

    this.reassignItems();

    var drawGroup = this.drawGroup = this;
    drawGroup.pivot.x = 0;
    drawGroup.pivot.y = 0;
    // drawGroup.z = mainPlayer ? 100 : 95;

    this.loadData();
    this.addWeapon(1332076);
    this.repositionYourself();

    this.setStance(this.stance);
    
    var back = false;

    var cntr = 0;
    var nextStanceFrame = -1
    var stanceCounter = 0;// playerCounter;
    var keys = [ "walk1", "walk2", "stand1", "stand2", "alert", "swingO1", "swingO2", "swingO3", "swingOF", "swingT1",
      "swingT2", "swingT3", "swingTF", "swingP1", "swingP2", "swingPF", "stabO1", "stabO2", "stabOF", "stabT1",
      "stabT2", "stabTF", "shoot1", "shoot2", "shootF", "proneStab", "prone", "heal", "fly", "jump", "sit", "ladder",
      "rope", "dead", "ghostwalk", "ghoststand", "ghostjump", "ghostproneStab", "ghostladder", "ghostrope", "ghostfly",
      "ghostsit" ];
    context.frame.registerUpdateCallback(function(timer) {
      if (!context.currentMap.loaded) {
        return;
      }
      
      cntr++;
      if (nextStanceFrame < timer) {
        player.stance_frame++;
        player.stance_frame %= player.stance_max_frames;

        player.repositionYourself();
        nextStanceFrame = timer + player.stance_delay;
      }
      
      player.physics.update();

      player.drawGroup.x = player.physics.x;
      player.drawGroup.y = player.physics.y;
      if (player.flip != (player.drawGroup.width < 0)) {
        player.drawGroup.width *= -1;
      }
      

      context.frame.game.camera.focusOnXY(player.physics.x, player.physics.y - 100);
      
      if (player.physics.down) {
        player.setStance("prone");
      } else if (!player.physics.left && !player.physics.right) {
        player.setStance("stand");
      } else {
        player.setStance("walk");
      }
      
    });

    
    this.physics = new context.Physics();
  };

  Player.prototype = Object.create(Phaser.Group.prototype);
  Player.prototype.constructor = Player;
  
  Player.prototype.addWeapon = function(itemid) {
    parseItem(this, itemid);
    if (this.itemset.indexOf(itemid) === -1) {
      this.itemset.push(itemid);
    }
    this.stance_walk_type = itemdata[itemid].info.walk || 1;
    this.stance_stand_type = itemdata[itemid].info.stand || 1;

  };

  Player.prototype.setStance = function(stance) {
    if (this.stance_name == stance) {
      return;
    }
    
    this.stance_frame = 0;
    this.stance = this.stance_name = stance;

    if (stance == 'stand') {
      this.stance = this.stance_name + this.stance_stand_type;
    } else if (stance == 'walk') {
      this.stance = this.stance_name + this.stance_walk_type;
    }
    
    this.stance_max_frames = itemdata[this.skin][this.stance]['frames'];
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

    this.data_buffer.hasHidingCap = false;

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
    this.data_buffer.body_map = {};

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

      if (itemid === player.skin) {
        player.stance_delay = frame['extra']['delay'] || 200;
        player.showface = frame['extra']['showface'] === 1;
      }

      for ( var drawableCategory in frame) {
        if (drawableCategory === 'extra') {
          continue;
        }

        var drawable = frame[drawableCategory];

        var mapping = drawable['info']['map'];
        var xy = calculateXYFromMapping(player, mapping, player.stance, player.stance_frame);

        var bodyObject = player.drawGroup.create(xy[0] - drawable.image.originX, xy[1] - drawable.image.originY,
            drawable.image.cacheKey);

        bodyObject.z = drawable.z;
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
        if (drawableCategory === 'extra') {
          continue;
        }
        var drawable = frame[drawableCategory];

        var mapping = drawable['info']['map'];
        var xy = calculateXYFromMapping(player, mapping, player.stance, player.stance_frame);

        var bodyObject = player.drawGroup.create(xy[0] - drawable.image.originX, xy[1] - drawable.image.originY,
            drawable.image.cacheKey);
        bodyObject.z = drawable.z;
      }
    }

    drawItem(this.skin);
    drawItem(10000 + this.skin);
    drawItem(30000 + this.hair);

    for (var i = 0; i < this.itemset.length; i++)
      drawItem(this.itemset[i]);

    if (this.showface) {
      drawFace(20000 + this.face);
    }
    this.drawGroup.sort();
  };

  function parseItem(player, itemid) {

    if (itemdata[itemid]) {
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
      if (typeof stanceNode !== 'object' || stanceName == 'info') {
        return;
      }

      if (typeof stanceNode === 'undefined') {
        console.warn('No info found for key ' + stanceName);
        return;
      }

      if (stanceNode instanceof context.UOL) {
        // console.warn('Probably UOL: ' + stanceNode.getPath());
        stanceNode = context.resolveUOL(stanceNode);
      }

      if (stanceNode === null) {
        console.warn('(2) No info found for key ' + stanceName);
        return;
      }

      stanceNode['frames'] = {};
      if (stanceNode['0']) {
        stanceNode.forEach(function(frame, frameName) {
          if (!(frame instanceof context.Node) || frame['action']) {
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
      // console.warn('Probably UOL: ' + categoryNode.getPath());
      categoryNode = context.resolveUOL(categoryNode);
      prevNode[categoryName] = categoryNode;
    }
    
    if (categoryName == 'hairShade') {
      // Its a skin we need for this stuffs
      categoryNode = categoryNode[player.skin % 1000];

      if (categoryNode instanceof context.UOL) {
        // fml
        categoryNode = context.resolveUOL(categoryNode);
        prevNode[categoryName] = categoryNode;
      }
    }

    if (!categoryNode['map']) {
      console.warn('No mapping info? ' + categoryNode.getPath());
      // console.warn(categoryNode['map']);
      return;
    }

    /*
     * if (o.itemtype == 2 && stanceName != player.emotion && player.stance !=
     * 'rope') { return; } if (o.itemtype == 1 && categoryName == 'ear' &&
     * !player.elven_ears) { return; }
     * 
     * if (o.itemtype == 121 && categoryName != 'weapon') { return; }
     */
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

    objectdata['z'] = zval;

    objectdata['image'] = context.getOrCreateSprite(categoryNode);

    if (!itemdata[itemid][stanceName]) {
      itemdata[itemid][stanceName] = { frames : 0 };
    }
    if (!itemdata[itemid][stanceName][frameName]) {
      var frameId = parseInt(frameName, 10) + 1;
      if (itemdata[itemid][stanceName]['frames'] < frameId) {
        itemdata[itemid][stanceName]['frames'] = frameId;
      }
      
      
      var obj = itemdata[itemid][stanceName][frameName] = {};
      obj['extra'] = {};

      var parentNode = categoryNode['..'];
      // check if special values are there
      if (parentNode['face']) {
        obj['extra']['showface'] = parentNode['face'];
      }
      if (parentNode['delay']) {
        obj['extra']['delay'] = parentNode['delay'];
      }
      if (parentNode['action']) {
        obj['extra']['action'] = parentNode['action'];
      }
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

        if (mapname == 'body') {
          positions.push(player.x);
          positions.push(player.y);
        } else {
          positions.push(x + map['X']);
          positions.push(y + map['Y']);
        }
      } else {
        x = bodymap[mapname][frameName][0] - map['X'];
        y = bodymap[mapname][frameName][1] - map['Y'];
      }
    });

    return [ x, y ];
  }

  context.Player = Player;
})(window);
