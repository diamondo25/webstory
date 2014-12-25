window.runOnInitialization(function(context) {
  // Server: maplestory0.tk
  // Username: diamondo25 | diamondo
  // Password: testtest

  context.getDataNode("Base.wz/zmap.img/null", function(obj) {
    var i = 0;
    var arr = {};
    for ( var key in obj) {
      if (context.isReservedDataObject(key)) {
        continue;
      }
      arr[key] = i++;
    }

    context.zmap = arr;
  }, true);
  /*
   * var backgroundSprite = null;
   * 
   * context.getDataNode("UI.wz/CashShop.img/Base/backgrnd", function (obj) {
   * console.log(obj); backgroundSprite = new context.Sprite(obj.uri, obj.width,
   * obj.height, 0, 0); });
   * 
   * context.frame.registerDrawCallback(0, function () { if (backgroundSprite !=
   * null) { backgroundSprite.drawAt(0, 0); } });
   */

  var showFPS = false;
  if (showFPS) {
    var curtime = new Date();
    var frames = 0, lastFPS = 0;
    context.frame.registerDrawCallback(1000000, function() {
      frames++;

      this.font = "48px serif";
      this.fillStyle = '#000';
      this.fillText("FPS: " + lastFPS, 0, 48);

      var nextcurtime = new Date();
      if ((nextcurtime - curtime) > 1000) {
        lastFPS = frames;
        frames = 0;
        curtime = nextcurtime;
      }
    });
  }

  var player = context.thisPlayer = new context.Player(true);
  player.x = 0;
  player.y = 0;

  context.getDataNode("UI.wz/StatusBar.img/null", function(obj) {
    function drawImageAt(node, x, y, locked) {
      locked = locked === true;
      var sprite = context.getOrCreateSprite(node);

      var realSprite = context.frame.game.uiLayer.create(x - sprite.originX, y - sprite.originY, sprite.cacheKey);
      realSprite.fixedToCamera = locked;
    }
    drawImageAt(obj['base']['backgrnd'], 0, 600 - 71, true);
    drawImageAt(obj['base']['backgrnd2'], 0, 600 - 71, true);
  });

});
